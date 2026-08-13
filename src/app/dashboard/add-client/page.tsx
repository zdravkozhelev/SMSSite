import { requireClient } from "@/lib/actions/client";
import { prisma } from "@/lib/db";
import { getActiveSubscription } from "@/lib/subscription";
import { ReminderRuleForm } from "./reminder-rule-form";
import { AddContactForm } from "./add-contact-form";

export default async function AddClientPage() {
  const client = await requireClient();

  const [subscription, rule] = await Promise.all([
    getActiveSubscription(client.id),
    prisma.reminderRule.findUnique({ where: { clientId: client.id } }),
  ]);

  const remaining = subscription
    ? Math.max(subscription.plan.smsLimit - subscription.smsUsed, 0)
    : 0;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-semibold text-slate-900">Добави клиент</h1>

      {subscription && (
        <div
          className={`mt-6 rounded-xl border p-4 ${
            remaining === 0
              ? "border-red-200 bg-red-50"
              : "border-slate-200 bg-white"
          }`}
        >
          <p className="text-sm text-slate-600">
            Оставащи SMS:{" "}
            <span className="font-semibold text-slate-900">
              {remaining.toLocaleString("bg-BG")}
            </span>{" "}
            от {subscription.plan.smsLimit.toLocaleString("bg-BG")}
          </p>
          {remaining === 0 && (
            <p className="mt-1 text-sm text-red-700">
              Лимитът на съобщения е изчерпан. Свържете се с администратор за
              увеличаване на лимита.
            </p>
          )}
        </div>
      )}

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Автоматично напомняне</h2>
        <p className="mt-1 text-sm text-slate-600">
          Изпраща се автоматично преди датата на технически преглед на всеки клиент.
        </p>
        <div className="mt-4">
          <ReminderRuleForm rule={rule} />
        </div>
      </div>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-slate-900">Нов клиент</h2>
        <div className="mt-4">
          <AddContactForm />
        </div>
      </div>
    </div>
  );
}
