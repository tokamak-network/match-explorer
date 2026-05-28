import styles from "./StatCard.module.css";

type Props = {
  label: string;
  value: string | number;
  sublabel?: string;
  accent?: boolean;
};

export function StatCard({ label, value, sublabel, accent }: Props) {
  return (
    <div className={`${styles.card} ${accent ? styles.accent : ""}`}>
      <div className={styles.label}>{label}</div>
      <div className={styles.value}>{value}</div>
      {sublabel ? <div className={styles.sub}>{sublabel}</div> : null}
    </div>
  );
}
