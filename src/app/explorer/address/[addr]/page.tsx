import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MODE_LABEL,
  formatAbsoluteTime,
  formatNumber,
  formatPct,
  type GameMode,
  type PlayerStats,
  repo,
} from "@/lib/explorer";
import { Hash } from "../../components/Hash";
import { MatchTable } from "../../components/MatchTable";
import { MapBadge } from "../../components/MapBadge";
import { ModeBadge } from "../../components/ModeBadge";
import { Pagination } from "../../components/Pagination";
import { StatCard } from "../../components/StatCard";
import { WeaponBadge } from "../../components/WeaponBadge";
import styles from "./page.module.css";

type Params = Promise<{ addr: string }>;
type Search = Promise<{ page?: string }>;

const PAGE_SIZE = 12;

export default async function PlayerPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Search;
}) {
  const [{ addr }, sp] = await Promise.all([params, searchParams]);
  const decoded = decodeURIComponent(addr);
  const page = Math.max(1, Number(sp.page) || 1);

  const player = await repo.getPlayer(decoded);
  if (!player) notFound();

  const matches = await repo.getPlayerMatches(decoded, {
    page,
    pageSize: PAGE_SIZE,
  });

  return (
    <>
      <div className={styles.crumb}>
        <Link href="/explorer">Explorer</Link> · Address
      </div>

      <section className={styles.profile}>
        <div className={styles.identityCard}>
          <span className={styles.identityKind}>[ player · {player.overall.matches} matches ]</span>
          <h1 className={styles.identityNick}>{player.nickname}</h1>
          <div className={styles.identityAddr}>
            <Hash value={player.address} full copyable />
          </div>
          <div className={styles.identityMeta}>
            <div>
              <span className={styles.metaK}>First seen</span>
              <span className={styles.metaV}>{formatAbsoluteTime(player.firstSeen)}</span>
            </div>
            <div>
              <span className={styles.metaK}>Last seen</span>
              <span className={styles.metaV}>{formatAbsoluteTime(player.lastSeen)}</span>
            </div>
            <div>
              <span className={styles.metaK}>Favorite map</span>
              <span className={styles.metaV}>
                <MapBadge map={player.favoriteMap} size="sm" />
              </span>
            </div>
            <div>
              <span className={styles.metaK}>Favorite weapon</span>
              <span className={styles.metaV}>
                <WeaponBadge weapon={player.favoriteWeapon} size="sm" />
              </span>
            </div>
          </div>
        </div>

        <div className={styles.statGrid}>
          <StatCard label="Matches" value={formatNumber(player.overall.matches)} />
          <StatCard
            label="Wins"
            value={formatNumber(player.overall.wins)}
            sublabel={`${formatPct(player.overall.winRate, 1)} win rate`}
            accent
          />
          <StatCard label="K / D" value={player.overall.kd.toFixed(2)} sublabel={`${player.overall.kills} K / ${player.overall.deaths} D`} />
          <StatCard label="MVP score" value={player.overall.mvpScore.toFixed(1)} sublabel={`${player.overall.mvps} MVPs`} />
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Performance by mode</h2>
        </div>
        <table className={styles.byMode}>
          <thead>
            <tr>
              <th>Mode</th>
              <th className={styles.num}>Matches</th>
              <th className={styles.num}>Win rate</th>
              <th className={styles.num}>K/D</th>
              <th className={styles.num}>MVP score</th>
            </tr>
          </thead>
          <tbody>
            {modeRows(player.byMode)}
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Recent matches</h2>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            {formatNumber(matches.total)} total
          </span>
        </div>
        <MatchTable
          matches={matches.items}
          columns={["number", "hash", "mode", "map", "duration", "winner", "age"]}
          emptyLabel="No matches recorded for this address"
        />
        <Pagination
          page={matches.page}
          pageSize={matches.pageSize}
          total={matches.total}
          baseHref={`/explorer/address/${player.address}`}
        />
      </section>

      <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 13, color: "var(--muted)", margin: 0, maxWidth: "60ch" }}>
        Inspecting a player profile is read-only. Profile data updates as new matches land in the
        ledger — composable, replayable, and addressable by anyone.
      </p>
    </>
  );
}

function modeRows(byMode: Partial<Record<GameMode, PlayerStats>>) {
  const entries = Object.entries(byMode) as [GameMode, PlayerStats][];
  if (entries.length === 0) {
    return (
      <tr>
        <td colSpan={5} style={{ textAlign: "center", color: "var(--muted)", padding: 24 }}>
          No mode data yet
        </td>
      </tr>
    );
  }
  return entries
    .sort((a, b) => b[1].matches - a[1].matches)
    .map(([mode, stats]) => (
      <tr key={mode}>
        <td>
          <ModeBadge mode={mode} full size="sm" />
        </td>
        <td className={styles.num}>{stats.matches}</td>
        <td className={styles.num}>{formatPct(stats.winRate, 1)}</td>
        <td className={styles.num}>{stats.kd.toFixed(2)}</td>
        <td className={styles.num} style={{ color: "var(--accent)" }}>{stats.mvpScore.toFixed(1)}</td>
      </tr>
    ));
  void MODE_LABEL;
}
