# Gate report
| Gate | Status | Evidence |
|---|---|---|
| Contrast | PASS | `npm run check:contrast` (18/18) |
| Question bank structure | PASS | `npm run check:bank` |
| Round engine (tamper, replay, timing) | PASS | `npx tsx scripts/test-engine.ts` (14/14) |
| Database schema | PASS | `npm run check:schema` on PGlite (14 checks, applies twice) |
| Accounts, results, boards, teams | PASS | `npm run test:data` on PGlite (39 checks): PIN hashing, lockout, daily-only boards, one ranked daily per player, replayed round refused, team average |
| Live API end to end | PASS | Real Postgres 16 + production build: sign up, play daily in browser, score saved from signed token, forged token 400, no session 401, replay refused, ranks, teams, live count |
| Build and types | PASS | `next build`, `tsc --noEmit` |
| Phone walkthrough (375px) | PASS | Playwright: daily round, resume, keyboard, timeout, accounts, teams, ranks, no console errors |
| Bank answer accuracy | PARTIAL | Independent fact-check found 13 faulty or ambiguous items; all fixed. Most remaining items judged from general knowledge, only about 5 web-sourced. The tiger-size claim and a few well-known facts were not re-sourced |
| Bank size | GAP | 170 questions (14 to 16 per category); players see repeats from about round 3. Use the generator, then a human review |
| Benchmark parity (G) | UNVERIFIED | See BENCHMARKS.md |
| Live on Vercel with a database | NOT YET | Needs `DATABASE_URL` set in Vercel; until then Ranks, Teams and sign-in show "Needs setup" |
| Admin generator | BUILT, INERT | Needs GEMINI_API_KEY and ADMIN_TOKEN in Vercel; Claude check needs ANTHROPIC_API_KEY |
| Real devices / slow network | NOT TESTED | Desktop Chromium only |
