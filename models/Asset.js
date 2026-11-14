import mongoose from "mongoose";

// Binary files generated for a user (AI images). Served only to the owner via /api/assets/[id].
const AssetSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    mime: { type: String, default: "image/png" },
    size: Number,
    data: { type: Buffer, required: true, select: false },
  },
  { timestamps: true }
);

export default mongoose.models.Asset || mongoose.model("Asset", AssetSchema);
