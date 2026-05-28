import { isAddressLike, isMatchHashLike, normalizeHex } from "./id";
import type { Fixtures } from "./generate";
import { FIXTURES } from "./fixtures";
import type {
  ExplorerRepo,
  GameMode,
  LeaderboardEntry,
  ListQuery,
  Match,
  OverviewStats,
  Page,
  Player,
  SearchHit,
} from "./types";
import { MAPS } from "./types";

const DEFAULT_PAGE_SIZE = 25;

function paginate<T>(items: T[], q?: ListQuery): Page<T> {
  const page = Math.max(1, q?.page ?? 1);
  const pageSize = Math.max(1, Math.min(100, q?.pageSize ?? DEFAULT_PAGE_SIZE));
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page,
    pageSize,
    total: items.length,
  };
}

export class FixtureRepo implements ExplorerRepo {
  constructor(private readonly fx: Fixtures) {}

  async getOverviewStats(): Promise<OverviewStats> {
    const matches = this.fx.matches;
    const newest = matches[0]?.startedAt ?? 0;
    const cutoff = newest - 86400;
    const matches24h = matches.filter((m) => m.startedAt >= cutoff).length;
    const avgMatchSec = matches.length
      ? Math.round(matches.reduce((s, m) => s + m.durationSec, 0) / matches.length)
      : 0;
    const modeCounts = new Map<GameMode, number>();
    for (const m of matches) modeCounts.set(m.mode, (modeCounts.get(m.mode) ?? 0) + 1);
    let topMode: GameMode = "DEATHMATCH_TEAM";
    let topCount = -1;
    for (const [mode, count] of modeCounts) {
      if (count > topCount) {
        topCount = count;
        topMode = mode;
      }
    }
    return {
      totalMatches: matches.length,
      totalPlayers: this.fx.players.length,
      matches24h,
      avgMatchSec,
      topMode,
    };
  }

  async getLatestMatches(q?: ListQuery): Promise<Page<Match>> {
    let items = this.fx.matches;
    if (q?.mode) items = items.filter((m) => m.mode === q.mode);
    if (q?.map) items = items.filter((m) => m.map === q.map);
    if (q?.seasonId) items = items.filter((m) => m.seasonId === q.seasonId);
    return paginate(items, q);
  }

  async getMatch(hash: string): Promise<Match | null> {
    return this.fx.byHash.get(normalizeHex(hash)) ?? null;
  }

  async getPlayer(address: string): Promise<Player | null> {
    return this.fx.byAddress.get(normalizeHex(address)) ?? null;
  }

  async getPlayerMatches(address: string, q?: ListQuery): Promise<Page<Match>> {
    const key = normalizeHex(address);
    let list = this.fx.matchesByAddress.get(key) ?? [];
    if (q?.mode) list = list.filter((m) => m.mode === q.mode);
    return paginate(list, q);
  }

  async getLeaderboard(q?: ListQuery): Promise<Page<LeaderboardEntry>> {
    const key: GameMode | "ALL" = q?.mode ?? "ALL";
    const list = this.fx.leaderboardsByMode.get(key) ?? [];
    return paginate(list, q);
  }

  async search(query: string, limit = 8): Promise<SearchHit[]> {
    const q = query.trim();
    if (!q) return [];
    const lower = q.toLowerCase();
    const hits: SearchHit[] = [];

    if (isMatchHashLike(q)) {
      const m = this.fx.byHash.get(normalizeHex(q));
      if (m) hits.push({ kind: "match", hash: m.hash, number: m.number, mode: m.mode, map: m.map });
    } else if (q.startsWith("0x") && q.length >= 6) {
      // hash or address prefix
      for (const m of this.fx.matches) {
        if (m.hash.startsWith(lower)) {
          hits.push({ kind: "match", hash: m.hash, number: m.number, mode: m.mode, map: m.map });
          if (hits.length >= limit) break;
        }
      }
      if (isAddressLike(q)) {
        const p = this.fx.byAddress.get(normalizeHex(q));
        if (p) hits.push({ kind: "player", address: p.address, nickname: p.nickname, matches: p.overall.matches });
      } else {
        for (const p of this.fx.players) {
          if (p.address.startsWith(lower)) {
            hits.push({ kind: "player", address: p.address, nickname: p.nickname, matches: p.overall.matches });
            if (hits.length >= limit) break;
          }
        }
      }
    }

    if (hits.length < limit) {
      for (const p of this.fx.players) {
        if (p.nickname.toLowerCase().startsWith(lower)) {
          hits.push({ kind: "player", address: p.address, nickname: p.nickname, matches: p.overall.matches });
          if (hits.length >= limit) break;
        }
      }
    }

    if (hits.length < limit) {
      for (const m of MAPS) {
        if (m.toLowerCase().includes(lower)) {
          const count = this.fx.matches.filter((mm) => mm.map === m).length;
          hits.push({ kind: "map", map: m, matchCount: count });
          if (hits.length >= limit) break;
        }
      }
    }

    return hits.slice(0, limit);
  }
}

export const repo: ExplorerRepo = new FixtureRepo(FIXTURES);
