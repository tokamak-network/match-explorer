import { MODE_LABEL, MODE_SHORT, type GameMode } from "@/lib/explorer";
import styles from "./Badge.module.css";

const STRIPE: Record<GameMode, string> = {
  DEATHMATCH_SOLO: styles.modeDmSolo,
  DEATHMATCH_TEAM: styles.modeDmTeam,
  GLADIATOR_SOLO: styles.modeGlSolo,
  GLADIATOR_TEAM: styles.modeGlTeam,
  ASSASSINATE: styles.modeAsn,
  BERSERKER: styles.modeBrk,
  DEATHMATCH_DUEL: styles.modeDuel,
};

type Props = {
  mode: GameMode;
  size?: "sm" | "md";
  full?: boolean;
};

export function ModeBadge({ mode, size = "md", full = false }: Props) {
  const cls = [styles.badge, STRIPE[mode], size === "sm" ? styles.sm : ""]
    .filter(Boolean)
    .join(" ");
  return <span className={cls}>{full ? MODE_LABEL[mode] : MODE_SHORT[mode]}</span>;
}
