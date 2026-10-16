# MotherDuck queries behind the shared data

`tools/pti_share_sync.py` builds the shared CSVs by running the queries below against MotherDuck (the `md:` database, or a local `.duckdb` file passed with `--database`). This page lists every one of them, what it reads and what it produces. The SQL lives in the constants at the top of `pti_share_sync.py` (`BASE`, `MATCHES`, `RATINGS`, `GROUPS`, `LEAGUES`, `NAMES`); if you change one there, change it here too.

All queries are read-only and use two tables:

| Table | Used for |
|---|---|
| `apta2.main.matches_unified` | One row per match line: date, schedule and line number, the four players' ids and names, their PTI (`…ELOStart`) and confidence (`…ELOConfidence`) before the match, the result code (`Winner`), the league (`LeagueID`) and up to five sets (`Set1.Team1Score` … `Set5.T2TieBreak`). |
| `apta2.main.leagues` | League names: `PSLeagueID` (the id `matches_unified.LeagueID` holds) and `PSName`. |

Most `matches_unified` columns are stored as `BLOB`, so the queries wrap them in `decode()` to get text, and `TRY_CAST` numbers out of that text. The PTI and confidence columns are already `DOUBLE`. In `leagues`, `PSLeagueID` and `PSName` are `VARCHAR`.

Player slots are numbered the same way everywhere: 1 = `Player1H`, 2 = `Player2H` (home team), 3 = `Player1A`, 4 = `Player2A` (away team).

| Query | Output | Rows over | Runs |
|---|---|---|---|
| [Base match rows](#1-base-match-rows-base) | shared by the next two | exported dates | always |
| [Matches](#2-matchescsv-matches) | `matches.csv` | exported dates | always |
| [Ratings](#3-ratingscsv-ratings) | `ratings.csv` | exported dates | always |
| [Groups](#4-groupscsv-groups) | `groups.csv` | whole table | unless `--no-groups` |
| [Leagues per player](#5-leagues-per-player-leagues) | restricted pool membership (not uploaded) | whole table | only with restricted pools |
| [All names](#6-all-player-names-names) | names placeholders must avoid (not uploaded) | whole table | only with restricted pools |

## 1. Base match rows (`BASE`)

Turns each `matches_unified` row into one tidy match: Eastern time, the four players, their starting PTI and confidence, whether APTA rates it, and a score string.

```sql
SELECT
    timezone('America/New_York', timezone('UTC', decode("Date")::TIMESTAMP)) AS ts,
    TRY_CAST(decode(ScheduleID) AS BIGINT) AS sid, TRY_CAST(decode(LineNumber) AS INTEGER) AS ln,
    decode(Player1HID) AS p1, decode(Player2HID) AS p2, decode(Player1AID) AS p3, decode(Player2AID) AS p4,
    decode(Player1HName) AS n1, decode(Player2HName) AS n2, decode(Player1AName) AS n3, decode(Player2AName) AS n4,
    Player1HELOStart AS s1, Player2HELOStart AS s2, Player1AELOStart AS s3, Player2AELOStart AS s4,
    Player1HELOConfidence AS c1, Player2HELOConfidence AS c2, Player1AELOConfidence AS c3, Player2AELOConfidence AS c4,
    (Player1HELOStart IS NOT NULL AND Player2HELOStart IS NOT NULL
    AND Player1AELOStart IS NOT NULL AND Player2AELOStart IS NOT NULL
    AND Player1HELOConfidence IS NOT NULL AND Player2HELOConfidence IS NOT NULL
    AND Player1AELOConfidence IS NOT NULL AND Player2AELOConfidence IS NOT NULL
    AND decode(Winner) IN ('1', '2', '7', '8')) AS rated,
    concat_ws(', ', <set 1>, <set 2>, <set 3>, <set 4>, <set 5>) AS score
  FROM "apta2"."main"."matches_unified"
```

- `ts`: `Date` is stored in UTC; it is converted to US Eastern, so dates and the `--from`/`--to` range follow the local calendar.
- `rated`: true only when all four players have a starting PTI and confidence and the result code is one APTA rates (`1`, `2`, `7`, `8`). Defaults, forfeits and other codes never change a rating, so they are left out.
- `score`: the played sets joined with `, `, for example `6-4, 3-6, 1-0(10-7)`. `concat_ws` skips the sets that come out `NULL`.

Each `<set n>` is the same expression (from `set_score(n)`), written here with
`a = TRY_CAST(decode("Setn.Team1Score") AS INTEGER)`, `b = …Team2Score`, `x = …T1TieBreak`, `y = …T2TieBreak` and `tb = coalesce(x, 0) + coalesce(y, 0)`:

```sql
CASE WHEN a IS NULL OR b IS NULL OR a + b + tb = 0 THEN NULL
     WHEN a + b = 1 AND tb = 0 AND (x IS NULL OR decode(Winner) NOT IN ('1', '2')) THEN NULL
     ELSE a || '-' || b || CASE WHEN tb > 0 THEN '(' || x || '-' || y || ')' ELSE '' END
END
```

That gives `games-games`, plus `(points-points)` when the set has tiebreak points. A set is dropped when nothing was played in it, or when it is a 1-0 set with no tiebreak points that APTA doesn't count (missing tiebreak, or a result code other than 1 or 2), because the explorer can't tell those apart from ones it does count (see `parseSets` in `pti24-engine.js`).

### The export filter

`MATCHES` and `RATINGS` run on top of `BASE` through two CTEs (`with_f`):

```sql
WITH b AS (<BASE>),
  f AS (SELECT * FROM b WHERE rated AND score <> ''
        -- only with --from: AND ts >= DATE 'YYYY-MM-DD'
        -- only with --to:   AND ts < DATE 'YYYY-MM-DD' + INTERVAL 1 DAY
  )
```

So the exported matches are the rated ones with at least one counted set, inside the optional date range (both ends inclusive, Eastern time). The dates are checked as `YYYY-MM-DD` before they go into the SQL.

## 2. `matches.csv` (`MATCHES`)

```sql
<WITH b, f as above>
  SELECT strftime(ts, '%Y-%m-%d') AS date,
    p1 AS player1id, p2 AS player2id, p3 AS player3id, p4 AS player4id, score
  FROM f
  ORDER BY ts, sid, ln, p1, p2, p3, p4
```

One row per exported match, in play order: by time, then schedule, line and players so the order is the same every run. Players 1 and 2 are the home team, 3 and 4 the away team.

## 3. `ratings.csv` (`RATINGS`)

```sql
<WITH b, f as above>
  , slots AS (
    SELECT ts, sid, ln, p1 AS id, n1 AS name, s1 AS pti, c1 AS sigma FROM f
    UNION ALL SELECT ts, sid, ln, p2, n2, s2, c2 FROM f
    UNION ALL SELECT ts, sid, ln, p3, n3, s3, c3 FROM f
    UNION ALL SELECT ts, sid, ln, p4, n4, s4, c4 FROM f
  )
  SELECT id, name, pti, sigma
  FROM slots
  QUALIFY row_number() OVER (PARTITION BY id ORDER BY ts, sid, ln) = 1
  ORDER BY id
```

One row per player who appears in the exported matches: their name, PTI and confidence (`sigma`) going into their first exported match. These are the starting ratings the explorer replays the matches from. Because it reads `f`, a `--from` date moves each player's starting point to their first match on or after that date.

## 4. `groups.csv` (`GROUPS`)

```sql
WITH pl AS (
  SELECT DISTINCT decode(p) AS player, decode(LeagueID) AS lg
  FROM "apta2"."main"."matches_unified", UNNEST([Player1HID, Player2HID, Player1AID, Player2AID]) AS t(p)
  WHERE p IS NOT NULL AND coalesce(decode(LeagueID), '') <> ''
)
SELECT pl.player, 'league' AS type, pl.lg AS "group", coalesce(nullif(l.PSName, ''), pl.lg) AS label
FROM pl LEFT JOIN (SELECT DISTINCT ON (PSLeagueID) * FROM "apta2"."main"."leagues") AS l ON l.PSLeagueID = pl.lg
ORDER BY "group", player
```

One row per player and league they have played in, for the explorer's Groups filter.

- It reads the **whole** table, every match and not only rated ones or the exported dates, so a player's leagues don't change with `--from`/`--to`.
- `UNNEST` turns the four player slots into one row each; rows with no league id are skipped.
- The label is the league's `PSName`, or the league id when the league has no name or isn't in `leagues`. `DISTINCT ON (PSLeagueID)` keeps one `leagues` row per id, so a league listed twice can't duplicate players.
- Only `league` groups come from MotherDuck today. Clubs, teams, cities or regions would be more `UNION ALL` branches with their own `type`.

After the query, the script removes rows for players in a restricted pool and blanks the label on every row but each group's first (`compact_groups`), to keep the file small.

## 5. Leagues per player (`LEAGUES`)

```sql
SELECT decode(p) AS id, list(DISTINCT coalesce(decode(LeagueID), '')) AS leagues
FROM "apta2"."main"."matches_unified", UNNEST([Player1HID, Player2HID, Player1AID, Player2AID]) AS t(p)
WHERE p IS NOT NULL GROUP BY 1
```

Runs only when `pti-pools.json` defines restricted pools. It gives every player in the whole table the set of leagues they have played in (a match with no league counts as league `''`). `pti_pools.members` then picks each pool's players from it: rule `only` takes players whose leagues all belong to the pool, `ever` takes anyone with at least one. Nothing from this query is uploaded.

## 6. All player names (`NAMES`)

```sql
SELECT DISTINCT decode(n) AS name
FROM "apta2"."main"."matches_unified", UNNEST([Player1HName, Player2HName, Player1AName, Player2AName]) AS t(n)
WHERE n IS NOT NULL
```

Also runs only with restricted pools. It lists every real name in the table so that placeholder names (such as "Avery H.") never match the first name and last initial of a real player. Nothing from this query is uploaded.
