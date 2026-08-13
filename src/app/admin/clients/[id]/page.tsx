import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { suspendClient, updateClientLimit } from "@/lib/actions/admin";
import { getActiveSubscription } from "@/lib/subscription";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      user: true,
      messages: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: { recipients: true },
      },
    },
  });

  if (!client) notFound();

  const activeSub = await getActiveSubscription(client.id);
  const atLimit = !!activeSub && activeSub.smsUsed >= activeSub.plan.smsLimit;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">{client.companyName}</h1>
        <form action={suspendClient.bind(null, client.id, client.status === "active" ? "suspended" : "active")}>
          <Button type="submit" variant={client.status === "active" ? "danger" : "primary"}>
            {client.status === "active" ? "Спри акаунта" : "Активирай акаунта"}
          </Button>
        </form>
      </div>
      <p className="mt-1 text-sm text-slate-500">{client.user.email}</p>

      {atLimit && (
        <div className="mt-4 rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Клиентът е достигнал лимита си на съобщения — новите SMS няма да се
          изпращат, докато не увеличите лимита по-долу.
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Лимит на съобщения</p>
          <form
            action={updateClientLimit.bind(null, client.id)}
            className="mt-2 flex items-center gap-2"
          >
            <Input
              name="smsLimit"
              type="number"
              min={0}
              defaultValue={activeSub?.plan.smsLimit ?? 0}
              className="w-24"
            />
            <Button type="submit" variant="outline" className="px-3 py-2 text-sm">
              Запази
            </Button>
          </form>
          {!activeSub && (
            <p className="mt-2 text-xs text-slate-400">
              Клиентът все още няма зададен лимит.
            </p>
          )}
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Използвани SMS</p>
          <p className="mt-2 text-xl font-bold text-slate-900">
            {activeSub ? `${activeSub.smsUsed} / ${activeSub.plan.smsLimit}` : "—"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <p className="text-sm text-slate-500">Текущ период до</p>
          <p className="mt-2 text-xl font-bold text-slate-900">
            {activeSub ? activeSub.currentPeriodEnd.toLocaleDateString("bg-BG") : "—"}
          </p>
        </div>
      </div>

      <h2 className="mt-10 text-lg font-semibold text-slate-900">История на съобщенията</h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Съобщение</th>
              <th className="px-4 py-3 font-medium">Статус</th>
              <th className="px-4 py-3 font-medium">Получатели</th>
              <th className="px-4 py-3 font-medium">Дата</th>
            </tr>
          </thead>
          <tbody>
            {client.messages.map((m) => (
              <tr key={m.id} className="border-b border-slate-50 last:border-0">
                <td className="max-w-xs truncate px-4 py-3 text-slate-900">{m.body}</td>
                <td className="px-4 py-3 text-slate-600">{m.status}</td>
                <td className="px-4 py-3 text-slate-600">{m.recipients.length}</td>
                <td className="px-4 py-3 text-slate-600">
                  {(m.sentAt ?? m.scheduledAt ?? m.createdAt).toLocaleString("bg-BG")}
                </td>
              </tr>
            ))}
            {client.messages.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                  Няма изпратени съобщения.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
