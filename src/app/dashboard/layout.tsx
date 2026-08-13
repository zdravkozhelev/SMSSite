import { auth } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";

const navItems = [
  { href: "/dashboard/add-client", label: "Добави клиент" },
  { href: "/dashboard/contacts", label: "Списък с клиенти" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <DashboardShell
      title="Клиентски панел"
      navItems={navItems}
      userLabel={session?.user?.email ?? ""}
    >
      {children}
    </DashboardShell>
  );
}
