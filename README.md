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

The carousel starts with 32 optimized photos in `public/gallery`. They are bundled with the site and replace the earlier portrait placeholders and matching uploaded copies. Once this version is deployed, the gallery is seeded on the next content read; later additions and removals in `/admin` are saved for everyone.

In `/admin`, the **What I’ve been up to** section accepts HEIC, JPG/JPEG, PNG, and WebP files up to 10 MB. The browser sends the original file directly to a private, temporary Supabase Storage bucket, avoiding the hosting function's request size limit. The server then converts it to WebP (up to 5 MB), publishes it to the public `portfolio-photos` bucket, and removes the temporary file. Photo changes go live immediately; other profile edits still use **Publish changes**. The server creates both buckets on the first upload using the secret key.

Set `SUPABASE_URL` before the production build so Next.js can optimize images from that Storage bucket. The gallery supports up to 60 photos total.
