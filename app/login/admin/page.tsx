"use client";

import "./admin.css";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!username || !password) return setError("Username dan password wajib diisi.");
    setLoading(true);
    setError("");

    const { data, error: dbError } = await supabase
      .from("users")
      .select("id, full_name, role, password")
      .eq("username", username)
      .single();

    setLoading(false);

    if (dbError || !data) return setError("Username tidak ditemukan.");
    if (data.password !== password) return setError("Password salah.");
    if (data.role !== "admin") return setError("Akun ini bukan administrator.");

    localStorage.setItem("user_id", data.id);
    localStorage.setItem("user_role", data.role);
    localStorage.setItem("user_name", data.full_name);

    router.push("/admin/dashboard");
  };

  return (
    <div className="admin-login">

      {/* LEFT */}
      <div className="admin-left">

        <div className="logo">
          📚 <span>LibraryJesMay</span>
        </div>

        <div className="admin-info">

          <div className="shield-box">🔐</div>

          <h1>Area<br />Administrator</h1>

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
            <strong>Hanya untuk staf perpustakaan yang terdaftar</strong>
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

          <div className="admin-badge">Admin Only</div>

          <h2>Masuk sebagai Admin</h2>

          <p className="desc">Gunakan kredensial akun administrator Anda</p>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: 10, padding: "10px 14px", marginBottom: 16,
              fontSize: 13, color: "#dc2626", fontWeight: 500,
            }}>
              ⚠️ {error}
            </div>
          )}

          <div>

            <label>Username Administrator</label>

            <div className="input-box">
              <Mail size={18} />
              <input
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
            </div>

            <label>Password</label>

            <div className="input-box">
              <Lock size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div className="forgot">Lupa password?</div>

            <div className="remember">
              <input type="checkbox" />
              Ingat perangkat ini selama 30 hari
            </div>

            <button
              className="btn-login"
              onClick={handleLogin}
              disabled={loading}
              style={{ opacity: loading ? 0.7 : 1, cursor: loading ? "not-allowed" : "pointer" }}
            >
              {loading ? "Memverifikasi..." : "🔐 Masuk sebagai Admin"}
            </button>

            <div className="divider"><span>atau</span></div>

            <button className="btn-sso">🏛 Masuk dengan SSO Institusi</button>

            <div className="member-box">
              <strong>⚠ Bukan administrator?</strong>
              <p>
                Halaman ini hanya untuk staf perpustakaan.{" "}
                <Link href="/login">Masuk sebagai Anggota →</Link>
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}