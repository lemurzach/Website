import Stripe from "stripe";

// Server-side Stripe client. Billing flows are built in Phase 9.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  typescript: true,
});
