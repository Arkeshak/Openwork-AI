"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ArrowRight, Trash2, X, Loader2, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { api } from "../../services/api";
import { Workspace } from "../../types/workspace";

interface DashboardData {
  workspaces: number;
  documents: number;
  chats: number;
  messages: number;
  recent_workspaces: Workspace[];
  recent_chats: { id: number; title: string; workspace_id: number }[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get("/dashboard");
      setData(res.data);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      try {
        const res = await api.get("/dashboard");
        if (!cancelled) setData(res.data);
      } catch { if (!cancelled) toast.error("Failed to load"); }
      finally { if (!cancelled) setLoading(false); }
    };
    fetch();
    return () => { cancelled = true; };
  }, []);

  const createWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) { toast.error("Name required"); return; }
    try {
      setCreating(true);
      await api.post("/workspaces", { name: newName.trim(), description: newDesc.trim() || null });
      toast.success("Workspace created.");
      setShowModal(false); setNewName(""); setNewDesc("");
      load();
    } catch { toast.error("Failed to create workspace"); }
    finally { setCreating(false); }
  };

  const deleteWorkspace = async (id: number) => {
    try {
      await api.delete(`/workspaces/${id}`);
      toast.success("Deleted.");
      load();
    } catch { toast.error("Delete failed"); }
  };

  const stats = [
    { label: "Workspaces", value: data?.workspaces ?? 0 },
    { label: "Documents",  value: data?.documents  ?? 0 },
    { label: "Chats",      value: data?.chats       ?? 0 },
    { label: "Messages",   value: data?.messages    ?? 0 },
  ];

  return (
    <div className="dashboard-root">
      <Sidebar />

      <div className="dashboard-body">
        <Navbar title="Dashboard" />

        <main style={{ flex: 1 }}>

          {/* ── Stats row ── */}
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className="stat-cell animate-fade-up"
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="label" style={{ marginBottom: 10 }}>{s.label}</div>
                {loading ? (
                  <div className="skeleton" style={{ height: 56, width: 80 }} />
                ) : (
                  <div
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 900,
                      fontSize: "clamp(2rem, 5vw, 4rem)",
                      lineHeight: 1,
                      color: i === 0 ? "var(--amber)" : "var(--cream)",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    {s.value.toString().padStart(2, "0")}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── Content grid ── */}
          <div className="content-grid">

            {/* ── Workspace index ── */}
            <div id="workspaces" className="workspace-panel">

              {/* Header row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "20px 24px",
                  borderBottom: "var(--bd)",
                  flexWrap: "wrap",
                  gap: 12,
                }}
              >
                <div className="flex items-center gap-3">
                  <h2
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 900,
                      fontSize: "clamp(1rem, 3vw, 1.4rem)",
                      textTransform: "uppercase",
                      letterSpacing: "-0.02em",
                      color: "var(--cream)",
                      lineHeight: 1,
                    }}
                  >
                    Workspaces
                  </h2>
                  {data && (
                    <span className="ed-badge ed-badge-amber">
                      {data.workspaces}
                    </span>
                  )}
                </div>
                <button
                  id="create-workspace-btn"
                  onClick={() => setShowModal(true)}
                  className="ed-btn ed-btn-primary ed-btn-sm"
                >
                  <Plus size={11} /> New
                </button>
              </div>

              {/* Workspace table */}
              {loading ? (
                <div style={{ padding: 32, display: "flex", flexDirection: "column", gap: 2 }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton" style={{ height: 64 }} />
                  ))}
                </div>
              ) : data?.recent_workspaces?.length === 0 ? (
                <div
                  style={{
                    padding: "60px 24px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-start",
                    gap: 16,
                  }}
                >
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 8vw, 5rem)", lineHeight: 1, color: "var(--char)", fontWeight: 900, textTransform: "uppercase" }}>
                    Empty
                  </div>
                  <p style={{ color: "var(--mist)", fontSize: "var(--text-sm)", maxWidth: 340 }}>
                    No workspaces yet. Create one to start uploading documents and chatting with your data.
                  </p>
                  <button onClick={() => setShowModal(true)} className="ed-btn ed-btn-outline" style={{ marginTop: 8 }}>
                    <Plus size={12} /> Create First Workspace
                  </button>
                </div>
              ) : (
                <div>
                  {/* Column labels — hidden on very small screens */}
                  <div className="workspace-table-header">
                    {["#", "Name / Description", "Created", "Actions"].map((h) => (
                      <div key={h} className="label" style={{ fontSize: "0.58rem" }}>{h}</div>
                    ))}
                  </div>

                  {data?.recent_workspaces.map((w, i) => (
                    <div
                      key={w.id}
                      className="workspace-row animate-fade-up"
                      onClick={() => router.push(`/workspace/${w.id}`)}
                      style={{ animationDelay: `${i * 0.05}s` }}
                      onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--coal)")}
                      onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
                    >
                      {/* Number */}
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.68rem",
                          color: "var(--ash)",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </div>

                      {/* Name + Description */}
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            fontFamily: "var(--font-body)",
                            fontWeight: 600,
                            fontSize: "var(--text-base)",
                            color: "var(--cream)",
                          }}
                        >
                          {w.name}
                        </div>
                        {w.description && (
                          <div
                            style={{
                              fontSize: "var(--text-xs)",
                              color: "var(--mist)",
                              marginTop: 2,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {w.description}
                          </div>
                        )}
                      </div>

                      {/* Date */}
                      <div
                        className="ws-date-col"
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "0.65rem",
                          color: "var(--sand)",
                          letterSpacing: "0.03em",
                        }}
                      >
                        {w.created_at
                          ? new Date(w.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "—"}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => router.push(`/workspace/${w.id}`)}
                          className="ed-btn ed-btn-ghost ed-btn-icon"
                          title="Open workspace"
                        >
                          <ArrowRight size={13} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteWorkspace(w.id); }}
                          className="ed-btn ed-btn-ghost ed-btn-icon"
                          title="Delete workspace"
                          style={{ color: "var(--ember)" }}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ── Right column: recent chats + info ── */}
            <div className="right-panel">
              {/* Recent chats */}
              <div style={{ padding: "20px 24px", borderBottom: "var(--bd)" }}>
                <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 900,
                      fontSize: "0.95rem",
                      textTransform: "uppercase",
                      color: "var(--cream)",
                    }}
                  >
                    Recent Chats
                  </h3>
                  <div style={{ width: 4, height: 4, background: "var(--amber)" }} />
                </div>

                {loading ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 52 }} />)}
                  </div>
                ) : !data?.recent_chats?.length ? (
                  <div style={{ padding: "24px 0", textAlign: "center" }}>
                    <MessageSquare size={20} style={{ color: "var(--ash)", margin: "0 auto 8px" }} />
                    <p style={{ fontSize: "var(--text-xs)", color: "var(--sand)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      No chats yet
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {data.recent_chats.map((chat) => (
                      <button
                        key={chat.id}
                        onClick={() => router.push(`/workspace/${chat.workspace_id}`)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 10,
                          padding: "10px 0",
                          borderBottom: "var(--bd)",
                          textAlign: "left",
                          width: "100%",
                          transition: "background 0.1s",
                        }}
                      >
                        <div style={{ width: 4, height: 4, background: "var(--amber)", marginTop: 6, flexShrink: 0 }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: "var(--text-sm)", color: "var(--cream)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 500 }}>
                            {chat.title}
                          </div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--sand)", fontFamily: "var(--font-mono)", marginTop: 2, letterSpacing: "0.04em" }}>
                            WS #{chat.workspace_id}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* System info block */}
              <div style={{ padding: "20px 24px" }}>
                <div className="label" style={{ marginBottom: 16 }}>System</div>
                {[
                  ["Engine", "Ollama llama3.2"],
                  ["Vector DB", "ChromaDB"],
                  ["Backend", "FastAPI"],
                  ["Database", "PostgreSQL"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 0",
                      borderBottom: "var(--bd)",
                    }}
                  >
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--sand)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      {k}
                    </span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--amber)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* ── Create Workspace Modal ── */}
      {showModal && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          style={{
            position: "fixed", inset: 0,
            background: "rgba(14,13,10,0.85)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 200, padding: 24,
            backdropFilter: "blur(2px)",
          }}
        >
          <div
            className="animate-scale-in"
            style={{
              width: "100%", maxWidth: 440,
              background: "var(--coal)",
              border: "var(--bd)",
              borderTop: "3px solid var(--amber)",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "20px 24px",
                borderBottom: "var(--bd)",
              }}
            >
              <div>
                <div className="label" style={{ color: "var(--amber)", marginBottom: 4 }}>◆ New Record</div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.2rem, 5vw, 1.6rem)", fontWeight: 900, textTransform: "uppercase", lineHeight: 1, color: "var(--cream)" }}>
                  Create Workspace
                </h2>
              </div>
              <button onClick={() => setShowModal(false)} className="ed-btn ed-btn-ghost ed-btn-icon">
                <X size={15} />
              </button>
            </div>

            {/* Modal body */}
            <form onSubmit={createWorkspace} style={{ padding: 24, display: "flex", flexDirection: "column", gap: 28 }}>
              <div>
                <label className="label" style={{ display: "block", marginBottom: 10 }}>
                  Name <span style={{ color: "var(--ember)" }}>*</span>
                </label>
                <input
                  id="workspace-name-input"
                  className="ed-input"
                  placeholder="Research Project"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="label" style={{ display: "block", marginBottom: 10 }}>
                  Description <span style={{ color: "var(--sand)" }}>(optional)</span>
                </label>
                <textarea
                  id="workspace-desc-input"
                  className="ed-input"
                  placeholder="What is this workspace for?"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  rows={3}
                  style={{ resize: "none" }}
                />
              </div>

              <div style={{ display: "flex", gap: 12, paddingTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="ed-btn ed-btn-outline"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  id="workspace-create-submit"
                  type="submit"
                  disabled={creating}
                  className="ed-btn ed-btn-primary"
                  style={{ flex: 1 }}
                >
                  {creating ? <Loader2 size={13} className="animate-spin" /> : "Create →"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-root {
          display: flex;
          min-height: 100vh;
          background: var(--ink);
        }
        .dashboard-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        /* Stats grid: 4 columns on desktop, 2 on tablet, 2 on mobile */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          border-bottom: var(--bd);
        }
        .stat-cell {
          padding: 28px 24px;
        }
        .stat-cell:not(:last-child) {
          border-right: var(--bd);
        }

        /* Content grid: sidebar + right panel on desktop, stacked on mobile */
        .content-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
        }
        .workspace-panel {
          border-right: var(--bd);
          min-height: calc(100vh - 180px);
        }
        .right-panel {
          min-width: 0;
        }

        /* Workspace table header */
        .workspace-table-header {
          display: grid;
          grid-template-columns: 48px 1fr 120px 80px;
          padding: 8px 24px;
          border-bottom: var(--bd);
          background: var(--coal);
        }
        .workspace-row {
          display: grid;
          grid-template-columns: 48px 1fr 120px 80px;
          align-items: center;
          padding: 0 24px;
          min-height: 68px;
          border-bottom: var(--bd);
          transition: background 0.15s;
          cursor: pointer;
        }

        /* ── Tablet (≤900px): hide right panel inline, stack below ── */
        @media (max-width: 900px) {
          .content-grid {
            grid-template-columns: 1fr;
          }
          .workspace-panel {
            border-right: none;
            border-bottom: var(--bd);
            min-height: unset;
          }
          .right-panel {
            border-top: none;
          }
        }

        /* ── Mobile (≤600px) ── */
        @media (max-width: 600px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .stat-cell {
            padding: 20px 16px;
          }
          .stat-cell:nth-child(2) {
            border-right: none;
          }
          .stat-cell:nth-child(1),
          .stat-cell:nth-child(2) {
            border-bottom: var(--bd);
          }

          /* Workspace table: hide # column and date column on mobile */
          .workspace-table-header {
            grid-template-columns: 1fr 80px;
            padding: 8px 16px;
          }
          .workspace-table-header > *:nth-child(1),
          .workspace-table-header > *:nth-child(3) {
            display: none;
          }
          .workspace-row {
            grid-template-columns: 1fr 80px;
            padding: 0 16px;
          }
          .workspace-row > *:nth-child(1),
          .workspace-row > *:nth-child(3) {
            display: none;
          }
          .ws-date-col {
            display: none;
          }

          /* Push hamburger menu spacing in mobile navbar */
          .dashboard-body > header {
            padding-left: 52px;
          }
        }

        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease both;
        }
      `}</style>
    </div>
  );
}