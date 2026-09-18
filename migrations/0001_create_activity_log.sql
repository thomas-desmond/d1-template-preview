-- Migration number: 0001 	 2024-12-27T22:04:18.794Z
--
-- Schema only, no seed data here on purpose.
--
-- Workers Builds' predeploy hook (`wrangler d1 migrations apply DB --remote`)
-- resolves the "DB" binding against the top-level `d1_databases` entry in
-- wrangler.json — it has no awareness of the `previews` override block. So
-- when this Worker is deployed as a PR Preview, this migration runs against
-- the *production* database again (a harmless no-op, already applied), not
-- against the attendee's new preview database.
--
-- That means a freshly-created preview D1 database never gets this table
-- from a migration at all. The Worker creates it lazily at request time
-- instead (see ensureSchema() in src/index.ts) — schema only, still no seed
-- rows — so Preview starts genuinely empty instead of erroring.
CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
