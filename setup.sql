DROP TABLE IF EXISTS petition CASCADE;
CREATE TABLE petition (
    id SERIAL primary key,
    sig VARCHAR(12255) not null,
    uid INT not null UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
