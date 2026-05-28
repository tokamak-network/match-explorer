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
          fontSize: 11,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--accent)",
        }}
      >
        [ 404 · not found ]
      </div>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 36,
          fontWeight: 900,
          letterSpacing: "-0.02em",
          margin: 0,
          color: "var(--fg)",
          textTransform: "uppercase",
        }}
      >
        Nothing here.
      </h2>
      <p
        style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          color: "var(--muted)",
          margin: 0,
          maxWidth: 420,
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
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "var(--fg)",
            border: "1px solid var(--accent)",
            padding: "8px 14px",
            textDecoration: "none",
            borderRadius: 2,
          }}
        >
          ← Back to overview
        </Link>
      </div>
    </div>
  );
}
