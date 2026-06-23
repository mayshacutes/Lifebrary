"use client";
import "./admin.css";
import Link from "next/link";
import { ArrowLeft, Mail, Lock, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  return (
    <div className="admin-login">

      {/* LEFT */}
      <div className="admin-left">

        <div className="logo">
          📚 <span>LibraryJesMay</span>
        </div>

        <div className="admin-info">

          <div className="shield-box">
            🔐
          </div>

          <h1>
            Area
            <br />
            Administrator
          </h1>

          <p>
            Akses khusus untuk pustakawan dan pengelola perpustakaan.
            Kelola seluruh sistem dari satu panel terpadu.
          </p>

          <ul>
            <li>✓ Manajemen buku & koleksi lengkap</li>
            <li>✓ Kelola anggota & peminjaman</li>
            <li>✓ Laporan analitik real-time</li>
            <li>✓ Kontrol penuh atas sistem</li>
          </ul>

          <div className="access-box">
            <span>Akses terbatas</span>
            <strong>
              Hanya untuk staf perpustakaan yang terdaftar
            </strong>
          </div>

        </div>
      </div>

      {/* RIGHT */}
      <div className="admin-right">

        <div className="form-wrapper">

          <Link href="/" className="back-link">
            <ArrowLeft size={16} />
            Kembali ke Beranda
          </Link>

          <div className="admin-badge">
            Admin Only
          </div>

          <h2>Masuk sebagai Admin</h2>

          <p className="desc">
            Gunakan kredensial akun administrator Anda
          </p>

          <form>

            <label>Email Administrator</label>

            <div className="input-box">
              <Mail size={18} />
              <input
                type="email"
                placeholder="admin@libraryjesmay.id"
              />
            </div>

            <label>Password</label>

            <div className="input-box">
              <Lock size={18} />
              <input
                type="password"
                placeholder="••••••••••"
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
              Ingat perangkat ini selama 30 hari
            </div>

            <button className="btn-login">
              🔐 Masuk sebagai Admin
            </button>

            <div className="divider">
              <span>atau</span>
            </div>

            <button className="btn-sso">
              🏛 Masuk dengan SSO Institusi
            </button>

            <div className="member-box">
              <strong>⚠ Bukan administrator?</strong>

              <p>
                Halaman ini hanya untuk staf perpustakaan.
                <Link href="/login">
                  Masuk sebagai Anggota →
                </Link>
              </p>
            </div>

          </form>

        </div>

      </div>

    </div>
  );
}