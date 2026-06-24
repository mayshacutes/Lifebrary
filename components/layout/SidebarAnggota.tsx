"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, BookOpen, BookMarked, History, User, LogOut,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/anggota/dashboard", icon: LayoutDashboard },
  { label: "Katalog Buku", href: "/anggota/katalog", icon: BookOpen },
  { label: "Peminjaman Saya", href: "/anggota/peminjaman", icon: BookMarked },
  { label: "Riwayat Peminjaman", href: "/anggota/riwayat", icon: History },
  { label: "Profil", href: "/anggota/profil", icon: User },
];

export default function SidebarAnggota() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: 220, minHeight: "100vh", background: "#6c47e8",
      display: "flex", flexDirection: "column", position: "fixed",
      left: 0, top: 0, bottom: 0, zIndex: 50,
    }}>
      {/* Brand */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "24px 20px 20px", borderBottom: "1px solid rgba(255,255,255,0.12)",
        marginBottom: 8,
      }}>
        <div style={{
          width: 36, height: 36, background: "#d4ef3b", borderRadius: 10,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <BookOpen size={20} color="#1a1a2e" />
        </div>
        <div>
          <div>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>Library</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: "#d4ef3b" }}>JesMay</span>
          </div>
          <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.3 }}>
            Perpustakaan Digital
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2, padding: "8px 12px" }}>
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link key={href} href={href} style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "10px 12px", borderRadius: 10, textDecoration: "none",
              color: isActive ? "#fff" : "rgba(255,255,255,0.65)",
              background: isActive ? "rgba(255,255,255,0.18)" : "transparent",
              fontWeight: isActive ? 600 : 500, fontSize: 13.5,
              transition: "background 0.15s",
            }}>
              <Icon size={18} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>{label}</span>
              {isActive && (
                <span style={{ width: 6, height: 6, background: "#d4ef3b", borderRadius: "50%" }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: 12, borderTop: "1px solid rgba(255,255,255,0.12)" }}>
        <Link href="/login" style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 12px", borderRadius: 10, textDecoration: "none",
          color: "rgba(255,255,255,0.5)", fontSize: 13.5, fontWeight: 500,
        }}>
          <LogOut size={18} />
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
}