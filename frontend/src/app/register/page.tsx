"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../../services/api";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const register = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password) { toast.error("All fields required"); return; }
    if (password.length < 6) { toast.error("Password: min. 6 characters"); return; }
    try {
      setLoading(true);
      await api.post("/auth/register", { username, email, password });
      toast.success("Account created. Sign in.");
      router.push("/login");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || "Registration failed";
      toast.error(msg);
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
        <div className="flex items-center justify-between">
          <span className="label">New Record</span>
          <span className="label">Est. 2025</span>
        </div>

        {/* Huge display text */}
        <div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "clamp(72px, 12vw, 160px)",
              lineHeight: 0.88,
              textTransform: "uppercase",
              letterSpacing: "-0.04em",
              color: "var(--cream)",
            }}
            className="animate-fade-up"
          >
            Create
          </div>
          <div
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "clamp(72px, 12vw, 160px)",
              lineHeight: 0.88,
              textTransform: "uppercase",
              letterSpacing: "-0.04em",
              color: "var(--amber)",
              marginBottom: 32,
            }}
            className="animate-fade-up d2"
          >
            Account
          </div>
          <p
            className="animate-fade-up d3"
            style={{
              color: "var(--mist)",
              fontSize: "var(--text-sm)",
              fontStyle: "italic",
              maxWidth: 320,
              lineHeight: 1.7,
            }}
          >
            Join the archive. Upload your documents, build workspaces, ask questions of your own knowledge base.
          </p>
        </div>

        {/* Stats block */}
        <div className="animate-fade-up d4">
          <hr className="ed-rule" style={{ marginBottom: 24 }} />
          <div style={{ display: "flex", gap: 48 }}>
            {[["Free", "to start"], ["∞", "Documents"], ["RAG", "Powered"]].map(([num, lbl]) => (
              <div key={lbl}>
                <div
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 900,
                    fontSize: "2.5rem",
                    lineHeight: 1,
                    color: "var(--amber)",
                    textTransform: "uppercase",
                  }}
                >
                  {num}
                </div>
                <div className="label" style={{ marginTop: 4 }}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Vertical text */}
        <div
          style={{
            position: "absolute",
            right: -1,
            top: 0, bottom: 0,
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
            ◆ Create Account ◆ Join OpenWork AI ◆ Document Intelligence Platform ◆ Powered by Ollama ◆
          </span>
        </div>
      </div>

      {/* ── RIGHT: Form ── */}
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
            <div style={{ width: 8, height: 8, background: "var(--amber)" }} />
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

          <div style={{ marginBottom: 48 }}>
            <div className="label" style={{ marginBottom: 12, color: "var(--amber)" }}>
              ◆ Register
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
              New<br />Archive
            </h1>
          </div>

          <form onSubmit={register} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            <div>
              <label className="label" style={{ display: "block", marginBottom: 10 }}>Username</label>
              <input
                id="register-username"
                type="text"
                className="ed-input"
                placeholder="yourname"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div>
              <label className="label" style={{ display: "block", marginBottom: 10 }}>Email Address</label>
              <input
                id="register-email"
                type="email"
                className="ed-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label" style={{ display: "block", marginBottom: 10 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  id="register-password"
                  type={showPw ? "text" : "password"}
                  className="ed-input"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  style={{ paddingRight: 36 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={{
                    position: "absolute", right: 0, bottom: 10,
                    background: "none", border: "none",
                    color: "var(--mist)", cursor: "pointer", display: "flex", padding: 0,
                  }}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <button
                id="register-submit"
                type="submit"
                disabled={loading}
                className="ed-btn ed-btn-primary w-full"
                style={{ height: 48, fontSize: "0.72rem" }}
              >
                {loading ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <>Open Account <ArrowRight size={14} /></>
                )}
              </button>

              <div style={{ marginTop: 20, textAlign: "center" }}>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--mist)", fontFamily: "var(--font-mono)" }}>
                  Already in?{" "}
                </span>
                <Link
                  href="/login"
                  style={{
                    fontSize: "var(--text-xs)",
                    fontFamily: "var(--font-mono)",
                    color: "var(--amber)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}
                >
                  Sign in →
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
