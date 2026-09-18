import { renderHtml } from "./renderHtml";

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
		await ensureSchema(env.DB);

		const url = new URL(request.url);
		const { pathname } = url;

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
