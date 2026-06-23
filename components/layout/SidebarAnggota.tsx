"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  BookCheck,
  Clock,
  User,
  LogOut,
} from "lucide-react";

interface SidebarAnggotaProps {
  user?: {
    name: string;
    email: string;
    memberId: string;
  };
}

export default function SidebarAnggota({
  user,
}: SidebarAnggotaProps) {
  const pathname = usePathname();

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/anggota/dashboard",
    },
    {
      label: "Katalog Buku",
      icon: BookOpen,
      href: "/anggota/katalog",
    },
    {
      label: "Peminjaman Saya",
      icon: BookCheck,
      href: "/anggota/peminjaman",
    },
    {
      label: "Riwayat Peminjaman",
      icon: Clock,
      href: "/anggota/riwayat",
    },
    {
      label: "Profil",
      icon: User,
      href: "/anggota/profil",
    },
  ];

  const isActive = (href: string) => {
    return pathname === href;
  };

  return (
    <aside
      className="
        w-[300px]
        h-screen
        sticky
        top-0
        bg-gradient-to-b
        from-[#7B61FF]
        to-[#8B73FF]
        flex
        flex-col
        text-white
        shadow-xl
      "
    >
      {/* LOGO */}
      <div className="px-8 py-8">
        <div className="flex items-center gap-4">
          <div
            className="
              w-14
              h-14
              rounded-2xl
              bg-[#D7E73F]
              flex
              items-center
              justify-center
              text-2xl
              shadow-lg
            "
          >
            📚
          </div>

          <div>
            <h1 className="text-xl font-extrabold">
              Library
              <span className="text-[#D7E73F]">
                JesMay
              </span>
            </h1>

            <p className="text-white/60 text-sm">
              Perpustakaan Digital
            </p>
          </div>
        </div>
      </div>

      {/* USER */}
      <div className="px-6 pb-6">
        <div className="bg-white/10 rounded-3xl p-4">
          <div className="flex items-center gap-3">
            <div
              className="
                w-12
                h-12
                rounded-full
                bg-white/20
                flex
                items-center
                justify-center
                text-lg
                font-bold
              "
            >
              {user?.name?.charAt(0) || "A"}
            </div>

            <div>
              <h3 className="font-semibold">
                {user?.name || "Anggota"}
              </h3>

              <p className="text-xs text-white/70">
                {user?.email || "anggota@email.com"}
              </p>

              <p className="text-xs text-[#D7E73F] mt-1">
                {user?.memberId || "LIB-2026-0001"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MENU */}
      <nav className="flex-1 px-4">
        <ul className="space-y-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`
                    flex
                    items-center
                    justify-between
                    px-5
                    h-[58px]
                    rounded-2xl
                    transition-all
                    duration-200
                    ${
                      active
                        ? "bg-white/15 text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    <Icon
                      size={20}
                      className={
                        active
                          ? "text-[#D7E73F]"
                          : "text-white/70"
                      }
                    />

                    <span className="font-medium">
                      {item.label}
                    </span>
                  </div>

                  {active && (
                    <div
                      className="
                        w-2.5
                        h-2.5
                        rounded-full
                        bg-[#D7E73F]
                      "
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* FOOTER */}
      <div className="p-6 border-t border-white/10">
        <Link
          href="/login"
          className="
            flex
            items-center
            gap-3
            text-[#D7E73F]
            font-semibold
            hover:opacity-80
            transition
          "
        >
          <LogOut size={18} />

          Logout
        </Link>
      </div>
    </aside>
  );
}