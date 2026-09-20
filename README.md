# Worker + D1 Activity Log

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/thomas-desmond/d1-template-preview)

<!-- dash-content-start -->

D1 is Cloudflare's native serverless SQL database ([docs](https://developers.cloudflare.com/d1/)). This project is the demo app for the Worker Previews workshop: a Worker with a D1 binding, and a small client-rendered UI to **add** and **delete** entries in an activity log — real writes, real deletes, not just a read-only query.

The production D1 database is created and seeded through `migrations/`. The workshop's candidate Preview schema lives separately at `workshop/preview-schema.sql`, so production deployment automation cannot apply it.

The candidate schema deliberately exposes an incompatible delete query. Add and refresh work, delete fails visibly, and Preview Observability captures the D1 error for an agent to diagnose. The repair uses SQLite's `rowid`, making the merged Worker compatible with both the unchanged production schema and the candidate Preview schema.

<!-- dash-content-end -->

## Getting started (via the Deploy to Cloudflare button)

Click the button above. It creates a repo in your own GitHub account, provisions a production D1 database, wires up Workers Builds, and deploys — no manual setup steps.

## Manual setup (if you're not using the button)

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a [D1 database](https://developers.cloudflare.com/d1/get-started/):
   ```bash
   npx wrangler d1 create d1-template-database
   ```
   ...and update the `database_id` field in `wrangler.json` with the new database ID.
3. Apply the migrations (schema in `0001`, seed data in `0002` — see the comments in `migrations/0001_create_activity_log.sql`):
   ```bash
   npx wrangler d1 migrations apply --remote d1-template-database
   ```
4. Deploy:
   ```bash
   npx wrangler deploy
   ```

## Workshop flow: creating your own Preview

1. Create a branch and a new database with `npx wrangler d1 create workshop-preview-db`.
2. Add `previews.d1_databases` and `previews.observability` configuration without changing the top-level production settings.
3. Push and open a PR. Workers Builds runs `npx wrangler preview` and posts the Preview URL.
4. Open the Preview. It renders setup instructions because the bound database has no schema.
5. Apply the workshop fixture by database name:
   ```bash
   npx wrangler d1 execute workshop-preview-db --remote --file workshop/preview-schema.sql
   ```
6. Refresh and confirm the Preview-specific rows load. Add and refresh work; delete produces a visible error and a structured Observability log.
7. Repair deletion without changing either schema. The merged query must work against production's `id` and the Preview's `activity_id`.
8. Push, retest the updated Preview, then merge. Production receives compatible Worker code and never receives the workshop SQL.

The merged `previews` binding intentionally remains on `main`. `workshop-preview-db` becomes a shared database for this Worker's future Previews: isolated from production, but shared between those Previews.
