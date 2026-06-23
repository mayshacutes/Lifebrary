import Navbar from "@/components/layout/Navbar";
import { getAllBooks, getBookStats } from "@/lib/buku";
import Link from "next/link";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";

const bookColors = ["#6c47e8", "#d4ef3b", "#ec4899", "#4ade80", "#f97316", "#60a5fa", "#8b5cf6", "#f59e0b"];

export default async function ManajemenBukuPage() {
  const [books, stats] = await Promise.all([getAllBooks(), getBookStats()]);

  return (
    <>
      <Navbar title="Manajemen Buku" subtitle="Kelola seluruh koleksi perpustakaan" userName="Administrator" userRole="Pustakawan" />
      <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Search + Add */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 10, padding: "10px 16px", border: "1px solid #e5e7eb" }}>
            <Search size={16} color="#aaa" />
            <input placeholder="Cari judul, penulis, atau ISBN..." style={{ border: "none", outline: "none", fontSize: 13.5, flex: 1, color: "#333", background: "transparent" }} />
          </div>
          <Link href="/admin/buku/tambah" style={{
            display: "flex", alignItems: "center", gap: 8, background: "#d4ef3b",
            borderRadius: 10, padding: "10px 18px", fontSize: 13.5, fontWeight: 700,
            color: "#1a1a2e", textDecoration: "none",
          }}>
            <Plus size={16} /> Tambah Buku
          </Link>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {[
            { label: "Total Buku", value: books.length.toLocaleString(), color: "#6c47e8" },
            { label: "Total Stok", value: stats.available.toLocaleString(), color: "#16a34a" },
            { label: "Sedang Dipinjam", value: stats.borrowed.toLocaleString(), color: "#f97316" },
            { label: "Stok Menipis (≤2)", value: books.filter(b => b.stock <= 2).length.toString(), color: "#ef4444" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color }}>{value}</p>
              <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#888" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid #f3f4f6" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>Daftar Buku</p>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
                {["No", "Sampul", "Judul & ISBN", "Penulis", "Penerbit", "Tahun", "Stok", "Aksi"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 12, color: "#aaa", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {books.map((book, i) => (
                <tr key={book.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                  <td style={{ padding: "14px 16px", fontSize: 13.5, color: "#aaa" }}>{i + 1}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ width: 36, height: 46, borderRadius: 6, background: bookColors[i % bookColors.length], display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 14 }}>📖</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13.5, color: "#1a1a2e" }}>{book.title}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#aaa" }}>{book.isbn ?? "-"}</p>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13.5, color: "#555" }}>{book.author}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#888" }}>{book.publisher ?? "-"}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#888" }}>{book.publication_year ?? "-"}</td>
                  <td style={{ padding: "14px 16px", fontSize: 14, fontWeight: 700, color: book.stock <= 2 ? "#ef4444" : "#16a34a" }}>{book.stock}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Link href={`/admin/buku/edit/${book.id}`} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, background: "#f0eeff", color: "#6c47e8", fontSize: 12.5, fontWeight: 600, textDecoration: "none" }}>
                        <Pencil size={13} /> Edit
                      </Link>
                      <form action={async () => { "use server"; const { deleteBook } = await import("@/lib/buku"); await deleteBook(book.id); }} >
                        <button type="submit" style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, background: "#fef2f2", color: "#ef4444", fontSize: 12.5, fontWeight: 600, border: "none", cursor: "pointer" }}>
                          <Trash2 size={13} /> Hapus
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: "14px 24px", borderTop: "1px solid #f3f4f6" }}>
            <span style={{ fontSize: 13, color: "#aaa" }}>Menampilkan {books.length} buku</span>
          </div>
        </div>
      </main>
    </>
  );
}