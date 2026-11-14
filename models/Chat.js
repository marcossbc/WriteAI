import mongoose from "mongoose";

const ChatSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "New chat" },
    kind: { type: String, default: "chat" },
    document: { type: mongoose.Schema.Types.ObjectId, ref: "Document" },
    messages: [{ role: { type: String, enum: ["user", "assistant"] }, content: String, docId: { type: mongoose.Schema.Types.ObjectId, ref: "Document" }, at: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
);

export default mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
