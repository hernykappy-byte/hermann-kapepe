// Plain Postgres, idempotent. Applied automatically on first use when DATABASE_URL is set,
// and validated against an in-process Postgres by scripts/check-schema.ts and scripts/test-data.ts.
// Accounts are our own (username + 6-digit PIN), so this works on any Postgres, Supabase included.
export const SCHEMA = `

create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  username text not null check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  pin_hash text not null,
  city text,
  fail_count smallint not null default 0,
  locked_until timestamptz,
  created_at timestamptz not null default now()
);
create unique index if not exists profiles_username_ci on profiles (lower(username));

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 40),
  kind text not null check (kind in ('school', 'class', 'crew')),
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);
create unique index if not exists teams_name_ci on teams (lower(name));

create table if not exists team_members (
  team_id uuid not null references teams(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (team_id, profile_id)
);

-- One row per finished round, written only by the server after it verifies the signed
-- round token. round_key is the round id inside that token, so a token can be saved once.
create table if not exists round_results (
  id uuid primary key default gen_random_uuid(),
  round_key text not null unique,
  profile_id uuid not null references profiles(id) on delete cascade,
  mode text not null check (mode in ('daily', 'category')),
  category text,
  day date,
  correct smallint not null check (correct between 0 and 5),
  total smallint not null check (total = 5),
  points integer not null check (points >= 0),
  played_at timestamptz not null default now(),
  check ((mode = 'daily') = (day is not null))
);
create unique index if not exists one_daily_per_player on round_results (profile_id, day) where mode = 'daily';
create index if not exists results_by_day on round_results (day, points desc) where mode = 'daily';

-- The app reaches the database as its owner. With RLS on and no policies, Supabase's public
-- REST API can read none of this (PIN hashes included).
alter table profiles enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table round_results enable row level security;
`;
