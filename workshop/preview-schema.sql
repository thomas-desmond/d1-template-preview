-- Workshop-only schema fixture.
--
-- This file intentionally lives outside `migrations/` so production deploys
-- can never apply it through `wrangler d1 migrations apply`.
CREATE TABLE activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Simulate a candidate schema change that has not been promoted to production.
-- The starter Worker's delete query still refers to `id`, exposing the bug the
-- attendee will diagnose in their Preview.
ALTER TABLE activity_log RENAME COLUMN id TO activity_id;

INSERT INTO activity_log (text)
VALUES
    ('Preview database connected'),
    ('Preview-only schema applied'),
    ('Ready to test this Preview');
