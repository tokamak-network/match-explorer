import type { Address, Hex, MatchHash } from "./types";

function fnv1a32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function mix(a: number, b: number): number {
  let x = (a ^ b) >>> 0;
  x = Math.imul(x ^ (x >>> 16), 0x85ebca6b) >>> 0;
  x = Math.imul(x ^ (x >>> 13), 0xc2b2ae35) >>> 0;
  return (x ^ (x >>> 16)) >>> 0;
}

function toHex(n: number, pad: number): string {
  return n.toString(16).padStart(pad, "0");
}

function digest(input: string, byteLen: number): string {
  const blocks = Math.ceil(byteLen / 4);
  let state = fnv1a32(input);
  let acc = "";
  for (let i = 0; i < blocks; i += 1) {
    state = mix(state, fnv1a32(`${input}#${i}`));
    acc += toHex(state, 8);
  }
  return acc.slice(0, byteLen * 2);
}

export function hexAddress(nickname: string): Address {
  return ("0x" + digest(nickname.toLowerCase(), 20)) as Address;
}

export function hexMatchHash(matchNumber: number, seed: number): MatchHash {
  return ("0x" + digest(`match:${matchNumber}:${seed}`, 32)) as MatchHash;
}

export function isHex(value: string): value is Hex {
  return /^0x[0-9a-f]+$/i.test(value);
}

export function isAddressLike(value: string): boolean {
  return /^0x[0-9a-f]{40}$/i.test(value);
}

export function isMatchHashLike(value: string): boolean {
  return /^0x[0-9a-f]{64}$/i.test(value);
}

export function truncateHex(value: string, head = 6, tail = 4): string {
  if (value.length <= head + tail + 2) return value;
  return `${value.slice(0, head + 2)}…${value.slice(-tail)}`;
}

export function normalizeHex(value: string): string {
  return value.toLowerCase();
}
