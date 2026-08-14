import Link from "next/link";
import { prisma } from "@/lib/db";
import { ResetPasswordForm } from "./reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  const record = token
    ? await prisma.passwordResetToken.findUnique({ where: { token } })
    : null;
  const valid = !!record && record.expiresAt > new Date();

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <Link href="/" className="text-xl font-bold text-slate-900">
          Together<span className="text-brand">SMS</span>
        </Link>
        <h1 className="mt-6 text-2xl font-semibold text-slate-900">Нова парола</h1>

        {valid && token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            Линкът е невалиден или изтекъл. Заявете нов от страницата за вход.
          </p>
        )}

        <p className="mt-6 text-center text-sm text-slate-600">
          <Link href="/login" className="font-medium text-brand hover:underline">
            Обратно към вход
          </Link>
        </p>
      </div>
    </div>
  );
}
