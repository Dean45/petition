DROP TABLE IF EXISTS profiles CASCADE;
CREATE TABLE profiles (
    id SERIAL primary key,
    age INTEGER,
    city VARCHAR(255),
    home VARCHAR(255),
    uid INT NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
