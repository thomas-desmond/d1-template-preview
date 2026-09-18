import { renderHtml } from "./renderHtml";
import { renderNoDatabaseHtml } from "./renderNoDatabaseHtml";

type Entry = {
	id: number;
	text: string;
	created_at: string;
};

// Schema-only, idempotent. No seed rows — see the comment in
// migrations/0001_create_activity_log.sql for why this also runs at request
// time: a freshly-created Preview D1 database never receives the migration
// (Workers Builds' predeploy hook can't reach it), so the table needs to
// exist by the time the first request comes in.
async function ensureSchema(db: D1Database): Promise<void> {
	await db.exec(
		"CREATE TABLE IF NOT EXISTS activity_log (id INTEGER PRIMARY KEY AUTOINCREMENT, text TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')))",
	);
}

async function listEntries(db: D1Database): Promise<Entry[]> {
	const { results } = await db
		.prepare("SELECT id, text, created_at FROM activity_log ORDER BY id DESC LIMIT 50")
		.all<Entry>();
	return results;
}

function json(data: unknown, init: ResponseInit = {}): Response {
	return new Response(JSON.stringify(data), {
		...init,
		headers: { "content-type": "application/json", ...init.headers },
	});
}

export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const { pathname } = url;

		// A Preview only gets a `DB` binding if `wrangler.json` has a
		// `previews.d1_databases` override for it — Cloudflare does not fall
		// back to the production binding. Without that override, `env.DB` is
		// `undefined` here, not an empty/unmigrated database. This is the
		// isolation mechanic the workshop's D1-override step is about: no
		// override, no database, not even a read-only fallback to prod.
		if (!env.DB) {
			if (pathname.startsWith("/api/")) {
				return json({ error: "No D1 database bound. Add a previews.d1_databases override." });
			}
			// 200, not an error status: this is an expected, legitimate app
			// state (no override configured yet), not a crash.
			return new Response(renderNoDatabaseHtml(), {
				headers: { "content-type": "text/html" },
			});
		}

		await ensureSchema(env.DB);

		if (pathname === "/api/entries" && request.method === "GET") {
			return json({ entries: await listEntries(env.DB) });
		}

		if (pathname === "/api/entries" && request.method === "POST") {
			const body = await request
				.json<{ text?: string }>()
				.catch(() => ({}) as { text?: string });
			const text = body.text?.trim();
			if (!text) {
				return json({ error: "text is required" }, { status: 400 });
			}
			await env.DB.prepare("INSERT INTO activity_log (text) VALUES (?)").bind(text).run();
			return json({ entries: await listEntries(env.DB) }, { status: 201 });
		}

		const deleteMatch = pathname.match(/^\/api\/entries\/(\d+)$/);
		if (deleteMatch && request.method === "DELETE") {
			const id = Number(deleteMatch[1]);
			await env.DB.prepare("DELETE FROM activity_log WHERE id = ?").bind(id).run();
			return json({ entries: await listEntries(env.DB) });
		}

		if (pathname === "/" && request.method === "GET") {
			return new Response(renderHtml(), {
				headers: { "content-type": "text/html" },
			});
		}

		return new Response("Not found", { status: 404 });
	},
} satisfies ExportedHandler<Env>;
