import { prisma } from "@/lib/db";
import { getSmsProvider } from "@/lib/sms/provider";
import { getActiveSubscription } from "@/lib/subscription";

export class SmsLimitExceededError extends Error {
  constructor() {
    super("SMS limit exceeded for current billing period");
    this.name = "SmsLimitExceededError";
  }
}

/**
 * Sends (or re-sends pending recipients of) a message, enforcing the
 * client's active subscription SMS limit. Used both by "send now" and by
 * the scheduled-message cron job.
 */
export async function processMessageSend(messageId: string) {
  const message = await prisma.message.findUniqueOrThrow({
    where: { id: messageId },
    include: {
      recipients: { where: { status: "PENDING" }, include: { contact: true } },
      client: true,
    },
  });

  const subscription = await getActiveSubscription(message.client.id);
  if (!subscription) {
    throw new Error("Client has no active subscription");
  }

  const remaining = subscription.plan.smsLimit - subscription.smsUsed;
  if (remaining < message.recipients.length) {
    throw new SmsLimitExceededError();
  }

  await prisma.message.update({
    where: { id: messageId },
    data: { status: "SENDING" },
  });

  const provider = getSmsProvider();
  let sentCount = 0;
  let failedCount = 0;

  for (const recipient of message.recipients) {
    const result = await provider.sendSms(recipient.contact.phone, message.body);

    if (result.success) {
      sentCount++;
      await prisma.messageRecipient.update({
        where: { id: recipient.id },
        data: {
          status: "SENT",
          providerMessageId: result.providerMessageId,
          sentAt: new Date(),
        },
      });
    } else {
      failedCount++;
      await prisma.messageRecipient.update({
        where: { id: recipient.id },
        data: { status: "FAILED", error: result.error ?? "Unknown error" },
      });
    }
  }

  if (sentCount > 0) {
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { smsUsed: { increment: sentCount } },
    });
  }

  await prisma.message.update({
    where: { id: messageId },
    data: {
      status: failedCount > 0 && sentCount === 0 ? "FAILED" : "SENT",
      sentAt: new Date(),
    },
  });

  return { sentCount, failedCount };
}
