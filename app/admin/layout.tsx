import SidebarAdmin from "@/components/layout/SidebarAdmin";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#F4F1FF",
      }}
    >
      <SidebarAdmin />

      <div
        style={{
          flex: 1,
        }}
      >
        {children}
      </div>
    </div>
  );
}