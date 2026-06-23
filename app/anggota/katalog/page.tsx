"use client";

import { useEffect, useState } from "react";
import { Search, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

interface Book {
  id: string;
  title: string;
  author: string;
  publisher: string | null;
  publication_year: number | null;
  stock: number;
  description: string | null;
  isbn: string | null;
}

export default function KatalogPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, []);

  useEffect(() => {
    const result = books.filter(
      (book) =>
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        book.author.toLowerCase().includes(search.toLowerCase()) ||
        (book.publisher && book.publisher.toLowerCase().includes(search.toLowerCase()))
    );
    setFilteredBooks(result);
  }, [search, books]);

  async function loadBooks() {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("title");

    if (!error && data) {
      setBooks(data);
      setFilteredBooks(data);
    }
    setLoading(false);
  }

  const backgroundColors = [
    "bg-purple-100",
    "bg-yellow-100", 
    "bg-pink-100",
    "bg-green-100",
    "bg-orange-100",
    "bg-blue-100"
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "#F8F8F8" }}>
        <div style={{ color: "#836CEC" }} className="text-lg font-semibold">Memuat data...</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#F8F8F8" }} className="min-h-screen p-6">
      {/* HEADER */}
      <div className="mb-6">
        <h1 style={{ color: "#1A1A1A" }} className="text-3xl font-bold">
          Katalog Buku
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Temukan buku yang ingin kamu baca
        </p>
      </div>

      {/* SEARCH */}
      <div 
        style={{ backgroundColor: "#FFFFFF" }}
        className="p-4 rounded-2xl shadow-sm mb-5"
      >
        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2"
            style={{ color: "#836CEC" }}
          />
          <input
            type="text"
            placeholder="Cari judul, penulis, atau penerbit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ borderColor: "#836CEC" }}
            className="
              w-full
              border-2
              rounded-xl
              py-3
              pl-12
              pr-4
              outline-none
              text-base
              focus:ring-2
              focus:ring-[#836CEC]
              focus:border-transparent
            "
          />
        </div>
      </div>

      {/* INFO */}
      <div className="mb-4 text-sm text-gray-500">
        Menampilkan{" "}
        <span style={{ color: "#1A1A1A" }} className="font-semibold">
          {filteredBooks.length}
        </span>{" "}
        buku
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBooks.map((book, index) => (
          <div
            key={book.id}
            style={{ backgroundColor: "#FFFFFF" }}
            className="
              rounded-2xl
              overflow-hidden
              shadow-sm
              hover:shadow-md
              transition-shadow
              duration-200
            "
          >
            {/* COVER */}
            <div
              className={`
                h-32
                flex
                items-center
                justify-center
                relative
                ${backgroundColors[index % backgroundColors.length]}
              `}
            >
              <span
                style={{ 
                  backgroundColor: "#FFFFFF",
                  color: "#836CEC" 
                }}
                className="
                  absolute
                  top-3
                  left-3
                  text-xs
                  px-3
                  py-1
                  rounded-full
                  font-medium
                "
              >
                {book.publisher || "Buku"}
              </span>

              <div
                style={{ 
                  background: "linear-gradient(to bottom, #836CEC, #6B4FE0)" 
                }}
                className="
                  w-14
                  h-20
                  rounded-lg
                  flex
                  items-center
                  justify-center
                  shadow-md
                "
              >
                <BookOpen
                  size={24}
                  style={{ color: "#FFFFFF" }}
                />
              </div>
            </div>

            {/* CONTENT */}
            <div className="p-4">
              <h3 style={{ color: "#1A1A1A" }} className="font-bold text-lg">
                {book.title}
              </h3>

              <p className="text-gray-500 text-sm mt-0.5">
                {book.author}
              </p>

              <div className="mt-2 text-xs text-gray-400">
                {book.publication_year ? `Tahun ${book.publication_year}` : "-"}
              </div>

              <div className="mt-3">
                {book.stock > 0 ? (
                  <>
                    <div className="text-green-600 text-sm font-medium mb-2">
                      Stok tersedia ({book.stock})
                    </div>
                    <button
                      style={{ backgroundColor: "#836CEC" }}
                      className="
                        w-full
                        hover:opacity-90
                        text-white
                        text-sm
                        font-medium
                        py-2.5
                        rounded-xl
                        transition-opacity
                        duration-200
                      "
                    >
                      Pinjam Sekarang
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-red-500 text-sm font-medium mb-2">
                      Tidak tersedia
                    </div>
                    <button
                      disabled
                      className="
                        w-full
                        bg-gray-200
                        text-gray-500
                        text-sm
                        font-medium
                        py-2.5
                        rounded-xl
                        cursor-not-allowed
                      "
                    >
                      Tidak Tersedia
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <BookOpen size={40} className="mx-auto mb-3 opacity-50" />
          <p className="text-base">Tidak ada buku yang ditemukan</p>
        </div>
      )}
    </div>
  );
}