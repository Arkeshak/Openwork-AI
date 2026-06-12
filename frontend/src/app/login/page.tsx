"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../../services/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("All fields required"); return; }
    try {
      setLoading(true);
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.access_token);
      toast.success("Access granted.");
      router.push("/dashboard");
    } catch {
      toast.error("Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--ink)", overflow: "hidden" }}>

      {/* ── LEFT: Typographic panel ── */}
      <div
        style={{
          width: "52%",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "40px 48px",
          borderRight: "var(--bd)",
          position: "relative",
          overflow: "hidden",
        }}
        className="hidden-lg"
      >
        {/* Issue label */}
        <div className="flex items-center justify-between">
          <span className="label">Issue Vol. 1</span>
          <span className="label">Document Intelligence</span>
        </div>

        {/* Big display word */}
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "clamp(80px, 14vw, 180px)",
              lineHeight: 0.88,
              textTransform: "uppercase",
              letterSpacing: "-0.04em",
              color: "var(--cream)",
              marginBottom: 8,
            }}
            className="animate-fade-up"
          >
            Open
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "clamp(80px, 14vw, 180px)",
              lineHeight: 0.88,
              textTransform: "uppercase",
              letterSpacing: "-0.04em",
              color: "var(--amber)",
              marginBottom: 32,
            }}
            className="animate-fade-up d2"
          >
            Work
          </div>
          <div
            className="animate-fade-up d3"
            style={{ display: "flex", alignItems: "center", gap: 16 }}
          >
            <span
              style={{
                background: "var(--amber)",
                color: "var(--ink)",
                fontFamily: "var(--font-mono)",
                fontSize: "0.7rem",
                fontWeight: 700,
                padding: "4px 10px",
                textTransform: "uppercase",
                letterSpacing: "0.12em",
              }}
            >
              AI
            </span>
            <span style={{ color: "var(--mist)", fontSize: "0.9rem", fontStyle: "italic", fontFamily: "var(--font-body)" }}>
              Your documents, made conversational.
            </span>
          </div>
        </div>

        {/* Features list */}
        <div className="animate-fade-up d4">
          <hr className="ed-rule" style={{ marginBottom: 24 }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 32px" }}>
            {["RAG-powered retrieval", "Multi-workspace", "Streaming AI responses", "Private & secure"].map((f) => (
              <div key={f} className="flex items-center gap-2">
                <div style={{ width: 6, height: 6, background: "var(--amber)", flexShrink: 0 }} />
                <span style={{ fontSize: "var(--text-sm)", color: "var(--smoke)" }}>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Vertical marquee text */}
        <div
          style={{
            position: "absolute",
            right: -1,
            top: 0,
            bottom: 0,
            width: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "0.55rem",
              textTransform: "uppercase",
              letterSpacing: "0.2em",
              color: "var(--ash)",
              writingMode: "vertical-rl",
              whiteSpace: "nowrap",
            }}
          >
            ◆ OpenWork AI ◆ Document Intelligence ◆ RAG ◆ Ollama ◆ ChromaDB ◆ FastAPI ◆ OpenWork AI ◆ Document Intelligence ◆
          </span>
        </div>
      </div>

      {/* ── RIGHT: Form panel ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "60px 48px",
        }}
      >
        <div style={{ maxWidth: 380, width: "100%" }}>

          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden" style={{ marginBottom: 48 }}>
            <div
              style={{
                width: 8,
                height: 8,
                background: "var(--amber)",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "1.1rem",
                textTransform: "uppercase",
                letterSpacing: "-0.02em",
                color: "var(--cream)",
              }}
            >
              OpenWork AI
            </span>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 48 }}>
            <div className="label" style={{ marginBottom: 12, color: "var(--amber)" }}>
              ◆ Sign In
            </div>
            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(3rem, 6vw, 5rem)",
                fontWeight: 900,
                textTransform: "uppercase",
                letterSpacing: "-0.03em",
                lineHeight: 0.9,
                color: "var(--cream)",
              }}
            >
              Welcome<br />Back
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={login} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            <div>
              <label className="label" style={{ display: "block", marginBottom: 10 }}>
                Email Address
              </label>
              <input
                id="login-email"
                type="email"
                className="ed-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label" style={{ display: "block", marginBottom: 10 }}>
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="login-password"
                  type={showPw ? "text" : "password"}
                  className="ed-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: 36 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 0,
                    bottom: 10,
                    background: "none",
                    border: "none",
                    color: "var(--mist)",
                    cursor: "pointer",
                    display: "flex",
                    padding: 0,
                  }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <button
                id="login-submit"
                type="submit"
                disabled={loading}
                className="ed-btn ed-btn-primary w-full"
                style={{ height: 48, fontSize: "0.72rem" }}
              >
                {loading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <>Enter Archive <ArrowRight size={14} /></>
                )}
              </button>

              <div style={{ marginTop: 20, textAlign: "center" }}>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--mist)", fontFamily: "var(--font-mono)" }}>
                  No account?{" "}
                </span>
                <Link
                  href="/register"
                  style={{
                    fontSize: "var(--text-xs)",
                    fontFamily: "var(--font-mono)",
                    color: "var(--amber)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Create one →
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}