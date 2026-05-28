import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MODE_LABEL,
  formatAbsoluteTime,
  formatDuration,
  formatRelativeTime,
  padMatchNumber,
  repo,
  type WeaponUsage,
} from "@/lib/explorer";
import { Hash } from "../../components/Hash";
import { MapBadge } from "../../components/MapBadge";
import { ModeBadge } from "../../components/ModeBadge";
import { ParticipantTable } from "../../components/ParticipantTable";
import { WeaponStrip } from "../../components/WeaponStrip";
import styles from "./page.module.css";

type Params = Promise<{ hash: string }>;

export default async function MatchDetail({ params }: { params: Params }) {
  const { hash } = await params;
  const match = await repo.getMatch(decodeURIComponent(hash));
  if (!match) notFound();

  const isTeam = match.participants.some((p) => p.team !== "FFA");
  const teamAUsages = aggregateUsages(match.participants.filter((p) => p.team === "A"));
  const teamBUsages = aggregateUsages(match.participants.filter((p) => p.team === "B"));
  const allUsages = aggregateUsages(match.participants);

  return (
    <>
      <div className={styles.crumb}>
        <Link href="/explorer">Explorer</Link> · Match
      </div>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h1 className={styles.sectionTitle}>
            [ #{padMatchNumber(match.number)} ] {MODE_LABEL[match.mode]}
          </h1>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--muted)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
            Season · {match.seasonId}
          </span>
        </div>

        <div className={styles.headBlock}>
          <div className={styles.cell}>
            <span className={styles.k}>Match #</span>
            <span className={`${styles.v} ${styles.vTitle}`}>{padMatchNumber(match.number)}</span>
          </div>
          <div className={styles.cell}>
            <span className={styles.k}>Mode</span>
            <span className={styles.v}>
              <ModeBadge mode={match.mode} full />
            </span>
          </div>
          <div className={styles.cell}>
            <span className={styles.k}>Map</span>
            <span className={styles.v}>
              <MapBadge map={match.map} />
            </span>
          </div>
          <div className={styles.cell}>
            <span className={styles.k}>Duration</span>
            <span className={styles.v}>{formatDuration(match.durationSec)}</span>
          </div>
          <div className={styles.cell} style={{ gridColumn: "span 2" }}>
            <span className={styles.k}>Hash</span>
            <span className={styles.v}>
              <Hash value={match.hash} full copyable />
            </span>
          </div>
          <div className={styles.cell}>
            <span className={styles.k}>Started</span>
            <span className={styles.v}>{formatAbsoluteTime(match.startedAt)}</span>
          </div>
          <div className={styles.cell}>
            <span className={styles.k}>Age</span>
            <span className={styles.v}>{formatRelativeTime(match.startedAt)}</span>
          </div>
          <div className={`${styles.cell} ${styles.cellLastRow}`} style={{ gridColumn: "span 2" }}>
            <span className={styles.k}>Winner</span>
            <span className={styles.v}>
              {isTeam && match.teamScore ? (
                <>
                  Team {match.winnerTeam}{" "}
                  <span style={{ color: "var(--muted)" }}>
                    · {match.teamScore.A}–{match.teamScore.B}
                  </span>
                </>
              ) : match.winnerAddress ? (
                <Link
                  href={`/explorer/address/${match.winnerAddress}`}
                  style={{ color: "var(--accent)", textDecoration: "none" }}
                >
                  {match.participants.find((p) => p.address === match.winnerAddress)?.nickname ?? "—"}
                </Link>
              ) : "—"}
            </span>
          </div>
          <div className={`${styles.cell} ${styles.cellLastRow}`}>
            <span className={styles.k}>Participants</span>
            <span className={styles.v}>{match.participants.length}</span>
          </div>
          <div className={`${styles.cell} ${styles.cellLastRow}`}>
            <span className={styles.k}>Team score</span>
            <span className={styles.v}>
              {match.teamScore ? `${match.teamScore.A} : ${match.teamScore.B}` : "FFA"}
            </span>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Participants</h2>
        </div>
        <ParticipantTable
          participants={match.participants}
          mode={match.mode}
          teamScore={match.teamScore}
        />
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Weapon distribution</h2>
        </div>
        {isTeam ? (
          <div className={styles.weaponGrid}>
            <WeaponStrip title="Team A" usages={teamAUsages} />
            <WeaponStrip title="Team B" usages={teamBUsages} />
          </div>
        ) : (
          <WeaponStrip title="All participants" usages={allUsages} />
        )}
      </section>
    </>
  );
}

function aggregateUsages(
  participants: { weapons: WeaponUsage[] }[],
): WeaponUsage[] {
  const map = new Map<number, WeaponUsage>();
  for (const p of participants) {
    for (const w of p.weapons) {
      const cur = map.get(w.itemId);
      if (cur) {
        cur.kills += w.kills;
        cur.shotsFired += w.shotsFired;
        cur.shotsHit += w.shotsHit;
        cur.damageDealt += w.damageDealt;
      } else {
        map.set(w.itemId, { ...w });
      }
    }
  }
  return [...map.values()];
}
