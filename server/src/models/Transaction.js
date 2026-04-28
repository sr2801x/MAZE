const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    provider: { type: String, enum: ["stripe"], default: "stripe" },
    amount: { type: Number, required: true }, // in smallest currency unit (e.g., paise/cents)
    currency: { type: String, default: "inr" },
    creditsAdded: { type: Number, required: true },
    status: { type: String, enum: ["created", "paid", "failed"], default: "created" },
    stripeSessionId: { type: String },
    stripePaymentIntentId: { type: String },
  },
  { timestamps: true }
);

const Transaction = mongoose.model("Transaction", TransactionSchema);

module.exports = { Transaction };

