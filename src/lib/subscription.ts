import { prisma } from "@/lib/db";
import type { Plan, Subscription } from "@/generated/prisma/client";

type SubscriptionWithPlan = Subscription & { plan: Plan };

/**
 * If the subscription's billing period has passed, resets usage and rolls
 * the period forward by a month. Called lazily wherever a subscription is
 * read, since there is no guaranteed external cron running in this setup.
 */
async function renewIfExpired(
  subscription: SubscriptionWithPlan
): Promise<SubscriptionWithPlan> {
  if (subscription.currentPeriodEnd > new Date()) {
    return subscription;
  }

  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  return prisma.subscription.update({
    where: { id: subscription.id },
    data: { smsUsed: 0, currentPeriodStart: now, currentPeriodEnd: periodEnd },
    include: { plan: true },
  });
}

export async function getActiveSubscription(
  clientId: string
): Promise<SubscriptionWithPlan | null> {
  const subscription = await prisma.subscription.findFirst({
    where: { clientId, status: "ACTIVE" },
    orderBy: { currentPeriodEnd: "desc" },
    include: { plan: true },
  });

  if (!subscription) return null;
  return renewIfExpired(subscription);
}
