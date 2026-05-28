import type { Weapon, WeaponClass } from "./types";

export const WEAPONS: readonly Weapon[] = [
  // Melee — 1..17 (selected ids from zitem.xml range)
  { itemId: 1,  name: "Dagger",        klass: "Melee",  damage: 32,  delay: 380,  range: 110, magazine: 0,  reload: 0   },
  { itemId: 3,  name: "Katana",        klass: "Melee",  damage: 48,  delay: 520,  range: 150, magazine: 0,  reload: 0   },
  { itemId: 4,  name: "Greatsword",    klass: "Melee",  damage: 72,  delay: 720,  range: 170, magazine: 0,  reload: 0   },
  { itemId: 11, name: "Kodachi",       klass: "Melee",  damage: 28,  delay: 320,  range: 100, magazine: 0,  reload: 0   },
  // Pistol — 4002..4010
  { itemId: 4002, name: "Beretta M9",   klass: "Pistol", damage: 22, delay: 220, range: 700,  magazine: 15, reload: 1400 },
  { itemId: 4006, name: "Desert Eagle", klass: "Pistol", damage: 38, delay: 340, range: 750,  magazine: 7,  reload: 1700 },
  { itemId: 4010, name: "Anaconda",     klass: "Pistol", damage: 44, delay: 460, range: 720,  magazine: 6,  reload: 2000 },
  // SMG — 5002..5004
  { itemId: 5002, name: "MP5",         klass: "SMG",    damage: 18, delay: 95,  range: 620,  magazine: 30, reload: 1600 },
  { itemId: 5004, name: "P90",         klass: "SMG",    damage: 16, delay: 80,  range: 660,  magazine: 50, reload: 1900 },
  // Shotgun — 6001..6002
  { itemId: 6001, name: "Breacher",    klass: "Shotgun", damage: 14, delay: 760, range: 380, magazine: 8,  reload: 2400 },
  { itemId: 6002, name: "Auto-12",     klass: "Shotgun", damage: 11, delay: 280, range: 360, magazine: 10, reload: 2600 },
  // Rifle — 7001..7002
  { itemId: 7001, name: "AK-47",       klass: "Rifle",  damage: 28, delay: 120, range: 860,  magazine: 30, reload: 2100 },
  { itemId: 7002, name: "M4A1",        klass: "Rifle",  damage: 26, delay: 110, range: 880,  magazine: 30, reload: 2000 },
  // MG — 8001..8002
  { itemId: 8001, name: "M249 SAW",    klass: "MG",     damage: 24, delay: 100, range: 820, magazine: 100, reload: 4200 },
  { itemId: 8002, name: "PKM",         klass: "MG",     damage: 26, delay: 110, range: 800, magazine: 100, reload: 4400 },
  // Rocket Launcher — 9001..9006
  { itemId: 9001, name: "RPG-7",       klass: "RocketLauncher", damage: 140, delay: 1800, range: 950, magazine: 1, reload: 3200 },
  { itemId: 9006, name: "Halberd",     klass: "RocketLauncher", damage: 165, delay: 2000, range: 980, magazine: 1, reload: 3600 },
];

export const WEAPONS_BY_CLASS: Record<WeaponClass, Weapon[]> = WEAPONS.reduce(
  (acc, w) => {
    (acc[w.klass] ||= []).push(w);
    return acc;
  },
  {} as Record<WeaponClass, Weapon[]>,
);

export const WEAPONS_BY_ID: Record<number, Weapon> = Object.fromEntries(
  WEAPONS.map((w) => [w.itemId, w]),
);

export const MODE_WEAPON_MIX: Record<
  string,
  { value: WeaponClass; weight: number }[]
> = {
  DEATHMATCH_SOLO: [
    { value: "Melee", weight: 25 },
    { value: "Pistol", weight: 15 },
    { value: "SMG", weight: 15 },
    { value: "Shotgun", weight: 15 },
    { value: "Rifle", weight: 20 },
    { value: "MG", weight: 5 },
    { value: "RocketLauncher", weight: 5 },
  ],
  DEATHMATCH_TEAM: [
    { value: "Melee", weight: 20 },
    { value: "Pistol", weight: 10 },
    { value: "SMG", weight: 15 },
    { value: "Shotgun", weight: 15 },
    { value: "Rifle", weight: 25 },
    { value: "MG", weight: 10 },
    { value: "RocketLauncher", weight: 5 },
  ],
  GLADIATOR_SOLO: [
    { value: "Melee", weight: 70 },
    { value: "Pistol", weight: 15 },
    { value: "Shotgun", weight: 15 },
  ],
  GLADIATOR_TEAM: [
    { value: "Melee", weight: 60 },
    { value: "Pistol", weight: 15 },
    { value: "Shotgun", weight: 15 },
    { value: "Rifle", weight: 10 },
  ],
  ASSASSINATE: [
    { value: "Melee", weight: 30 },
    { value: "Pistol", weight: 15 },
    { value: "Shotgun", weight: 20 },
    { value: "Rifle", weight: 25 },
    { value: "RocketLauncher", weight: 10 },
  ],
  BERSERKER: [
    { value: "Melee", weight: 35 },
    { value: "Shotgun", weight: 25 },
    { value: "Rifle", weight: 20 },
    { value: "MG", weight: 10 },
    { value: "RocketLauncher", weight: 10 },
  ],
  DEATHMATCH_DUEL: [
    { value: "Melee", weight: 80 },
    { value: "Pistol", weight: 10 },
    { value: "Shotgun", weight: 10 },
  ],
};
