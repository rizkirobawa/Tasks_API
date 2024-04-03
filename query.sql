CREATE TABLE tasks (
    id BIGSERIAL PRIMARY KEY,
    description VARCHAR(255) NOT NULL,
    deadline VARCHAR(255) NOT NULL,
    priority INT NOT NULL,
    is_completed BOOLEAN NOT NULL
);