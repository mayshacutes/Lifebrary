import Navbar from "@/components/layout/Navbar";
import { getAllLoans, getLoanStats } from "@/lib/peminjaman";

const bookColors = ["#6c47e8", "#d4ef3b", "#ec4899", "#4ade80", "#f97316", "#60a5fa", "#8b5cf6", "#f59e0b"];

export default async function PeminjamanAdminPage() {
  const [loans, stats] = await Promise.all([getAllLoans(), getLoanStats()]);
  const today = new Date().toISOString().split("T")[0];

  return (
    <>
      <Navbar title="Peminjaman" subtitle="Kelola semua transaksi peminjaman buku" userName="Administrator" userRole="Pustakawan" />
      <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {[
            { label: "Total Aktif", value: stats.active.toLocaleString(), color: "#6c47e8" },
            { label: "Terlambat", value: stats.late.toLocaleString(), color: "#ef4444" },
            { label: "Dikembalikan Hari Ini", value: stats.returnedToday.toLocaleString(), color: "#16a34a" },
            { label: "Total Denda Terkumpul", value: `Rp ${(stats.totalFine / 1000).toFixed(0)}K`, color: "#f97316" },
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
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>Daftar Peminjaman</p>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
                {["No", "Anggota", "Buku", "Tgl Pinjam", "Jatuh Tempo", "Dikembalikan", "Denda", "Status", "Aksi"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontSize: 12, color: "#aaa", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loans.map((loan, i) => {
                const isLate = loan.status === "borrowed" && loan.due_date < today;
                const statusLabel = loan.status === "returned" ? "Dikembalikan" : loan.status === "extended" ? "Diperpanjang" : isLate ? "Terlambat" : "Aktif";
                const statusColors: Record<string, [string, string]> = {
                  Dikembalikan: ["#f0fdf4", "#16a34a"],
                  Terlambat: ["#fef2f2", "#ef4444"],
                  Diperpanjang: ["#fef9c3", "#92400e"],
                  Aktif: ["#f0eeff", "#6c47e8"],
                };
                const [sbg, sc] = statusColors[statusLabel];
                const fine = loan.returns?.fine ?? 0;
                const bookTitle = loan.loan_details?.[0]?.books?.title ?? "-";

                return (
                  <tr key={loan.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                    <td style={{ padding: "12px 14px", fontSize: 13.5, color: "#aaa" }}>{i + 1}</td>
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: bookColors[i % bookColors.length], color: "#fff", fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {loan.users?.full_name?.charAt(0).toUpperCase() ?? "?"}
                        </div>
                        <span style={{ fontSize: 13.5, fontWeight: 600, color: "#1a1a2e" }}>{loan.users?.full_name ?? "-"}</span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#555" }}>{bookTitle}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#555" }}>{loan.loan_date}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: isLate ? "#ef4444" : "#555", fontWeight: isLate ? 700 : 400 }}>{loan.due_date}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, color: "#aaa" }}>{loan.returns?.return_date ?? "-"}</td>
                    <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 600, color: fine > 0 ? "#ef4444" : "#aaa" }}>
                      {fine > 0 ? `Rp ${fine.toLocaleString()}` : "-"}
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      <span style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, background: sbg, color: sc }}>{statusLabel}</span>
                    </td>
                    <td style={{ padding: "12px 14px" }}>
                      {loan.status !== "returned" && (
                        <button style={{ padding: "5px 10px", borderRadius: 8, background: "#f0fdf4", color: "#16a34a", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer" }}>
                          ✓ Kembali
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ padding: "14px 24px", borderTop: "1px solid #f3f4f6" }}>
            <span style={{ fontSize: 13, color: "#aaa" }}>Menampilkan {loans.length} peminjaman</span>
          </div>
        </div>

      </main>
    </>
  );
}