-- Grrand Quiz schema. Not wired into the app yet: accounts, rankings and teams stay
-- "Planned" in the UI until these tables are live and the app writes to them.
-- Plain Postgres so it can be validated locally (scripts/check-schema.ts).

create table profiles (
  id uuid primary key,                       -- = auth.users.id in Supabase
  username text not null unique check (username ~ '^[A-Za-z0-9_]{3,20}$'),
  city text,
  school text,
  created_at timestamptz not null default now()
);

create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 2 and 40),
  kind text not null check (kind in ('school', 'class', 'crew')),
  created_by uuid not null references profiles(id),
  created_at timestamptz not null default now()
);

create table team_members (
  team_id uuid not null references teams(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (team_id, profile_id)
);

-- One row per finished round. Written only by the server after it verifies the signed
-- round token, never by the browser directly.
create table round_results (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  mode text not null check (mode in ('daily', 'category')),
  category text,
  day date,                                  -- Lusaka day, daily rounds only
  correct smallint not null check (correct between 0 and 5),
  total smallint not null check (total = 5),
  points integer not null check (points >= 0),
  played_at timestamptz not null default now(),
  check ((mode = 'daily') = (day is not null))
);

-- A player gets one ranked daily result per day.
create unique index one_daily_per_player on round_results (profile_id, day) where mode = 'daily';
create index results_by_day on round_results (day, points desc) where mode = 'daily';

-- Daily board. Team boards average members, so team size gives no advantage.
create view daily_board as
  select r.day, p.username, p.city, p.school, r.points, r.correct
  from round_results r join profiles p on p.id = r.profile_id
  where r.mode = 'daily';

create view team_daily_board as
  select r.day, t.id as team_id, t.name, round(avg(r.points))::int as avg_points, count(*)::int as players
  from round_results r
  join team_members m on m.profile_id = r.profile_id
  join teams t on t.id = m.team_id
  where r.mode = 'daily'
  group by r.day, t.id, t.name;

-- Row level security (Supabase). Reads are public for boards; writes go through the
-- service role on the server.
alter table profiles enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table round_results enable row level security;

create policy profiles_read on profiles for select using (true);
create policy profiles_update_own on profiles for update using (id = auth.uid());
create policy teams_read on teams for select using (true);
create policy members_read on team_members for select using (true);
create policy results_read on round_results for select using (true);
