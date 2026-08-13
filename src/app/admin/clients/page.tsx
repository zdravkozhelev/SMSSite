import Link from "next/link";
import { prisma } from "@/lib/db";
import { getActiveSubscription } from "@/lib/subscription";

export default async function AdminClientsPage() {
  const clients = await prisma.client.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const clientsWithSub = await Promise.all(
    clients.map(async (client) => ({
      client,
      sub: await getActiveSubscription(client.id),
    }))
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Клиенти</h1>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50 text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Фирма</th>
              <th className="px-4 py-3 font-medium">Имейл</th>
              <th className="px-4 py-3 font-medium">Лимит</th>
              <th className="px-4 py-3 font-medium">Използвани SMS</th>
              <th className="px-4 py-3 font-medium">Статус</th>
            </tr>
          </thead>
          <tbody>
            {clientsWithSub.map(({ client, sub }) => {
              const atLimit = !!sub && sub.smsUsed >= sub.plan.smsLimit;
              return (
                <tr key={client.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/clients/${client.id}`}
                      className="font-medium text-brand hover:underline"
                    >
                      {client.companyName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{client.user.email}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {sub ? `${sub.plan.smsLimit.toLocaleString("bg-BG")} SMS` : "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {sub ? `${sub.smsUsed} / ${sub.plan.smsLimit}` : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1.5">
                      <span
                        className={
                          client.status === "active"
                            ? "rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700"
                            : "rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700"
                        }
                      >
                        {client.status === "active" ? "Активен" : "Спрян"}
                      </span>
                      {atLimit && (
                        <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">
                          Лимит достигнат
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
            {clients.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  Все още няма регистрирани клиенти.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
