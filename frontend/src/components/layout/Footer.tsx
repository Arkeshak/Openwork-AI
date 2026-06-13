import React from "react";

export default function Footer() {
  return (
    <footer
      style={{
        padding: "24px",
        marginTop: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
        borderTop: "var(--bd)",
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.65rem",
          color: "var(--mist)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
        }}
      >
        © 2026 All Rights Reserved.
      </div>
      <div
        className="footer-brand"
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.75rem",
          color: "var(--sand)",
          transition: "color 0.2s ease, text-shadow 0.2s ease",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.color = "var(--cream)";
          e.currentTarget.style.textShadow = "0 0 8px rgba(240, 165, 32, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = "var(--sand)";
          e.currentTarget.style.textShadow = "none";
        }}
      >
        Designed by <span style={{ color: "var(--amber)", fontWeight: 500 }}>@arkeshak</span>
      </div>
    </footer>
  );
}
