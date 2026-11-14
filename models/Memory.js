import mongoose from "mongoose";

// Facts the user wants the AI to remember ("I write in Somali", "My company is Hodan Trading").
const MemorySchema = new mongoose.Schema(
  { user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true }, text: { type: String, required: true, maxlength: 300 } },
  { timestamps: true }
);

export default mongoose.models.Memory || mongoose.model("Memory", MemorySchema);
