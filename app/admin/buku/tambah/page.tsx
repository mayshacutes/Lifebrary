"use client";

import Navbar from "@/components/layout/Navbar";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", borderRadius: 10,
  border: "1px solid #e5e7eb", fontSize: 13.5, color: "#333",
  outline: "none", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  fontSize: 13, fontWeight: 600, color: "#444", marginBottom: 6, display: "block",
};

export default function TambahBukuPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", isbn: "", author: "", publisher: "",
    publication_year: "", stock: "", description: "",
  });

  const handleSubmit = async () => {
    if (!form.title || !form.author) return alert("Judul dan penulis wajib diisi.");
    setLoading(true);
    const { error } = await supabase.from("books").insert({
      title: form.title,
      isbn: form.isbn || null,
      author: form.author,
      publisher: form.publisher || null,
      publication_year: form.publication_year ? Number(form.publication_year) : null,
      stock: Number(form.stock) || 0,
      description: form.description || null,
    });
    setLoading(false);
    if (error) return alert("Gagal menyimpan: " + error.message);
    router.push("/admin/buku");
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <>
      <Navbar title="Tambah Buku" subtitle="Tambah koleksi buku baru" userName="Administrator" userRole="Pustakawan" />
      <main style={{ padding: 28 }}>
        <Link href="/admin/buku" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#6c47e8", textDecoration: "none", fontSize: 13.5, fontWeight: 600, marginBottom: 20 }}>
          <ArrowLeft size={16} /> Kembali ke Manajemen Buku
        </Link>

        <div style={{ background: "#fff", borderRadius: 16, padding: 28, boxShadow: "0 1px 4px rgba(0,0,0,0.07)", maxWidth: 760 }}>
          <h2 style={{ margin: "0 0 24px", fontSize: 17, fontWeight: 700, color: "#1a1a2e" }}>Informasi Buku</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <div>
              <label style={labelStyle}>Judul Buku <span style={{ color: "#ef4444" }}>*</span></label>
              <input style={inputStyle} placeholder="Masukkan judul buku" value={form.title} onChange={set("title")} />
            </div>
            <div>
              <label style={labelStyle}>ISBN</label>
              <input style={inputStyle} placeholder="978-xxx-xx-xxxx-x" value={form.isbn} onChange={set("isbn")} />
            </div>
            <div>
              <label style={labelStyle}>Penulis <span style={{ color: "#ef4444" }}>*</span></label>
              <input style={inputStyle} placeholder="Nama penulis" value={form.author} onChange={set("author")} />
            </div>
            <div>
              <label style={labelStyle}>Penerbit</label>
              <input style={inputStyle} placeholder="Nama penerbit" value={form.publisher} onChange={set("publisher")} />
            </div>
            <div>
              <label style={labelStyle}>Tahun Terbit</label>
              <input style={inputStyle} placeholder="2024" type="number" value={form.publication_year} onChange={set("publication_year")} />
            </div>
            <div>
              <label style={labelStyle}>Jumlah Stok</label>
              <input style={inputStyle} placeholder="0" type="number" min={0} value={form.stock} onChange={set("stock")} />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Deskripsi / Sinopsis</label>
              <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} placeholder="Masukkan sinopsis..." value={form.description} onChange={set("description")} />
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 28 }}>
            <Link href="/admin/buku" style={{ padding: "10px 22px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 13.5, fontWeight: 600, color: "#555", textDecoration: "none" }}>Batal</Link>
            <button onClick={handleSubmit} disabled={loading} style={{ padding: "10px 24px", borderRadius: 10, background: "#6c47e8", color: "#fff", border: "none", fontSize: 13.5, fontWeight: 700, cursor: "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Menyimpan..." : "Simpan Buku"}
            </button>
          </div>
        </div>
      </main>
    </>
  );
}