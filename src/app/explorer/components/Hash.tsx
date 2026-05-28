import Link from "next/link";
import dynamic from "next/dynamic";
import { truncateHex } from "@/lib/explorer";
import styles from "./Hash.module.css";

const CopyButton = dynamic(() => import("./CopyButton").then((m) => m.CopyButton));

type Props = {
  value: string;
  href?: string;
  head?: number;
  tail?: number;
  full?: boolean;
  copyable?: boolean;
};

export function Hash({ value, href, head = 6, tail = 4, full = false, copyable = false }: Props) {
  const display = full ? value : truncateHex(value, head, tail);
  const content = href ? (
    <Link href={href} className={styles.link}>
      {display}
    </Link>
  ) : (
    <span>{display}</span>
  );
  if (!copyable) return <span className={styles.hash}>{content}</span>;
  return (
    <span className={`${styles.hash} ${styles.row}`}>
      {content}
      <CopyButton value={value} />
    </span>
  );
}
