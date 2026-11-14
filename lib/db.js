import mongoose from "mongoose";

const cached = global._mongoose || (global._mongoose = { conn: null, promise: null });

export async function connectDB() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing in .env.local");
  if (cached.conn) return cached.conn;
  cached.promise ||= mongoose.connect(process.env.MONGODB_URI, { bufferCommands: false });
  cached.conn = await cached.promise;
  return cached.conn;
}
