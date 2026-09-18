-- Migration number: 0002 	 2025-09-18T00:00:00.000Z
--
-- Seed data. Deliberately split into its own migration file (separate from
-- 0001's schema) per the workshop plan's intent: schema-only migrations are
-- safe to run anywhere, seed-only migrations are meant for production.
--
-- In practice this migration only ever reaches the production database —
-- see the note in 0001_create_activity_log.sql for why. Preview databases
-- never get these rows, which is exactly the "Preview vs. Production
-- visibly differ" effect the workshop app is built to show.
INSERT INTO activity_log (text)
VALUES
    ('Deployed the production Worker'),
    ('Provisioned the D1 database'),
    ('Wired up Workers Builds')
;
