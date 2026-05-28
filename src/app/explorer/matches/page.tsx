import Link from "next/link";
import {
  GAME_MODES,
  MODE_LABEL,
  MODE_SHORT,
  repo,
  type GameMode,
} from "@/lib/explorer";
import { MatchTable } from "../components/MatchTable";
import { Pagination } from "../components/Pagination";
import styles from "./page.module.css";

type Search = Promise<{ mode?: string; page?: string }>;

const PAGE_SIZE = 25;

export default async function MatchesPage({ searchParams }: { searchParams: Search }) {
  const sp = await searchParams;
  const mode = parseMode(sp.mode);
  const page = Math.max(1, Number(sp.page) || 1);

  const result = await repo.getLatestMatches({ mode, page, pageSize: PAGE_SIZE });

  return (
    <>
      <section>
        <h1 className={styles.heroTitle}>All matches.</h1>
        <p className={styles.heroLead}>
          Every recorded round, newest first. Filter by mode to narrow the feed
          — duels, deathmatch, gladiator, and more.
        </p>

        <div className={styles.filterBar}>
          <Link
            href="/explorer/matches"
            className={`${styles.chip} ${!mode ? styles.chipActive : ""}`}
            aria-current={!mode ? "page" : undefined}
          >
            All modes
          </Link>
          {GAME_MODES.map((m) => (
            <Link
              key={m}
              href={`/explorer/matches?mode=${m}`}
              className={`${styles.chip} ${mode === m ? styles.chipActive : ""}`}
              aria-current={mode === m ? "page" : undefined}
              title={MODE_LABEL[m]}
            >
              {MODE_SHORT[m]}
            </Link>
          ))}
        </div>

        <MatchTable matches={result.items} emptyLabel="No matches for this mode" />

        <Pagination
          page={result.page}
          pageSize={result.pageSize}
          total={result.total}
          baseHref="/explorer/matches"
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
