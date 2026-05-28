import type { WeaponClass } from "@/lib/explorer";
import styles from "./Badge.module.css";

const STRIPE: Record<WeaponClass, string> = {
  Melee: styles.classMelee,
  Pistol: styles.classPistol,
  SMG: styles.classSmg,
  Shotgun: styles.classShotgun,
  Rifle: styles.classRifle,
  MG: styles.classMg,
  RocketLauncher: styles.classRpg,
};

type Props = {
  weapon: { itemId: number; name: string; klass: WeaponClass };
  size?: "sm" | "md";
};

export function WeaponBadge({ weapon, size = "md" }: Props) {
  const cls = [styles.badge, STRIPE[weapon.klass], size === "sm" ? styles.sm : ""]
    .filter(Boolean)
    .join(" ");
  return <span className={cls}>{weapon.name}</span>;
}
