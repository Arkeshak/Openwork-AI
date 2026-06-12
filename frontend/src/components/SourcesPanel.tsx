"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, BookOpen } from "lucide-react";

interface Props {
  sources: string[];
}

export default function SourcesPanel({ sources }: Props) {
  const [open, setOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div style={{ marginTop: 12, border: "var(--bd)", overflow: "hidden" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          background: "var(--soot)",
          border: "none",
          cursor: "pointer",
          color: "var(--mist)",
          fontFamily: "var(--font-mono)",
          fontSize: "0.62rem",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          transition: "background 0.1s",
        }}
        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--char)")}
        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--soot)")}
      >
        <BookOpen size={11} style={{ color: "var(--amber)" }} />
        {sources.length} source{sources.length !== 1 ? "s" : ""} retrieved
        {open ? <ChevronDown size={11} style={{ marginLeft: "auto" }} /> : <ChevronRight size={11} style={{ marginLeft: "auto" }} />}
      </button>

      {open && (
        <div style={{ background: "var(--coal)" }}>
          {sources.map((src, i) => (
            <div
              key={i}
              style={{
                padding: "10px 12px",
                borderTop: "var(--bd)",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.58rem",
                  color: "var(--amber)",
                  border: "1.5px solid var(--amber)",
                  padding: "1px 5px",
                  flexShrink: 0,
                  marginTop: 1,
                  lineHeight: 1.4,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <p
                style={{
                  margin: 0,
                  fontSize: "var(--text-xs)",
                  color: "var(--smoke)",
                  lineHeight: 1.65,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {src.length > 280 ? src.slice(0, 280) + "…" : src}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
