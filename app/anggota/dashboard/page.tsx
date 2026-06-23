"use client";

import { useEffect, useState } from "react";
import { BookOpen, Clock3, Library } from "lucide-react";
import { getDashboardData } from "@/lib/dashboard";

export default function DashboardAnggota() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const userId = localStorage.getItem("userId");

      if (!userId) return;

      const result = await getDashboardData(userId);

      setData(result);
      setLoading(false);
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="p-10">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-[#F5F4FB] min-h-screen p-8">
      {/* HERO */}

      <div className="bg-gradient-to-r from-purple-500 to-purple-400 rounded-3xl p-8 text-white flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">
            Halo 👋
          </h1>

          <p className="mt-2 opacity-90">
            Selamat datang di perpustakaan digital
          </p>
        </div>

        <div className="text-7xl">
          📚
        </div>
      </div>

      {/* STAT CARD */}

      <div className="grid md:grid-cols-3 gap-6 mt-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <Library className="text-purple-500" />

          <h2 className="text-5xl font-bold mt-4">
            {data.totalBooks}
          </h2>

          <p className="text-gray-500">
            Koleksi Buku
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <BookOpen className="text-purple-500" />

          <h2 className="text-5xl font-bold mt-4">
            {data.borrowedCount}
          </h2>

          <p className="text-gray-500">
            Sedang Dipinjam
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <Clock3 className="text-orange-500" />

          <h2 className="text-2xl font-bold mt-4">
            {data.nearestDue
              ? data.nearestDue.due_date
              : "-"}
          </h2>

          <p className="text-gray-500">
            Tenggat Terdekat
          </p>
        </div>
      </div>

      {/* REKOMENDASI */}

      <h2 className="font-bold text-2xl mt-10 mb-5">
        Rekomendasi Buku
      </h2>

      <div className="grid md:grid-cols-3 gap-5">
        {data.books?.map((book: any) => (
          <div
            key={book.id}
            className="bg-white rounded-2xl p-5 shadow-sm"
          >
            <div className="h-32 bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl"></div>

            <h3 className="font-bold mt-4">
              {book.title}
            </h3>

            <p className="text-gray-500">
              {book.author}
            </p>

            <button className="mt-4 bg-purple-500 text-white px-4 py-2 rounded-lg">
              Detail
            </button>
          </div>
        ))}
      </div>

      {/* PINJAMAN AKTIF */}

      <h2 className="font-bold text-2xl mt-10 mb-5">
        Sedang Dipinjam
      </h2>

      <div className="bg-white rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-4 text-left">
                Tanggal Pinjam
              </th>

              <th className="p-4 text-left">
                Jatuh Tempo
              </th>

              <th className="p-4 text-left">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {data.activeLoans?.map((loan: any) => (
              <tr key={loan.id}>
                <td className="p-4">
                  {loan.loan_date}
                </td>

                <td className="p-4">
                  {loan.due_date}
                </td>

                <td className="p-4">
                  <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                    {loan.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}