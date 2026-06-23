"use client";

import "./login.css";
import Link from "next/link";
import { User, Lock, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .eq("password", password)
        .single();

      if (error || !data) {
        alert("Username atau password salah");
        return;
      }

      localStorage.setItem("userId", data.id);
      localStorage.setItem("role", data.role);
      localStorage.setItem("fullName", data.full_name);

      if (data.role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/anggota/dashboard");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">

      {/* LEFT */}
      <div className="login-left">

        <div className="login-form-wrapper">

          <Link href="/" className="back-link">
            <ArrowLeft size={18} />
            Kembali ke Beranda
          </Link>

          <div className="badge">
            Area Anggota
          </div>

          <h1>
            Selamat Datang! 👋
          </h1>

          <p className="subtitle">
            Masuk untuk mengakses perpustakaan digital Anda
          </p>

          <form
            className="login-form"
            onSubmit={handleLogin}
          >

            <label>ID Anggota / Email</label>

            <div className="input-group">
              <User size={18} />

              <input
                type="text"
                placeholder="Masukkan Username"
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value)
                }
                required
              />
            </div>

            <label>Password</label>

            <div className="input-group">
              <Lock size={18} />

              <input
                type="password"
                placeholder="••••••••••"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                required
              />

              <button type="button">
                Tampilkan
              </button>
            </div>

            <div className="forgot">
              Lupa password?
            </div>

            <div className="remember">
              <input type="checkbox" />
              <span>Tetap masuk di perangkat ini</span>
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading
                ? "Memproses..."
                : "Masuk ke Perpustakaan"}
            </button>

            <div className="divider">
              <span>atau</span>
            </div>

            <button
              type="button"
              className="btn-google"
            >
              🌐 Lanjutkan dengan Google
            </button>

            <p className="register">
              Belum punya akun?
              <span> Daftar Sekarang →</span>
            </p>

            <button
              type="button"
              className="btn-admin"
            >
              📚 Masuk sebagai Admin →
            </button>

          </form>
        </div>
      </div>

      {/* RIGHT */}
      <div className="login-right">

        <div className="logo">
          📚 <span>LibraryJesMay</span>
        </div>

        <div className="hero-content">

          <div className="book-icon">
            📖
          </div>

          <h2>
            Dunia Buku
            <br />
            Ada di Sini
          </h2>

          <p>
            Akses ribuan koleksi buku, kelola peminjaman,
            dan pantau riwayat membaca dalam satu tempat.
          </p>

          <div className="features">

            <div className="feature-card">
              <h3>2,847+</h3>
              <span>Koleksi Buku</span>
            </div>

            <div className="feature-card">
              <h3>Gratis</h3>
              <span>Untuk Anggota</span>
            </div>

            <div className="feature-card">
              <h3>Online</h3>
              <span>Akses 24 Jam</span>
            </div>

            <div className="feature-card">
              <h3>Cepat</h3>
              <span>Pinjam Mudah</span>
            </div>

          </div>

          <div className="testimonial">

            <p>
              "LibraryMS bikin saya makin rajin baca.
              Tinggal klik, buku langsung bisa dipinjam!"
            </p>

            <div className="user">
              <div className="avatar">
                A
              </div>

              <div>
                <strong>Andi Pratama</strong>
                <p>Anggota Aktif ⭐⭐⭐⭐⭐</p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}