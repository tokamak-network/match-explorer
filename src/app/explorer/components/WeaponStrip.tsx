import type { WeaponUsage } from "@/lib/explorer";
import { WeaponBadge } from "./WeaponBadge";
import styles from "./WeaponStrip.module.css";

type Props = {
  title?: string;
  usages: WeaponUsage[];
  max?: number;
};

export function WeaponStrip({ title, usages, max = 6 }: Props) {
  if (usages.length === 0) {
    return (
      <div className={styles.wrap}>
        {title ? <h4 className={styles.title}>{title}</h4> : null}
        <div className={styles.empty}>No weapon data</div>
      </div>
    );
  }
  const top = [...usages].sort((a, b) => b.kills - a.kills).slice(0, max);
  const peak = Math.max(1, top[0]!.kills);
  return (
    <div className={styles.wrap}>
      {title ? <h4 className={styles.title}>{title}</h4> : null}
      {top.map((w) => (
        <div className={styles.row} key={`${w.itemId}-${w.kills}`}>
          <div className={styles.label}>
            <WeaponBadge weapon={w} size="sm" />
          </div>
          <div className={styles.bar}>
            <span
              className={styles.fill}
              style={{ transform: `scaleX(${w.kills / peak})` }}
            />
          </div>
          <div className={styles.value}>{w.kills}</div>
        </div>
      ))}
    </div>
  );
}
