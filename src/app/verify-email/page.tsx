import Link from "next/link";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";

async function verifyToken(token: string | undefined) {
  if (!token) return { ok: false, message: "Липсва токен за потвърждение." };

  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record) {
    return { ok: false, message: "Невалиден или вече използван линк." };
  }

  if (record.expiresAt < new Date()) {
    await prisma.verificationToken.delete({ where: { id: record.id } });
    return { ok: false, message: "Линкът е изтекъл. Заявете нов от страницата за вход." };
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: { emailVerified: new Date() },
  });
  await prisma.verificationToken.deleteMany({ where: { userId: record.userId } });

  return { ok: true, message: "Имейлът е потвърден успешно! Вече можете да влезете." };
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const result = await verifyToken(token);

  return (
    <div className="flex min-h-screen flex-1 items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <Link href="/" className="text-xl font-bold text-slate-900">
          Together<span className="text-brand">SMS</span>
        </Link>

        <p
          className={`mt-6 text-sm ${result.ok ? "text-green-700" : "text-red-600"}`}
        >
          {result.message}
        </p>

        <Link href="/login" className="mt-6 block">
          <Button className="w-full">Към вход</Button>
        </Link>
      </div>
    </div>
  );
}
