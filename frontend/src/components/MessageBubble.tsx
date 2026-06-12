"use client";

import ReactMarkdown from "react-markdown";
import { useState } from "react";
import { Copy, Check, Sparkles } from "lucide-react";

interface Props {
  role: string;
  content: string;
}

export default function MessageBubble({ role, content }: Props) {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";

  const copyText = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isUser) {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
        <div
          style={{
            maxWidth: "68%",
            background: "var(--soot)",
            border: "var(--bd)",
            borderRight: "3px solid var(--amber)",
            padding: "12px 16px",
          }}
        >
          <p style={{ fontSize: "var(--text-sm)", color: "var(--cream)", lineHeight: 1.65, margin: 0 }}>
            {content}
          </p>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--mist)", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "right" }}>
            You
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 12, marginBottom: 28 }}>
      <div
        style={{
          width: 26,
          height: 26,
          background: "var(--amber)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        <Sparkles size={11} style={{ color: "var(--ink)" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--amber)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
          ◆ OpenWork AI
        </div>
        <div className="prose-chat">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        <button
          onClick={copyText}
          className="ed-btn ed-btn-ghost"
          style={{ marginTop: 8, padding: "3px 8px", fontSize: "0.6rem", color: "var(--sand)", gap: 4 }}
        >
          {copied ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
        </button>
      </div>
    </div>
  );
}
