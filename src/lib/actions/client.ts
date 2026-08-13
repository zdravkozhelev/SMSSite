"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { processMessageSend, SmsLimitExceededError } from "@/lib/sms/send";
import { fillTemplate } from "@/lib/sms/template";

export async function requireClient() {
  const session = await auth();
  if (session?.user?.role !== "CLIENT") {
    throw new Error("Forbidden");
  }
  const client = await prisma.client.findUnique({
    where: { userId: session.user.id },
  });
  if (!client) throw new Error("Client not found");
  return client;
}

async function getOrCreateDefaultGroup(clientId: string) {
  const existing = await prisma.contactGroup.findFirst({
    where: { clientId },
    orderBy: { createdAt: "asc" },
  });
  if (existing) return existing;

  return prisma.contactGroup.create({
    data: { clientId, name: "Клиенти" },
  });
}

export async function addContact(formData: FormData) {
  const client = await requireClient();
  const phone = z.string().min(5).parse(formData.get("phone"));
  const name = (formData.get("name") as string) || null;
  const carPlate = (formData.get("carPlate") as string) || null;
  const inspectionDateRaw = formData.get("inspectionDate") as string;
  const inspectionDate = inspectionDateRaw ? new Date(inspectionDateRaw) : null;

  const group = await getOrCreateDefaultGroup(client.id);

  const contact = await prisma.contact.create({
    data: { groupId: group.id, phone, name, carPlate, inspectionDate },
  });
  revalidatePath("/dashboard/contacts");

  const sendWelcome = formData.get("sendWelcome") === "on";
  const welcomeMessage = (formData.get("welcomeMessage") as string)?.trim();

  if (sendWelcome && welcomeMessage) {
    const message = await prisma.message.create({
      data: {
        clientId: client.id,
        groupId: group.id,
        body: fillTemplate(welcomeMessage, contact),
        status: "DRAFT",
        recipients: { create: [{ contactId: contact.id }] },
      },
    });

    try {
      const result = await processMessageSend(message.id);
      revalidatePath("/dashboard/add-client");

      if (result.sentCount === 0) {
        return {
          error: "Контактът е добавен, но съобщението не бе изпратено (грешка от доставчика).",
        };
      }
      return { success: "Контактът е добавен и съобщението е изпратено." };
    } catch (err) {
      return {
        error:
          err instanceof SmsLimitExceededError
            ? "Контактът е добавен, но е достигнат лимитът SMS — съобщението не бе изпратено."
            : "Контактът е добавен, но възникна грешка при изпращане на съобщението.",
      };
    }
  }

  return { success: "Контактът е добавен." };
}

export async function editContact(contactId: string, formData: FormData) {
  const client = await requireClient();
  const phone = z.string().min(5).parse(formData.get("phone"));
  const name = (formData.get("name") as string) || null;
  const carPlate = (formData.get("carPlate") as string) || null;
  const inspectionDateRaw = formData.get("inspectionDate") as string;
  const inspectionDate = inspectionDateRaw ? new Date(inspectionDateRaw) : null;

  const contact = await prisma.contact.findFirst({
    where: { id: contactId, group: { clientId: client.id } },
  });
  if (!contact) throw new Error("Contact not found");

  const dateChanged =
    inspectionDate?.getTime() !== contact.inspectionDate?.getTime();

  await prisma.contact.update({
    where: { id: contactId },
    data: {
      phone,
      name,
      carPlate,
      inspectionDate,
      // A new/changed inspection date starts a fresh reminder cycle.
      reminderSentForDate: dateChanged ? null : contact.reminderSentForDate,
    },
  });
  revalidatePath("/dashboard/contacts");
}

export async function deleteContact(contactId: string) {
  const client = await requireClient();
  await prisma.contact.deleteMany({
    where: { id: contactId, group: { clientId: client.id } },
  });
  revalidatePath("/dashboard/contacts");
}

const reminderRuleSchema = z.object({
  body: z.string().min(1).max(918),
  daysBefore: z.coerce.number().int().min(1).max(90),
  isActive: z.boolean(),
});

export async function updateReminderRule(formData: FormData) {
  const client = await requireClient();

  const parsed = reminderRuleSchema.parse({
    body: formData.get("body"),
    daysBefore: formData.get("daysBefore"),
    isActive: formData.get("isActive") === "on",
  });

  await prisma.reminderRule.upsert({
    where: { clientId: client.id },
    create: { clientId: client.id, ...parsed },
    update: parsed,
  });

  revalidatePath("/dashboard/add-client");
  return { success: "Настройките за напомняне са запазени." };
}
