import Link from "next/link";
import {
  MODE_LABEL,
  formatDuration,
  formatNumber,
  formatPct,
  repo,
  truncateHex,
} from "@/lib/explorer";
import { MatchTable } from "./components/MatchTable";
import { StatCard } from "./components/StatCard";
import styles from "./page.module.css";

export const dynamic = "force-static";

export default async function ExplorerOverview() {
  const [stats, latest, leaders] = await Promise.all([
    repo.getOverviewStats(),
    repo.getLatestMatches({ pageSize: 10 }),
    repo.getLeaderboard({ pageSize: 5 }),
  ]);

  return (
    <>
      <section className={styles.hero}>
        <span className={styles.heroTag}>[ explorer.v1 — fixture ]</span>
        <h1 className={styles.heroTitle}>PvP on-chain ledger.</h1>
        <p className={styles.heroLead}>
          Every duel, deathmatch, and gladiator round — recorded as composable data.
          Browse matches, inspect players, and follow the meta as it forms.
        </p>
      </section>

      <section className={styles.stats}>
        <StatCard
          label="Total matches"
          value={formatNumber(stats.totalMatches)}
          sublabel={`Across ${stats.totalPlayers} ranked players`}
          accent
        />
        <StatCard
          label="Matches · 24h"
          value={formatNumber(stats.matches24h)}
          sublabel="Recent activity"
        />
        <StatCard
          label="Avg. match length"
          value={formatDuration(stats.avgMatchSec)}
          sublabel="Across all modes"
        />
        <StatCard
          label="Top mode"
          value={MODE_LABEL[stats.topMode]}
          sublabel="By match count"
        />
      </section>

      <div className={styles.row2col}>
        <section className={styles.section}>
          <header className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Latest matches</h2>
            <Link className={styles.sectionLink} href="/explorer/leaderboard">
              View all leaderboards →
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
        </section>
      </div>
    </>
  );
}
