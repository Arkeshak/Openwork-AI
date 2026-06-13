"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Check, X, Search, MessageSquare, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../services/api";
import { Chat } from "../types/chat";

interface Props {
  workspaceId: number;
  selectedChatId?: number;
  onSelectChat: (chatId: number) => void;
  refresh?: number;
  onRefresh?: () => void;
}

export default function ChatSidebar({
  workspaceId,
  selectedChatId,
  onSelectChat,
  refresh = 0,
  onRefresh,
}: Props) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [title, setTitle] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const loadChats = useCallback(async () => {
    if (!workspaceId) return;
    try {
      const res = await api.get(`/workspaces/${workspaceId}/chats`);
      setChats(res.data);
    } catch {
      toast.error("Failed to load chats");
    }
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId) return;
    let cancelled = false;
    const fetch = async () => {
      try {
        const res = await api.get(`/workspaces/${workspaceId}/chats`);
        if (!cancelled) setChats(res.data);
      } catch {
        if (!cancelled) toast.error("Failed to load chats");
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [workspaceId, refresh]); // eslint-disable-line react-hooks/exhaustive-deps

  const createChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    try {
      setCreating(true);
      const res = await api.post(`/workspaces/${workspaceId}/chats`, { title });
      setTitle("");
      await loadChats();
      onSelectChat(res.data.id);
      onRefresh?.();
    } catch {
      toast.error("Failed to create chat");
    } finally {
      setCreating(false);
    }
  };

  const saveEdit = async (id: number) => {
    if (!editedTitle.trim()) { setEditingId(null); return; }
    try {
      await api.patch(`/chats/${id}`, { title: editedTitle.trim() });
      setEditingId(null);
      await loadChats();
    } catch {
      toast.error("Failed to rename");
    }
  };

  const deleteChat = async (id: number) => {
    try {
      await api.delete(`/chats/${id}`);
      setPendingDeleteId(null);
      if (selectedChatId === id) onSelectChat(0);
      await loadChats();
      onRefresh?.();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const filtered = chats.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="chat-sidebar">
      {/* Header */}
      <div style={{ padding: "14px 14px 10px", borderBottom: "var(--bd)" }}>
        <div className="label" style={{ marginBottom: 10 }}>Conversations</div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "var(--soot)",
            border: "var(--bd)",
            padding: "5px 8px",
          }}
        >
          <Search size={11} style={{ color: "var(--mist)", flexShrink: 0 }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter…"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: "var(--text-xs)",
              color: "var(--text)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.03em",
            }}
          />
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", padding: "6px 0" }}>
        {filtered.length === 0 && (
          <div style={{ padding: "28px 16px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <MessageSquare size={18} style={{ color: "var(--ash)" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--sand)", textAlign: "center" }}>
              {search ? "No matches" : "No chats yet"}
            </span>
          </div>
        )}

        {filtered.map((chat, i) => {
          const isSelected = chat.id === selectedChatId;
          const isEditing = editingId === chat.id;
          const isPendingDelete = pendingDeleteId === chat.id;

          return (
            <div key={chat.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.03}s` }}>
              {isEditing ? (
                <div style={{ padding: "6px 10px", display: "flex", gap: 4, background: "var(--soot)" }}>
                  <input
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") saveEdit(chat.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    autoFocus
                    style={{
                      flex: 1,
                      background: "var(--char)",
                      border: "var(--bd-accent)",
                      color: "var(--text)",
                      fontSize: "var(--text-xs)",
                      padding: "4px 8px",
                      outline: "none",
                      fontFamily: "var(--font-body)",
                    }}
                  />
                  <button onClick={() => saveEdit(chat.id)} className="ed-btn ed-btn-ghost" style={{ color: "var(--amber)", width: 24, height: 24, padding: 4 }}>
                    <Check size={11} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="ed-btn ed-btn-ghost" style={{ width: 24, height: 24, padding: 4 }}>
                    <X size={11} />
                  </button>
                </div>
              ) : isPendingDelete ? (
                <div style={{ padding: "8px 10px", background: "rgba(200,64,32,0.08)", borderLeft: "2px solid var(--ember)" }}>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--smoke)", marginBottom: 6, lineHeight: 1.4 }}>
                    Delete &ldquo;{chat.title.length > 22 ? chat.title.slice(0, 22) + "…" : chat.title}&rdquo;?
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => deleteChat(chat.id)} className="ed-btn ed-btn-danger" style={{ fontSize: "0.58rem", padding: "3px 8px" }}>Delete</button>
                    <button onClick={() => setPendingDeleteId(null)} className="ed-btn ed-btn-ghost" style={{ fontSize: "0.58rem", padding: "3px 8px" }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => onSelectChat(chat.id)}
                  className="chat-row"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 12px",
                    cursor: "pointer",
                    borderLeft: isSelected ? "2px solid var(--amber)" : "2px solid transparent",
                    background: isSelected ? "rgba(240,165,32,0.06)" : "transparent",
                    transition: "all 0.1s",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.02)";
                    const actions = (e.currentTarget as HTMLElement).querySelector(".chat-actions") as HTMLElement;
                    if (actions) actions.style.opacity = "1";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) (e.currentTarget as HTMLElement).style.background = "transparent";
                    const actions = (e.currentTarget as HTMLElement).querySelector(".chat-actions") as HTMLElement;
                    if (actions) actions.style.opacity = "0";
                  }}
                >
                  <div style={{ width: 4, height: 4, background: isSelected ? "var(--amber)" : "var(--ash)", flexShrink: 0, transition: "background 0.1s" }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: "var(--text-xs)",
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? "var(--cream)" : "var(--smoke)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}>
                      {chat.title}
                    </div>
                  </div>
                  <div className="chat-actions flex items-center gap-1" style={{ flexShrink: 0, opacity: 0, transition: "opacity 0.1s" }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditingId(chat.id); setEditedTitle(chat.title); }}
                      className="ed-btn ed-btn-ghost"
                      style={{ width: 20, height: 20, padding: 2, color: "var(--mist)" }}
                    >
                      <Pencil size={10} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setPendingDeleteId(chat.id); }}
                      className="ed-btn ed-btn-ghost"
                      style={{ width: 20, height: 20, padding: 2, color: "var(--ember)" }}
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* New chat form */}
      <div style={{ borderTop: "2px solid var(--amber)", padding: 12 }}>
        <div className="label" style={{ marginBottom: 8 }}>New Chat</div>
        <form onSubmit={createChat} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Chat title…"
            style={{
              background: "var(--soot)",
              border: "var(--bd)",
              color: "var(--text)",
              fontSize: "var(--text-xs)",
              padding: "7px 10px",
              outline: "none",
              fontFamily: "var(--font-body)",
              width: "100%",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--amber)"; }}
            onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "var(--border)"; }}
          />
          <button
            type="submit"
            disabled={creating || !title.trim()}
            className="ed-btn ed-btn-primary w-full"
            style={{ fontSize: "0.62rem", height: 32 }}
          >
            {creating ? <Loader2 size={11} className="animate-spin" /> : <><Plus size={11} /> Create</>}
          </button>
        </form>
      </div>
    </div>
  );
}
