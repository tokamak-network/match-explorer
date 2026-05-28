import type { MapName } from "@/lib/explorer";
import styles from "./Badge.module.css";

type Props = { map: MapName; size?: "sm" | "md" };

export function MapBadge({ map, size = "md" }: Props) {
  const cls = [styles.badge, styles.map, size === "sm" ? styles.sm : ""]
    .filter(Boolean)
    .join(" ");
  return <span className={cls}>{map}</span>;
}
