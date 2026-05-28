import Link from "next/link";
import type { ReactNode } from "react";
import { IBM_Plex_Mono, Inter, Newsreader } from "next/font/google";
import { SearchBar } from "./components/SearchBar";
import styles from "./page.module.css";

const display = Inter({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-display",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const serif = Newsreader({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata = {
  title: "GunZ Explorer · PvP On-Chain Ledger",
  description:
    "Browse GunZ PvP matches, player profiles, and leaderboards. Composable PvP data, indexed for the open arena.",
};

export default function ExplorerLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${styles.page} ${display.variable} ${mono.variable} ${serif.variable}`}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/explorer" className={styles.brand}>
            <span className={styles.brandMark}>GunZ Explorer</span>
            <span className={styles.brandKind}>· PvP ledger</span>
          </Link>
          <SearchBar />
          <nav className={styles.nav}>
            <Link href="/explorer" className={styles.navLink}>Overview</Link>
            <Link href="/explorer/leaderboard" className={styles.navLink}>Leaderboard</Link>
          </nav>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        Match Explorer · MVP fixture data · indexed for the open arena
      </footer>
    </div>
  );
}
