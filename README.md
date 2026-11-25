# Chris Yan portfolio

Run locally with `pnpm install` and `pnpm dev`, then open http://localhost:3000. The private editor is at `/admin`.

## Shared portfolio content

The editor publishes profile, highlights, experience, projects, and carousel order to one Supabase row. Visitors read that row through `/api/portfolio`; an open tab checks for changes every minute and when the tab becomes visible. Language, light mode, and cursor trail remain personal browser preferences.

1. Use the dedicated Supabase project for this portfolio.
2. Apply `supabase/migrations/20261125000000_portfolio_content.sql` in that project's SQL editor, or via the Supabase CLI.
3. Copy `.env.example` to `.env.local`. Set `ADMIN_PASSWORD`, `SUPABASE_URL`, and the project's publishable and secret API keys. Keep `.env.local` private. The secret key is used only in the server route and must never have a `NEXT_PUBLIC_` prefix. Supabase SSR helpers and middleware are unnecessary here because the admin route uses its own signed cookie.
4. Restart `pnpm dev`. Sign in at `/admin` and select **Publish changes** to populate the shared row. Until the first publish, the site shows the bundled default content.

For a hosted site, set the same environment variables in the hosting provider and redeploy. The database is shared by local and hosted instances if both use the same Supabase project.

### Carousel photos

In `/admin`, the **What I’ve been up to** section accepts JPG, PNG, and WebP files up to 10 MB. Uploads are converted to WebP and published immediately; removing a photo also updates the shared site immediately. Other profile edits still use **Publish changes**. The server creates a public `portfolio-photos` Storage bucket on the first upload, using the secret key. The ten bundled portrait cards are demo entries that can be removed one at a time. Add photos and remove the demos as you replace them.

Set `SUPABASE_URL` before the production build so Next.js can optimize images from that Storage bucket. Uploaded images are limited to 30 gallery entries.
