import Link from "next/link";
import {
  formatDuration,
  formatRelativeTime,
  padMatchNumber,
  type Match,
} from "@/lib/explorer";
import { Hash } from "./Hash";
import { ModeBadge } from "./ModeBadge";
import { MapBadge } from "./MapBadge";
import styles from "./MatchTable.module.css";

export type MatchColumn =
  | "number"
  | "hash"
  | "mode"
  | "map"
  | "players"
  | "duration"
  | "winner"
  | "age";

const DEFAULT_COLUMNS: MatchColumn[] = [
  "number",
  "hash",
  "mode",
  "map",
  "players",
  "duration",
  "winner",
  "age",
];

const HEADER: Record<MatchColumn, string> = {
  number: "Match #",
  hash: "Hash",
  mode: "Mode",
  map: "Map",
  players: "Players",
  duration: "Duration",
  winner: "Winner",
  age: "Age",
};

const NUMERIC: Partial<Record<MatchColumn, true>> = {
  players: true,
  duration: true,
  age: true,
};

type Props = {
  matches: Match[];
  columns?: MatchColumn[];
  emptyLabel?: string;
};

export function MatchTable({
  matches,
  columns = DEFAULT_COLUMNS,
  emptyLabel = "No matches found",
}: Props) {
  if (matches.length === 0) {
    return (
      <div className={styles.wrap}>
        <div className={styles.empty}>{emptyLabel}</div>
      </div>
    );
  }
  return (
    <div className={styles.wrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c} className={NUMERIC[c] ? styles.num : ""}>
                {HEADER[c]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matches.map((m) => (
            <MatchRow key={m.hash} match={m} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MatchRow({
  match: m,
  columns,
}: {
  match: Match;
  columns: MatchColumn[];
}) {
  const href = `/explorer/match/${m.hash}`;
  const winner = renderWinner(m);
  return (
    <tr>
      {columns.map((c) => (
        <td key={c} className={NUMERIC[c] ? styles.num : ""}>
          <Link href={href} className={styles.tdLink}>
            {cell(c, m, winner)}
          </Link>
        </td>
      ))}
    </tr>
  );
}

function cell(c: MatchColumn, m: Match, winner: React.ReactNode) {
  switch (c) {
    case "number":
      return <span className={styles.muted}>#{padMatchNumber(m.number)}</span>;
    case "hash":
      return <Hash value={m.hash} />;
    case "mode":
      return <ModeBadge mode={m.mode} />;
    case "map":
      return <MapBadge map={m.map} size="sm" />;
    case "players":
      return m.participants.length;
    case "duration":
      return formatDuration(m.durationSec);
    case "winner":
      return winner;
    case "age":
      return <span className={styles.muted}>{formatRelativeTime(m.startedAt)}</span>;
  }
}

function renderWinner(m: Match): React.ReactNode {
  if (m.winnerTeam && m.teamScore) {
    return (
      <span className={styles.winnerWin}>
        Team {m.winnerTeam}
        <span className={styles.muted}>
          {" "}
          {m.teamScore.A}–{m.teamScore.B}
        </span>
      </span>
    );
  }
  if (m.winnerAddress) {
    const w = m.participants.find((p) => p.address === m.winnerAddress);
    return w ? <span className={styles.winnerWin}>{w.nickname}</span> : "—";
  }
  return "—";
}
