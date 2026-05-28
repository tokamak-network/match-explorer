import { GAME_MODES, MAPS, type GameMode, type MapName } from "./types";

const DUEL_MAPS: MapName[] = ["Hall", "Catacomb", "Jail", "Shower Room"];
const PVP_MAPS: MapName[] = MAPS.filter((m) => !DUEL_MAPS.includes(m));

export const MODE_MAPS: Record<GameMode, MapName[]> = {
  DEATHMATCH_SOLO: PVP_MAPS,
  DEATHMATCH_TEAM: PVP_MAPS,
  GLADIATOR_SOLO: PVP_MAPS,
  GLADIATOR_TEAM: PVP_MAPS,
  ASSASSINATE: PVP_MAPS,
  BERSERKER: PVP_MAPS,
  DEATHMATCH_DUEL: DUEL_MAPS,
};

export const MODE_WEIGHTS: { value: GameMode; weight: number }[] = [
  { value: "DEATHMATCH_TEAM", weight: 35 },
  { value: "GLADIATOR_TEAM", weight: 20 },
  { value: "DEATHMATCH_SOLO", weight: 18 },
  { value: "GLADIATOR_SOLO", weight: 12 },
  { value: "DEATHMATCH_DUEL", weight: 10 },
  { value: "ASSASSINATE", weight: 3 },
  { value: "BERSERKER", weight: 2 },
];

export const MODE_LABEL: Record<GameMode, string> = {
  DEATHMATCH_SOLO: "Deathmatch · Solo",
  DEATHMATCH_TEAM: "Deathmatch · Team",
  GLADIATOR_SOLO: "Gladiator · Solo",
  GLADIATOR_TEAM: "Gladiator · Team",
  ASSASSINATE: "Assassinate",
  BERSERKER: "Berserker",
  DEATHMATCH_DUEL: "Deathmatch · Duel",
};

export const MODE_SHORT: Record<GameMode, string> = {
  DEATHMATCH_SOLO: "DM·S",
  DEATHMATCH_TEAM: "DM·T",
  GLADIATOR_SOLO: "GL·S",
  GLADIATOR_TEAM: "GL·T",
  ASSASSINATE: "ASN",
  BERSERKER: "BRK",
  DEATHMATCH_DUEL: "DUEL",
};

export const MODE_IS_TEAM: Record<GameMode, boolean> = {
  DEATHMATCH_SOLO: false,
  DEATHMATCH_TEAM: true,
  GLADIATOR_SOLO: false,
  GLADIATOR_TEAM: true,
  ASSASSINATE: true,
  BERSERKER: false,
  DEATHMATCH_DUEL: false,
};

export const MODE_PLAYER_RANGE: Record<GameMode, { min: number; max: number }> = {
  DEATHMATCH_SOLO: { min: 4, max: 8 },
  DEATHMATCH_TEAM: { min: 6, max: 16 },
  GLADIATOR_SOLO: { min: 4, max: 8 },
  GLADIATOR_TEAM: { min: 4, max: 10 },
  ASSASSINATE: { min: 6, max: 12 },
  BERSERKER: { min: 4, max: 8 },
  DEATHMATCH_DUEL: { min: 2, max: 2 },
};

export const SEASONS = [
  { id: 1, name: "Genesis", startedAt: "2026-02-01T00:00:00Z" },
  { id: 2, name: "Ascension", startedAt: "2026-04-01T00:00:00Z" },
];

export { GAME_MODES, MAPS };
