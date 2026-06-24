"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@/types/anggota";
import type { Loan } from "@/types/peminjaman";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

const bookColors = ["#4ade80", "#f97316", "#ec4899", "#60a5fa", "#8b5cf6", "#f59e0b"];

export default function PeminjamanSayaPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
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
        .in("status", ["borrowed", "extended"])
        .order("due_date", { ascending: true });
      setLoans(loansData ?? []);
      setLoading(false);
    }
    fetchAll();
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <p style={{ color: "#6c47e8", fontWeight: 600 }}>Memuat data...</p>
    </div>
  );

  const lateLoans = loans.filter(l => l.due_date < today);
  const lateFine = lateLoans.reduce((acc, l) => {
    const days = Math.floor((new Date(today).getTime() - new Date(l.due_date).getTime()) / 86400000);
    return acc + days * 1000;
  }, 0);

  const nearestDue = loans[0];
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <>
      <Navbar title="Peminjaman Saya" subtitle="Buku yang sedang kamu pinjam" userName={user?.full_name ?? ""} userRole="Anggota" />
      <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          {[
            { label: "Sedang Dipinjam", value: loans.length, color: "#6c47e8" },
            { label: "Terlambat", value: lateLoans.length, color: "#ef4444" },
            { label: "Total Denda", value: `Rp ${lateFine.toLocaleString("id-ID")}`, color: "#f97316" },
            { label: "Tenggat Terdekat", value: nearestDue ? formatDate(nearestDue.due_date) : "-", color: "#16a34a" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color }}>{value}</p>
              <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#888" }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Alert banner if there's late */}
        {lateLoans.length > 0 && (
          <div style={{
            background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 12,
            padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <AlertTriangle size={18} color="#ef4444" />
              <div>
                <p style={{ margin: 0, fontWeight: 700, fontSize: 13.5, color: "#ef4444" }}>
                  {lateLoans.length} buku melewati batas waktu peminjaman!
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12.5, color: "#f87171" }}>
                  Segera kembalikan untuk menghindari denda tambahan. Denda saat ini: Rp {lateFine.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
            <button style={{
              background: "#ef4444", color: "#fff", border: "none", borderRadius: 10,
              padding: "8px 18px", fontSize: 13, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap",
            }}>
              Bayar Denda
            </button>
          </div>
        )}

        {/* Detail Peminjaman Aktif */}
        <div>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>Detail Peminjaman Aktif</h3>
          {loans.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 14, padding: "32px 24px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <p style={{ margin: 0, color: "#aaa", fontSize: 14 }}>Kamu tidak sedang meminjam buku apapun.</p>
              <Link href="/anggota/katalog" style={{ display: "inline-block", marginTop: 12, background: "#6c47e8", color: "#fff", borderRadius: 10, padding: "8px 20px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                Pinjam Buku
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {loans.map((loan, i) => {
                const book = loan.loan_details?.[0]?.books;
                const isLate = loan.due_date < today;
                const daysLeft = Math.ceil((new Date(loan.due_date).getTime() - new Date(today).getTime()) / 86400000);
                const lateDays = isLate ? Math.abs(daysLeft) : 0;
                const fine = isLate ? lateDays * 1000 : 0;
                const progressPct = isLate ? 100 : Math.max(0, Math.round((1 - daysLeft / 14) * 100));

                return (
                  <div key={loan.id} style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 44, height: 56, borderRadius: 8, background: bookColors[i % bookColors.length], display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <span style={{ fontSize: 18 }}>📖</span>
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: "#1a1a2e" }}>{book?.title ?? "-"}</p>
                          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#888" }}>{book?.author ?? "-"}</p>
                        </div>
                      </div>
                      <span style={{
                        padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700,
                        background: isLate ? "#fef2f2" : "#f0fdf4",
                        color: isLate ? "#ef4444" : "#16a34a",
                      }}>
                        {isLate ? "Terlambat" : "Aktif"}
                      </span>
                    </div>

                    {/* Detail Row */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 14 }}>
                      {[
                        { label: "Tanggal Pinjam", value: formatDate(loan.loan_date) },
                        { label: "Jatuh Tempo", value: formatDate(loan.due_date), highlight: isLate },
                        { label: "Denda", value: fine > 0 ? `Rp ${fine.toLocaleString("id-ID")}` : "Tidak ada", highlight: fine > 0 },
                      ].map(({ label, value, highlight }) => (
                        <div key={label} style={{ background: "#f9fafb", borderRadius: 10, padding: "10px 14px" }}>
                          <p style={{ margin: 0, fontSize: 11.5, color: "#aaa", marginBottom: 4 }}>{label}</p>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: highlight ? "#ef4444" : "#1a1a2e" }}>{value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Progress bar */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: "#aaa" }}>Waktu peminjaman</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: isLate ? "#ef4444" : "#16a34a" }}>
                        {isLate ? `${lateDays} hari terlambat` : `${daysLeft} hari tersisa`}
                      </span>
                    </div>
                    <div style={{ height: 6, background: "#f3f4f6", borderRadius: 99 }}>
                      <div style={{ width: `${progressPct}%`, height: "100%", background: isLate ? "#ef4444" : "#16a34a", borderRadius: 99 }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Kuota */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "16px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ flex: 1, marginRight: 20 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#555" }}>Kuota Peminjaman</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#6c47e8" }}>{loans.length} / 5 buku</span>
            </div>
            <div style={{ height: 8, background: "#f0eeff", borderRadius: 99 }}>
              <div style={{ width: `${(loans.length / 5) * 100}%`, height: "100%", background: "#6c47e8", borderRadius: 99 }} />
            </div>
          </div>
          <Link href="/anggota/katalog" style={{
            background: "#6c47e8", color: "#fff", borderRadius: 10,
            padding: "10px 18px", fontSize: 13, fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap",
          }}>
            + Pinjam Buku Baru
          </Link>
        </div>

      </main>
    </>
  );
}