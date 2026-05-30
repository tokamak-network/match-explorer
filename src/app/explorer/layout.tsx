import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { Inter, Space_Mono } from "next/font/google";
import { SearchModal } from "./components/SearchModal";
import styles from "./page.module.css";

const body = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

const display = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
  display: "swap",
});

const mono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata = {
  title: "RIVAI Explorer · PvP On-Chain Ledger",
  description:
    "Browse PvP matches, player profiles, and leaderboards. Composable PvP data, indexed for the open arena.",
};

export default function ExplorerLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${styles.page} ${body.variable} ${display.variable} ${mono.variable}`}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/explorer" className={styles.brand}>
            <Image
              src="/logo.png"
              alt=""
              width={1158}
              height={432}
              className={styles.brandLogo}
              priority
              aria-hidden
            />
            <span className={styles.brandMark}>RIVAI Explorer</span>
          </Link>
          <nav className={styles.nav}>
            <Link href="/explorer/matches" className={styles.navLink}>Matches</Link>
            <Link href="/explorer/leaderboard" className={styles.navLink}>Leaderboard</Link>
          </nav>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <span>Match Explorer · MVP fixture data · indexed for the open arena</span>
      </footer>
      <SearchModal />
    </div>
  );
}
