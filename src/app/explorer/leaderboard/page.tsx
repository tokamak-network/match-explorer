import Link from "next/link";
import {
  GAME_MODES,
  MODE_LABEL,
  MODE_SHORT,
  formatNumber,
  formatPct,
  repo,
  truncateHex,
  type GameMode,
} from "@/lib/explorer";
import { Pagination } from "../components/Pagination";
import styles from "./page.module.css";

type Search = Promise<{ mode?: string; page?: string }>;

const PAGE_SIZE = 25;

export default async function LeaderboardPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const mode = parseMode(sp.mode);
  const page = Math.max(1, Number(sp.page) || 1);

  const board = await repo.getLeaderboard({
    mode,
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <>
      <section>
        <h1 className={styles.heroTitle}>Leaderboard.</h1>
        <p className={styles.heroLead}>
          Ranked by MVP score — a composite of kills, assists, win contribution, and damage.
          Filter by mode to see who shines where.
        </p>

        <div className={styles.filterBar}>
          <Link
            href="/explorer/leaderboard"
            className={`${styles.chip} ${!mode ? styles.chipActive : ""}`}
            aria-current={!mode ? "page" : undefined}
          >
            All modes
          </Link>
          {GAME_MODES.map((m) => (
            <Link
              key={m}
              href={`/explorer/leaderboard?mode=${m}`}
              className={`${styles.chip} ${mode === m ? styles.chipActive : ""}`}
              aria-current={mode === m ? "page" : undefined}
              title={MODE_LABEL[m]}
            >
              {MODE_SHORT[m]}
            </Link>
          ))}
        </div>

        {board.items.length === 0 ? (
          <div className={styles.empty}>
            No players qualify for this mode yet (min. 3 matches).
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Player</th>
                <th className={styles.num}>Matches</th>
                <th className={styles.num}>Wins</th>
                <th className={styles.num}>Win rate</th>
                <th className={styles.num}>K/D</th>
                <th className={styles.num}>MVP score</th>
              </tr>
            </thead>
            <tbody>
              {board.items.map((p) => {
                const href = `/explorer/address/${p.address}`;
                return (
                  <tr key={p.address}>
                    <td className={`${styles.rank} ${p.rank <= 3 ? styles.rankTop : ""}`}>
                      <Link href={href} className={styles.tdLink}>
                        #{p.rank.toString().padStart(3, "0")}
                      </Link>
                    </td>
                    <td>
                      <Link href={href} className={styles.tdLink}>
                        <div className={styles.player}>
                          <span className={styles.playerNick}>{p.nickname}</span>
                          <span style={{ color: "var(--muted)" }}>{truncateHex(p.address)}</span>
                        </div>
                      </Link>
                    </td>
                    <td className={styles.num}>
                      <Link href={href} className={styles.tdLink}>{formatNumber(p.matches)}</Link>
                    </td>
                    <td className={styles.num}>
                      <Link href={href} className={styles.tdLink}>{formatNumber(p.wins)}</Link>
                    </td>
                    <td className={styles.num}>
                      <Link href={href} className={styles.tdLink}>{formatPct(p.winRate, 1)}</Link>
                    </td>
                    <td className={styles.num}>
                      <Link href={href} className={styles.tdLink}>{p.kd.toFixed(2)}</Link>
                    </td>
                    <td className={`${styles.num} ${styles.mvpScore}`}>
                      <Link href={href} className={styles.tdLink}>{p.mvpScore.toFixed(1)}</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        <Pagination
          page={board.page}
          pageSize={board.pageSize}
          total={board.total}
          baseHref="/explorer/leaderboard"
          preserveParams={{ mode: mode ?? undefined }}
        />
      </section>
    </>
  );
}

function parseMode(value: string | undefined): GameMode | undefined {
  if (!value) return undefined;
  return (GAME_MODES as readonly string[]).includes(value)
    ? (value as GameMode)
    : undefined;
}
