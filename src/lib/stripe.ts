import Stripe from "stripe";

export function isStripeConfigured() {
  return (
    !!process.env.STRIPE_SECRET_KEY &&
    !process.env.STRIPE_SECRET_KEY.includes("placeholder")
  );
}

export const stripe = isStripeConfigured()
  ? new Stripe(process.env.STRIPE_SECRET_KEY as string)
  : null;
