import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }

  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const clientId = session.metadata?.clientId;
      const planId = session.metadata?.planId;
      if (clientId && planId && session.subscription) {
        const stripeSub = await stripe.subscriptions.retrieve(
          session.subscription as string
        );
        await prisma.subscription.create({
          data: {
            clientId,
            planId,
            stripeSubscriptionId: stripeSub.id,
            status: "ACTIVE",
            currentPeriodStart: new Date(stripeSub.items.data[0].current_period_start * 1000),
            currentPeriodEnd: new Date(stripeSub.items.data[0].current_period_end * 1000),
          },
        });
      }
      break;
    }
    case "invoice.paid": {
      const invoice = event.data.object as Stripe.Invoice & {
        subscription?: string | null;
      };
      const subId = invoice.subscription;
      if (subId) {
        const existing = await prisma.subscription.findUnique({
          where: { stripeSubscriptionId: subId as string },
        });
        if (existing) {
          const stripeSub = await stripe.subscriptions.retrieve(subId as string);
          await prisma.subscription.update({
            where: { id: existing.id },
            data: {
              status: "ACTIVE",
              smsUsed: 0,
              currentPeriodStart: new Date(stripeSub.items.data[0].current_period_start * 1000),
              currentPeriodEnd: new Date(stripeSub.items.data[0].current_period_end * 1000),
            },
          });
        }
      }
      break;
    }
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const existing = await prisma.subscription.findUnique({
        where: { stripeSubscriptionId: sub.id },
      });
      if (existing) {
        await prisma.subscription.update({
          where: { id: existing.id },
          data: { status: "CANCELED" },
        });
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
