import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    label: String,
    credits: Number,
    amountUsd: Number,
    provider: { type: String, default: "demo" },
    itemId: String,
    providerRef: { type: String, unique: true, sparse: true }, // Stripe session id -> makes webhook retries idempotent (no double credits)
  },
  { timestamps: true }
);

export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
