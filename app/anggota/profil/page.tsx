"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@/types/anggota";
import type { Loan } from "@/types/peminjaman";

export default function ProfilPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", address: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) { window.location.href = "/login"; return; }

    async function fetchAll() {
      const { data: userData } = await supabase.from("users").select("*").eq("id", userId).single();
      setUser(userData);
      setForm({
        full_name: userData?.full_name ?? "",
        email: userData?.email ?? "",
        phone: userData?.phone ?? "",
        address: userData?.address ?? "",
      });

      const { data: allLoans } = await supabase
        .from("loans")
        .select(`*, loan_details(books(title)), returns(fine, return_date)`)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setLoans(allLoans ?? []);

      const active = (allLoans ?? []).filter(l => l.status === "borrowed" || l.status === "extended");
      setActiveLoans(active);
      setLoading(false);
    }
    fetchAll();
  }, []);

  const handleSave = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;
    setSaving(true);
    const { error } = await supabase.from("users").update({
      full_name: form.full_name,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
    }).eq("id", userId);
    setSaving(false);
    if (error) return alert("Gagal menyimpan: " + error.message);
    setUser(prev => prev ? { ...prev, ...form } : null);
    setEditMode(false);
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <p style={{ color: "#6c47e8", fontWeight: 600 }}>Memuat profil...</p>
    </div>
  );

  const totalFine = loans.reduce((acc, l) => acc + Number(l.returns?.fine ?? 0), 0);
  const returned = loans.filter(l => l.status === "returned").length;
  const recentLoans = loans.slice(0, 3);
  const joinedDate = user?.created_at ? new Date(user.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "-";

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 10, boxSizing: "border-box",
    border: "1px solid #e5e7eb", fontSize: 13.5, color: "#333", outline: "none",
    background: editMode ? "#fff" : "#f9fafb",
  };
  const labelStyle: React.CSSProperties = { fontSize: 12.5, color: "#aaa", marginBottom: 4, display: "block" };

  return (
    <>
      <Navbar title="Profil Saya" subtitle="Informasi akun dan data diri" userName={user?.full_name ?? ""} userRole="Anggota" />
      <main style={{ padding: 28, display: "flex", gap: 20 }}>

        {/* Left Column */}
        <div style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Profile Card */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "28px 20px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{
              width: 80, height: 80, borderRadius: "50%", background: "#6c47e8",
              color: "#fff", fontSize: 28, fontWeight: 700,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 12px",
              border: "3px solid #d4ef3b",
            }}>
              {user?.full_name?.charAt(0).toUpperCase()}
            </div>
            <h3 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: "#1a1a2e" }}>{user?.full_name}</h3>
            <p style={{ margin: "0 0 10px", fontSize: 13, color: "#888" }}>Anggota Aktif</p>
            <span style={{ background: "#f0fdf4", color: "#16a34a", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 99 }}>
              ✓ Terverifikasi
            </span>
            <div style={{ margin: "16px 0", borderTop: "1px solid #f3f4f6", borderBottom: "1px solid #f3f4f6", padding: "12px 0" }}>
              <p style={{ margin: "0 0 2px", fontSize: 12, color: "#aaa" }}>ID Anggota</p>
              <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: "#6c47e8" }}>
                {user?.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              style={{
                width: "100%", padding: "10px", borderRadius: 10, border: "none",
                background: "#d4ef3b", color: "#1a1a2e", fontSize: 13, fontWeight: 700, cursor: "pointer", marginBottom: 8,
              }}
            >
              ✏️ {editMode ? "Batal Edit" : "Edit Profil"}
            </button>
            <button style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", color: "#555", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              🔒 Ubah Password
            </button>
          </div>

          {/* Statistik */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <p style={{ margin: "0 0 14px", fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>Statistik Saya</p>
            {[
              { label: "Total Dipinjam", value: loans.length, color: "#6c47e8" },
              { label: "Dikembalikan", value: returned, color: "#16a34a" },
              { label: "Sedang Dipinjam", value: activeLoans.length, color: "#f97316" },
              { label: "Total Denda", value: `Rp ${(totalFine / 1000).toFixed(0)}K`, color: "#ef4444" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f9fafb" }}>
                <span style={{ fontSize: 13, color: "#555" }}>📊 {label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Data Diri */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>Data Diri</h3>
              {editMode && (
                <button onClick={handleSave} disabled={saving} style={{
                  background: "#6c47e8", color: "#fff", border: "none", borderRadius: 8,
                  padding: "7px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer",
                  opacity: saving ? 0.7 : 1,
                }}>
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              )}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Nama Lengkap</label>
                <input style={inputStyle} value={form.full_name} disabled={!editMode}
                  onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Email</label>
                <input style={inputStyle} value={form.email} disabled={!editMode} type="email"
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>No. Telepon</label>
                <input style={inputStyle} value={form.phone} disabled={!editMode}
                  onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              </div>
              <div>
                <label style={labelStyle}>Username</label>
                <input style={{ ...inputStyle, background: "#f9fafb", color: "#aaa" }} value={user?.username ?? ""} disabled />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={labelStyle}>Alamat</label>
                <textarea
                  style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
                  value={form.address} disabled={!editMode}
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Informasi Keanggotaan */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>Informasi Keanggotaan</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {[
                { icon: "📅", label: "Terdaftar Sejak", value: joinedDate },
                { icon: "✅", label: "Status", value: "Aktif" },
                { icon: "🎫", label: "Jenis Anggota", value: "Reguler" },
              ].map(({ icon, label, value }) => (
                <div key={label} style={{ background: "#f9fafb", borderRadius: 12, padding: "14px 16px" }}>
                  <span style={{ fontSize: 20 }}>{icon}</span>
                  <p style={{ margin: "8px 0 2px", fontSize: 20, fontWeight: 700, color: "#1a1a2e" }}>{value}</p>
                  <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Riwayat Terbaru */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>Riwayat Peminjaman Terbaru</h3>
            {recentLoans.length === 0 ? (
              <p style={{ color: "#aaa", fontSize: 13 }}>Belum ada riwayat peminjaman.</p>
            ) : recentLoans.map((loan, i) => {
              const book = loan.loan_details?.[0]?.books;
              const statusLabel = loan.status === "returned" ? "Dikembalikan" : loan.status === "extended" ? "Diperpanjang" : "Aktif";
              const colors: Record<string, string> = { Dikembalikan: "#16a34a", Aktif: "#6c47e8", Diperpanjang: "#f97316" };
              const bgs: Record<string, string> = { Dikembalikan: "#f0fdf4", Aktif: "#f0eeff", Diperpanjang: "#fef9c3" };
              return (
                <div key={loan.id} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 0", borderBottom: i < recentLoans.length - 1 ? "1px solid #f3f4f6" : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 36, height: 44, borderRadius: 6, background: ["#6c47e8", "#f97316", "#ec4899"][i], display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 14 }}>📖</span>
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 13.5, color: "#1a1a2e" }}>{book?.title ?? "-"}</p>
                      <p style={{ margin: "2px 0 0", fontSize: 12, color: "#aaa" }}>
                        {loan.loan_date} – {loan.returns?.return_date ?? loan.due_date}
                      </p>
                    </div>
                  </div>
                  <span style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, background: bgs[statusLabel], color: colors[statusLabel] }}>
                    {statusLabel}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </main>
    </>
  );
}