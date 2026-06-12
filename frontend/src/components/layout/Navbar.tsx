"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X, Bell } from "lucide-react";
import Link from "next/link";
import { api } from "../../services/api";
import { Workspace } from "../../types/workspace";

interface Profile { id: number; username: string; email: string; }

export default function Navbar({ title }: { title?: string }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Workspace[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      try { const res = await api.get("/auth/me"); setProfile(res.data); } catch { /* ignore */ }
    };
    load();
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await api.get("/workspaces");
        setResults((res.data as Workspace[]).filter((w) =>
          w.name.toLowerCase().includes(query.toLowerCase())
        ).slice(0, 6));
      } catch { /* ignore */ }
    }, 250);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const initials = profile?.username ? profile.username.slice(0, 2).toUpperCase() : "—";

  return (
    <header
      style={{
        height: 52,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        background: "var(--coal)",
        borderBottom: "var(--bd)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        gap: 24,
      }}
    >
      {/* Page title / breadcrumb */}
      <div style={{ flexShrink: 0 }}>
        {title ? (
          <span
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "1rem",
              textTransform: "uppercase",
              letterSpacing: "-0.01em",
              color: "var(--cream)",
            }}
          >
            {title}
          </span>
        ) : (
          <div style={{ width: 8, height: 8, background: "var(--amber)" }} />
        )}
      </div>

      {/* Search */}
      <div ref={searchRef} style={{ flex: 1, maxWidth: 400, position: "relative" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "var(--soot)",
            border: showSearch ? "var(--bd-accent)" : "var(--bd)",
            padding: "5px 12px",
            transition: "border-color 0.15s",
          }}
        >
          <Search size={12} style={{ color: "var(--mist)", flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSearch(true); }}
            onFocus={() => setShowSearch(true)}
            placeholder="Search workspaces…"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text)",
              fontFamily: "var(--font-mono)",
              fontSize: "0.72rem",
              letterSpacing: "0.04em",
            }}
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setResults([]); }}
              style={{ background: "none", border: "none", color: "var(--mist)", cursor: "pointer", display: "flex" }}
            >
              <X size={11} />
            </button>
          )}
        </div>

        {showSearch && results.length > 0 && (
          <div
            className="animate-fade-in"
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "var(--coal)",
              border: "var(--bd)",
              borderTop: "2px solid var(--amber)",
              zIndex: 100,
              marginTop: 2,
            }}
          >
            <div
              style={{
                padding: "6px 12px 4px",
                fontFamily: "var(--font-mono)",
                fontSize: "0.58rem",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color: "var(--mist)",
                borderBottom: "var(--bd)",
              }}
            >
              Workspaces
            </div>
            {results.map((w) => (
              <Link
                key={w.id}
                href={`/workspace/${w.id}`}
                onClick={() => { setQuery(""); setShowSearch(false); }}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "8px 12px",
                    borderBottom: "var(--bd)",
                    transition: "background 0.1s",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--soot)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                >
                  <div
                    style={{
                      width: 4,
                      height: 4,
                      background: "var(--amber)",
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.78rem", color: "var(--cream)" }}>
                    {w.name}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Right: user */}
      <div className="flex items-center gap-4 shrink-0">
        <button className="ed-btn-ghost ed-btn-icon" style={{ color: "var(--mist)" }}>
          <Bell size={14} />
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            borderLeft: "var(--bd)",
            paddingLeft: 16,
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              background: "var(--amber)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-display)",
              fontWeight: 900,
              fontSize: "0.75rem",
              color: "var(--ink)",
              letterSpacing: "-0.01em",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div className="hidden md:block">
            <div
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "0.68rem",
                color: "var(--cream)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                lineHeight: 1,
              }}
            >
              {profile?.username || "—"}
            </div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.58rem", color: "var(--mist)", lineHeight: 1.5, letterSpacing: "0.04em" }}>
              Active
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
