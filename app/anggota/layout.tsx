import SidebarAnggota from "@/components/layout/SidebarAnggota";

export default function AnggotaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f4f4f8" }}>
      <SidebarAnggota />
      <div style={{ marginLeft: 220, flex: 1, display: "flex", flexDirection: "column" }}>
        {children}
      </div>
    </div>
  );
}