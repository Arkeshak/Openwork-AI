"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Settings, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

const nav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid, scrollTo: null },
  { href: "/settings", label: "Settings", icon: Settings, scrollTo: null },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Prevent body scroll when sidebar open on mobile
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);


  const handleNavClick = (item: typeof nav[0]) => {
    setOpen(false);
    if (item.scrollTo) {
      // Navigate to dashboard first, then scroll to section
      if (pathname !== "/dashboard") {
        router.push("/dashboard");
        // After navigation, scroll to section
        setTimeout(() => {
          const el = document.getElementById(item.scrollTo!);
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }, 300);
      } else {
        const el = document.getElementById(item.scrollTo);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      router.push(item.href);
    }
  };

  const SidebarContent = () => (
    <aside
      style={{
        width: 220,
        flexShrink: 0,
        height: "100%",
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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
        {/* Mobile close button inside sidebar */}
        <button
          className="sidebar-close-btn"
          onClick={() => setOpen(false)}
          style={{
            background: "none",
            border: "none",
            color: "var(--mist)",
            cursor: "pointer",
            display: "none",
            padding: 4,
          }}
        >
          <X size={16} />
        </button>
      </div>
      <div
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          textTransform: "uppercase",
          letterSpacing: "0.18em",
          color: "var(--sand)",
          padding: "6px 24px 0 42px",
        }}
      >
        AI Platform
      </div>


      {/* Nav items */}
      <nav style={{ flex: 1, paddingBottom: 16 }}>
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href &&
            !item.scrollTo ||
            (item.href !== "/" && !item.scrollTo && pathname.startsWith(item.href));
          return (
            <button
              key={item.href + item.label}
              onClick={() => handleNavClick(item)}
              className={`nav-item ${isActive ? "active" : ""}`}
              style={{ border: "none" }}
            >
              <Icon size={13} style={{ flexShrink: 0 }} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Bottom — version */}
      <div style={{ borderTop: "var(--bd)", padding: "12px 0" }}>
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

  return (
    <>
      {/* Desktop sidebar — always visible */}
      <div className="sidebar-desktop">
        <SidebarContent />
      </div>

      {/* Mobile hamburger button */}
      <button
        className="sidebar-hamburger"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        style={{
          position: "fixed",
          top: 10,
          left: 12,
          zIndex: 300,
          background: "var(--coal)",
          border: "var(--bd)",
          color: "var(--cream)",
          cursor: "pointer",
          padding: "7px 10px",
          display: "none",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Menu size={16} />
      </button>

      {/* Mobile overlay + drawer */}
      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 250,
            background: "rgba(14,13,10,0.7)",
            backdropFilter: "blur(2px)",
            display: "flex",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <SidebarContent />
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .sidebar-hamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .sidebar-desktop { display: flex !important; height: 100vh; position: sticky; top: 0; }
          .sidebar-hamburger { display: none !important; }
        }
      `}</style>
    </>
  );
}
