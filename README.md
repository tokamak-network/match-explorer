# RIVAI Explorer

Etherscan-like explorer for **PvP** match data. Designed so the same UI can read from a fixture today and from an on-chain match ledger tomorrow.

## Stack

- Next.js 16 (App Router) · React 19 · TypeScript (strict)
- CSS Modules (no Tailwind / UI library)
- Server Components by default; only `SearchBar` and `CopyButton` are client islands

## Quick start

```sh
npm install
npm run dev
# open http://localhost:3000 → redirects to /explorer
```

## Routes

| Path | Description |
|---|---|
| `/` | Redirects to `/explorer` |
| `/explorer` | Overview — stat cards, latest matches, top players |
| `/explorer/match/[hash]` | Match detail — title block, participants, weapon distribution |
| `/explorer/address/[addr]` | Player profile — stat grid, mode breakdown, recent matches |
| `/explorer/leaderboard` | Leaderboard — mode chip filter + pagination |
| `/explorer/search?q=…` | Grouped search results · exact match redirects to detail |
| `/explorer/api/search/[q]` | JSON endpoint feeding the SearchBar dropdown |

## Project layout

```
src/
  app/
    layout.tsx, page.tsx, globals.css   ← root shell + redirect
    explorer/
      layout.tsx                        ← Explorer chrome (header, search, footer)
      page.tsx                          ← /explorer
      match/[hash]/                     ← match detail
      address/[addr]/                   ← player profile
      leaderboard/                      ← leaderboard + filters
      search/                           ← search results page
      api/search/[q]/route.ts           ← search JSON
      components/                       ← server components + 1 client island
      not-found.tsx
  lib/
    explorer/
      types.ts                          ← domain types + ExplorerRepo interface
      id.ts                             ← deterministic 0x address / 0x hash hashing
      catalog.ts                        ← game modes, maps, mode→map allowlists
      weapons.ts                        ← weapon catalog mirroring zitem.xml ranges
      rng.ts                            ← mulberry32 PRNG + sampling utilities
      generate.ts                       ← seeded fixture generator
      fixtures.ts                       ← export const FIXTURES = generate(SEED)
      repo.ts                           ← FixtureRepo + singleton `repo` export
      format.ts                         ← time / number / hash formatters
      index.ts                          ← public surface
```

## Data model

Each PvP match is one ledger record with player participations, scores, weapon usage, and a deterministic `0x…` 64-char hash. Players have `0x…` 40-char addresses derived from their nickname.

The `ExplorerRepo` interface in `src/lib/explorer/types.ts` is the only data seam:

```ts
export interface ExplorerRepo {
  getOverviewStats(): Promise<OverviewStats>;
  getLatestMatches(q?: ListQuery): Promise<Page<Match>>;
  getMatch(hash: string): Promise<Match | null>;
  getPlayer(address: string): Promise<Player | null>;
  getPlayerMatches(address: string, q?: ListQuery): Promise<Page<Match>>;
  getLeaderboard(q?: ListQuery): Promise<Page<LeaderboardEntry>>;
  search(query: string, limit?: number): Promise<SearchHit[]>;
}
```

To swap the fixture for an on-chain reader later, write a `ChainRepo implements ExplorerRepo` and change one line in `src/lib/explorer/repo.ts`:

```ts
export const repo: ExplorerRepo = new FixtureRepo(FIXTURES);
// → new ChainRepo(rpcUrl, contractAddress);
```

No page or component needs to change.

## Fixture seed

The fixture generator (`generate.ts`) is fully deterministic:

- `SEED = 0xC0FFEE`
- Epoch anchored at `2026-05-15T00:00:00Z` and stepped backward per match
- 80 players × 200 matches across all PvP modes
- Match counts/weights/maps mirror the real game configuration

Refresh the seed to regenerate the entire ledger.

## Out of scope (v1)

Real chain integration · wallet connect · authentication · light theme · i18n · replays · live websocket updates.
