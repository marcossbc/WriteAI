import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  action: { type: String, required: true, index: true },
  ip: String,
  userAgent: String,
  meta: mongoose.Schema.Types.Mixed,
  createdAt: { type: Date, default: Date.now },
});
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 180 }); // auto-delete after 180 days

export default mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
