var spicedPg = require('spiced-pg');
var db = spicedPg(process.env.DATABASE_URL || 'postgres:postgres:postgres@localhost:5432/petition');

exports.addUser = user => {
    return db.query(
        `INSERT INTO users (first, last, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id`,
        [user.first || null, user.last || null, user.email || null, user.password || null]
    );
};

exports.passCheck = email => {
    return db.query(
        `SELECT password, id FROM users WHERE email = $1`, [email])
        .then(({ rows }) => {
            return rows;
        });
};

exports.addSig = function(sig, uid) {
    return db.query(
        `INSERT INTO petition(sig, uid)
        VALUES ($1, $2)
        RETURNING id`,
        [sig || null, uid || null]
    );
};

exports.getSig = sig => {
    return db.query(
        `SELECT sig FROM petition WHERE id = $1`, [sig])
        .then(({ rows }) => {
            return rows;
        });
};

exports.getNumber = () => {
    return db.query(`SELECT COUNT(*) FROM petition`);
};

exports.getUser = uid => {
    return db.query(`SELECT first, last FROM users WHERE id = $1`, [uid]);
};

exports.addInfo = function(age, city, home, uid) {
    return db.query(
        `INSERT INTO profiles (age, city, home, uid)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (uid)
        DO UPDATE SET age = $1, city = $2, home = $3`,
        [age || null, city, hackHome(home) || null, uid || null]);
};

function hackHome(home) {

    if(home == "") {
        console.log("home: ", home);
        return;
    }
    if ( home.startsWith("http://") || home.startsWith("https://")) {
        return home;
    } else {
        return "http://" + home;
    }
}

exports.getAll = () => {
    return db.query(
        `SELECT petition.id, users.first, users.last, profiles.age, profiles.city, profiles.home
        FROM petition
        JOIN users ON petition.uid = users.id
        JOIN profiles ON users.id = profiles.uid`)
        .then(({ rows }) => {
            return rows;
        });
};

exports.getAllCity = (city) => {
    return db.query(
        `SELECT petition.id, users.first, users.last, profiles.age, profiles.city, profiles.home
        FROM petition
        JOIN users ON petition.uid = users.id
        JOIN profiles ON users.id = profiles.uid
        WHERE LOWER(profiles.city) = LOWER($1)`, [city])
        .then(({ rows }) => {
            return rows;
        });
};

exports.getAllInfo = uid => {
    return db.query(
        `SELECT users.first, users.last, users.email, profiles.age, profiles.city, profiles.home
        FROM users
        JOIN profiles ON users.id = profiles.uid
        WHERE users.id = $1`, [uid])
        .then(({ rows }) => {
            return rows;
        });
};

exports.getSidCookie = uid => {
    return db.query(
        `SELECT id FROM petition
        WHERE uid = $1`, [uid])
        .then(({ rows }) => {
            return rows;
        });
};

exports.updUsr = function(first, last, email, uid) {
    return db.query(
        `UPDATE users SET first=$1, last=$2, email=$3
        WHERE users.id = $4`,
        [first || null, last || null, email || null, uid || null]);
};

exports.updPass = function(password, uid) {
    return db.query(
        `UPDATE users SET password=$1
        WHERE users.id = $2`,
        [password || null, uid || null]);
};

exports.delSig = uid => {
    return db.query(
        `DELETE FROM petition
        WHERE uid = $1`, [uid]);
};
