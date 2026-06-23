import Navbar from "@/components/layout/Navbar";
import { getAdminDashboardStats, getRecentLoans, getWeeklyLoanData } from "@/lib/dashboard";
import { BookCopy, Users, ClipboardList, AlertTriangle } from "lucide-react";

function StatusBadge({ status }: { status: string }) {
  const isLate = status === "borrowed" && false; // handled inline
  return null;
}

export default async function AdminDashboardPage() {
  const [stats, recentLoans, weeklyData] = await Promise.all([
    getAdminDashboardStats(),
    getRecentLoans(),
    getWeeklyLoanData(),
  ]);

  const today = new Date().toISOString().split("T")[0];
  const maxWeekly = Math.max(...weeklyData.map((d) => d.count), 1);

  const statCards = [
    { label: "Total Buku", value: stats.totalBooks.toLocaleString(), icon: BookCopy, color: "#6c47e8", growth: true },
    { label: "Total Anggota", value: stats.totalMembers.toLocaleString(), icon: Users, color: "#6c47e8", growth: true },
    { label: "Peminjaman Aktif", value: stats.activeLoans.toLocaleString(), icon: ClipboardList, color: "#6c47e8", growth: true },
    { label: "Buku Terlambat", value: stats.lateLoans.toLocaleString(), icon: AlertTriangle, color: "#ef4444", growth: false },
  ];

  return (
    <>
      <Navbar title="Dashboard" subtitle="Selamat datang kembali, Admin!" userName="Administrator" userRole="Pustakawan" />
      <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}>
          {statCards.map(({ label, value, icon: Icon, color, growth }) => (
            <div key={label} style={{ background: "#fff", borderRadius: 14, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: color === "#ef4444" ? "#fef2f2" : "#f0eeff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon size={18} color={color} />
                </div>
              </div>
              <p style={{ margin: "12px 0 2px", fontSize: 26, fontWeight: 700, color: color === "#ef4444" ? "#ef4444" : "#1a1a2e" }}>{value}</p>
              <p style={{ margin: 0, fontSize: 13, color: "#888" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Chart + Summary */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
          {/* Bar Chart */}
          <div style={{ background: "#fff", borderRadius: 14, padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>Peminjaman per Minggu</p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#aaa" }}>7 hari terakhir</p>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 160 }}>
              {weeklyData.map((d, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 11, color: "#aaa" }}>{d.count}</span>
                  <div style={{
                    width: "100%", borderRadius: "6px 6px 0 0",
                    background: i === weeklyData.length - 1 ? "#6c47e8" : "#e0d9ff",
                    height: `${(d.count / maxWeekly) * 120}px`, minHeight: 4,
                  }} />
                  <span style={{ fontSize: 11, color: "#aaa" }}>{d.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Daily Summary */}
          <div style={{ background: "#fff", borderRadius: 14, padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <p style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>Ringkasan Hari Ini</p>
            {[
              { label: "Buku dikembalikan", value: stats.returnedToday, color: "#16a34a" },
              { label: "Buku dipinjam", value: stats.borrowedToday, color: "#6c47e8" },
              { label: "Anggota baru", value: stats.newMembersToday, color: "#f97316" },
              { label: "Denda terkumpul", value: `Rp ${(stats.totalFine / 1000).toFixed(0)}K`, color: "#ef4444" },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: 13.5, color: "#555" }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Loans */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>Peminjaman Terbaru</p>
            <a href="/admin/peminjaman" style={{ fontSize: 13, color: "#6c47e8", textDecoration: "none", fontWeight: 600 }}>Lihat Semua →</a>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #f3f4f6" }}>
                {["No", "Anggota", "Buku", "Tgl Pinjam", "Jatuh Tempo", "Status"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 12, color: "#aaa", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentLoans.map((loan, i) => {
                const isLate = loan.status === "borrowed" && loan.due_date < today;
                const statusLabel = loan.status === "returned" ? "Dikembalikan" : isLate ? "Terlambat" : "Aktif";
                const statusColor = loan.status === "returned" ? ["#f0fdf4", "#16a34a"] : isLate ? ["#fef2f2", "#ef4444"] : ["#f0eeff", "#6c47e8"];
                const bookTitle = loan.loan_details?.[0]?.books?.title ?? "-";
                return (
                  <tr key={loan.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                    <td style={{ padding: "12px", fontSize: 13.5, color: "#aaa" }}>{i + 1}</td>
                    <td style={{ padding: "12px", fontSize: 13.5, fontWeight: 600, color: "#1a1a2e" }}>{loan.users?.full_name ?? "-"}</td>
                    <td style={{ padding: "12px", fontSize: 13.5, color: "#555" }}>{bookTitle}</td>
                    <td style={{ padding: "12px", fontSize: 13.5, color: "#555" }}>{loan.loan_date}</td>
                    <td style={{ padding: "12px", fontSize: 13.5, color: isLate ? "#ef4444" : "#555", fontWeight: isLate ? 600 : 400 }}>{loan.due_date}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, background: statusColor[0], color: statusColor[1] }}>{statusLabel}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </main>
    </>
  );
}