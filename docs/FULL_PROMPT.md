# GRRAND QUIZ: FULL BUILD PROMPT
(Self-contained. Paste the whole thing into Claude Code, Cursor, Google AI Studio, Hercules or any builder. Nothing outside this prompt is needed.)

## ROLE
You are a senior product engineer and UI architect. Build "Grrand Quiz", a mobile-first social quiz web app for players in Zambia and southern Africa, as a Next.js project deployable to Vercel. Build it completely and run its checks. Do not ask me questions; where something is unspecified, choose the simplest sensible option and list it at the end under "Assumptions".

## THE PRODUCT IN ONE PARAGRAPH
A round is 5 questions, 20 seconds each. Everyone plays the same Daily Round, which resets at midnight Lusaka time, and there are 12 categories to master on their own. Players can play instantly as guests. If they make an account they appear on daily, 7-day and all-time ranks, can filter by city, and can join teams (school, class, crew). Free to play.

## STACK (fixed)
- Next.js 16 App Router, React 19, TypeScript (strict). Node 20+.
- Plain CSS with design tokens in CSS variables. NO Tailwind, NO component library, NO icon library (draw small inline SVG icons).
- Optional Postgres via the `pg` package and one env var, DATABASE_URL (works with any Postgres, including a Supabase pooled string). No Supabase SDK, no Supabase Auth.
- Hosting: Vercel, region cpt1 (vercel.json). Security headers in next.config.ts (nosniff, frame SAMEORIGIN, referrer-policy, permissions-policy, HSTS).
- Dev dependencies for checks: tsx, @electric-sql/pglite.

## NON-NEGOTIABLE RULES
1. HONESTY: never show fake players, fake scores, fake counts or placeholder leaderboards. Anything not live says "Needs setup".
2. SERVER IS AUTHORITATIVE: the browser never sees correct answers and never reports a score. See "Round engine".
3. APPEND-ONLY BANK: question ids are `${categoryId}-${index}` and are stored in players' histories. Never reorder or delete entries. New questions go at the end of a category.
4. It must load and play on wifi networks as well as mobile data: no blocked third-party fonts or scripts; use system fonts; keep first load light.
5. Accessibility: contrast 4.5:1 for text and 3:1 for UI, visible focus rings, 44px minimum touch targets, no colour-only meaning, `prefers-reduced-motion` respected, forced-colors support, usable at 375px wide with no horizontal scroll, play by keyboard (A-D or 1-4 to answer, Enter for next).
6. Credit in every footer, exactly: "Crafted, conceptualized and designed by **Hermann Kapepe**, Founder of Witty Enterprises. Product Designer, UI Architect and UX Designer." (About page uses name and title only.)

## DESIGN DIRECTION
Not a generic "AI app" look: no purple-to-blue gradients, no glassmorphism, no emoji as icons, no centred hero with three feature cards. Aim for the clarity of Duolingo and Kahoot (big tappable answers, one clear action per screen, confident type) with the sober structure of modern government sites. Benchmark against Kahoot, Duolingo, QuizUp and gov.uk-style pages before finalising, and note in docs/BENCHMARKS.md what you borrowed and what you rejected.

Brand tokens (locked):
- text #1B1033, text-muted #4F4668, surface #FBFAFD, surface-alt #F1EEF7
- stage (dark panel) #2D1B5E, stage-text #FFFFFF, stage-muted #D9D0F2
- action (primary button) #C1294A, action-text #FFFFFF, action-hover #A81F3C
- lavender #7B5EA7, border-ui #6F6788, focus #1B1033
- ok #0B6B3A / ok-bg #E4F4EA / ok-text #0B4F2B, miss-bg #ECE8F5 / miss-text #3B2F5E, stop #B3261E
Write these to tokens.json with the foreground/background pairs, and add `scripts/contrast.py` that fails the build if any pair is below its required ratio.
Buttons are chunky: 2px border, thicker bottom border that compresses on press. A wrong answer is shown in calm purple, never red shaming. A correct answer is green with a check icon plus the word "Correct".

## NAVIGATION
- Mobile: bottom tab bar with 4 tabs: Play (/), Ranks (/ranks), Teams (/teams), Me (/me). Desktop (>= 900px): left rail with the same tabs.
- Top bar: logo (two overlapping rounded squares with a check) and a streak chip linking to /me.
- Footer: credit line, links to /about and /privacy.
- Inside a round (/play/*) hide the tab bar and top bar so nothing distracts. Provide a Leave button with a confirm dialog.
- Pages: /, /ranks, /teams, /me, /about, /privacy, /play/daily, /play/[category].
- PWA: manifest, favicon (app/icon.svg), and 192/512 PNG icon routes at /pwa/[size] using next/og ImageResponse.

## HOME (/)
Headline "Five questions. Twenty seconds each." Daily Round panel on the dark stage colour: today's date, live countdown to the next Lusaka midnight, a primary button "Play today's round" (or the player's result and "See result and share" if already played today). If an unfinished round exists, show a "Resume" banner. Below: grid of 12 category cards (name, blurb, a pill showing "N new" for questions this player has not seen, or "All seen"). If the database is on and at least one signed-in player finished today's daily, show "N signed-in players have finished today's round."

## CATEGORIES (id, name, blurb)
zambia "Zambia" / Places, people and history; africa "Africa" / The continent, country by country; geography "World geography" / Maps, rivers and capitals; science "Science" / Atoms to planets; history "History" / Events that shaped the world; sport "Sport" / Pitch, track and court; music "Music" / From mbira to amapiano; film "Film and TV" / Screens big and small; tech "Technology" / How the digital world works; food "Food and drink" / What is on the table; nature "Nature" / Animals and plants; general "General knowledge" / A bit of everything.

## QUESTION BANK (lib/bank.ts)
Store as `const RAW: Record<string, Raw[]>` with `type Raw = [question, optA, optB, optC, optD, correctIndex(0-3), difficulty("E"|"M"|"H"), fact]`. A `build()` turns it into `Question { id, cat, q, options[4], answer, diff, fact }`. Export BANK, BY_ID, CATEGORIES.
Write at least 14 questions per category (at least 4 easy, 4 medium, 2 hard), about 170 total. Rules: exactly one defensible answer, wrong options plausible and of the same type, one interesting sentence of explanation, no facts that go stale (no "current president"), Zambian questions must be ones you are certain of. Examples of the form:
- ["Which city is the capital of Zambia?","Ndola","Lusaka","Kitwe","Livingstone",1,"E","Lusaka is Zambia's largest city and its seat of government."]
- ["Which river does the Kariba Dam hold back to form Lake Kariba?","Kafue","Zambezi","Luangwa","Limpopo",1,"M","The dam on the Zambezi, completed in 1959, created one of the world's largest reservoirs."]
- ["How many points is a free throw worth in basketball?","1","2","3","4",0,"E","A free throw is worth one point."]
`scripts/check-bank.ts` must fail on: not 4 options, duplicate options, answer out of range, duplicate question text, question not ending in "?" or "...", fact under 15 characters, or a category without at least 2 E, 2 M and 1 H.

## ROUND ENGINE (the core; lib/round.ts, lib/token.ts, lib/scoring.ts)
Stateless server with an HMAC-SHA256 signed token (Node crypto). Secret env GRRAND_SECRET, at least 16 characters; in production, throw if missing; in dev use a fixed dev secret. Token format `base64url(json).base64url(hmac)`, verified with timingSafeEqual, max 4000 chars.

RoundState: `{ v:1, rid, mode:"daily"|"category", cat|null, day|null, qids[], i, phase:"shown"|"answered", t(server ms the current question was shown), ok:(0|1)[], pts:number[], fresh(multiplier x100) }`.

Endpoints (all POST, JSON, runtime nodejs, dynamic force-dynamic, `Cache-Control: no-store`):
- /api/round/start `{mode, category?, seen?[], recentPlays?}` returns `{token, mode, category, day, limitSec:20, repeats, questions:[{id,cat,q,options(shuffled for this round),diff}]}`. No answers and no facts in this response.
- /api/round/answer `{token, choice 0-3 or -1 for timeout}` verifies the token and phase "shown"; computes elapsed = now - t - 400ms grace; timed out if choice is -1 or elapsed > 21.5s; returns `{token, correct, timedOut, correctIndex (in the shuffled order), fact, points, elapsedMs}` and a new token with phase "answered".
- /api/round/next `{token}` requires phase "answered" and more questions; returns a new token with phase "shown", i+1, t=now.
- /api/round/finish `{token}` requires all answered; returns `{correct,total,basePoints,perfectBonus,freshness,points,grid:["hit"|"miss"...],day,category,mode,questionIds}`.
Option order per question is a deterministic shuffle seeded by `${rid}:${questionId}` so the server can recompute it without storing anything.

Question selection:
- Round size 5. Difficulty ramp E, M, H, M, E (easy start, peak at the third, finish on an easier one). If a difficulty is missing, fall back to the nearest.
- Daily: seeded by the Lusaka date (UTC+2, no daylight saving), same 5 questions for everyone: shuffle categories with the seeded RNG and take one question per ramp slot from successive categories.
- Category round: prefer questions the player has not seen (`seen` ids sent by the client, oldest first); when a difficulty is exhausted, reuse the one seen longest ago and count it in `repeats`.
- Seeded RNG: small deterministic PRNG (e.g. mulberry32 from a string hash) in lib/rng.ts.

Scoring (Kahoot-style, no streak bonus):
- Base: Easy 600, Medium 800, Hard 1000, only if correct.
- Speed trims, never below half: under 500ms = full base; otherwise base * (1 - 0.5 * min(1, elapsed/20000)), rounded.
- Perfect round (5/5) adds 500.
- Freshness multiplier (category rounds only; daily is always 1.0): plays of the same category in the last 7 days (device-reported) 0, 1, 2, 3 or more gives 1, 0.6, 0.4, 0.2.
- Round points = round((sum of answer points + perfect bonus) * freshness).

Write `scripts/test-engine.ts` that proves: a valid round scores correctly; tampered token rejected; token replayed after answering rejected (409); answering out of order rejected; timeout scored 0; slow answers still earn at least half; correct answer never appears in the start response; finish before completion rejected; same daily for the same Lusaka day; different tokens do not cross rounds. At least 14 checks, all printed with ok/FAIL.

## ROUND PLAYER UI (components/RoundPlayer.tsx)
- Header: progress segments (5), question counter, timer bar that drains over 20s and turns urgent in the last 5s, plus the seconds as text.
- Question card, then 4 answer buttons labelled A-D (large, full width, stacked). Selecting locks the answer and calls /api/round/answer. Then show Correct/Not quite, the correct option, the fact, the points earned, and a "Next" button (or "See result" on the last).
- Timeout auto-submits -1.
- Keyboard: A-D or 1-4 answer, Enter or Space advances. Haptics via navigator.vibrate where available.
- Network failure: keep the answer, show "No connection. Your answer is kept." and a Retry button; never lose a round.
- Resume: persist the active round (start response, token, index, phase, answers, time shown) in localStorage after every step; on reload restore it and re-start the timer from the stored time (a question whose time ran out is submitted as timed out).
- If the daily was already played today, show the stored result instead of starting a new one.
- Summary screen on the dark stage: "N of 5 correct", the result grid (5 cells, check or dash icons), points breakdown table (base, perfect bonus, freshness, total), Share button, and 3 suggested other categories. Share text: `Grrand Quiz daily 2026-10-09\n4/5 · 3,200 pts\n🟩🟩🟩🟩🟪\nPlay: <SITE URL>`; use the Web Share API with a WhatsApp link and a Copy fallback.

## LOCAL STORAGE (lib/local.ts), key `grrand:v3`, wrapped in try/catch and fully optional
Fields: seen (ids, capped at 1000), plays (category plays with timestamps for the 7-day freshness count), daily results by date, streak data (consecutive Lusaka days with a finished daily), totals (rounds, points, best round, answered, correct, perfects), active round. Me page shows streak, rounds, total points, best round, accuracy and perfect rounds, plus "Erase my data on this device" with a confirm.

## ACCOUNTS (only active when DATABASE_URL is set)
Schema (lib/schema.ts exported as a SQL string, idempotent, applied automatically on first use, no extensions needed):
- profiles(id uuid pk default gen_random_uuid(), username text check ~ '^[A-Za-z0-9_]{3,20}$', pin_hash, city, fail_count smallint, locked_until timestamptz, created_at); unique index on lower(username).
- teams(id, name check 2-40 chars, kind in ('school','class','crew'), created_by, created_at); unique index on lower(name).
- team_members(team_id, profile_id, joined_at, pk both).
- round_results(id, round_key text UNIQUE, profile_id, mode, category, day date, correct 0-5, total = 5, points >= 0, played_at, check (mode='daily') = (day is not null)); unique index one ranked daily per (profile_id, day) where mode='daily'; index on (day, points desc) where mode='daily'.
- Enable row level security on all tables with no policies (the app connects as owner).
Auth: username + 6-digit PIN only, no email or phone. Hash PINs with scrypt (random 16-byte salt, format `s1$salt$hash`). After 5 wrong PINs lock the account for 15 minutes. Unknown user and wrong PIN return the same error and cost the same time. Session = the signed token machinery with `{u: profileId, exp}`, httpOnly, SameSite=Lax, Secure in production, 30 days. JSON requests only (reject other content types). City is chosen from a fixed list (Lusaka, Kitwe, Ndola, Kabwe, Livingstone, Chipata, Kasama, Solwezi, Mansa, Mongu, Choma, Elsewhere), never free text.
Data layer takes an injectable `query(sql, params)` so it runs on `pg` in production and on PGlite in tests. `lib/db.ts` returns null when DATABASE_URL is unset; with `pg` set `ssl: { rejectUnauthorized:false }` unless the host is localhost and strip `sslmode` from the URL.

Routes: POST /api/auth/register, /api/auth/login, /api/auth/logout; GET /api/auth/me (returns `{enabled, user}`); POST /api/results; GET /api/ranks?w=daily|weekly|all&city=; GET and POST /api/teams; POST /api/teams/join `{teamId, leave?}`; GET /api/stats `{enabled, playersToday}`.
Ranked results rule (critical): /api/results takes ONLY the finished round token. The server verifies it, reads points from the signed state, requires a signed-in session, requires the round to have finished within 10 minutes, requires a daily round's day to equal today's Lusaka day, and inserts with `on conflict do nothing` keyed on the round id and on (player, day). A score sent by the client is ignored. Return `{recorded:true}` or `{recorded:false, reason}`.
Boards count DAILY rounds only so practice rounds cannot buy a rank: daily = today, weekly = the last 7 Lusaka days summed, all = all time summed; top 50, ties broken by earliest play. Team board = average points per member daily result in the window (so team size gives no advantage), show player count. A player can be in at most 5 teams. Team name unique case-insensitively.
UI: Me page has a sign-up/sign-in panel (username, PIN, optional city) and a signed-in panel with Sign out. Ranks page: window tabs (Today, 7 days, All time), Players/Teams tabs, city filter, table with the signed-in player's row highlighted, honest empty states. Teams page: create team form (signed in), list with Join/Leave. When the database is not configured every one of these shows a "Needs setup" empty state. After a finished round the summary says "Saved to the rankings." or the reason it was not saved, or "Sign in on the Me tab to put your daily score on the rankings."
Privacy page must say exactly what is stored: nothing for guests; for accounts the username, hashed PIN, chosen city, score and date of rounds finished while signed in, and teams joined.

## QUESTION-DRAFTING TOOL (admin, drafts only)
POST /api/admin/generate with `Authorization: Bearer ADMIN_TOKEN` (16+ chars, otherwise the endpoint is off; compare with timingSafeEqual) and `{category, count 1-15}`. Calls the Gemini REST API (model from env GEMINI_MODEL, JSON response schema) to draft questions, drops malformed ones and any whose word overlap (Jaccard > 0.6) with the bank or other drafts is too high, then asks every configured checker to review each draft: GROQ_API_KEY (llama-3.3-70b-versatile), CEREBRAS_API_KEY (llama-3.3-70b), ANTHROPIC_API_KEY (Claude), all overridable by env. A draft is ok only if every checker that answered says ok. Return drafts with per-checker verdicts. It NEVER writes to the bank. Add `scripts/questions.mts` with `draft <category> [count]` (calls the live endpoint, saves drafts/ JSON) and `add <file> --accept 0,2 | --all-ok` (appends rows to the end of that category in lib/bank.ts), plus a test for the append function.

## SCRIPTS AND CHECKS (package.json)
dev, build, start, typecheck, check:contrast, check:bank, check:schema (applies the schema twice on PGlite and tests every constraint), test:data (PGlite, 39-style checks: PIN hashing, lockout, daily-only boards, one ranked daily per player, replayed round refused, stale round refused, team average beats team size, 5-team cap), test:questions, questions. Everything must pass before you say you are done. Also run the production build and play a full round in a real browser at 375px (Playwright), including resume after refresh and keyboard play, and confirm no console errors.

## ENV (.env.example)
GRRAND_SECRET (required in production), DATABASE_URL (optional), GEMINI_API_KEY, ADMIN_TOKEN, GROQ_API_KEY, CEREBRAS_API_KEY, ANTHROPIC_API_KEY (all optional), NEXT_PUBLIC_SITE_URL.

## DELIVERABLES
The full repo; README (run, env, how to add questions); docs/BENCHMARKS.md; docs/GATE_REPORT.md listing every check as PASS, FAIL or NOT TESTED with evidence (do not claim anything you did not run); and a final "Assumptions" list. Commit in small steps.

## DEFINITION OF DONE
A guest can open the site on a phone, tap Play, finish five timed questions, see a result they can share on WhatsApp, refresh mid-round and resume, and come back tomorrow to a new daily round. With DATABASE_URL set, a player can make an account, have their daily score ranked, create and join a team, and see both boards. The browser can never learn a correct answer early or submit its own score.
