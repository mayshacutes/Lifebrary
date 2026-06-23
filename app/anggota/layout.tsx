import SidebarMember from "@/components/layout/SidebarAnggota";

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex bg-gray-100 min-h-screen">
      <SidebarMember />

      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}