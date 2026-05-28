import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        minHeight: 360,
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--accent)",
          padding: "5px 10px",
          border: "1px solid var(--accent)",
          borderRadius: "var(--radius-sm)",
          background: "rgba(248, 149, 32, 0.06)",
        }}
      >
        404 · NOT FOUND
      </div>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 36,
          fontWeight: 700,
          letterSpacing: "0.02em",
          margin: 0,
          color: "var(--fg)",
          textTransform: "uppercase",
        }}
      >
        Nothing here.
      </h2>
      <p
        style={{
          fontFamily: "var(--font-body)",
          color: "var(--muted)",
          margin: 0,
          maxWidth: 420,
          lineHeight: 1.5,
        }}
      >
        That hash, address, or page does not exist in the current ledger. Try a search,
        or head back to the overview.
      </p>
      <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
        <Link
          href="/explorer"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "#000",
            background: "var(--accent)",
            padding: "10px 16px",
            textDecoration: "none",
            borderRadius: "var(--radius-sm)",
          }}
        >
          ← Back to overview
        </Link>
      </div>
    </div>
  );
}
