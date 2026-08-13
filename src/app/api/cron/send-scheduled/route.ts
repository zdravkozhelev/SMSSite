import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { processMessageSend } from "@/lib/sms/send";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const due = await prisma.message.findMany({
    where: {
      status: "SCHEDULED",
      scheduledAt: { lte: new Date() },
    },
  });

  const results = [];
  for (const message of due) {
    try {
      const result = await processMessageSend(message.id);
      results.push({ messageId: message.id, ...result });
    } catch (err) {
      results.push({
        messageId: message.id,
        error: err instanceof Error ? err.message : "Unknown error",
      });
      await prisma.message.update({
        where: { id: message.id },
        data: { status: "FAILED" },
      });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
