import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { processMessageSend } from "@/lib/sms/send";
import { fillTemplate } from "@/lib/sms/template";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const rules = await prisma.reminderRule.findMany({
    where: { isActive: true },
  });

  const results: Array<{ contactId: string; messageId?: string; error?: string }> = [];

  for (const rule of rules) {
    const contacts = await prisma.contact.findMany({
      where: {
        group: { clientId: rule.clientId },
        inspectionDate: { not: null },
      },
    });

    for (const contact of contacts) {
      if (!contact.inspectionDate) continue;

      const alreadySentForThisDate =
        contact.reminderSentForDate?.getTime() === contact.inspectionDate.getTime();
      if (alreadySentForThisDate) continue;

      const reminderDueAt = new Date(contact.inspectionDate);
      reminderDueAt.setDate(reminderDueAt.getDate() - rule.daysBefore);
      if (now < reminderDueAt) continue;

      const message = await prisma.message.create({
        data: {
          clientId: rule.clientId,
          body: fillTemplate(rule.body, contact),
          status: "DRAFT",
          recipients: { create: [{ contactId: contact.id }] },
        },
      });

      try {
        await processMessageSend(message.id);
        await prisma.contact.update({
          where: { id: contact.id },
          data: { reminderSentForDate: contact.inspectionDate },
        });
        results.push({ contactId: contact.id, messageId: message.id });
      } catch (err) {
        results.push({
          contactId: contact.id,
          messageId: message.id,
          error: err instanceof Error ? err.message : "Unknown error",
        });
      }
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
