"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, FolderOpen, Settings, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/dashboard#workspaces", label: "Workspaces", icon: FolderOpen },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        height: "100vh",
        position: "sticky",
        top: 0,
        background: "var(--coal)",
        borderRight: "var(--bd)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Wordmark */}
      <div
        style={{
          padding: "20px 24px 18px",
          borderBottom: "var(--bd)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            style={{
              width: 10,
              height: 10,
              background: "var(--amber)",
              flexShrink: 0,
            }}
          />
          <Link href="/dashboard" style={{ textDecoration: "none" }}>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 900,
                fontSize: "1.05rem",
                textTransform: "uppercase",
                letterSpacing: "-0.02em",
                color: "var(--cream)",
                lineHeight: 1,
              }}
            >
              OpenWork
            </span>
          </Link>
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.6rem",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            color: "var(--sand)",
            marginTop: 6,
            paddingLeft: 18,
          }}
        >
          AI Platform
        </div>
      </div>

      {/* Nav section label */}
      <div
        style={{
          padding: "16px 24px 8px",
        }}
      >
        <span className="label" style={{ fontSize: "0.58rem", letterSpacing: "0.18em" }}>
          Navigation
        </span>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, paddingBottom: 16 }}>
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && !item.href.includes("#") && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href + item.label}
              href={item.href}
              style={{ textDecoration: "none" }}
            >
              <div className={`nav-item ${isActive ? "active" : ""}`}>
                <Icon size={13} style={{ flexShrink: 0 }} />
                {item.label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom — version + logout */}
      <div style={{ borderTop: "var(--bd)", padding: "12px 0" }}>
        <button onClick={logout} className="nav-item" style={{ color: "var(--ember)" }}>
          <LogOut size={13} />
          Logout
        </button>
        <div
          style={{
            padding: "8px 24px 0",
            fontFamily: "var(--font-mono)",
            fontSize: "0.58rem",
            color: "var(--ash)",
            textTransform: "uppercase",
            letterSpacing: "0.12em",
          }}
        >
          v1.0 — Archival Build
        </div>
      </div>
    </aside>
  );
}
