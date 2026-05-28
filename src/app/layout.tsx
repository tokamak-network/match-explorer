import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "Match Explorer · GunZ PvP Ledger",
  description:
    "Etherscan-like explorer for GunZ PvP match data. Composable, on-chain-ready.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
