import User from "@/models/User";
import { UserError } from "./validate";

// Atomic: only deducts when the balance is enough (no race condition / double spend).
export async function charge(userId, amount) {
  return User.findOneAndUpdate({ _id: userId, credits: { $gte: amount } }, { $inc: { credits: -amount } }, { new: true });
}
export async function refund(userId, amount) {
  await User.updateOne({ _id: userId }, { $inc: { credits: amount } });
}
export const noCredits = () => new UserError("Not enough credits. Buy more to continue.", 402, "NO_CREDITS");
