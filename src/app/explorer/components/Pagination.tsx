import Link from "next/link";
import styles from "./Pagination.module.css";

type Props = {
  page: number;
  pageSize: number;
  total: number;
  baseHref: string;
  preserveParams?: Record<string, string | undefined>;
};

export function Pagination({
  page,
  pageSize,
  total,
  baseHref,
  preserveParams,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const prev = Math.max(1, page - 1);
  const next = Math.min(totalPages, page + 1);

  const startIdx = (page - 1) * pageSize + 1;
  const endIdx = Math.min(total, page * pageSize);

  const hrefFor = (p: number) => {
    const sp = new URLSearchParams();
    if (preserveParams) {
      for (const [k, v] of Object.entries(preserveParams)) {
        if (v) sp.set(k, v);
      }
    }
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return qs ? `${baseHref}?${qs}` : baseHref;
  };

  return (
    <div className={styles.bar}>
      <div>
        Showing <span className={styles.position}>{startIdx}–{endIdx}</span> of{" "}
        <span className={styles.position}>{total}</span>
      </div>
      <div className={styles.controls}>
        {page > 1 ? (
          <Link href={hrefFor(prev)} className={styles.link}>
            ← Prev
          </Link>
        ) : (
          <span className={styles.disabled}>← Prev</span>
        )}
        <span className={styles.position}>
          {page} / {totalPages}
        </span>
        {page < totalPages ? (
          <Link href={hrefFor(next)} className={styles.link}>
            Next →
          </Link>
        ) : (
          <span className={styles.disabled}>Next →</span>
        )}
      </div>
    </div>
  );
}
