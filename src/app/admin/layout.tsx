import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";

const navItems = [
  { href: "/admin", label: "Табло" },
  { href: "/admin/clients", label: "Клиенти" },
  { href: "/admin/settings", label: "Настройки" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <DashboardShell
      title="Админ панел"
      navItems={navItems}
      userLabel={session?.user?.email ?? ""}
    >
      {children}
    </DashboardShell>
  );
}
