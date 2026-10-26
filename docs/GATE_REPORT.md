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
| Bank answer accuracy | PARTIAL | First 170: independent check found 13 faulty items, all fixed. The 292 added 2026-10-26: 163 source-verified, 100 reviewed by a second model only (no dates, numbers or superlatives), 29 textbook facts the source check could not reach. See QUESTION_AUDIT.md. Models reviewing models is not proof; a person should spot-check |
| Bank size | IMPROVED | 462 questions (36 to 41 per category); first repeat for a player who plays one category every round now comes around round 8 (was round 3) |
| Benchmark parity (G) | UNVERIFIED | See BENCHMARKS.md |
| Live on Vercel with a database | NOT YET | Needs `DATABASE_URL` set in Vercel; until then Ranks, Teams and sign-in show "Needs setup" |
| Admin generator + checkers | BUILT, INERT | Mock-tested: auth, duplicate drop, malformed drop, multi-checker disagreement flagged, `npm run test:questions`. Not yet run with real keys. Needs GEMINI_API_KEY and ADMIN_TOKEN in Vercel; free checkers need GROQ_API_KEY or CEREBRAS_API_KEY |
| Duplicate detection | PASS | `npm run test:similar` (7 checks): same-answer rewordings caught, template questions (Cairo/Baghdad) not falsely flagged; wired into check:bank and the generator. Known limit: an inverted question (answer and subject swapped) is not caught |
| Share card | PASS | Local production build: result link `/r/<signed card>` shows a 1200x630 card; a forged card falls back to a generic page |
| Real devices / slow network | NOT TESTED | Desktop Chromium only |
