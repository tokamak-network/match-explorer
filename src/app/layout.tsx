import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "RIVAI Explorer · PvP Ledger",
  description:
    "Etherscan-like explorer for PvP match data. Composable, on-chain-ready.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
