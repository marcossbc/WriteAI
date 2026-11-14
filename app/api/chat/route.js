import { connectDB } from "@/lib/db";
import { charge, refund, noCredits } from "@/lib/credits";
import { COSTS } from "@/lib/plans";
import { chatReply } from "@/lib/openai";
import { handler, requireUser, readJson } from "@/lib/api";
import { rateLimit } from "@/lib/ratelimit";
import { log } from "@/lib/audit";
import { memoryPrompt } from "@/lib/memory";
import * as v from "@/lib/validate";
import Chat from "@/models/Chat";
import Document from "@/models/Document";
import Transaction from "@/models/Transaction";

export const maxDuration = 60;

export const POST = handler(async (req) => {
  const user = await requireUser();
  rateLimit(req, "chat", 20, 60_000, String(user._id));
  const body = await readJson(req, 10000);
  const message = v.str(body.message, { name: "Message", min: 1, max: 4000 });
  const chatId = body.chatId ? v.id(body.chatId, "Chat") : null;
  const documentId = body.documentId ? v.id(body.documentId, "Document") : null;

  await connectDB();
  let chat = chatId ? await Chat.findOne({ _id: chatId, user: user._id }) : null; // ownership enforced in the query
  if (chatId && !chat) throw new v.UserError("Chat not found.", 404);
  if (!chat) {
    if (documentId && !(await Document.exists({ _id: documentId, user: user._id }))) throw new v.UserError("Document not found.", 404);
    chat = new Chat({ user: user._id, document: documentId || undefined, title: message.slice(0, 60) });
  }
  if (chat.messages.length >= 200) throw new v.UserError("This chat is full. Start a new one.");

  if (!(await charge(user._id, COSTS.chat))) throw noCredits();
  try {
    let context = "";
    if (chat.document) context = (await Document.findOne({ _id: chat.document, user: user._id }))?.result || "";
    chat.messages.push({ role: "user", content: message });
    const reply = await chatReply({ messages: chat.messages.map((m) => ({ role: m.role, content: m.content })), context, userId: String(user._id), memory: await memoryPrompt(user._id) });
    chat.messages.push({ role: "assistant", content: reply });
    await chat.save();
    await Transaction.create({ user: user._id, label: "Chat message", credits: -COSTS.chat, amountUsd: 0, provider: "usage" });
    return Response.json({ chatId: String(chat._id), reply });
  } catch (e) {
    await refund(user._id, COSTS.chat);
    log("error", "chat_failed", { userId: String(user._id), message: e.message });
    throw new v.UserError("The assistant could not answer. Your credits were returned.", 500);
  }
});
