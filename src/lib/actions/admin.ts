"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
}

async function getOrCreateCustomPlan(clientId: string, smsLimit: number) {
  const name = `Custom (${clientId})`;
  const existing = await prisma.plan.findFirst({ where: { name } });
  if (existing) {
    return prisma.plan.update({ where: { id: existing.id }, data: { smsLimit } });
  }
  return prisma.plan.create({
    data: { name, smsLimit, priceCents: 0, isActive: false },
  });
}

export async function updateClientLimit(clientId: string, formData: FormData) {
  await requireAdmin();
  const smsLimit = z.coerce.number().int().nonnegative().parse(formData.get("smsLimit"));

  const plan = await getOrCreateCustomPlan(clientId, smsLimit);

  const subscription = await prisma.subscription.findFirst({
    where: { clientId, status: "ACTIVE" },
    orderBy: { currentPeriodEnd: "desc" },
  });

  if (subscription) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { planId: plan.id },
    });
  } else {
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    await prisma.subscription.create({
      data: {
        clientId,
        planId: plan.id,
        status: "ACTIVE",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      },
    });
  }

  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin/clients");
}

export async function suspendClient(clientId: string, status: "active" | "suspended") {
  await requireAdmin();
  await prisma.client.update({ where: { id: clientId }, data: { status } });
  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath("/admin/clients");
}
