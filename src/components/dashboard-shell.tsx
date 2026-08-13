import Link from "next/link";
import { SignOutButton } from "@/components/sign-out-button";

type NavItem = { href: string; label: string };

export function DashboardShell({
  title,
  navItems,
  userLabel,
  children,
}: {
  title: string;
  navItems: NavItem[];
  userLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-64 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-100 px-6 py-5">
          <Link href="/" className="text-lg font-bold text-slate-900">
            Together<span className="text-brand">SMS</span>
          </Link>
          <p className="mt-1 text-xs font-medium uppercase tracking-wide text-slate-400">
            {title}
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-100 px-4 py-4">
          <p className="truncate text-xs text-slate-500">{userLabel}</p>
          <SignOutButton />
        </div>
      </aside>
      <main className="flex-1 px-8 py-8">{children}</main>
    </div>
  );
}
