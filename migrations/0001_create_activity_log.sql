-- Migration number: 0001 	 2024-12-27T22:04:18.794Z
--
-- Production schema. Worker Preview builds never run this migration command;
-- they use the separate workshop/preview-schema.sql fixture instead.
CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
