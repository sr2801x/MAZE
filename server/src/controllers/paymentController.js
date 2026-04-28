const { z } = require("zod");
const { asyncHandler } = require("../utils/asyncHandler");
const { AppError } = require("../utils/appError");
const { getStripe, getPricingCatalog } = require("../services/stripe");
const { Transaction } = require("../models/Transaction");
const { User } = require("../models/User");

const createCheckoutSchema = z.object({
  packId: z.string().min(1),
});

const createCheckout = asyncHandler(async (req, res) => {
  const parsed = createCheckoutSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid pack", 400);

  const catalog = getPricingCatalog();
  const pack = catalog.find((p) => p.id === parsed.data.packId);
  if (!pack) throw new AppError("Unknown pack", 400);

  const stripe = getStripe();

  const successUrl = process.env.STRIPE_SUCCESS_URL;
  const cancelUrl = process.env.STRIPE_CANCEL_URL;
  if (!successUrl || !cancelUrl) throw new Error("Missing STRIPE_SUCCESS_URL / STRIPE_CANCEL_URL");

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: pack.currency,
          unit_amount: pack.amount,
          product_data: { name: `MAZE ${pack.name}` },
        },
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: String(req.user._id),
    metadata: {
      userId: String(req.user._id),
      packId: pack.id,
      credits: String(pack.credits),
    },
  });

  await Transaction.create({
    userId: req.user._id,
    provider: "stripe",
    amount: pack.amount,
    currency: pack.currency,
    creditsAdded: pack.credits,
    status: "created",
    stripeSessionId: session.id,
  });

  res.json({ ok: true, url: session.url });
});

function stripeWebhookHandler() {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("Missing STRIPE_WEBHOOK_SECRET");

  return async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (_e) {
      console.error("❌ Webhook signature verification failed:", _e.message);
      return res.status(400).send("Webhook signature verification failed");
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session?.metadata?.userId;
      const credits = Number(session?.metadata?.credits || 0);
      const sessionId = session.id;
      const paymentIntentId = session.payment_intent;

      console.log(`🔔 Processing webhook for user ${userId}: ${credits} credits`);

      if (userId && credits > 0) {
        try {
          const updateResult = await User.updateOne({ _id: userId }, { $inc: { credits } });
          console.log(`✅ Updated user ${userId} with ${credits} credits. Modified: ${updateResult.modifiedCount}`);
          
          const txnResult = await Transaction.updateOne(
            { stripeSessionId: sessionId },
            { $set: { status: "paid", stripePaymentIntentId: paymentIntentId } }
          );
          console.log(`✅ Transaction ${sessionId} marked as paid. Modified: ${txnResult.modifiedCount}`);
        } catch (error) {
          console.error(`❌ Error updating user/transaction:`, error);
        }
      } else {
        console.warn(`⚠️ Webhook missing userId or credits. userId=${userId}, credits=${credits}`);
      }
    } else {
      console.log(`ℹ️ Webhook event type: ${event.type} (not processed)`);
    }

    res.json({ received: true });
  };
}

const pricing = asyncHandler(async (_req, res) => {
  res.json({ ok: true, packs: getPricingCatalog() });
});

// DEV ONLY: Manually process pending transactions (for testing without Stripe CLI)
const devProcessPendingTransactions = asyncHandler(async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    throw new AppError("Not available in production", 403);
  }

  const pendingTxns = await Transaction.find({ status: "created" }).sort({ createdAt: -1 }).limit(20);
  let processed = 0;

  for (const txn of pendingTxns) {
    if (txn.creditsAdded > 0) {
      const result = await User.updateOne({ _id: txn.userId }, { $inc: { credits: txn.creditsAdded } });
      if (result.modifiedCount > 0) {
        await Transaction.updateOne({ _id: txn._id }, { $set: { status: "paid" } });
        processed++;
        console.log(`✅ DEV: Processed ${txn.creditsAdded} credits for user ${txn.userId}`);
      }
    }
  }

  res.json({ ok: true, message: `Processed ${processed} pending transactions`, count: processed });
});

module.exports = { createCheckout, stripeWebhookHandler, pricing, devProcessPendingTransactions };

