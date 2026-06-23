"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BookCheck,
  FileBarChart,
  LogOut,
} from "lucide-react";

interface SidebarAdminProps {
  user?: {
    name: string;
    role: string;
  };
}

export default function SidebarAdmin({ user }: SidebarAdminProps) {
  const pathname = usePathname();

  const menus = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Manajemen Buku",
      href: "/admin/buku",
      icon: BookOpen,
    },
    {
      name: "Manajemen Anggota",
      href: "/admin/anggota",
      icon: Users,
    },
    {
      name: "Peminjaman",
      href: "/admin/peminjaman",
      icon: BookCheck,
    },
    {
      name: "Laporan",
      href: "/admin/laporan",
      icon: FileBarChart,
    },
  ];

  return (
    <aside
      className="flex flex-col justify-between"
      style={{
        width: "280px",
        background: "#836CEC",
        minHeight: "100vh",
      }}
    >
      {/* TOP */}
      <div>
        {/* LOGO */}
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "42px",
                height: "42px",
                background: "#DFE94B",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              📚
            </div>

            <div>
              <h2
                style={{
                  color: "white",
                  fontSize: "18px",
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                Library
                <span style={{ color: "#DFE94B" }}>
                  JesMay
                </span>
              </h2>

              <p
                style={{
                  color: "#D8CCFF",
                  fontSize: "12px",
                  margin: 0,
                }}
              >
                Perpustakaan Digital
              </p>
            </div>
          </div>
        </div>

        {/* MENU */}
        <div style={{ padding: "20px 12px" }}>
          {menus.map((menu) => {
            const Icon = menu.icon;

            const active =
              pathname === menu.href ||
              pathname.startsWith(menu.href + "/");

            return (
              <Link
                key={menu.href}
                href={menu.href}
                style={{
                  textDecoration: "none",
                }}
              >
                <div
                  style={{
                    marginBottom: "8px",
                    padding: "14px 16px",
                    borderRadius: "14px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: active
                      ? "rgba(255,255,255,0.15)"
                      : "transparent",
                    transition: "0.2s",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <Icon
                      size={18}
                      color={
                        active ? "#DFE94B" : "#E9E3FF"
                      }
                    />

                    <span
                      style={{
                        color: active
                          ? "white"
                          : "#E9E3FF",
                        fontWeight: active ? 600 : 400,
                      }}
                    >
                      {menu.name}
                    </span>
                  </div>

                  {active && (
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: "#DFE94B",
                      }}
                    />
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* BOTTOM */}
      <div
        style={{
          padding: "24px",
          borderTop:
            "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Link
          href="/login"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            color: "#DFE94B",
            textDecoration: "none",
            fontWeight: 600,
          }}
        >
          <LogOut size={18} />
          Logout
        </Link>
      </div>
    </aside>
  );
}