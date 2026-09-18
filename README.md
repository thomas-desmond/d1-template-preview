# Worker + D1 Activity Log

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/thomas-desmond/d1-template-preview)

<!-- dash-content-start -->

D1 is Cloudflare's native serverless SQL database ([docs](https://developers.cloudflare.com/d1/)). This project is the demo app for the Worker Previews workshop: a Worker with a D1 binding, and a small client-rendered UI to **add** and **delete** entries in an activity log — real writes, real deletes, not just a read-only query.

The production D1 database is seeded with a few entries via migration. A Preview created via the `previews` override in `wrangler.json` starts with an **empty** table instead — see the comments in `migrations/0001_create_activity_log.sql` for why, and `src/index.ts` for the self-healing schema creation that makes it safe.

Add an entry, delete an entry, then compare your Preview against production — same code, different data, because the database is isolated per Preview.

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

1. New branch, add a `previews.d1_databases` override in `wrangler.json` pointing at a new D1 database (`npx wrangler d1 create <your-preview-db-name>`).
2. Push, open a PR. Workers Builds deploys a Preview at `<branch>-<worker-name>.<account-subdomain>.workers.dev`.
3. Open the Preview. The table is empty — add and delete a few entries. Compare against your production URL, which still has its seeded rows. Same code, isolated data.

> Note: this PR exists to measure how long a Workers Builds Preview takes to show up on a PR. Safe to close.
