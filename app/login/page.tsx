"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
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

    localStorage.setItem("user_id", data.id);
    localStorage.setItem("user_role", data.role);
    localStorage.setItem("user_name", data.full_name);

    if (data.role === "admin") router.push("/admin/dashboard");
    else router.push("/anggota/dashboard");
  };

  const features = [
    { icon: "📚", label: "2,847+", sub: "Koleksi Buku" },
    { icon: "🆓", label: "Gratis", sub: "Untuk Anggota" },
    { icon: "📱", label: "Online", sub: "Akses 24 Jam" },
    { icon: "🚀", label: "Cepat", sub: "Pinjam Mudah" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>

      {/* Left: Form */}
      <div style={{
        width: "50%", background: "#6c47e8",
        display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "48px 56px",
      }}>
        <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.6)", fontSize: 13, textDecoration: "none", marginBottom: 40 }}>
          ← Kembali ke Beranda
        </a>

        <h1 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 800, color: "#fff" }}>
          Selamat Datang! 👋
        </h1>
        <p style={{ margin: "0 0 36px", fontSize: 14, color: "rgba(255,255,255,0.65)" }}>
          Masuk untuk mengakses perpustakaan digital Anda
        </p>

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)",
            borderRadius: 10, padding: "10px 14px", marginBottom: 20,
            fontSize: 13, color: "#fca5a5", fontWeight: 500,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Username */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: 8 }}>
            Username
          </label>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.12)", borderRadius: 12,
            padding: "12px 16px", border: "1px solid rgba(255,255,255,0.2)",
          }}>
            <span style={{ fontSize: 16 }}>👤</span>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="Masukkan username"
              style={{
                border: "none", outline: "none", background: "transparent",
                fontSize: 13.5, color: "#fff", flex: 1,
              }}
            />
          </div>
        </div>

        {/* Password */}
        <div style={{ marginBottom: 10 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: 8 }}>
            Password
          </label>
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            background: "rgba(255,255,255,0.12)", borderRadius: 12,
            padding: "12px 16px", border: "1px solid rgba(255,255,255,0.2)",
          }}>
            <span style={{ fontSize: 16 }}>🔒</span>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="Masukkan password"
              style={{
                border: "none", outline: "none", background: "transparent",
                fontSize: 13.5, color: "#fff", flex: 1,
              }}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center" }}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Remember + Forgot */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={remember}
              onChange={e => setRemember(e.target.checked)}
              style={{ width: 15, height: 15, accentColor: "#d4ef3b", cursor: "pointer" }}
            />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.65)" }}>Tetap masuk di perangkat ini</span>
          </label>
          <a href="#" style={{ fontSize: 13, color: "#d4ef3b", textDecoration: "none", fontWeight: 600 }}>
            Lupa password?
          </a>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "14px", borderRadius: 12, border: "none",
            background: "#d4ef3b", color: "#1a1a2e",
            fontSize: 15, fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.8 : 1,
            marginBottom: 16, letterSpacing: 0.2,
          }}
        >
          {loading ? "Memverifikasi..." : "Masuk ke Perpustakaan"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.15)" }} />
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>atau</span>
          <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.15)" }} />
        </div>

        {/* Register */}
        <p style={{ textAlign: "center", fontSize: 13.5, color: "rgba(255,255,255,0.6)", margin: "0 0 16px" }}>
          Belum punya akun?{" "}
          <a href="#" style={{ color: "#d4ef3b", fontWeight: 700, textDecoration: "none" }}>
            Daftar Sekarang
          </a>
        </p>

        {/* Admin Login hint */}
        <div style={{
          background: "rgba(255,255,255,0.08)", borderRadius: 10,
          padding: "10px 16px", textAlign: "center",
        }}>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>Pustakawan? </span>
          <span
            onClick={() => router.push("/login/admin")}
            style={{ color: "rgba(255,255,255,0.8)", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
          >
            🔐 Masuk sebagai Admin
          </span>
        </div>
      </div>{/* ← penutup div Left Form */}

      {/* Right: Branding */}
      <div style={{
        width: "50%", background: "#d4ef3b",
        display: "flex", flexDirection: "column",
        justifyContent: "center", padding: "48px 56px",
        position: "relative", overflow: "hidden",
      }}>
        <div style={{ position: "absolute", top: -60, right: -60, width: 220, height: 220, borderRadius: "50%", background: "rgba(108,71,232,0.08)" }} />
        <div style={{ position: "absolute", bottom: -80, left: -40, width: 300, height: 300, borderRadius: "50%", background: "rgba(108,71,232,0.06)" }} />

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 40 }}>
          <div style={{ width: 44, height: 44, background: "#6c47e8", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 22 }}>📚</span>
          </div>
          <div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#1a1a2e" }}>Library</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#6c47e8" }}>JesMay</span>
          </div>
        </div>

        {/* Headline */}
        <div style={{
          background: "#fff", borderRadius: 20, padding: "28px 28px 24px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)", marginBottom: 24, position: "relative", zIndex: 1,
        }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
          <h2 style={{ margin: "0 0 10px", fontSize: 26, fontWeight: 800, color: "#1a1a2e", lineHeight: 1.2 }}>
            Dunia Buku<br />Ada di Sini
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: "#666", lineHeight: 1.6 }}>
            Akses ribuan koleksi buku, kelola peminjaman, dan pantau riwayat membacamu dalam satu tempat.
          </p>
        </div>

        {/* Feature Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, position: "relative", zIndex: 1 }}>
          {features.map(({ icon, label, sub }) => (
            <div key={label} style={{
              background: "rgba(255,255,255,0.7)", borderRadius: 14, padding: "14px 16px",
              backdropFilter: "blur(4px)",
            }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <p style={{ margin: "6px 0 2px", fontSize: 15, fontWeight: 800, color: "#1a1a2e" }}>{label}</p>
              <p style={{ margin: 0, fontSize: 12, color: "#666" }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div style={{
          marginTop: 20, background: "rgba(255,255,255,0.7)", borderRadius: 14,
          padding: "14px 16px", position: "relative", zIndex: 1,
        }}>
          <p style={{ margin: "0 0 10px", fontSize: 13, color: "#444", fontStyle: "italic", lineHeight: 1.5 }}>
            "LibraryJesMay bikin saya makin rajin baca. Tinggal klik, buku langsung bisa dipinjam!"
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#6c47e8", color: "#fff", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>A</div>
            <div>
              <p style={{ margin: 0, fontSize: 12.5, fontWeight: 700, color: "#1a1a2e" }}>Andi Pratama</p>
              <p style={{ margin: 0, fontSize: 11, color: "#888" }}>Anggota Aktif · ⭐⭐⭐⭐⭐</p>
            </div>
          </div>
        </div>
      </div>{/* ← penutup div Right Branding */}

    </div>
  );
}