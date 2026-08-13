import { prisma } from "@/lib/db";

export default async function AdminDashboard() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [clientCount, smsSentThisMonth, activeSubscriptions] = await Promise.all([
    prisma.client.count(),
    prisma.messageRecipient.count({
      where: { status: "SENT", sentAt: { gte: startOfMonth } },
    }),
    prisma.subscription.findMany({
      where: { status: "ACTIVE" },
      include: { plan: true },
    }),
  ]);

  const atLimitCount = activeSubscriptions.filter(
    (s) => s.smsUsed >= s.plan.smsLimit
  ).length;

  const stats = [
    { label: "Клиенти", value: clientCount.toLocaleString("bg-BG") },
    { label: "SMS изпратени този месец", value: smsSentThisMonth.toLocaleString("bg-BG") },
    { label: "Клиенти с активен лимит", value: activeSubscriptions.length.toLocaleString("bg-BG") },
    { label: "Клиенти на лимит", value: atLimitCount.toLocaleString("bg-BG") },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Табло</h1>
      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-6">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
