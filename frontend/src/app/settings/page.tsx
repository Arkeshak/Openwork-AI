"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, User, Lock, Palette, AlertTriangle, Check, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import Sidebar from "../../components/Sidebar";
import Navbar from "../../components/layout/Navbar";
import { api } from "../../services/api";

interface Profile { id: number; username: string; email: string; }

type Section = "profile" | "security" | "appearance";

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<Section>("profile");

  // Profile
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  // Danger
  const [confirmDelete, setConfirmDelete] = useState("");
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get("/auth/me");
      setProfile(res.data);
      setUsername(res.data.username);
      setEmail(res.data.email);
    } catch { toast.error("Failed to load profile"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      try {
        const res = await api.get("/auth/me");
        if (!cancelled) { setProfile(res.data); setUsername(res.data.username); setEmail(res.data.email); }
      } catch { if (!cancelled) toast.error("Failed to load profile"); }
      finally { if (!cancelled) setLoading(false); }
    };
    fetch();
    return () => { cancelled = true; };
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) { toast.error("Username required"); return; }
    try {
      setSavingProfile(true);
      await api.patch("/auth/me", { username: username.trim(), email: email.trim() });
      await load();
      toast.success("Profile updated.");
    } catch { toast.error("Update failed"); }
    finally { setSavingProfile(false); }
  };

  const savePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPw || !newPw) { toast.error("Both fields required"); return; }
    if (newPw.length < 6) { toast.error("Min. 6 characters"); return; }
    try {
      setSavingPw(true);
      await api.patch("/auth/me/password", { old_password: oldPw, new_password: newPw });
      setOldPw(""); setNewPw("");
      toast.success("Password updated.");
    } catch { toast.error("Incorrect current password"); }
    finally { setSavingPw(false); }
  };

  const deleteAccount = async () => {
    if (confirmDelete !== profile?.username) { toast.error(`Type your username to confirm`); return; }
    try {
      setDeleting(true);
      await api.delete("/auth/me");
      localStorage.removeItem("token");
      toast.success("Account deleted.");
      router.push("/login");
    } catch { toast.error("Delete failed"); }
    finally { setDeleting(false); }
  };

  const sections: { key: Section; label: string; icon: React.ElementType }[] = [
    { key: "profile", label: "Profile", icon: User },
    { key: "security", label: "Security", icon: Lock },
    { key: "appearance", label: "Appearance", icon: Palette },
  ];

  const initials = profile?.username ? profile.username.slice(0, 2).toUpperCase() : "—";

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--ink)" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <Navbar title="Settings" />

        <div style={{ flex: 1, display: "flex" }}>
          {/* Settings nav */}
          <div
            style={{
              width: 220,
              flexShrink: 0,
              borderRight: "var(--bd)",
              background: "var(--coal)",
              padding: "24px 0",
            }}
          >
            {/* Avatar block */}
            <div style={{ padding: "0 24px 20px", borderBottom: "var(--bd)", marginBottom: 8 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: "var(--amber)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "var(--font-display)",
                  fontWeight: 900,
                  fontSize: "1.4rem",
                  color: "var(--ink)",
                  marginBottom: 10,
                  letterSpacing: "-0.02em",
                }}
              >
                {initials}
              </div>
              {loading ? (
                <div className="skeleton" style={{ height: 16, width: 100 }} />
              ) : (
                <>
                  <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--cream)", marginBottom: 2 }}>
                    {profile?.username}
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.6rem", color: "var(--mist)", letterSpacing: "0.03em" }}>
                    {profile?.email}
                  </div>
                </>
              )}
            </div>

            {sections.map((s) => {
              const Icon = s.icon;
              return (
                <button
                  key={s.key}
                  onClick={() => setSection(s.key)}
                  className={`nav-item ${section === s.key ? "active" : ""}`}
                >
                  <Icon size={13} />
                  {s.label}
                  {section === s.key && <ChevronRight size={11} style={{ marginLeft: "auto" }} />}
                </button>
              );
            })}

            {/* Danger */}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "var(--bd)" }}>
              <button
                onClick={() => setSection("security")}
                className="nav-item"
                style={{ color: "var(--ember)" }}
              >
                <AlertTriangle size={13} />
                Danger Zone
              </button>
            </div>
          </div>

          {/* Content area */}
          <div style={{ flex: 1, overflowY: "auto", padding: "40px 48px", maxWidth: 680 }}>

            {/* ── Profile section ── */}
            {section === "profile" && (
              <div className="animate-fade-up">
                <div style={{ marginBottom: 32 }}>
                  <div className="label" style={{ color: "var(--amber)", marginBottom: 8 }}>◆ Section 01</div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "2.5rem", textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 0.95, color: "var(--cream)" }}>
                    Profile
                  </h2>
                  <p style={{ color: "var(--mist)", fontSize: "var(--text-sm)", marginTop: 8, fontStyle: "italic" }}>
                    Update your display name and email address.
                  </p>
                </div>

                <hr className="ed-rule" style={{ marginBottom: 32 }} />

                <form onSubmit={saveProfile} style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                  <div>
                    <label className="label" style={{ display: "block", marginBottom: 10 }}>Username</label>
                    <input
                      id="settings-username"
                      className="ed-input"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <label className="label" style={{ display: "block", marginBottom: 10 }}>Email Address</label>
                    <input
                      id="settings-email"
                      type="email"
                      className="ed-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <div>
                    <button type="submit" disabled={savingProfile || loading} className="ed-btn ed-btn-primary" style={{ minWidth: 160 }}>
                      {savingProfile ? <Loader2 size={13} className="animate-spin" /> : <><Check size={12} /> Save Profile</>}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ── Security section ── */}
            {section === "security" && (
              <div className="animate-fade-up">
                <div style={{ marginBottom: 32 }}>
                  <div className="label" style={{ color: "var(--amber)", marginBottom: 8 }}>◆ Section 02</div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "2.5rem", textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 0.95, color: "var(--cream)" }}>
                    Security
                  </h2>
                  <p style={{ color: "var(--mist)", fontSize: "var(--text-sm)", marginTop: 8, fontStyle: "italic" }}>
                    Change your password and manage account access.
                  </p>
                </div>

                <hr className="ed-rule" style={{ marginBottom: 32 }} />

                <form onSubmit={savePassword} style={{ display: "flex", flexDirection: "column", gap: 28, marginBottom: 56 }}>
                  <div>
                    <label className="label" style={{ display: "block", marginBottom: 10 }}>Current Password</label>
                    <input
                      id="settings-old-password"
                      type="password"
                      className="ed-input"
                      placeholder="••••••••"
                      value={oldPw}
                      onChange={(e) => setOldPw(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="label" style={{ display: "block", marginBottom: 10 }}>New Password</label>
                    <input
                      id="settings-new-password"
                      type="password"
                      className="ed-input"
                      placeholder="Min. 6 characters"
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                    />
                  </div>
                  <div>
                    <button type="submit" disabled={savingPw} className="ed-btn ed-btn-primary" style={{ minWidth: 180 }}>
                      {savingPw ? <Loader2 size={13} className="animate-spin" /> : <><Lock size={12} /> Update Password</>}
                    </button>
                  </div>
                </form>

                {/* Danger zone */}
                <div style={{ borderTop: "2px solid var(--ember)", paddingTop: 32 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                    <AlertTriangle size={14} style={{ color: "var(--ember)" }} />
                    <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.2rem", textTransform: "uppercase", color: "var(--ember)", fontWeight: 900 }}>
                      Danger Zone
                    </h3>
                  </div>
                  <p style={{ color: "var(--mist)", fontSize: "var(--text-sm)", marginBottom: 20, fontStyle: "italic" }}>
                    Permanently delete your account and all associated data. This cannot be undone.
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <label className="label" style={{ display: "block", marginBottom: 8, color: "var(--ember)" }}>
                        Type <strong style={{ color: "var(--cream)" }}>{profile?.username}</strong> to confirm
                      </label>
                      <input
                        id="settings-delete-confirm"
                        className="ed-input"
                        placeholder={profile?.username || "username"}
                        value={confirmDelete}
                        onChange={(e) => setConfirmDelete(e.target.value)}
                        style={{ borderBottomColor: "var(--ember)" }}
                      />
                    </div>
                    <button
                      onClick={deleteAccount}
                      disabled={deleting || confirmDelete !== profile?.username}
                      className="ed-btn ed-btn-danger"
                      style={{ alignSelf: "flex-start", minWidth: 180 }}
                    >
                      {deleting ? <Loader2 size={13} className="animate-spin" /> : "Delete My Account"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Appearance section ── */}
            {section === "appearance" && (
              <div className="animate-fade-up">
                <div style={{ marginBottom: 32 }}>
                  <div className="label" style={{ color: "var(--amber)", marginBottom: 8 }}>◆ Section 03</div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontWeight: 900, fontSize: "2.5rem", textTransform: "uppercase", letterSpacing: "-0.02em", lineHeight: 0.95, color: "var(--cream)" }}>
                    Appearance
                  </h2>
                </div>

                <hr className="ed-rule" style={{ marginBottom: 32 }} />

                <div>
                  <div className="label" style={{ marginBottom: 16 }}>Color Theme</div>
                  <div style={{ display: "flex", gap: 12 }}>
                    {/* Only dark theme available — design is intentionally dark */}
                    <div
                      style={{
                        border: "2px solid var(--amber)",
                        padding: 16,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        cursor: "pointer",
                        minWidth: 140,
                      }}
                    >
                      <div style={{ height: 48, background: "var(--ink)", border: "var(--bd)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <div style={{ width: 12, height: 12, background: "var(--amber)" }} />
                      </div>
                      <div style={{ fontSize: "var(--text-xs)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--amber)" }}>
                        Archival Dark ◆
                      </div>
                    </div>
                  </div>

                  <p style={{ marginTop: 16, color: "var(--mist)", fontSize: "var(--text-sm)", fontStyle: "italic" }}>
                    OpenWork AI uses the Archival Industrial theme — a warm dark palette designed for extended reading sessions.
                  </p>
                </div>

                <div style={{ marginTop: 40 }}>
                  <div className="label" style={{ marginBottom: 16 }}>Design System</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8 }}>
                    {[
                      { name: "Ink",   color: "var(--ink)" },
                      { name: "Coal",  color: "var(--coal)" },
                      { name: "Amber", color: "var(--amber)" },
                      { name: "Ember", color: "var(--ember)" },
                      { name: "Cream", color: "var(--cream)" },
                    ].map((c) => (
                      <div key={c.name}>
                        <div style={{ height: 32, background: c.color, border: "var(--bd)" }} />
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.55rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--mist)", marginTop: 4 }}>
                          {c.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
