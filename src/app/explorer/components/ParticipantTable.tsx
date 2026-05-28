import Link from "next/link";
import {
  formatNumber,
  formatPct,
  type GameMode,
  type Match,
  type MatchParticipant,
} from "@/lib/explorer";
import { Hash } from "./Hash";
import { WeaponBadge } from "./WeaponBadge";
import styles from "./ParticipantTable.module.css";

type Props = {
  participants: MatchParticipant[];
  mode: GameMode;
  teamScore?: Match["teamScore"];
};

export function ParticipantTable({ participants, mode, teamScore }: Props) {
  const isTeam = participants.some((p) => p.team !== "FFA");
  if (isTeam) {
    const a = participants.filter((p) => p.team === "A");
    const b = participants.filter((p) => p.team === "B");
    return (
      <div className={styles.wrap}>
        <table className={styles.table}>
          <Head />
          <tbody>
            <TeamHeader team="A" score={teamScore?.A} />
            {a.map((p) => <Row key={p.address} p={p} />)}
            <TeamHeader team="B" score={teamScore?.B} />
            {b.map((p) => <Row key={p.address} p={p} />)}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <Head ffa />
        <tbody>
          {participants.map((p) => <Row key={p.address} p={p} />)}
        </tbody>
      </table>
    </div>
  );
  void mode;
}

function Head({ ffa = false }: { ffa?: boolean }) {
  return (
    <thead>
      <tr>
        <th style={{ width: 36 }}>#</th>
        <th>Player</th>
        <th className={styles.num}>K</th>
        <th className={styles.num}>D</th>
        <th className={styles.num}>A</th>
        <th className={styles.num}>Score</th>
        <th className={styles.num}>Damage</th>
        <th className={styles.num}>Acc.</th>
        <th>Weapons</th>
        <th>{ffa ? "Result" : "Status"}</th>
      </tr>
    </thead>
  );
}

function TeamHeader({ team, score }: { team: "A" | "B"; score?: number }) {
  return (
    <tr className={styles.teamHeader}>
      <td colSpan={10}>
        Team {team}
        {typeof score === "number" ? (
          <span className={styles.teamScore}>SCORE · {score}</span>
        ) : null}
      </td>
    </tr>
  );
}

function Row({ p }: { p: MatchParticipant }) {
  return (
    <tr>
      <td>
        <span className={styles.placement}>{p.placement}</span>
      </td>
      <td>
        <div className={styles.nickname}>
          <Link href={`/explorer/address/${p.address}`} className={styles.nicknameText}>
            {p.nickname}
          </Link>
          <Hash value={p.address} href={`/explorer/address/${p.address}`} head={4} tail={4} />
        </div>
      </td>
      <td className={styles.num}>{p.kills}</td>
      <td className={styles.num}>{p.deaths}</td>
      <td className={styles.num}>{p.assists}</td>
      <td className={styles.num}>{formatNumber(p.score)}</td>
      <td className={styles.num}>{formatNumber(p.damageDealt)}</td>
      <td className={styles.num}>{formatPct(p.accuracy, 0)}</td>
      <td>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {p.weapons.slice(0, 2).map((w) => (
            <WeaponBadge key={w.itemId} weapon={w} size="sm" />
          ))}
        </div>
      </td>
      <td>
        {p.isMvp ? <span className={`${styles.pill} ${styles.pillMvp}`}>MVP</span> :
          p.isWinner ? <span className={`${styles.pill} ${styles.pillWin}`}>WIN</span> :
          <span className={styles.pill}>LOSS</span>}
      </td>
    </tr>
  );
}
