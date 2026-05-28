import { MODE_IS_TEAM, MODE_MAPS, MODE_PLAYER_RANGE, MODE_WEIGHTS } from "./catalog";
import { hexAddress, hexMatchHash } from "./id";
import { mulberry32, pick, pickWeighted, poisson, randInt, sampleN } from "./rng";
import type {
  GameMode,
  LeaderboardEntry,
  MapName,
  Match,
  MatchParticipant,
  Player,
  PlayerStats,
  TeamSide,
  WeaponUsage,
} from "./types";
import { MODE_WEAPON_MIX, WEAPONS_BY_CLASS } from "./weapons";

export const FIXTURE_SEED = 0x00c0ffee;
export const FIXTURE_EPOCH_SEC = Math.floor(
  Date.UTC(2026, 4, 15, 0, 0, 0) / 1000,
);

const NICK_STEMS = [
  "Reaper", "Blade", "Static", "Spectre", "Comet", "Echo", "Ash", "Vector",
  "Talon", "Glitch", "Volt", "Cipher", "Halo", "Quartz", "Vesper", "Onyx",
  "Krono", "Nimbus", "Vector", "Drift", "Pulse", "Vandal", "Crow", "Iris",
  "Hex", "Faye", "Mira", "Lupin", "Rook", "Sable", "Wisp", "Halberd",
  "Karma", "Soren", "Vega", "Wraith", "Zenith", "Atlas", "Tempo", "Riot",
];

const NICK_PREFIXES = [
  "Mono", "Neo", "Lo-", "Hi-", "x_", "K", "Dr.", "El", "Iron", "Solo",
  "Cold", "Hot", "Last", "Lone", "True", "Half", "Soft", "Hard", "Slow", "Fast",
];

export type Fixtures = {
  matches: Match[]; // ordered: index 0 = newest, last = oldest
  players: Player[]; // address-sorted
  byAddress: Map<string, Player>;
  byHash: Map<string, Match>;
  matchesByAddress: Map<string, Match[]>; // newest first
  leaderboardsByMode: Map<GameMode | "ALL", LeaderboardEntry[]>;
};

function uniqueNicknames(rng: () => number, n: number): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  while (out.length < n) {
    const stem = pick(rng, NICK_STEMS);
    const useNum = rng() < 0.55;
    const usePrefix = rng() < 0.4;
    const num = useNum ? randInt(rng, 1, 99) : "";
    const prefix = usePrefix ? pick(rng, NICK_PREFIXES) : "";
    const nick = `${prefix}${stem}${useNum ? num : ""}`;
    if (seen.has(nick.toLowerCase())) continue;
    seen.add(nick.toLowerCase());
    out.push(nick);
  }
  return out;
}

type Skill = { address: string; nickname: string; skill: number };

function makePlayers(rng: () => number, count = 80): Skill[] {
  const nicks = uniqueNicknames(rng, count);
  return nicks.map((nickname) => ({
    address: hexAddress(nickname),
    nickname,
    skill: randInt(rng, 600, 1800),
  }));
}

type WeaponMixOut = { weapon: WeaponUsage; usedDelta: number };

function rollWeapons(
  rng: () => number,
  mode: GameMode,
  totalKills: number,
  totalDamage: number,
): WeaponUsage[] {
  const mix = MODE_WEAPON_MIX[mode] ?? MODE_WEAPON_MIX.DEATHMATCH_TEAM;
  const klassPicks: WeaponUsage[] = [];
  const usedKlasses = new Set<string>();
  const slots = Math.min(3, Math.max(1, Math.ceil(totalKills / 4) || 1));
  let remainingKills = totalKills;
  let remainingDamage = totalDamage;
  for (let i = 0; i < slots; i += 1) {
    const klass = pickWeighted(rng, mix);
    const pool = WEAPONS_BY_CLASS[klass];
    if (!pool || pool.length === 0) continue;
    const weapon = pick(rng, pool);
    if (usedKlasses.has(`${weapon.itemId}`)) continue;
    usedKlasses.add(`${weapon.itemId}`);
    const share = i === slots - 1 ? 1 : 0.3 + rng() * 0.4;
    const k = Math.max(0, Math.round(remainingKills * share));
    const dmg = Math.max(0, Math.round(remainingDamage * share));
    remainingKills -= k;
    remainingDamage -= dmg;
    const shotsFired = k > 0
      ? Math.round(k * (klass === "Melee" ? 1.6 : klass === "RocketLauncher" ? 2.2 : 6 + rng() * 8))
      : Math.round(randInt(rng, 4, 20));
    const shotsHit = Math.min(
      shotsFired,
      Math.round(shotsFired * (klass === "Melee" ? 0.85 : 0.18 + rng() * 0.32)),
    );
    klassPicks.push({
      itemId: weapon.itemId,
      name: weapon.name,
      klass: weapon.klass,
      kills: k,
      shotsFired,
      shotsHit,
      damageDealt: dmg,
    });
  }
  klassPicks.sort((a, b) => b.kills - a.kills);
  return klassPicks;
}

function computeMvpScore(p: MatchParticipant): number {
  return Math.round(
    p.kills * 1.0
      + p.assists * 0.4
      - p.deaths * 0.6
      + (p.isMvp ? 8 : 0)
      + (p.isWinner ? 4 : 0)
      + p.damageDealt / 1000,
  );
}

function emptyStats(): PlayerStats {
  return {
    matches: 0,
    wins: 0,
    losses: 0,
    kills: 0,
    deaths: 0,
    assists: 0,
    mvps: 0,
    damageDealt: 0,
    winRate: 0,
    kd: 0,
    mvpScore: 0,
  };
}

function rollMatch(
  rng: () => number,
  matchNumber: number,
  startedAt: number,
  players: Skill[],
): Match {
  const mode = pickWeighted(rng, MODE_WEIGHTS);
  const map = pick(rng, MODE_MAPS[mode]);
  const range = MODE_PLAYER_RANGE[mode];
  const n = randInt(rng, range.min, range.max);
  // skill-weighted sample
  const pool = players
    .map((p) => ({ player: p, weight: Math.pow(p.skill / 800, 2.5) }))
    .sort((a, b) => b.weight - a.weight);
  const sampled = sampleN(rng, pool, n).map((x) => x.player);

  const isTeam = MODE_IS_TEAM[mode];
  const durationSec = mode === "DEATHMATCH_DUEL"
    ? randInt(rng, 60, 180)
    : mode.startsWith("GLADIATOR")
      ? randInt(rng, 180, 540)
      : randInt(rng, 240, 900);

  type Roll = Skill & {
    team: TeamSide;
    kills: number;
    deaths: number;
    assists: number;
    damageDealt: number;
    damageTaken: number;
    accuracy: number;
  };

  const rolls: Roll[] = sampled.map((p, idx): Roll => {
    const team: TeamSide = isTeam ? (idx % 2 === 0 ? "A" : "B") : "FFA";
    const skillScale = p.skill / 1200;
    const killLambda = (durationSec / 60) * (mode.startsWith("GLADIATOR") ? 1.2 : 1.6) * skillScale;
    const kills = Math.max(0, poisson(rng, killLambda));
    const deaths = Math.max(0, poisson(rng, (durationSec / 60) * 1.4 * (1.4 - skillScale * 0.6)));
    const assists = Math.max(0, poisson(rng, killLambda * 0.4));
    const damageDealt = Math.round(kills * (160 + rng() * 100) + assists * 70 + rng() * 220);
    const damageTaken = Math.round(deaths * (180 + rng() * 90) + rng() * 240);
    const accuracy = Math.min(0.95, 0.18 + rng() * 0.32 + skillScale * 0.08);
    return {
      ...p,
      team,
      kills,
      deaths,
      assists,
      damageDealt,
      damageTaken,
      accuracy,
    };
  });

  let winnerTeam: "A" | "B" | undefined;
  let teamScore: { A: number; B: number } | undefined;
  let winnerAddress: string | undefined;

  if (isTeam) {
    const a = rolls.filter((r) => r.team === "A").reduce((s, r) => s + r.kills, 0);
    const b = rolls.filter((r) => r.team === "B").reduce((s, r) => s + r.kills, 0);
    teamScore = { A: a, B: b };
    if (a === b) {
      // break tie randomly
      winnerTeam = rng() < 0.5 ? "A" : "B";
      teamScore[winnerTeam] += 1;
    } else {
      winnerTeam = a > b ? "A" : "B";
    }
  } else {
    // FFA: highest kills, tie by lower deaths
    const sorted = [...rolls].sort(
      (x, y) => y.kills - x.kills || x.deaths - y.deaths,
    );
    winnerAddress = sorted[0]?.address;
  }

  // placements + mvp
  const placementSorted = [...rolls].sort((x, y) => {
    if (isTeam && x.team !== y.team) {
      if (x.team === winnerTeam) return -1;
      if (y.team === winnerTeam) return 1;
    }
    return y.kills - x.kills || x.deaths - y.deaths;
  });

  const mvpAddress = placementSorted[0]?.address;

  const participants: MatchParticipant[] = placementSorted.map((r, idx) => {
    const isWinner = isTeam
      ? r.team === winnerTeam
      : r.address === winnerAddress;
    const isMvp = r.address === mvpAddress;
    const score = isTeam ? r.kills * 2 + r.assists - r.deaths : r.kills * 3 - r.deaths * 2 + r.assists;
    const p: MatchParticipant = {
      address: r.address as MatchParticipant["address"],
      nickname: r.nickname,
      team: r.team,
      placement: idx + 1,
      kills: r.kills,
      deaths: r.deaths,
      assists: r.assists,
      score,
      damageDealt: r.damageDealt,
      damageTaken: r.damageTaken,
      accuracy: r.accuracy,
      isWinner,
      isMvp,
      weapons: rollWeapons(rng, mode, r.kills, r.damageDealt),
    };
    return p;
  });

  const seasonId = startedAt >= Math.floor(Date.UTC(2026, 3, 1) / 1000) ? 2 : 1;

  return {
    hash: hexMatchHash(matchNumber, FIXTURE_SEED),
    number: matchNumber,
    mode,
    map,
    startedAt,
    durationSec,
    teamScore,
    participants,
    winnerTeam,
    winnerAddress: winnerAddress as MatchParticipant["address"] | undefined,
    seasonId,
  };
}

function rollupPlayer(
  base: Skill,
  participations: { match: Match; participant: MatchParticipant }[],
): Player {
  const overall = emptyStats();
  const byMode: Partial<Record<GameMode, PlayerStats>> = {};
  const mapCounts = new Map<MapName, number>();
  const weaponKills = new Map<number, { kills: number; name: string; klass: WeaponUsage["klass"] }>();
  let firstSeen = Number.POSITIVE_INFINITY;
  let lastSeen = 0;

  for (const { match, participant: p } of participations) {
    const target = (byMode[match.mode] ||= emptyStats());
    for (const stats of [overall, target]) {
      stats.matches += 1;
      stats.kills += p.kills;
      stats.deaths += p.deaths;
      stats.assists += p.assists;
      stats.damageDealt += p.damageDealt;
      if (p.isWinner) stats.wins += 1;
      else stats.losses += 1;
      if (p.isMvp) stats.mvps += 1;
    }
    mapCounts.set(match.map, (mapCounts.get(match.map) ?? 0) + 1);
    for (const w of p.weapons) {
      const cur = weaponKills.get(w.itemId);
      if (cur) cur.kills += w.kills;
      else weaponKills.set(w.itemId, { kills: w.kills, name: w.name, klass: w.klass });
    }
    if (match.startedAt < firstSeen) firstSeen = match.startedAt;
    if (match.startedAt > lastSeen) lastSeen = match.startedAt;
  }

  const finalize = (s: PlayerStats) => {
    s.winRate = s.matches > 0 ? s.wins / s.matches : 0;
    s.kd = s.kills / Math.max(s.deaths, 1);
    const perMatch = s.matches > 0
      ? (s.kills * 1.0 + s.assists * 0.4 - s.deaths * 0.6 + s.mvps * 8 + s.wins * 4 + s.damageDealt / 1000) / s.matches
      : 0;
    s.mvpScore = Math.round(perMatch * 10) / 10;
    return s;
  };
  finalize(overall);
  for (const k of Object.keys(byMode)) finalize(byMode[k as GameMode]!);

  let favMap: MapName = "Mansion";
  let favCount = -1;
  for (const [m, c] of mapCounts) {
    if (c > favCount) {
      favMap = m;
      favCount = c;
    }
  }

  let favWeaponId = 7001;
  let favWeaponName = "AK-47";
  let favWeaponKlass: WeaponUsage["klass"] = "Rifle";
  let favKills = -1;
  for (const [id, v] of weaponKills) {
    if (v.kills > favKills) {
      favKills = v.kills;
      favWeaponId = id;
      favWeaponName = v.name;
      favWeaponKlass = v.klass;
    }
  }

  return {
    address: base.address as Player["address"],
    nickname: base.nickname,
    firstSeen: Number.isFinite(firstSeen) ? firstSeen : 0,
    lastSeen,
    favoriteMap: favMap,
    favoriteWeapon: { itemId: favWeaponId, name: favWeaponName, klass: favWeaponKlass },
    byMode,
    overall,
  };
}

function buildLeaderboard(
  players: Player[],
  mode: GameMode | "ALL",
  minMatches = 5,
): LeaderboardEntry[] {
  const rows = players
    .map((p) => {
      const stats = mode === "ALL" ? p.overall : p.byMode[mode];
      if (!stats || stats.matches < minMatches) return null;
      return {
        address: p.address,
        nickname: p.nickname,
        matches: stats.matches,
        wins: stats.wins,
        winRate: stats.winRate,
        kd: stats.kd,
        mvpScore: stats.mvpScore,
      };
    })
    .filter((x): x is Omit<LeaderboardEntry, "rank"> => x !== null)
    .sort(
      (a, b) =>
        b.mvpScore - a.mvpScore || b.winRate - a.winRate || b.matches - a.matches,
    );
  return rows.map((r, i) => ({ rank: i + 1, ...r }));
}

export function generate(seed = FIXTURE_SEED): Fixtures {
  const rng = mulberry32(seed);
  const players = makePlayers(rng, 80);

  const matches: Match[] = [];
  const matchesByAddress = new Map<string, Match[]>();
  // start newest at epoch and step backwards
  let startedAt = FIXTURE_EPOCH_SEC;
  const TOTAL = 200;
  for (let n = TOTAL; n >= 1; n -= 1) {
    const match = rollMatch(rng, n, startedAt, players);
    matches.push(match);
    for (const p of match.participants) {
      const arr = matchesByAddress.get(p.address) ?? [];
      arr.push(match);
      matchesByAddress.set(p.address, arr);
    }
    // step back 4..14 minutes between matches
    startedAt -= randInt(rng, 240, 840);
  }

  // matches array currently has number=TOTAL first (newest)
  matches.sort((a, b) => b.number - a.number);

  // rollup players
  const rolled: Player[] = players.map((p) => {
    const mlist = matchesByAddress.get(p.address) ?? [];
    const participations = mlist.map((m) => ({
      match: m,
      participant: m.participants.find((x) => x.address === p.address)!,
    }));
    // compute mvpScore at the participant level too (consumed by leaderboard later — already in stats)
    void computeMvpScore;
    return rollupPlayer(p, participations);
  });

  rolled.sort((a, b) => a.address.localeCompare(b.address));

  const byAddress = new Map(rolled.map((p) => [p.address, p]));
  const byHash = new Map(matches.map((m) => [m.hash, m]));

  // matchesByAddress newest-first
  for (const [addr, list] of matchesByAddress) {
    list.sort((a, b) => b.number - a.number);
    matchesByAddress.set(addr, list);
  }

  const leaderboards = new Map<GameMode | "ALL", LeaderboardEntry[]>();
  leaderboards.set("ALL", buildLeaderboard(rolled, "ALL"));
  for (const m of MODE_WEIGHTS.map((x) => x.value)) {
    leaderboards.set(m, buildLeaderboard(rolled, m, 3));
  }

  return {
    matches,
    players: rolled,
    byAddress,
    byHash,
    matchesByAddress,
    leaderboardsByMode: leaderboards,
  };
}
