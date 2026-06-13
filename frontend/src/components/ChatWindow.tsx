"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Send, Sparkles, Copy, Check } from "lucide-react";
import toast from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { api } from "../services/api";

interface Message {
  id: number;
  role: string;
  content: string;
  sources?: string[];
}

interface Props {
  workspaceId: number;
  chatId?: number;
}

export default function ChatWindow({ workspaceId, chatId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const loadMessages = useCallback(async () => {
    if (!chatId) return;
    try {
      const res = await api.get(`/chats/${chatId}/messages`);
      setMessages(res.data);
    } catch { /* silent */ }
  }, [chatId]);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      if (!chatId) {
        if (!cancelled) setMessages([]);
        return;
      }
      try {
        const res = await api.get(`/chats/${chatId}/messages`);
        if (!cancelled) setMessages(res.data);
      } catch { /* silent */ }
    };
    fetch();
    return () => { cancelled = true; };
  }, [chatId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const copyText = async (text: string, id: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const sendMessage = async () => {
    if (!question.trim() || !chatId || loading) return;
    const currentQuestion = question.trim();
    const assistantId = -(Date.now() + 1);
    const userMsg: Message = { id: -Date.now(), role: "user", content: currentQuestion };
    const assistantMsg: Message = { id: assistantId, role: "assistant", content: "", sources: [] };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://openwork-ai-production.up.railway.app";
      const response = await fetch(
        `${apiBase}/workspaces/${workspaceId}/chats/${chatId}/rag-stream`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ question: currentQuestion }),
        }
      );

      if (!response.ok || !response.body) {
        const fallback = await api.post(
          `/workspaces/${workspaceId}/chats/${chatId}/rag`,
          { question: currentQuestion }
        );
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: fallback.data.answer, sources: fallback.data.sources || [] }
              : m
          )
        );
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.token) {
                acc += data.token;
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, content: acc } : m))
                );
              }
              if (data.sources) {
                setMessages((prev) =>
                  prev.map((m) => (m.id === assistantId ? { ...m, sources: data.sources } : m))
                );
              }
            } catch { /* ignore */ }
          }
        }
      }

      await loadMessages();
    } catch {
      toast.error("Failed to get response.");
      setMessages((prev) => prev.filter((m) => m.id !== assistantId && m.id !== userMsg.id));
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  /* ── No chat selected ── */
  if (!chatId) {
    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 48,
          gap: 20,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "clamp(3.5rem, 8vw, 7rem)",
            textTransform: "uppercase",
            letterSpacing: "-0.04em",
            lineHeight: 0.9,
            color: "var(--char)",
            textAlign: "center",
          }}
        >
          Select<br />a Chat
        </div>
        <p style={{ color: "var(--sand)", fontSize: "var(--text-sm)", textAlign: "center", maxWidth: 260, fontStyle: "italic", lineHeight: 1.7 }}>
          Pick a conversation from the left panel, or create a new one to get started.
        </p>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.18em", color: "var(--ash)" }}>
          ◆ OpenWork AI
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Messages */}
      <div className="chat-messages-container" style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 0 }}>

        {messages.length === 0 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, padding: 48 }}>
            <Sparkles size={22} style={{ color: "var(--amber)" }} />
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "2.5rem", textTransform: "uppercase", letterSpacing: "-0.03em", lineHeight: 0.95, color: "var(--ash)", textAlign: "center" }}>
              Ask Anything
            </div>
            <p style={{ color: "var(--sand)", fontSize: "var(--text-sm)", fontStyle: "italic", textAlign: "center", maxWidth: 300 }}>
              Type a question below. The AI will search your uploaded documents for an answer.
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={msg.id} className="animate-fade-up" style={{ animationDelay: `${i * 0.02}s` }}>

            {msg.role === "user" ? (
              /* User bubble — right-aligned, amber right border */
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
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--cream)", lineHeight: 1.65 }}>
                    {msg.content}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--mist)", marginTop: 6, textTransform: "uppercase", letterSpacing: "0.1em", textAlign: "right" }}>
                    You
                  </div>
                </div>
              </div>
            ) : (
              /* AI bubble — left-aligned, amber square icon */
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

                  {msg.content ? (
                    <div className="prose-chat">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  ) : loading ? (
                    <div style={{ display: "flex", gap: 5, alignItems: "center", padding: "4px 0" }}>
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                      <div className="typing-dot" />
                    </div>
                  ) : null}

                  {/* Sources */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div style={{ marginTop: 12 }}>
                      <div className="label" style={{ marginBottom: 6 }}>Sources</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {msg.sources.map((s, si) => (
                          <span key={si} className="ed-badge">
                            {s.length > 45 ? s.slice(0, 45) + "…" : s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Copy button */}
                  {msg.content && (
                    <button
                      onClick={() => copyText(msg.content, msg.id)}
                      className="ed-btn ed-btn-ghost"
                      style={{ marginTop: 8, padding: "3px 8px", fontSize: "0.6rem", color: "var(--sand)", gap: 4 }}
                    >
                      {copiedId === msg.id ? <><Check size={10} /> Copied</> : <><Copy size={10} /> Copy</>}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div style={{ borderTop: "2px solid var(--amber)", padding: "14px 20px", background: "var(--coal)" }}>
        <div
          style={{
            display: "flex",
            gap: 10,
            alignItems: "flex-end",
            background: "var(--soot)",
            border: "var(--bd)",
            padding: "10px 14px",
            transition: "border-color 0.15s",
          }}
          onFocusCapture={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--amber)"; }}
          onBlurCapture={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
        >
          <textarea
            ref={inputRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about your documents… (Enter to send, Shift+Enter for new line)"
            rows={1}
            disabled={loading}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text)",
              fontFamily: "var(--font-body)",
              fontSize: "var(--text-sm)",
              resize: "none",
              lineHeight: 1.6,
              maxHeight: 160,
              overflowY: "auto",
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !question.trim()}
            className="ed-btn ed-btn-primary ed-btn-icon-lg"
            style={{ flexShrink: 0 }}
            title="Send (Enter)"
          >
            <Send size={14} />
          </button>
        </div>
        <div style={{ marginTop: 5, fontFamily: "var(--font-mono)", fontSize: "0.55rem", color: "var(--ash)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
          ↵ Enter — Send · ⇧↵ — New line · Powered by Ollama
        </div>
      </div>
    </div>
  );
}
