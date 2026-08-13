import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="border-b border-slate-100">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold text-slate-900">
          Together<span className="text-brand">SMS</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/#use-cases" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            За кого е
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Цени
          </Link>
          <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900">
            Вход
          </Link>
          <Link href="/register">
            <Button>Регистрация</Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
