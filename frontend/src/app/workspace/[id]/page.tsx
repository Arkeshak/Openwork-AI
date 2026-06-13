"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit2, Trash2, Check, X, Loader2, FileText, MessageSquare, Zap } from "lucide-react";
import toast from "react-hot-toast";
import Sidebar from "../../../components/Sidebar";
import Navbar from "../../../components/layout/Navbar";
import { api } from "../../../services/api";
import ChatSidebar from "../../../components/ChatSidebar";
import ChatWindow from "../../../components/ChatWindow";
import UploadButton from "../../../components/UploadButton";
import DocumentList from "../../../components/DocumentList";
import Footer from "../../../components/layout/Footer";

interface Workspace { id: number; name: string; description?: string; created_at?: string; }
interface Stats { documents: number; chats: number; messages: number; }

export default function WorkspacePage() {
  const { id } = useParams();
  const workspaceId = Number(id);
  const router = useRouter();

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [saving, setSaving] = useState(false);
  const [selectedChatId, setSelectedChatId] = useState<number | undefined>();
  const [chatRefresh, setChatRefresh] = useState(0);
  const [activeTab, setActiveTab] = useState<"chat" | "docs">("chat");
  const [docRefresh, setDocRefresh] = useState(0);

  const loadWorkspace = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const [wsRes, statsRes] = await Promise.all([
        api.get(`/workspaces/${workspaceId}`),
        api.get(`/workspaces/${workspaceId}/stats`).catch(() => ({ data: { documents: 0, chats: 0, messages: 0 } })),
      ]);
      setWorkspace(wsRes.data);
      setStats(statsRes.data);
    } catch {
      toast.error("Failed to load workspace");
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId) return;
    let cancelled = false;
    const fetch = async () => {
      try {
        const [wsRes, statsRes] = await Promise.all([
          api.get(`/workspaces/${workspaceId}`),
          api.get(`/workspaces/${workspaceId}/stats`).catch(() => ({ data: { documents: 0, chats: 0, messages: 0 } })),
        ]);
        if (!cancelled) { setWorkspace(wsRes.data); setStats(statsRes.data); }
      } catch {
        if (!cancelled) toast.error("Failed to load workspace");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [workspaceId]);

  const saveEdit = async () => {
    if (!editName.trim()) { toast.error("Name required"); return; }
    try {
      setSaving(true);
      await api.patch(`/workspaces/${workspaceId}`, { name: editName.trim(), description: editDesc.trim() || null });
      setEditing(false);
      await loadWorkspace();
      toast.success("Renamed.");
    } catch { toast.error("Failed to save"); }
    finally { setSaving(false); }
  };

  const deleteWorkspace = async () => {
    try {
      await api.delete(`/workspaces/${workspaceId}`);
      toast.success("Workspace deleted.");
      router.push("/dashboard");
    } catch { toast.error("Delete failed"); }
  };

  const wsStats = [
    { label: "Documents", value: stats?.documents ?? 0, icon: FileText },
    { label: "Chats",     value: stats?.chats     ?? 0, icon: MessageSquare },
    { label: "Messages",  value: stats?.messages  ?? 0, icon: Zap },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--ink)" }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Navbar title={workspace?.name} />

        {/* ── Workspace header ── */}
        <div
          style={{
            padding: "24px 32px 0",
            borderBottom: "var(--bd)",
            background: "var(--coal)",
          }}
        >
          {/* Back + breadcrumb */}
          <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
            <button
              onClick={() => router.push("/dashboard")}
              className="ed-btn ed-btn-ghost"
              style={{ padding: "4px 8px", gap: 4, color: "var(--mist)" }}
            >
              <ArrowLeft size={12} />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Dashboard
              </span>
            </button>
            <span style={{ color: "var(--ash)", fontFamily: "var(--font-mono)", fontSize: "0.65rem" }}>/</span>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--amber)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Workspace
            </span>
          </div>

          {/* Title row */}
          <div className="flex items-start justify-between" style={{ gap: 24 }}>
            {loading ? (
              <div className="skeleton" style={{ height: 56, width: 320 }} />
            ) : editing ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, maxWidth: 500 }}>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveEdit(); if (e.key === "Escape") setEditing(false); }}
                  autoFocus
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: "var(--bd-accent)",
                    outline: "none",
                    fontFamily: "var(--font-display)",
                    fontWeight: 900,
                    fontSize: "clamp(1.8rem, 4vw, 3rem)",
                    textTransform: "uppercase",
                    letterSpacing: "-0.02em",
                    color: "var(--cream)",
                    padding: "4px 0",
                    width: "100%",
                  }}
                />
                <input
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  placeholder="Description (optional)"
                  style={{
                    background: "transparent",
                    border: "none",
                    borderBottom: "var(--bd)",
                    outline: "none",
                    fontFamily: "var(--font-body)",
                    fontSize: "var(--text-sm)",
                    color: "var(--smoke)",
                    padding: "4px 0",
                    width: "100%",
                  }}
                />
                <div className="flex items-center gap-2" style={{ marginTop: 4 }}>
                  <button onClick={saveEdit} disabled={saving} className="ed-btn ed-btn-primary ed-btn-sm">
                    {saving ? <Loader2 size={10} className="animate-spin" /> : <><Check size={10} /> Save</>}
                  </button>
                  <button onClick={() => setEditing(false)} className="ed-btn ed-btn-outline ed-btn-sm">
                    <X size={10} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h1
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 900,
                    fontSize: "clamp(2rem, 4vw, 3.5rem)",
                    textTransform: "uppercase",
                    letterSpacing: "-0.03em",
                    lineHeight: 0.95,
                    color: "var(--cream)",
                    marginBottom: workspace?.description ? 8 : 0,
                  }}
                >
                  {workspace?.name || "Workspace"}
                </h1>
                {workspace?.description && (
                  <p style={{ color: "var(--mist)", fontSize: "var(--text-sm)", fontStyle: "italic" }}>
                    {workspace.description}
                  </p>
                )}
              </div>
            )}

            {!loading && !editing && (
              <div className="flex items-center gap-2" style={{ flexShrink: 0, paddingTop: 4 }}>
                <button
                  onClick={() => { setEditName(workspace?.name ?? ""); setEditDesc(workspace?.description ?? ""); setEditing(true); }}
                  className="ed-btn ed-btn-outline ed-btn-sm"
                >
                  <Edit2 size={10} /> Rename
                </button>
                <button onClick={deleteWorkspace} className="ed-btn ed-btn-danger ed-btn-sm">
                  <Trash2 size={10} /> Delete
                </button>
              </div>
            )}
          </div>

          {/* Stats strip */}
          <div style={{ display: "flex", gap: 0, marginTop: 20, flexWrap: "wrap" }}>
            {wsStats.map((s, i) => (
              <div
                key={s.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "10px 20px",
                  borderRight: i < 2 ? "var(--bd)" : "none",
                  borderTop: "var(--bd)",
                }}
              >
                <s.icon size={11} style={{ color: "var(--amber)" }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--mist)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {s.label}
                </span>
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 900,
                    fontSize: "1rem",
                    color: "var(--cream)",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {loading ? "—" : String(s.value).padStart(2, "0")}
                </span>
              </div>
            ))}

            {/* Tab switcher */}
            <div style={{ marginLeft: "auto", display: "flex", borderTop: "var(--bd)", borderLeft: "var(--bd)" }}>
              {(["chat", "docs"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: "10px 20px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.65rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: activeTab === tab ? "var(--amber)" : "var(--mist)",
                    background: activeTab === tab ? "rgba(240,165,32,0.06)" : "transparent",
                    border: "none",
                    borderRight: tab === "chat" ? "var(--bd)" : "none",
                    borderBottom: activeTab === tab ? "2px solid var(--amber)" : "2px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                >
                  {tab === "chat" ? <><MessageSquare style={{ display: "inline", marginRight: 4 }} size={10} /> Chat</> : <><FileText style={{ display: "inline", marginRight: 4 }} size={10} /> Docs</>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Main content ── */}
        <div className="workspace-content">

          {activeTab === "chat" ? (
            <>
              {/* Chat sidebar */}
              <ChatSidebar
                workspaceId={workspaceId}
                selectedChatId={selectedChatId}
                onSelectChat={(cid) => setSelectedChatId(cid || undefined)}
                refresh={chatRefresh}
                onRefresh={() => setChatRefresh((n) => n + 1)}
              />
              {/* Chat window */}
              <ChatWindow workspaceId={workspaceId} chatId={selectedChatId} />
            </>
          ) : (
            /* Documents tab */
            <div className="docs-tab-container" style={{ flex: 1, overflowY: "auto" }}>
              <div style={{ maxWidth: 800, display: "flex", flexDirection: "column", gap: 24 }}>
                {/* Upload area */}
                <div>
                  <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 900,
                        fontSize: "1.2rem",
                        textTransform: "uppercase",
                        letterSpacing: "-0.01em",
                        color: "var(--cream)",
                      }}
                    >
                      Upload Document
                    </h3>
                    <span className="ed-badge ed-badge-amber">PDF / TXT</span>
                  </div>
                  <UploadButton
                    workspaceId={workspaceId}
                    onUpload={() => setDocRefresh((n) => n + 1)}
                  />
                </div>

                <hr className="ed-rule" />

                {/* Document list */}
                <div>
                  <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
                    <h3
                      style={{
                        fontFamily: "var(--font-display)",
                        fontWeight: 900,
                        fontSize: "1.2rem",
                        textTransform: "uppercase",
                        letterSpacing: "-0.01em",
                        color: "var(--cream)",
                      }}
                    >
                      Documents
                    </h3>
                  </div>
                  <DocumentList workspaceId={workspaceId} refresh={docRefresh} />
                </div>
              </div>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
}
