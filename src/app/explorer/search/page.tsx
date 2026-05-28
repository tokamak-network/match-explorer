import Link from "next/link";
import { redirect } from "next/navigation";
import {
  isAddressLike,
  isMatchHashLike,
  repo,
  truncateHex,
} from "@/lib/explorer";
import styles from "./page.module.css";

type Search = Promise<{ q?: string }>;

export default async function SearchPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();

  if (!q) return <EmptyState />;

  if (isMatchHashLike(q)) {
    const m = await repo.getMatch(q);
    if (m) redirect(`/explorer/match/${m.hash}`);
  }
  if (isAddressLike(q)) {
    const p = await repo.getPlayer(q);
    if (p) redirect(`/explorer/address/${p.address}`);
  }

  const hits = await repo.search(q, 30);
  const matches = hits.filter((h) => h.kind === "match");
  const players = hits.filter((h) => h.kind === "player");
  const maps = hits.filter((h) => h.kind === "map");

  return (
    <>
      <div className={styles.crumb}>
        <Link href="/explorer">Explorer</Link> · Search
      </div>
      <h1 className={styles.heroTitle}>
        Results for<span className={styles.q}>“{q}”</span>
      </h1>
      <p className={styles.heroLead}>
        {hits.length === 0
          ? "Nothing matched. Try a nickname prefix, a partial hash starting with 0x, or a map name."
          : `${hits.length} match${hits.length === 1 ? "" : "es"} across matches, players, and maps.`}
      </p>

      {matches.length > 0 && (
        <div className={styles.group}>
          <h2 className={styles.groupTitle}>Matches · {matches.length}</h2>
          {matches.map((h) =>
            h.kind === "match" ? (
              <Link key={h.hash} href={`/explorer/match/${h.hash}`} className={styles.row}>
                <div className={styles.rowMain}>
                  <span style={{ color: "var(--muted)" }}>#{h.number.toString().padStart(6, "0")}</span>
                  <span>{truncateHex(h.hash, 8, 6)}</span>
                </div>
                <span className={styles.rowMeta}>{h.mode} · {h.map}</span>
              </Link>
            ) : null,
          )}
        </div>
      )}

      {players.length > 0 && (
        <div className={styles.group}>
          <h2 className={styles.groupTitle}>Players · {players.length}</h2>
          {players.map((h) =>
            h.kind === "player" ? (
              <Link
                key={h.address}
                href={`/explorer/address/${h.address}`}
                className={styles.row}
              >
                <div className={styles.rowMain}>
                  <span className={styles.nick}>{h.nickname}</span>
                  <span style={{ color: "var(--muted)" }}>{truncateHex(h.address, 8, 6)}</span>
                </div>
                <span className={styles.rowMeta}>{h.matches} matches</span>
              </Link>
            ) : null,
          )}
        </div>
      )}

      {maps.length > 0 && (
        <div className={styles.group}>
          <h2 className={styles.groupTitle}>Maps · {maps.length}</h2>
          {maps.map((h) =>
            h.kind === "map" ? (
              <div key={h.map} className={styles.row}>
                <div className={styles.rowMain}>
                  <span className={styles.nick}>{h.map}</span>
                </div>
                <span className={styles.rowMeta}>{h.matchCount} matches</span>
              </div>
            ) : null,
          )}
        </div>
      )}

      {hits.length === 0 && <NoHits q={q} />}
    </>
  );
}

async function EmptyState() {
  const latest = await repo.getLatestMatches({ pageSize: 2 });
  const board = await repo.getLeaderboard({ pageSize: 2 });
  return (
    <>
      <div className={styles.crumb}>
        <Link href="/explorer">Explorer</Link> · Search
      </div>
      <h1 className={styles.heroTitle}>Start searching.</h1>
      <p className={styles.heroLead}>
        Look up a match hash, a player address, a nickname, or a map. Here are a few examples
        from the current ledger.
      </p>
      <div className={styles.examples}>
        <div className={styles.exampleHeader}>Try one of these</div>
        {latest.items[0] && (
          <Link href={`/explorer/search?q=${latest.items[0].hash}`} className={styles.row}>
            <div className={styles.rowMain}>
              <span>{truncateHex(latest.items[0].hash, 10, 8)}</span>
            </div>
            <span className={styles.rowMeta}>Match hash</span>
          </Link>
        )}
        {board.items[0] && (
          <Link
            href={`/explorer/search?q=${encodeURIComponent(board.items[0].nickname)}`}
            className={styles.row}
          >
            <div className={styles.rowMain}>
              <span className={styles.nick}>{board.items[0].nickname}</span>
            </div>
            <span className={styles.rowMeta}>Nickname</span>
          </Link>
        )}
        {board.items[1] && (
          <Link
            href={`/explorer/search?q=${board.items[1].address}`}
            className={styles.row}
          >
            <div className={styles.rowMain}>
              <span>{truncateHex(board.items[1].address, 10, 8)}</span>
            </div>
            <span className={styles.rowMeta}>Address</span>
          </Link>
        )}
        <Link href={`/explorer/search?q=Mansion`} className={styles.row}>
          <div className={styles.rowMain}>
            <span className={styles.nick}>Mansion</span>
          </div>
          <span className={styles.rowMeta}>Map</span>
        </Link>
      </div>
    </>
  );
}

function NoHits({ q }: { q: string }) {
  return (
    <div className={styles.empty}>
      No results matched “{q}”. Try a shorter prefix.
    </div>
  );
}
