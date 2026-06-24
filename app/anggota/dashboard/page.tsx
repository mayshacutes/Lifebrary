"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@/types/anggota";
import type { Loan } from "@/types/peminjaman";
import Link from "next/link";
import { BookMarked, AlertTriangle, Clock } from "lucide-react";

export default function DashboardAnggotaPage() {
  const [user, setUser] = useState<User | null>(null);
  const [activeLoans, setActiveLoans] = useState<Loan[]>([]);
  const [totalLoans, setTotalLoans] = useState(0);
  const [totalFine, setTotalFine] = useState(0);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) { window.location.href = "/login"; return; }

    async function fetchAll() {
      // User
      const { data: userData } = await supabase
        .from("users").select("*").eq("id", userId).single();
      setUser(userData);

      // Active loans
      const { data: loansData } = await supabase
        .from("loans")
        .select(`*, loan_details(quantity, books(id, title, author)), returns(fine, return_date)`)
        .eq("user_id", userId)
        .in("status", ["borrowed", "extended"])
        .order("due_date", { ascending: true });
      setActiveLoans(loansData ?? []);

      // Total loans count
      const { count } = await supabase
        .from("loans")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);
      setTotalLoans(count ?? 0);

      // Total fine
      const { data: returnData } = await supabase
        .from("returns")
        .select("fine, loan_id, loans!inner(user_id)")
        .eq("loans.user_id", userId);
      const fine = returnData?.reduce((acc, r) => acc + Number(r.fine), 0) ?? 0;
      setTotalFine(fine);

      // Recommendations: random books not currently borrowed
      const { data: books } = await supabase
        .from("books").select("*").gt("stock", 0).limit(3);
      setRecommendations(books ?? []);

      setLoading(false);
    }
    fetchAll();
  }, []);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <p style={{ color: "#6c47e8", fontWeight: 600 }}>Memuat data...</p>
    </div>
  );

  const lateLoans = activeLoans.filter(l => l.due_date < today);
  const lateFine = lateLoans.reduce((acc, l) => {
    const lateDays = Math.floor((new Date(today).getTime() - new Date(l.due_date).getTime()) / 86400000);
    return acc + lateDays * 1000;
  }, 0);

  const nearestDue = activeLoans[0];
  const daysLeft = nearestDue
    ? Math.ceil((new Date(nearestDue.due_date).getTime() - new Date(today).getTime()) / 86400000)
    : null;

  const bookColors = ["#6c47e8", "#f97316", "#ec4899", "#4ade80", "#60a5fa", "#f59e0b", "#8b5cf6"];

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <>
      <Navbar title="Dashboard" subtitle="Perpustakaan Digital" userName={user?.full_name ?? ""} userRole="Anggota" />
      <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* Welcome Banner */}
        <div style={{
          background: "#6c47e8", borderRadius: 16, padding: "28px 32px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#fff" }}>
              Halo, {user?.full_name?.split(" ")[0]}! 👋
            </h2>
            <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.7)", fontSize: 14 }}>
              Selamat datang di perpustakaan digital
            </p>
            <p style={{ margin: "2px 0 0", color: "rgba(255,255,255,0.5)", fontSize: 12 }}>
              {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <span style={{ fontSize: 52 }}>📚</span>
        </div>

        {/* Stat Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {/* Sedang Dipinjam */}
          <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <p style={{ margin: 0, fontSize: 12.5, color: "#888", display: "flex", alignItems: "center", gap: 6 }}>
              <BookMarked size={14} /> Sedang Dipinjam
            </p>
            <p style={{ margin: "8px 0 4px", fontSize: 32, fontWeight: 700, color: "#6c47e8" }}>{activeLoans.length}</p>
            <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>dari maksimal 5 buku</p>
            <div style={{ marginTop: 10, height: 6, background: "#f0eeff", borderRadius: 99 }}>
              <div style={{ width: `${(activeLoans.length / 5) * 100}%`, height: "100%", background: "#6c47e8", borderRadius: 99 }} />
            </div>
          </div>

          {/* Denda */}
          <div style={{
            background: lateLoans.length > 0 ? "#fff3f3" : "#fff",
            borderRadius: 14, padding: "20px 24px",
            border: lateLoans.length > 0 ? "1px solid #fecaca" : "none",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}>
            <p style={{ margin: 0, fontSize: 12.5, color: lateLoans.length > 0 ? "#ef4444" : "#888", display: "flex", alignItems: "center", gap: 6 }}>
              <AlertTriangle size={14} /> Denda / Keterlambatan
            </p>
            <p style={{ margin: "8px 0 4px", fontSize: 32, fontWeight: 700, color: lateLoans.length > 0 ? "#ef4444" : "#1a1a2e" }}>
              {lateLoans.length > 0 ? `Rp ${lateFine.toLocaleString("id-ID")}` : "Rp 0"}
            </p>
            <p style={{ margin: 0, fontSize: 12, color: lateLoans.length > 0 ? "#f87171" : "#aaa" }}>
              {lateLoans.length > 0 ? `${lateLoans.length} buku terlambat dikembalikan` : "Semua tepat waktu"}
            </p>
            {lateLoans.length > 0 && (
              <Link href="/anggota/peminjaman" style={{
                display: "inline-block", marginTop: 12, background: "#ef4444", color: "#fff",
                borderRadius: 8, padding: "6px 14px", fontSize: 12, fontWeight: 600, textDecoration: "none",
              }}>
                Lihat Detail
              </Link>
            )}
          </div>

          {/* Tenggat Terdekat */}
          <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <p style={{ margin: 0, fontSize: 12.5, color: "#888", display: "flex", alignItems: "center", gap: 6 }}>
              <Clock size={14} /> Tenggat Terdekat
            </p>
            {nearestDue ? (
              <>
                <p style={{ margin: "8px 0 2px", fontSize: 20, fontWeight: 700, color: daysLeft! < 0 ? "#ef4444" : daysLeft! <= 3 ? "#f97316" : "#1a1a2e" }}>
                  {formatDate(nearestDue.due_date)}
                </p>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#333" }}>
                  {nearestDue.loan_details?.[0]?.books?.title ?? "-"}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: "#aaa" }}>
                  {daysLeft! < 0 ? `${Math.abs(daysLeft!)} hari terlambat` : daysLeft === 0 ? "Jatuh tempo hari ini" : `Sisa ${daysLeft} hari`}
                </p>
                {daysLeft! <= 3 && (
                  <div style={{ marginTop: 10, background: "#fef9c3", borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 600, color: "#92400e", display: "inline-block" }}>
                    Segera kembalikan!
                  </div>
                )}
              </>
            ) : (
              <p style={{ margin: "8px 0 0", fontSize: 14, color: "#aaa" }}>Tidak ada peminjaman aktif</p>
            )}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div>
            <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>Rekomendasi &amp; Favorit</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              {recommendations.map((book, i) => (
                <div key={book.id} style={{
                  background: "#fff", borderRadius: 14, padding: 16,
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: 14,
                }}>
                  <div style={{
                    width: 44, height: 56, borderRadius: 8, background: bookColors[i % bookColors.length],
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 18 }}>📖</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 13.5, color: "#1a1a2e", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{book.title}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: "#888" }}>{book.author}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 12, color: book.stock > 0 ? "#16a34a" : "#ef4444", fontWeight: 600 }}>
                      {book.stock > 0 ? `Stok: ${book.stock}` : "Habis"}
                    </p>
                  </div>
                  <Link href="/anggota/katalog" style={{
                    background: "#f0eeff", color: "#6c47e8", borderRadius: 8,
                    padding: "5px 10px", fontSize: 12, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap",
                  }}>
                    + Pinjam
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Loans */}
        <div>
          <h3 style={{ margin: "0 0 14px", fontSize: 15, fontWeight: 700, color: "#1a1a2e" }}>Sedang Dipinjam</h3>
          {activeLoans.length === 0 ? (
            <div style={{ background: "#fff", borderRadius: 14, padding: "32px 24px", textAlign: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <p style={{ margin: 0, color: "#aaa", fontSize: 14 }}>Kamu belum meminjam buku apapun.</p>
              <Link href="/anggota/katalog" style={{ display: "inline-block", marginTop: 12, background: "#6c47e8", color: "#fff", borderRadius: 10, padding: "8px 20px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                Lihat Katalog
              </Link>
            </div>
          ) : (
            <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              {activeLoans.map((loan, i) => {
                const isLate = loan.due_date < today;
                const book = loan.loan_details?.[0]?.books;
                return (
                  <div key={loan.id} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "14px 20px",
                    borderBottom: i < activeLoans.length - 1 ? "1px solid #f3f4f6" : "none",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 44, borderRadius: 6, background: bookColors[i % bookColors.length], display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 14 }}>📖</span>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: "#1a1a2e" }}>{book?.title ?? "-"}</p>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: "#aaa" }}>Jatuh tempo: {formatDate(loan.due_date)}</p>
                      </div>
                    </div>
                    <span style={{
                      padding: "4px 12px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                      background: isLate ? "#fef2f2" : "#f0fdf4",
                      color: isLate ? "#ef4444" : "#16a34a",
                    }}>
                      {isLate ? "Terlambat" : "Aktif"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>
    </>
  );
}