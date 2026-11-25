# Chris Yan portfolio

Run locally with `pnpm install` and `pnpm dev`, then open http://localhost:3000. The private editor is at `/admin`.

## Shared portfolio content

The editor publishes profile, highlights, experience, and projects to one Supabase row. Visitors read that row through `/api/portfolio`; an open tab checks for changes every minute and when the tab becomes visible. Language, light mode, and cursor trail remain personal browser preferences.

1. Use the dedicated Supabase project for this portfolio.
2. Apply `supabase/migrations/20261125000000_portfolio_content.sql` in that project's SQL editor, or via the Supabase CLI.
3. Copy `.env.example` to `.env.local`. Set `ADMIN_PASSWORD`, `SUPABASE_URL`, and the project's publishable and secret API keys. Keep `.env.local` private. The secret key is used only in the server route and must never have a `NEXT_PUBLIC_` prefix. Supabase SSR helpers and middleware are unnecessary here because the admin route uses its own signed cookie.
4. Restart `pnpm dev`. Sign in at `/admin` and select **Publish changes** to populate the shared row. Until the first publish, the site shows the bundled default content.

For a hosted site, set the same environment variables in the hosting provider and redeploy. The database is shared by local and hosted instances if both use the same Supabase project.
