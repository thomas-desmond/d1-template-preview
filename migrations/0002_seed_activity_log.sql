-- Migration number: 0002 	 2025-09-18T00:00:00.000Z
--
-- Production seed data. Preview setup uses workshop/preview-schema.sql, which
-- contains different rows and is deliberately outside the migration path.
INSERT INTO activity_log (text)
VALUES
    ('Deployed the production Worker'),
    ('Provisioned the D1 database'),
    ('Wired up Workers Builds')
;
