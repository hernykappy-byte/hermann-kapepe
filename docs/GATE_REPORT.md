# Gate report
| Gate | Status | Evidence |
|---|---|---|
| Contrast | PASS | `npm run check:contrast` (18/18) |
| Question bank structure | PASS | `npm run check:bank` |
| Round engine (tamper, replay, timing) | PASS | `npx tsx scripts/test-engine.ts` (14/14) |
| Database schema | PASS | `npm run check:schema` on PGlite (11 checks) |
| Build and types | PASS | `next build`, `tsc --noEmit` |
| Phone walkthrough (375px) | PASS | Playwright: daily round, resume, keyboard, timeout, no console errors, no horizontal scroll |
| Benchmark parity (G) | UNVERIFIED | See BENCHMARKS.md |
| Bank answer accuracy | UNVERIFIED | 170 questions not independently fact-checked |
| Supabase wiring | NOT BUILT | Schema only; needs keys |
| Real devices / slow network | NOT TESTED | Desktop Chromium only |
