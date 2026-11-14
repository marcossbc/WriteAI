import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    credits: { type: Number, default: () => Number(process.env.SIGNUP_CREDITS || 80), min: 0 },
    plan: { type: String, enum: ["free", "pro"], default: "free" },
    lastCheckinDay: { type: String }, // "YYYY-MM-DD" (UTC) of the last daily check-in
    role: { type: String, enum: ["user", "admin"], default: "user" },
    failedLogins: { type: Number, default: 0 },
    lockUntil: { type: Date },
    preferredLanguage: { type: String, default: "English" },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
