export type Hex = `0x${string}`;
export type MatchHash = Hex;
export type Address = Hex;
export type Timestamp = number;

export const GAME_MODES = [
  "DEATHMATCH_SOLO",
  "DEATHMATCH_TEAM",
  "GLADIATOR_SOLO",
  "GLADIATOR_TEAM",
  "ASSASSINATE",
  "BERSERKER",
  "DEATHMATCH_DUEL",
] as const;
export type GameMode = (typeof GAME_MODES)[number];

export const MAPS = [
  "Mansion",
  "Prison",
  "Prison II",
  "Island",
  "Garden",
  "Station",
  "Battle Arena",
  "Factory",
  "Town",
  "Ruin",
  "Port",
  "Snow_Town",
  "Dojo",
  "Castle",
  "Dungeon",
  "Lost Shrine",
  "Stairway",
  "Hall",
  "Catacomb",
  "Jail",
  "Shower Room",
] as const;
export type MapName = (typeof MAPS)[number];

export const WEAPON_CLASSES = [
  "Melee",
  "Pistol",
  "SMG",
  "Shotgun",
  "Rifle",
  "MG",
  "RocketLauncher",
] as const;
export type WeaponClass = (typeof WEAPON_CLASSES)[number];

export type Weapon = {
  itemId: number;
  name: string;
  klass: WeaponClass;
  damage: number;
  delay: number;
  range: number;
  magazine: number;
  reload: number;
};

export type WeaponUsage = {
  itemId: number;
  name: string;
  klass: WeaponClass;
  kills: number;
  shotsFired: number;
  shotsHit: number;
  damageDealt: number;
};

export type TeamSide = "A" | "B" | "FFA";

export type MatchParticipant = {
  address: Address;
  nickname: string;
  team: TeamSide;
  placement: number;
  kills: number;
  deaths: number;
  assists: number;
  score: number;
  damageDealt: number;
  damageTaken: number;
  accuracy: number;
  isWinner: boolean;
  isMvp: boolean;
  weapons: WeaponUsage[];
};

export type Match = {
  hash: MatchHash;
  number: number;
  mode: GameMode;
  map: MapName;
  startedAt: Timestamp;
  durationSec: number;
  teamScore?: { A: number; B: number };
  participants: MatchParticipant[];
  winnerTeam?: "A" | "B";
  winnerAddress?: Address;
  seasonId: number;
};

export type PlayerStats = {
  matches: number;
  wins: number;
  losses: number;
  kills: number;
  deaths: number;
  assists: number;
  mvps: number;
  damageDealt: number;
  winRate: number;
  kd: number;
  mvpScore: number;
};

export type Player = {
  address: Address;
  nickname: string;
  firstSeen: Timestamp;
  lastSeen: Timestamp;
  favoriteWeapon: { itemId: number; name: string; klass: WeaponClass };
  favoriteMap: MapName;
  byMode: Partial<Record<GameMode, PlayerStats>>;
  overall: PlayerStats;
};

export type LeaderboardEntry = {
  rank: number;
  address: Address;
  nickname: string;
  matches: number;
  wins: number;
  winRate: number;
  kd: number;
  mvpScore: number;
};

export type SearchHit =
  | {
      kind: "match";
      hash: MatchHash;
      number: number;
      mode: GameMode;
      map: MapName;
    }
  | {
      kind: "player";
      address: Address;
      nickname: string;
      matches: number;
    }
  | {
      kind: "map";
      map: MapName;
      matchCount: number;
    };

export type ListQuery = {
  page?: number;
  pageSize?: number;
  mode?: GameMode;
  map?: MapName;
  seasonId?: number;
};

export type Page<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export type OverviewStats = {
  totalMatches: number;
  totalPlayers: number;
  bestStreak: { address: Address; nickname: string; wins: number } | null;
  topPlayerToday: {
    address: Address;
    nickname: string;
    mvpScore: number;
    matches: number;
  } | null;
};

export interface ExplorerRepo {
  getOverviewStats(): Promise<OverviewStats>;
  getLatestMatches(q?: ListQuery): Promise<Page<Match>>;
  getMatch(hash: string): Promise<Match | null>;
  getPlayer(address: string): Promise<Player | null>;
  getPlayerMatches(address: string, q?: ListQuery): Promise<Page<Match>>;
  getLeaderboard(q?: ListQuery): Promise<Page<LeaderboardEntry>>;
  search(query: string, limit?: number): Promise<SearchHit[]>;
}
