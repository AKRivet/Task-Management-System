-- Task Management System — reference schema
--
-- This file is a human-readable copy of the schema for learning/reference.
-- The actual source of truth is the EF Core migration in
-- backend/TaskManagementSystem.Api/Data/Migrations — running that migration
-- (`dotnet ef database update`) is what actually creates these tables.
-- You should NOT need to run this file by hand; it exists so you can read
-- the schema as plain SQL without digging through generated C# migration code.

CREATE TABLE users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE projects (
    id             SERIAL PRIMARY KEY,
    name           VARCHAR(150) NOT NULL,
    description    TEXT,
    owner_user_id  INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE statuses (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(50) NOT NULL UNIQUE
);

INSERT INTO statuses (name) VALUES
    ('To Do'),
    ('In Progress'),
    ('Done'),
    ('Blocked');

CREATE TABLE tasks (
    id                SERIAL PRIMARY KEY,
    title             VARCHAR(200) NOT NULL,
    description       TEXT,
    project_id        INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    assigned_user_id  INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status_id         INTEGER NOT NULL REFERENCES statuses(id) ON DELETE RESTRICT,
    priority          VARCHAR(20) NOT NULL DEFAULT 'Medium'
                          CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')),
    due_date          DATE,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ix_tasks_project_id ON tasks(project_id);
CREATE INDEX ix_tasks_status_id ON tasks(status_id);

CREATE TABLE comments (
    id          SERIAL PRIMARY KEY,
    task_id     INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    body        TEXT NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX ix_comments_task_id ON comments(task_id);

CREATE TABLE tags (
    id    SERIAL PRIMARY KEY,
    name  VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE task_tags (
    task_id  INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    tag_id   INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (task_id, tag_id)
);
