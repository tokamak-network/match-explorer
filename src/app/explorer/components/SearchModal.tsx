"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { SearchHit } from "@/lib/explorer";
import { truncateHex } from "@/lib/explorer";
import styles from "./SearchModal.module.css";

export function SearchModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<SearchHit[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      if (isMod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      if (e.key === "Escape") setOpen(false);
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("explorer:open-search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("explorer:open-search", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 10);
      return () => window.clearTimeout(t);
    }
    setQ("");
    setHits(null);
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (!q.trim()) {
      setHits(null);
      return;
    }
    const ctrl = new AbortController();
    const t = window.setTimeout(() => {
      fetch(`/explorer/api/search/${encodeURIComponent(q)}`, { signal: ctrl.signal })
        .then((r) => (r.ok ? r.json() : []))
        .then((data: SearchHit[]) => setHits(data))
        .catch(() => undefined);
    }, 180);
    return () => {
      ctrl.abort();
      window.clearTimeout(t);
    };
  }, [q, open]);

  useEffect(() => {
    if (open) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return undefined;
  }, [open]);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      router.push(href);
    },
    [router],
  );

  if (!open) return null;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) go(`/explorer/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <div
      className={styles.overlay}
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Search"
    >
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <form className={styles.form} onSubmit={onSubmit}>
          <svg
            className={styles.icon}
            aria-hidden
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            className={styles.input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by hash, address, nickname, or map"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className={styles.kbd}>ESC</kbd>
        </form>
        <div className={styles.results}>
          {!q.trim() ? (
            <div className={styles.hint}>
              Try a nickname, match hash (0x…), address, or map name
            </div>
          ) : hits && hits.length === 0 ? (
            <div className={styles.empty}>No matches</div>
          ) : hits ? (
            <Groups hits={hits} onPick={go} />
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Groups({ hits, onPick }: { hits: SearchHit[]; onPick: (href: string) => void }) {
  const matches = hits.filter((h) => h.kind === "match");
  const players = hits.filter((h) => h.kind === "player");
  const maps = hits.filter((h) => h.kind === "map");
  return (
    <>
      {matches.length > 0 && (
        <div className={styles.group}>
          <div className={styles.groupHeader}>Matches</div>
          {matches.map((h) =>
            h.kind === "match" ? (
              <button
                key={h.hash}
                type="button"
                className={styles.item}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onPick(`/explorer/match/${h.hash}`)}
              >
                <span>#{h.number.toString().padStart(6, "0")}</span>
                <span>{truncateHex(h.hash, 8, 6)}</span>
                <span className={styles.itemMeta}>{h.mode} · {h.map}</span>
              </button>
            ) : null,
          )}
        </div>
      )}
      {players.length > 0 && (
        <div className={styles.group}>
          <div className={styles.groupHeader}>Players</div>
          {players.map((h) =>
            h.kind === "player" ? (
              <button
                key={h.address}
                type="button"
                className={styles.item}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onPick(`/explorer/address/${h.address}`)}
              >
                <span>{h.nickname}</span>
                <span>{truncateHex(h.address, 8, 6)}</span>
                <span className={styles.itemMeta}>{h.matches} matches</span>
              </button>
            ) : null,
          )}
        </div>
      )}
      {maps.length > 0 && (
        <div className={styles.group}>
          <div className={styles.groupHeader}>Maps</div>
          {maps.map((h) =>
            h.kind === "map" ? (
              <button
                key={h.map}
                type="button"
                className={styles.item}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onPick(`/explorer/search?q=${encodeURIComponent(h.map)}`)}
              >
                <span>{h.map}</span>
                <span className={styles.itemMeta}>{h.matchCount} matches</span>
              </button>
            ) : null,
          )}
        </div>
      )}
    </>
  );
}
