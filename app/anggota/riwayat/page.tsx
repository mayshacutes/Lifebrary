"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@/types/anggota";
import type { Loan } from "@/types/peminjaman";
import { Search } from "lucide-react";

const bookColors = ["#6c47e8", "#d4ef3b", "#ec4899", "#4ade80", "#f97316", "#60a5fa", "#8b5cf6", "#f59e0b"];

export default function RiwayatPeminjamanPage() {
  const [user, setUser] = useState<User | null>(null);
  const [allLoans, setAllLoans] = useState<Loan[]>([]);
  const [filtered, setFiltered] = useState<Loan[]>([]);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) { window.location.href = "/login"; return; }

    async function fetchAll() {
      const { data: userData } = await supabase.from("users").select("*").eq("id", userId).single();
      setUser(userData);

      const { data: loansData } = await supabase
        .from("loans")
        .select(`*, loan_details(quantity, books(title, author)), returns(fine, return_date, late_days)`)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setAllLoans(loansData ?? []);
      setFiltered(loansData ?? []);
      setLoading(false);
    }
    fetchAll();
  }, []);

  useEffect(() => {
    let result = allLoans;

    if (activeFilter === "Tepat Waktu") {
      result = result.filter(l => l.status === "returned" && (l.returns?.late_days ?? 0) === 0);
    } else if (activeFilter === "Terlambat") {
      result = result.filter(l => {
        const isLate = l.status === "borrowed" && l.due_date < today;
        const wasLate = l.status === "returned" && (l.returns?.late_days ?? 0) > 0;
        return isLate || wasLate;
      });
    }

    if (search) {
      result = result.filter(l =>
        l.loan_details?.[0]?.books?.title?.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFiltered(result);
  }, [search, activeFilter, allLoans]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <p style={{ color: "#6c47e8", fontWeight: 600 }}>Memuat riwayat...</p>
    </div>
  );

  const onTime = allLoans.filter(l => l.status === "returned" && (l.returns?.late_days ?? 0) === 0).length;
  const late = allLoans.filter(l => {
    const isLate = l.status === "borrowed" && l.due_date < today;
    const wasLate = l.status === "returned" && (l.returns?.late_days ?? 0) > 0;
    return isLate || wasLate;
  }).length;
  const totalFine = allLoans.reduce((acc, l) => acc + Number(l.returns?.fine ?? 0), 0);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

  const getDuration = (loan: Loan) => {
    const start = new Date(loan.loan_date);
    const end = loan.returns?.return_date ? new Date(loan.returns.return_date) : new Date(loan.due_date);
    return Math.ceil((end.getTime() - start.getTime()) / 86400000);
  };

  const getStatus = (loan: Loan) => {
    if (loan.status === "returned") return (loan.returns?.late_days ?? 0) > 0 ? "Terlambat" : "Tepat Waktu";
    if (loan.status === "borrowed") return loan.due_date < today ? "Terlambat" : "Aktif";
    return "Diperpanjang";
  };

  return (
    <>
      <Navbar title="Riwayat Peminjaman" subtitle="Rekam jejak semua peminjaman kamu" userName={user?.full_name ?? ""} userRole="Anggota" />
      <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {[
            { label: "Total Dipinjam", value: allLoans.length, color: "#6c47e8" },
            { label: "Tepat Waktu", value: onTime, color: "#16a34a" },
            { label: "Pernah Terlambat", value: late, color: "#f97316" },
            { label: "Total Denda", value: `Rp ${(totalFine / 1000).toFixed(0)}K`, color: "#ef4444" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color }}>{value}</p>
              <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#888" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Search + Filter */}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "#fff", borderRadius: 10, padding: "10px 16px", border: "1px solid #e5e7eb" }}>
            <Search size={16} color="#aaa" />
            <input
              placeholder="Cari judul buku..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: 13.5, flex: 1, color: "#333", background: "transparent" }}
            />
          </div>
          {["Semua", "Tepat Waktu", "Terlambat"].map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} style={{
              padding: "9px 16px", borderRadius: 10, border: "none", cursor: "pointer",
              fontSize: 13, fontWeight: 600,
              background: activeFilter === f ? "#6c47e8" : "#fff",
              color: activeFilter === f ? "#fff" : "#555",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            }}>{f}</button>
          ))}
          <button style={{
            padding: "9px 16px", borderRadius: 10, background: "#6c47e8", color: "#fff",
            border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer",
            display: "flex", alignItems: "center", gap: 6,
          }}>
            ⬇ Export
          </button>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 24px", borderBottom: "1px solid #f3f4f6" }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>Semua Riwayat</p>
            <span style={{ fontSize: 13, color: "#aaa" }}>{filtered.length} transaksi</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #f3f4f6", background: "#fafafa" }}>
                {["No", "Buku", "Tgl Pinjam", "Tgl Kembali", "Durasi", "Denda", "Status"].map(h => (
                  <th key={h} style={{ textAlign: "left", padding: "10px 16px", fontSize: 12, color: "#aaa", fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "#aaa", fontSize: 14 }}>
                    Tidak ada riwayat ditemukan
                  </td>
                </tr>
              ) : filtered.map((loan, i) => {
                const book = loan.loan_details?.[0]?.books;
                const status = getStatus(loan);
                const fine = Number(loan.returns?.fine ?? 0);
                const statusColors: Record<string, [string, string]> = {
                  "Tepat Waktu": ["#f0fdf4", "#16a34a"],
                  "Terlambat": ["#fef2f2", "#ef4444"],
                  "Aktif": ["#f0eeff", "#6c47e8"],
                  "Diperpanjang": ["#fef9c3", "#92400e"],
                };
                const [sbg, sc] = statusColors[status] ?? ["#f3f4f6", "#555"];
                return (
                  <tr key={loan.id} style={{ borderBottom: "1px solid #f9fafb" }}>
                    <td style={{ padding: "14px 16px", fontSize: 13.5, color: "#aaa" }}>{i + 1}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 40, borderRadius: 6, background: bookColors[i % bookColors.length], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: 12 }}>📖</span>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600, fontSize: 13.5, color: "#1a1a2e" }}>{book?.title ?? "-"}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 12, color: "#aaa" }}>{book?.author ?? "-"}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#555" }}>{formatDate(loan.loan_date)}</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#555" }}>
                      {loan.returns?.return_date ? formatDate(loan.returns.return_date) : "-"}
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#555" }}>{getDuration(loan)} hari</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: fine > 0 ? "#ef4444" : "#aaa" }}>
                      {fine > 0 ? `Rp ${fine.toLocaleString("id-ID")}` : "-"}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600, background: sbg, color: sc }}>{status}</span>
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