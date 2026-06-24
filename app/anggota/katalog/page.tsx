"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { supabase } from "@/lib/supabase/client";
import type { Book } from "@/types/buku";
import type { User } from "@/types/anggota";
import { Search } from "lucide-react";

const bookColors = ["#6c47e8", "#d4ef3b", "#ec4899", "#4ade80", "#f97316", "#60a5fa", "#8b5cf6", "#f59e0b", "#ef4444", "#14b8a6"];
const categories = ["Semua", "Fiksi", "Non-Fiksi", "Sejarah", "Sains", "Sastra", "Biografi"];

function Stars({ count = 4 }: { count?: number }) {
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < count ? "#f59e0b" : "#e5e7eb", fontSize: 13 }}>★</span>
      ))}
    </div>
  );
}

export default function KatalogPage() {
  const [user, setUser] = useState<User | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [filtered, setFiltered] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [borrowing, setBorrowing] = useState<string | null>(null);
  const [activeLoansCount, setActiveLoansCount] = useState(0);

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    if (!userId) { window.location.href = "/login"; return; }

    async function fetchAll() {
      const { data: userData } = await supabase.from("users").select("*").eq("id", userId).single();
      setUser(userData);

      const { data: booksData } = await supabase.from("books").select("*").order("title");
      setBooks(booksData ?? []);
      setFiltered(booksData ?? []);

      const { count } = await supabase
        .from("loans").select("*", { count: "exact", head: true })
        .eq("user_id", userId).in("status", ["borrowed", "extended"]);
      setActiveLoansCount(count ?? 0);
      setLoading(false);
    }
    fetchAll();
  }, []);

  useEffect(() => {
    let result = books;
    if (search) result = result.filter(b => b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase()));
    setFiltered(result);
  }, [search, activeCategory, books]);

  const handleBorrow = async (book: Book) => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return;
    if (activeLoansCount >= 5) return alert("Kamu sudah mencapai batas maksimal 5 buku yang dipinjam.");
    if (book.stock <= 0) return alert("Stok buku habis.");

    setBorrowing(book.id);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);
    const dueDateStr = dueDate.toISOString().split("T")[0];

    const { data: loan, error: loanError } = await supabase
      .from("loans")
      .insert({ user_id: userId, due_date: dueDateStr, status: "borrowed" })
      .select().single();

    if (loanError || !loan) { setBorrowing(null); return alert("Gagal meminjam: " + loanError?.message); }

    const { error: detailError } = await supabase
      .from("loan_details")
      .insert({ loan_id: loan.id, book_id: book.id, quantity: 1 });

    if (detailError) { setBorrowing(null); return alert("Gagal menyimpan detail: " + detailError.message); }

    await supabase.from("books").update({ stock: book.stock - 1, updated_at: new Date().toISOString() }).eq("id", book.id);

    setBooks(prev => prev.map(b => b.id === book.id ? { ...b, stock: b.stock - 1 } : b));
    setActiveLoansCount(prev => prev + 1);
    setBorrowing(null);
    alert(`Berhasil meminjam "${book.title}"! Tenggat: ${dueDateStr}`);
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <p style={{ color: "#6c47e8", fontWeight: 600 }}>Memuat katalog...</p>
    </div>
  );

  return (
    <>
      <Navbar title="Katalog Buku" subtitle="Temukan buku yang ingin kamu baca" userName={user?.full_name ?? ""} userRole="Anggota" />
      <main style={{ padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Search + Filter */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "16px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#f4f4f8", borderRadius: 10, padding: "10px 16px", marginBottom: 14 }}>
            <Search size={16} color="#aaa" />
            <input
              placeholder="Cari judul, penulis, atau kategori buku..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ border: "none", outline: "none", fontSize: 13.5, flex: 1, color: "#333", background: "transparent" }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: "#555", fontWeight: 600 }}>Filter:</span>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                padding: "5px 14px", borderRadius: 99, border: "none", cursor: "pointer",
                fontSize: 12.5, fontWeight: 600,
                background: activeCategory === cat ? "#6c47e8" : "#f4f4f8",
                color: activeCategory === cat ? "#fff" : "#555",
              }}>{cat}</button>
            ))}
          </div>
        </div>

        <p style={{ margin: 0, fontSize: 13, color: "#888" }}>Menampilkan <strong>{filtered.length}</strong> buku</p>

        {/* Book Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {filtered.map((book, i) => (
            <div key={book.id} style={{
              background: "#fff", borderRadius: 14,
              overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              display: "flex", flexDirection: "column",
            }}>
              {/* Cover area */}
              <div style={{ position: "relative", background: book.stock === 0 ? "#f9fafb" : `${bookColors[i % bookColors.length]}18`, padding: "28px 0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {book.stock === 0 && (
                  <span style={{
                    position: "absolute", top: 10, right: 10,
                    background: "#ef4444", color: "#fff", fontSize: 11, fontWeight: 700,
                    padding: "3px 8px", borderRadius: 99,
                  }}>Tidak Tersedia</span>
                )}
                <div style={{
                  width: 70, height: 90, borderRadius: 8,
                  background: book.stock === 0 ? "#e5e7eb" : bookColors[i % bookColors.length],
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}>
                  <span style={{ fontSize: 28 }}>📖</span>
                </div>
              </div>

              {/* Info */}
              <div style={{ padding: "14px 16px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
                <p style={{ margin: "0 0 2px", fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>{book.title}</p>
                <p style={{ margin: "0 0 6px", fontSize: 12.5, color: "#888" }}>{book.author}</p>
                <Stars count={4} />
                {book.publisher && (
                  <p style={{ margin: "6px 0 0", fontSize: 11.5, color: "#bbb" }}>{book.publisher} · {book.publication_year}</p>
                )}
                <div style={{ marginTop: "auto", paddingTop: 12 }}>
                  <button
                    onClick={() => handleBorrow(book)}
                    disabled={book.stock === 0 || borrowing === book.id || activeLoansCount >= 5}
                    style={{
                      width: "100%", padding: "9px", borderRadius: 10, border: "none",
                      fontSize: 13, fontWeight: 700, cursor: book.stock === 0 || activeLoansCount >= 5 ? "not-allowed" : "pointer",
                      background: book.stock === 0 ? "#f3f4f6" : "#6c47e8",
                      color: book.stock === 0 ? "#aaa" : "#fff",
                      opacity: borrowing === book.id ? 0.7 : 1,
                    }}
                  >
                    {borrowing === book.id ? "Memproses..." : book.stock === 0 ? "Tidak Tersedia" : "Pinjam Sekarang"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>
    </>
  );
}