"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SearchHit } from "@/lib/explorer";
import { truncateHex } from "@/lib/explorer";
import styles from "./SearchBar.module.css";

type Props = { initialQuery?: string };

export function SearchBar({ initialQuery = "" }: Props) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!q.trim()) {
      setHits(null);
      return;
    }
    const ctrl = new AbortController();
    const t = window.setTimeout(() => {
      fetch(`/explorer/api/search/${encodeURIComponent(q)}`, {
        signal: ctrl.signal,
      })
        .then((r) => (r.ok ? r.json() : []))
        .then((data: SearchHit[]) => setHits(data))
        .catch(() => undefined);
    }, 180);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [q]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, []);

  const goTo = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <div className={styles.wrap} ref={wrapRef}>
      <form
        className={styles.form}
        action="/explorer/search"
        method="get"
        onSubmit={() => setOpen(false)}
      >
        <input
          name="q"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search by hash / address / nickname / map"
          className={styles.input}
          autoComplete="off"
          spellCheck={false}
        />
        <span className={styles.icon}>↵</span>
      </form>
      {open && q.trim() && hits ? (
        <div className={styles.drop}>
          {hits.length === 0 ? (
            <div className={styles.dropEmpty}>No matches</div>
          ) : (
            <Groups hits={hits} onPick={goTo} />
          )}
        </div>
      ) : null}
    </div>
  );
}

function Groups({
  hits,
  onPick,
}: {
  hits: SearchHit[];
  onPick: (href: string) => void;
}) {
  const matches = hits.filter((h) => h.kind === "match");
  const players = hits.filter((h) => h.kind === "player");
  const maps = hits.filter((h) => h.kind === "map");
  return (
    <>
      {matches.length > 0 && (
        <div className={styles.dropGroup}>
          <div className={styles.dropHeader}>Matches</div>
          {matches.map((h) =>
            h.kind === "match" ? (
              <button
                key={h.hash}
                type="button"
                className={styles.dropItem}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onPick(`/explorer/match/${h.hash}`)}
              >
                <span>#{h.number.toString().padStart(6, "0")}</span>
                <span>{truncateHex(h.hash, 6, 4)}</span>
                <span className={styles.dropMeta}>
                  {h.mode} · {h.map}
                </span>
              </button>
            ) : null,
          )}
        </div>
      )}
      {players.length > 0 && (
        <div className={styles.dropGroup}>
          <div className={styles.dropHeader}>Players</div>
          {players.map((h) =>
            h.kind === "player" ? (
              <button
                key={h.address}
                type="button"
                className={styles.dropItem}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onPick(`/explorer/address/${h.address}`)}
              >
                <span>{h.nickname}</span>
                <span>{truncateHex(h.address, 6, 4)}</span>
                <span className={styles.dropMeta}>{h.matches} matches</span>
              </button>
            ) : null,
          )}
        </div>
      )}
      {maps.length > 0 && (
        <div className={styles.dropGroup}>
          <div className={styles.dropHeader}>Maps</div>
          {maps.map((h) =>
            h.kind === "map" ? (
              <button
                key={h.map}
                type="button"
                className={styles.dropItem}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() =>
                  onPick(`/explorer/search?q=${encodeURIComponent(h.map)}`)
                }
              >
                <span>{h.map}</span>
                <span className={styles.dropMeta}>
                  {h.matchCount} matches
                </span>
              </button>
            ) : null,
          )}
        </div>
      )}
    </>
  );
}
