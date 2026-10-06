# Grrand Quiz
Next.js 16 on Vercel. Server-authoritative rounds (signed tokens), personal stats in the browser, Supabase schema ready for accounts and rankings.

```
npm install
cp .env.example .env.local   # set GRRAND_SECRET (openssl rand -base64 48)
npm run dev
```
Checks: `npm run typecheck`, `check:contrast`, `check:bank`, `check:schema`, `npx tsx scripts/test-engine.ts`.

Question drafting: `POST /api/admin/generate` with `Authorization: Bearer $ADMIN_TOKEN` and `{"category":"zambia","count":8}`. Gemini drafts, Claude optionally verifies, nothing is saved; a person reviews. See `docs/GATE_REPORT.md` for what is and isn't verified.
