# Grrand Quiz
Next.js 16 on Vercel. Server-authoritative rounds (signed tokens), personal stats in the browser, optional Postgres (any provider, Supabase included) for accounts, ranks, teams and the live count.

```
npm install
cp .env.example .env.local   # set GRRAND_SECRET (openssl rand -base64 48)
npm run dev
```
Checks: `npm run typecheck`, `check:contrast`, `check:bank`, `check:schema`, `test:data` (needs GRRAND_SECRET), `npx tsx scripts/test-engine.ts`.

Accounts, ranks and teams switch on when `DATABASE_URL` is set; tables are created on first use. Ranked scores are read from the signed round token on the server, never sent by the browser.

Growing the question bank (Vercel cannot edit files after a deploy, so a person approves and commits):
1. `ADMIN_TOKEN=... npm run questions -- draft zambia 8` calls `POST /api/admin/generate` on the live site. Gemini drafts; every configured checker (Groq, Cerebras, Claude) reviews; duplicates of the bank are dropped. Drafts land in `drafts/` and nothing touches the bank.
2. Read them. A checker saying ok is a signal, not proof; check Zambian facts and anything with a number, date or "first/largest" yourself.
3. `npm run questions -- add drafts/<file>.json --accept 0,2,3` (or `--all-ok`) appends to the end of that category, then `npm run check:bank`, commit and push; Vercel redeploys.

Env: `GEMINI_API_KEY`, `ADMIN_TOKEN` (16+ chars), plus any of `GROQ_API_KEY`, `CEREBRAS_API_KEY`, `ANTHROPIC_API_KEY`. See `docs/GATE_REPORT.md` for what is and isn't verified.
