# Grrand Quiz
Next.js 16 on Vercel. Server-authoritative rounds (signed tokens), personal stats in the browser, optional Postgres (any provider, Supabase included) for accounts, ranks, teams and the live count.

```
npm install
cp .env.example .env.local   # set GRRAND_SECRET (openssl rand -base64 48)
npm run dev
```
Checks: `npm run typecheck`, `check:contrast`, `check:bank`, `check:schema`, `test:data` (needs GRRAND_SECRET), `npx tsx scripts/test-engine.ts`.

Accounts, ranks and teams switch on when `DATABASE_URL` is set; tables are created on first use. Ranked scores are read from the signed round token on the server, never sent by the browser.

Question drafting: `POST /api/admin/generate` with `Authorization: Bearer $ADMIN_TOKEN` and `{"category":"zambia","count":8}`. Gemini drafts, Claude optionally verifies, nothing is saved; a person reviews. See `docs/GATE_REPORT.md` for what is and isn't verified.
