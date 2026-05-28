"use client";

import styles from "./SearchBar.module.css";

export function SearchTrigger() {
  const open = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("explorer:open-search"));
    }
  };
  return (
    <div className={styles.wrap}>
      <button type="button" className={styles.triggerBtn} onClick={open}>
        <svg
          className={styles.searchIcon}
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
        <span className={styles.triggerLabel}>Search collections, players, matches</span>
        <kbd className={styles.kbd}>⌘K</kbd>
      </button>
    </div>
  );
}
