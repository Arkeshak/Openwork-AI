"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { api } from "../services/api";

interface Props {
  workspaceId: number;
  onUpload?: () => void;
}

export default function UploadButton({ workspaceId, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [lastFile, setLastFile] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const upload = async (file: File) => {
    if (!file) return;
    const allowed = ["application/pdf", "text/plain"];
    if (!allowed.includes(file.type) && !file.name.match(/\.(pdf|txt)$/i)) {
      toast.error("Only PDF and TXT files supported");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setProgress(0);
      setLastFile(null);

      await api.post(`/workspaces/${workspaceId}/documents`, formData, {
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });

      setProgress(100);
      setLastFile(file.name);
      toast.success(`"${file.name}" uploaded & indexed.`);
      onUpload?.();

      setTimeout(() => { setProgress(0); setUploading(false); }, 1500);
    } catch {
      toast.error("Upload failed. Check file and try again.");
      setUploading(false);
      setProgress(0);
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (files?.[0]) upload(files[0]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <div>
      <div
        onClick={() => !uploading && inputRef.current?.click()}
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        style={{
          border: dragActive ? "var(--bd-accent)" : "var(--bd)",
          borderStyle: "dashed",
          padding: "32px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          cursor: uploading ? "not-allowed" : "pointer",
          transition: "all 0.15s",
          background: dragActive ? "rgba(240,165,32,0.04)" : "transparent",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Progress bar */}
        {uploading && progress > 0 && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              height: 3,
              width: `${progress}%`,
              background: "var(--amber)",
              transition: "width 0.3s ease",
            }}
          />
        )}

        {uploading ? (
          progress === 100 ? (
            <>
              <div style={{ width: 32, height: 32, background: "var(--amber)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Check size={16} style={{ color: "var(--ink)" }} />
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--amber)" }}>
                Indexed
              </div>
              {lastFile && (
                <div style={{ fontSize: "var(--text-xs)", color: "var(--mist)", fontStyle: "italic", textAlign: "center" }}>
                  {lastFile}
                </div>
              )}
            </>
          ) : (
            <>
              <Loader2 size={22} style={{ color: "var(--amber)" }} className="animate-spin" />
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", textTransform: "uppercase", letterSpacing: "0.1em", color: "var(--amber)" }}>
                Uploading {progress}%
              </div>
            </>
          )
        ) : (
          <>
            <div
              style={{
                width: 40,
                height: 40,
                border: dragActive ? "var(--bd-accent)" : "var(--bd)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "border-color 0.15s",
              }}
            >
              <Upload size={16} style={{ color: dragActive ? "var(--amber)" : "var(--mist)" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: dragActive ? "var(--amber)" : "var(--cream)",
                  marginBottom: 4,
                }}
              >
                {dragActive ? "Drop to upload" : "Drop file or click to browse"}
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--mist)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                PDF · TXT — max 50MB
              </div>
            </div>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.txt"
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
        onClick={(e) => { (e.target as HTMLInputElement).value = ""; }}
      />
    </div>
  );
}
