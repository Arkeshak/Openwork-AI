"use client";

import { useCallback, useEffect, useState } from "react";
import { FileText, Image, File, Trash2, Download, Loader2, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../services/api";

interface Document {
  id: number;
  filename: string;
  file_size?: number;
  created_at?: string;
  file_type?: string;
}

interface Props {
  workspaceId: number;
  refresh?: number;
}

function fileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext === "pdf") return <FileText size={13} style={{ color: "var(--amber)" }} />;
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext || "")) return <Image size={13} style={{ color: "var(--amber)" }} />;
  return <File size={13} style={{ color: "var(--mist)" }} />;
}

function formatSize(bytes?: number) {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentList({ workspaceId, refresh }: Props) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingId, setPendingId] = useState<number | null>(null);
  const [reindexingId, setReindexingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/workspaces/${workspaceId}/documents`);
      setDocs(res.data);
    } catch {
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/workspaces/${workspaceId}/documents`);
        if (!cancelled) setDocs(res.data);
      } catch {
        if (!cancelled) toast.error("Failed to load documents");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [workspaceId, refresh]);

  const deleteDoc = async (id: number) => {
    try {
      await api.delete(`/documents/${id}`);
      setPendingId(null);
      toast.success("Document removed.");
      await load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const reindex = async (id: number) => {
    try {
      setReindexingId(id);
      await api.post(`/documents/${id}/reingest`);
      toast.success("Document re-indexed successfully!");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(msg || "Re-index failed. Try re-uploading the file.");
    } finally {
      setReindexingId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton" style={{ height: 56 }} />
        ))}
      </div>
    );
  }

  if (docs.length === 0) {
    return (
      <div
        style={{
          padding: "48px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: 12,
        }}
      >
        <div
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 900,
            fontSize: "3.5rem",
            textTransform: "uppercase",
            color: "var(--char)",
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
        >
          Empty
        </div>
        <p style={{ color: "var(--mist)", fontSize: "var(--text-sm)", fontStyle: "italic" }}>
          No documents uploaded yet. Use the uploader above.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Column header */}
      <div
        className="doc-grid-row"
        style={{
          padding: "6px 12px",
          borderBottom: "var(--bd)",
          background: "var(--coal)",
          borderTop: "var(--bd)",
        }}
      >
        {["", "Filename", "Size", "Uploaded", ""].map((h, i) => (
          <div key={i} className="label" style={{ fontSize: "0.55rem" }}>{h}</div>
        ))}
      </div>

      {docs.map((doc, i) => (
        <div
          key={doc.id}
          className="doc-grid-row animate-fade-up"
          style={{
            alignItems: "center",
            padding: "0 12px",
            minHeight: 52,
            borderBottom: "var(--bd)",
            transition: "background 0.12s",
            animationDelay: `${i * 0.04}s`,
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "var(--coal)")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
        >
          {/* Icon */}
          <div style={{ display: "flex", alignItems: "center" }}>
            {fileIcon(doc.filename)}
          </div>

          {/* Name */}
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "var(--text-sm)",
                color: "var(--cream)",
                fontWeight: 500,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {doc.filename}
            </div>
            {doc.file_type && (
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.58rem",
                  color: "var(--sand)",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                {doc.file_type}
              </span>
            )}
          </div>

          {/* Size */}
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", color: "var(--mist)" }}>
            {formatSize(doc.file_size)}
          </div>

          {/* Date */}
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.62rem", color: "var(--sand)" }}>
            {doc.created_at
              ? new Date(doc.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : "—"}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {pendingId === doc.id ? (
              <>
                <button
                  onClick={() => deleteDoc(doc.id)}
                  className="ed-btn ed-btn-danger"
                  style={{ fontSize: "0.58rem", padding: "3px 6px" }}
                >
                  Confirm
                </button>
                <button
                  onClick={() => setPendingId(null)}
                  className="ed-btn ed-btn-ghost"
                  style={{ fontSize: "0.58rem", padding: "3px 6px" }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => reindex(doc.id)}
                  className="ed-btn ed-btn-ghost ed-btn-icon"
                  title="Re-index into AI"
                  disabled={reindexingId === doc.id}
                  style={{ color: "var(--amber)" }}
                >
                  {reindexingId === doc.id
                    ? <Loader2 size={12} className="animate-spin" />
                    : <RefreshCw size={12} />}
                </button>
                <a
                  href={`${process.env.NEXT_PUBLIC_API_URL || "/api"}/documents/${doc.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="ed-btn ed-btn-ghost ed-btn-icon" title="Download" style={{ color: "var(--mist)" }}>
                    <Download size={12} />
                  </button>
                </a>
                <button
                  onClick={() => setPendingId(doc.id)}
                  className="ed-btn ed-btn-ghost ed-btn-icon"
                  title="Delete"
                  style={{ color: "var(--ember)" }}
                >
                  <Trash2 size={12} />
                </button>
              </>
            )}
          </div>
        </div>
      ))}

      {/* Footer count */}
      <div
        style={{
          padding: "8px 12px",
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          color: "var(--ash)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          borderTop: "var(--bd)",
        }}
      >
        {docs.length} record{docs.length !== 1 ? "s" : ""}
      </div>
    </div>
  );
}
