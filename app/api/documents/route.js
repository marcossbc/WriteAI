import { connectDB } from "@/lib/db";
import { handler, requireUser } from "@/lib/api";
import Document from "@/models/Document";

export const GET = handler(async () => {
  const user = await requireUser();
  await connectDB();
  const documents = await Document.find({ user: user._id }).select("title templateName language createdAt").sort({ createdAt: -1 }).limit(500).lean();
  return Response.json({ documents });
});
