import Link from "next/link";
import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link href="/" className="text-xl font-bold text-slate-900">
          Together<span className="text-brand">SMS</span>
        </Link>
        <h1 className="mt-6 text-2xl font-semibold text-slate-900">
          Регистрация
        </h1>

        <RegisterForm />
      </div>
    </div>
  );
}
