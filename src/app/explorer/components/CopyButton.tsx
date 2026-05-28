"use client";

import { useCallback, useState } from "react";

type Props = { value: string };

export function CopyButton({ value }: Props) {
  const [copied, setCopied] = useState(false);
  const onClick = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    });
  }, [value]);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Copy"
      style={{
        background: "transparent",
        border: "1px solid var(--line)",
        color: copied ? "var(--accent)" : "var(--muted)",
        fontFamily: "var(--font-mono)",
        fontSize: 10,
        letterSpacing: "0.1em",
        padding: "2px 6px",
        borderRadius: 2,
        cursor: "pointer",
      }}
    >
      {copied ? "OK" : "COPY"}
    </button>
  );
}
