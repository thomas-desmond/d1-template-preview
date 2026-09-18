export function renderNoDatabaseHtml() {
	return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Activity Log — no database bound</title>
        <link rel="stylesheet" type="text/css" href="https://static.integrations.cloudflare.com/styles.css">
      </head>

      <body>
        <header>
          <img
            src="https://imagedelivery.net/wSMYJvS3Xw-n339CbDyDIA/30e0d3f6-6076-40f8-7abb-8a7676f83c00/public"
          />
          <h1>📋 Activity Log</h1>
          <p>This Preview doesn't have a D1 database bound yet.</p>
        </header>
        <main>
          <p>
            Previews don't automatically inherit the production
            <code>DB</code> binding. Add a <code>previews.d1_databases</code>
            override in <code>wrangler.json</code> pointing at your own D1
            database, push, and this Preview will get its own isolated copy
            of the app — separate from production, separate from every other
            attendee's Preview.
          </p>
        </main>
      </body>
    </html>
`;
}
