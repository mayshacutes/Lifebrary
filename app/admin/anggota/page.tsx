import Navbar from "@/components/layout/Navbar";
import { getAllAnggota, getAnggotaStats } from "@/lib/anggota";
import Link from "next/link";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";

const avatarColors = ["#6c47e8", "#ec4899", "#4ade80", "#f97316", "#ef4444", "#8b5cf6", "#f59e0b", "#60a5fa"];

export default async function ManajemenAnggotaPage() {
  const [members, stats] = await Promise.all([getAllAnggota(), getAnggotaStats()]);

  return (
    <>
      <Navbar title="Manajemen Anggota" subtitle="Kelola data anggota perpustakaan" userName="Administrator" userRole="Pustakawan" />
      <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Search + Add */}
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 10, padding: "10px 16px", border: "1px solid #e5e7eb" }}>
            <Search size={16} color="#aaa" />
            <input placeholder="Cari nama, username, atau email..." style={{ border: "none", outline: "none", fontSize: 13.5, flex: 1, color: "#333", background: "transparent" }} />
          </div>
          <Link href="/admin/anggota/tambah" style={{ display: "flex", alignItems: "center", gap: 8, background: "#d4ef3b", borderRadius: 10, padding: "10px 18px", fontSize: 13.5, fontWeight: 700, color: "#1a1a2e", textDecoration: "none" }}>
            <Plus size={16} /> Tambah Anggota
          </Link>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
          {[
            { label: "Total Anggota", value: stats.total.toLocaleString(), color: "#6c47e8" },
            { label: "Sedang Meminjam", value: members.filter(m => true).length.toString(), color: "#f97316" },
            { label: "Ada Keterlambatan", value: stats.withLate.toLocaleString(), color: "#ef4444" },
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
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>Daftar Anggota</p>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
                {["No", "Anggota", "Username", "Email", "No. HP", "Tgl Daftar", "Aksi"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 12, color: "#aaa", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((m, i) => (
                <tr key={m.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                  <td style={{ padding: "14px 16px", fontSize: 13.5, color: "#aaa" }}>{i + 1}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: avatarColors[i % avatarColors.length], color: "#fff", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {m.full_name.charAt(0).toUpperCase()}
                      </div>
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 13.5, color: "#1a1a2e" }}>{m.full_name}</p>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ fontSize: 12.5, fontWeight: 600, color: "#6c47e8", background: "#f0eeff", padding: "3px 8px", borderRadius: 6 }}>{m.username}</span>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#555" }}>{m.email ?? "-"}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#555" }}>{m.phone ?? "-"}</td>
                  <td style={{ padding: "14px 16px", fontSize: 13, color: "#888" }}>{new Date(m.created_at).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <Link href={`/admin/anggota/edit/${m.id}`} style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, background: "#f0eeff", color: "#6c47e8", fontSize: 12.5, fontWeight: 600, textDecoration: "none" }}>
                        <Pencil size={13} /> Edit
                      </Link>
                      <form action={async () => { "use server"; const { deleteAnggota } = await import("@/lib/anggota"); await deleteAnggota(m.id); }}>
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
            <span style={{ fontSize: 13, color: "#aaa" }}>Menampilkan {members.length} anggota</span>
          </div>
        </div>
      </main>
    </>
  );
}