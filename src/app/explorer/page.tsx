import Link from "next/link";
import {
  formatNumber,
  formatPct,
  repo,
  truncateHex,
} from "@/lib/explorer";
import { MatchTable } from "./components/MatchTable";
import { SearchTrigger } from "./components/SearchTrigger";
import { StatCard } from "./components/StatCard";
import styles from "./page.module.css";

export const dynamic = "force-static";

export default async function ExplorerOverview() {
  const [stats, latest, leaders] = await Promise.all([
    repo.getOverviewStats(),
    repo.getLatestMatches({ pageSize: 13 }),
    repo.getLeaderboard({ pageSize: 10 }),
  ]);

  return (
    <>
      <section className={styles.heroSearch}>
        <SearchTrigger />
      </section>

      <section className={styles.stats}>
        <StatCard
          label="Total matches"
          value={formatNumber(stats.totalMatches)}
          sublabel="In ledger"
        />
        <StatCard
          label="Unique players"
          value={formatNumber(stats.totalPlayers)}
          sublabel="Ranked addresses"
        />
        <StatCard
          label="Best streak · 24h"
          value={stats.bestStreak ? `${stats.bestStreak.wins}W` : "—"}
          sublabel={stats.bestStreak ? stats.bestStreak.nickname : "No data"}
        />
        <StatCard
          label="Top player · 24h"
          value={stats.topPlayerToday?.nickname ?? "—"}
          sublabel={
            stats.topPlayerToday
              ? `MVP ${stats.topPlayerToday.mvpScore.toFixed(1)} · ${stats.topPlayerToday.matches} matches`
              : "No data"
          }
        />
      </section>

      <div className={styles.row2col}>
        <section className={styles.section}>
          <header className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Latest matches</h2>
            <Link className={styles.sectionLink} href="/explorer/matches">
              View all matches →
            </Link>
          </header>
          <MatchTable matches={latest.items} />
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Top players</h2>
            <Link className={styles.sectionLink} href="/explorer/leaderboard">
              Full leaderboard →
            </Link>
          </header>
          <div className={styles.topPlayers}>
            <div className={styles.topPlayersHeader}>
              <span>Rank</span>
              <span>Player</span>
              <span className={styles.topPlayersHeaderNum}>MVP</span>
            </div>
            <div className={styles.topPlayersBody}>
              {leaders.items.map((p) => (
                <Link
                  key={p.address}
                  href={`/explorer/address/${p.address}`}
                  className={styles.topPlayerRow}
                >
                  <span className={styles.topRank}>#{p.rank.toString().padStart(2, "0")}</span>
                  <span>
                    <span className={styles.topNick}>{p.nickname}</span>
                    <span className={styles.topNickSub}>
                      {truncateHex(p.address)} · {p.matches} matches · {formatPct(p.winRate, 0)} WR · {p.kd.toFixed(2)} K/D
                    </span>
                  </span>
                  <span className={styles.topScore}>{p.mvpScore.toFixed(1)}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
