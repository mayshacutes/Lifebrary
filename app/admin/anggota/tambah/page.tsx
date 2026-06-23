"use client";

import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const inputStyle: React.CSSProperties = { width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 13.5, color: "#333", outline: "none", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6, display: "block" };

export default function TambahAnggotaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ full_name: "", username: "", email: "", phone: "", address: "", password: "" });

  const handleSubmit = async () => {
    if (!form.full_name || !form.username || !form.password) return alert("Nama, username, dan password wajib diisi.");
    setLoading(true);
    const { error } = await supabase.from("users").insert({
      full_name: form.full_name,
      username: form.username,
      email: form.email || null,
      phone: form.phone || null,
      address: form.address || null,
      password: form.password,
      role: "anggota",
    });
    setLoading(false);
    if (error) return alert("Gagal menyimpan: " + error.message);
    router.push("/admin/anggota");
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <>
      <Navbar title="Tambah Anggota" subtitle="Daftarkan anggota baru" userName="Administrator" userRole="Pustakawan" />
      <main style={{ padding: 28 }}>
        <Link href="/admin/anggota" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#6c47e8", textDecoration: "none", fontSize: 13.5, fontWeight: 600, marginBottom: 20 }}>
          <ArrowLeft size={16} /> Kembali ke Manajemen Anggota
        </Link>
        <div style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", maxWidth: 760 }}>
          <h2 style={{ margin: "0 0 24px", fontSize: 17, fontWeight: 700, color: "#1a1a2e" }}>Data Anggota Baru</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <label style={labelStyle}>Nama Lengkap <span style={{ color: "#ef4444" }}>*</span></label>
              <input style={inputStyle} placeholder="Masukkan nama lengkap" value={form.full_name} onChange={set("full_name")} />
            </div>
            <div>
              <label style={labelStyle}>Username <span style={{ color: "#ef4444" }}>*</span></label>
              <input style={inputStyle} placeholder="username unik" value={form.username} onChange={set("username")} />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} placeholder="email@gmail.com" type="email" value={form.email} onChange={set("email")} />
            </div>
            <div>
              <label style={labelStyle}>No. Telepon</label>
              <input style={inputStyle} placeholder="+62 812-xxxx-xxxx" value={form.phone} onChange={set("phone")} />
            </div>
            <div>
              <label style={labelStyle}>Password <span style={{ color: "#ef4444" }}>*</span></label>
              <input style={inputStyle} type="password" placeholder="Buat password" value={form.password} onChange={set("password")} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Alamat</label>
              <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} placeholder="Masukkan alamat lengkap..." value={form.address} onChange={set("address")} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 28 }}>
            <Link href="/admin/anggota" style={{ padding: "10px 22px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 13.5, fontWeight: 600, color: "#555", textDecoration: "none" }}>Batal</Link>
            <button onClick={handleSubmit} disabled={loading} style={{ padding: "10px 24px", borderRadius: 10, background: "#6c47e8", color: "#fff", border: "none", fontSize: 13.5, fontWeight: 700, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Menyimpan..." : "Daftarkan Anggota"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}