const express = require("express");
const app = express();
const hb = require("express-handlebars");
const cookieSession = require('cookie-session');
const csurf = require("csurf");
const db = require("./utils/db");
const { hash, compare } = require("./utils/bc");
const { requireNoSig, requireSig, requireNoUid, requireUid } = require("./utils/routs");


app.engine("hbs", hb({ extname: ".hbs"}));
app.set("view engine", "hbs");

app.use(express.urlencoded({ extended: false }));
app.use(express.static("./public"));

app.use(cookieSession({
    //I think we need to keep this safe...maybe not
    secret: `Welcome to the wooorld of tomorrowww!`,
    maxAge: 1000 * 60 * 60 * 24 * 13365
}));

app.get("/", (req, res) => {
    res.render("welcome");
});

app.get("/registration", requireNoUid, (req, res) => {
    res.render("registration");
});

app.post("/registration", (req, res) => {
    if (req.body.password == "") {
        res.render("registration", {
            error: true
        });
    } else {

        hash(req.body.password).then(hash => {
            req.session.user = {
                first: req.body.first,
                last: req.body.last,
                email: req.body.email,
                password: hash
            };
            //.then(id => { req.session.uid = id.rows[0].id;
            db.addUser(req.session.user)
                .then(
                    res.redirect("/login")
                )
                .catch(error => {
                    console.log("error: ", error);
                    res.render("registration", {
                        error: error });
                });

        }).catch(error => {
            console.log("error: ", error);
            res.render("registration", {
                error: error });
        });
    }
});


app.get("/login", (req, res) => {
    res.render("login");
});

app.post("/login", (req, res) => {
    db.passCheck(req.body.email)
        .then(check => {
            compare(req.body.password, check[0].password).then(match => {
                if (match === true) {
                    req.session.uid = check[0].id;
                    db.getSidCookie(check[0].id)
                        .then(id => {
                            req.session.sid = id[0].id;
                            res.redirect("/thanks");
                        })
                        .catch(err => {
                            console.log("user didnt sign yet", err);
                            res.redirect("/thanks");
                        });
                } else {
                    res.render("login", {
                        error: true
                    });
                }
            }).catch(error => {
                console.log("error:", error);
                res.render("login", {
                    error: error
                });
            });
        })
        .catch(error => {
            console.log("error:", error);
            res.render("login", {
                error: error
            });
        });
});


app.get("/profile", requireUid, requireNoSig, (req, res) => {
    res.render("profile");
});

app.post("/profile", (req, res) => {
    db.addInfo(req.body.age, req.body.city, req.body.home, req.session.uid)
        .then(() => {
            res.redirect("/petition");
        })
        .catch(error => {
            console.log("error: ", error);
            res.render("profile", {
                error: error });
        });
});


app.get("/petition", requireUid, requireNoSig, (req, res) => {
    res.render("petition");
});

app.post("/petition", (req, res) => {
    db.addSig(req.body.sig, req.session.uid)
        .then(id => { req.session.sid = id.rows[0].id;
            res.redirect("/thanks");
        })
        .catch(error => {
            res.render("petition", {
                error: error });

        });
});

app.get("/thanks", requireSig, (req, res) => {
//    console.log(req.session.uid);
    db.getSig(req.session.sid)
        .then(sig => {
            db.getNumber()
                .then(number => {
                    db.getUser(req.session.uid)
                        .then(user => {
                            res.render("thanks", {
                                sig: sig[0].sig,
                                user: user.rows[0],
                                number: number.rows[0].count
                            });
                        }).catch(err => {
                            console.log("err", err);
                        });
                }).catch(err => {
                    console.log("err", err);
                });
        }).catch(err => {
            console.log("err", err);
        });
});


app.get("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
});


app.get("/signers", requireSig, (req, res) => {
    db.getAll().then(signersdb => {
        res.render("signers", {
            signersdb: signersdb
        });
    }).catch(err => {
        console.log("err", err);
    });
});

app.get("/signed-by/:city", requireSig, (req, res) => {
    const city = req.params.city;
    db.getAllCity(city)
        .then(signersdb => {
            res.render("signers", {
                signersdb: signersdb,
                selectedCity: true,
                city: city
            });
        }).catch(err => {
            console.log("err", err);
        });
});

app.get("/eprofile", requireSig, (req, res) => {
    db.getAllInfo(req.session.uid)
        .then(info => {
            res.render("eprofile", {
                first: info[0].first,
                last: info[0].last,
                email: info[0].email,
                age: info[0].age,
                city: info[0].city,
                home: info[0].home
            });
        }).catch(err => {
            console.log("err", err);
        });
});

app.post("/eprofile", (req, res) => {
    db.updUsr(req.body.first, req.body.last, req.body.email, req.session.uid)
        .then(() => {
            if (req.body.password) {
                hash(req.body.password).then(hash => {
                    db.updPass(hash, req.session.uid);
                }).catch(err => {
                    console.log("err", err);
                });
            }
            db.addInfo(req.body.age, req.body.city, req.body.home, req.session.uid)
                .then(() => {
                    res.redirect("/thanks");
                }).catch(err => {
                    console.log("err", err);
                });
        }).catch(err => {
            console.log("err", err);
        });
});

app.post("/thanks", (req, res) => {
    db.delSig(req.session.uid)
        .then(() => {
            req.session.sid = null;
            res.redirect("/petition");
        }).catch(err => {
            console.log("err", err);
        });
});


app.use(csurf());

app.use(function(req,res, next){
    res.setHeader("x-frame-options", "deny");
    res.locals.csrfToken = req.csrfToken();
    next();
});


app.listen(process.env.PORT || 8080, () => {
    console.log("Omicron Persei 8080");
});
