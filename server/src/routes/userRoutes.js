const express = require("express");
const { requireAuth } = require("../middleware/auth");
const { asyncHandler } = require("../utils/asyncHandler");
const { User } = require("../models/User");
const { Transaction } = require("../models/Transaction");

function userRoutes() {
  const router = express.Router();

  router.get(
    "/overview",
    requireAuth,
    asyncHandler(async (req, res) => {
      const user = await User.findById(req.user._id).lean();
      const transactions = await Transaction.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20).lean();

      res.json({
        ok: true,
        overview: {
          credits: user?.credits ?? 0,
          plan: user?.plan ?? "free",
          transactions: transactions.map((t) => ({
            id: String(t._id),
            amount: t.amount,
            currency: t.currency,
            creditsAdded: t.creditsAdded,
            status: t.status,
            date: t.createdAt,
          })),
        },
      });
    })
  );

  return router;
}

module.exports = { userRoutes };

