import Navbar from "@/components/layout/Navbar";
import { getMonthlyLoanStats, getTopBooks, getLaporanStats } from "@/lib/laporan";
import { Download } from "lucide-react";

export default async function LaporanPage() {
  const year = 2026;
  const [monthly, topBooks, laporanStats] = await Promise.all([
    getMonthlyLoanStats(year),
    getTopBooks(6, year),
    getLaporanStats(year),
  ]);

  const maxMonthly = Math.max(...monthly.map((m) => m.count), 1);
  const peakMonth = monthly.reduce((a, b) => (b.count > a.count ? b : a), monthly[0]);

  return (
    <>
      <Navbar title="Laporan" subtitle="Analisis tren dan statistik peminjaman" userName="Administrator" userRole="Pustakawan" />
      <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Period Filter */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff", borderRadius: 12, padding: "14px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13.5, color: "#555", fontWeight: 600 }}>Periode:</span>
            {monthly.map((m, i) => (
              <button key={m.label} style={{
                padding: "6px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600,
                background: i === monthly.length - 1 ? "#6c47e8" : "transparent",
                color: i === monthly.length - 1 ? "#fff" : "#888",
              }}>{m.label}</button>
            ))}
            <span style={{ background: "#f0eeff", color: "#6c47e8", padding: "6px 12px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>{year}</span>
          </div>
          <button style={{ display: "flex", alignItems: "center", gap: 8, background: "#6c47e8", color: "#fff", border: "none", borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            <Download size={15} /> Cetak / Ekspor PDF
          </button>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {[
            { label: "Total Peminjaman", sublabel: `Jan–Jun ${year}`, value: laporanStats.totalLoans.toLocaleString(), color: "#6c47e8" },
            { label: "Rata-rata/Bulan", sublabel: "per bulan", value: laporanStats.avgPerMonth.toString(), color: "#16a34a" },
            { label: "Bulan Tertinggi", sublabel: `${peakMonth?.count ?? 0} peminjaman`, value: peakMonth?.label ?? "-", color: "#f97316" },
            { label: "Denda Terkumpul", sublabel: `Jan–Jun ${year}`, value: `Rp ${(laporanStats.totalFine / 1000).toFixed(0)}K`, color: "#ef4444" },
          ].map(({ label, sublabel, value, color }) => (
            <div key={label} style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color }}>{value}</p>
              <p style={{ margin: "4px 0 2px", fontSize: 13, color: "#555", fontWeight: 600 }}>{label}</p>
              <p style={{ margin: 0, fontSize: 12, color, fontWeight: 600 }}>{sublabel}</p>
            </div>
          ))}
        </div>

        {/* Line Chart */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <p style={{ margin: "0 0 4px", fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>Tren Peminjaman {year}</p>
          <p style={{ margin: "0 0 20px", fontSize: 12, color: "#aaa" }}>Januari – Juni {year}</p>
          <svg viewBox="0 0 700 200" style={{ width: "100%", overflow: "visible" }}>
            {[0, 50, 100, 150, 200].map((y) => (
              <g key={y}>
                <line x1={40} y1={180 - (y / 200) * 150} x2={680} y2={180 - (y / 200) * 150} stroke="#f3f4f6" strokeWidth={1} />
                <text x={30} y={184 - (y / 200) * 150} fontSize={10} fill="#aaa" textAnchor="end">{y}</text>
              </g>
            ))}
            {(() => {
              const pts = monthly.map((m, i) => {
                const x = 40 + (i / (monthly.length - 1)) * 640;
                const y = 180 - (m.count / maxMonthly) * 150;
                return `${x},${y}`;
              });
              return (
                <>
                  <polyline points={pts.join(" ")} fill="none" stroke="#6c47e8" strokeWidth={2.5} strokeLinejoin="round" />
                  {monthly.map((m, i) => {
                    const x = 40 + (i / (monthly.length - 1)) * 640;
                    const y = 180 - (m.count / maxMonthly) * 150;
                    return <circle key={i} cx={x} cy={y} r={5} fill="#6c47e8" />;
                  })}
                </>
              );
            })()}
            {monthly.map((m, i) => {
              const x = 40 + (i / (monthly.length - 1)) * 640;
              return <text key={m.label} x={x} y={198} fontSize={11} fill="#aaa" textAnchor="middle">{m.label}</text>;
            })}
          </svg>
        </div>

        {/* Top Books */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "22px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <p style={{ margin: "0 0 16px", fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>Buku Paling Diminati · Jun {year}</p>
          {topBooks.length === 0 ? (
            <p style={{ color: "#aaa", fontSize: 13 }}>Belum ada data peminjaman bulan ini.</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                  {["Rank", "Judul", "Penulis", "Pinjam", "Popularitas"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: 12, color: "#aaa", fontWeight: 600 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topBooks.map((book, i) => {
                  const medals = ["🥇", "🥈", "🥉"];
                  return (
                    <tr key={book.title} style={{ borderBottom: "1px solid #f9fafb" }}>
                      <td style={{ padding: "12px", fontSize: 16 }}>{medals[i] ?? i + 1}</td>
                      <td style={{ padding: "12px", fontSize: 13.5, fontWeight: 600, color: "#1a1a2e" }}>{book.title}</td>
                      <td style={{ padding: "12px", fontSize: 13, color: "#555" }}>{book.author}</td>
                      <td style={{ padding: "12px", fontSize: 13.5, fontWeight: 700, color: "#6c47e8" }}>{book.count}×</td>
                      <td style={{ padding: "12px", width: 200 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ flex: 1, height: 8, background: "#f0eeff", borderRadius: 99 }}>
                            <div style={{ width: `${book.pct}%`, height: "100%", background: "#6c47e8", borderRadius: 99 }} />
                          </div>
                          <span style={{ fontSize: 12, color: "#888", minWidth: 32 }}>{book.pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

      </main>
    </>
  );
}