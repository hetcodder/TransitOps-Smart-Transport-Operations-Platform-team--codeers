import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn("⚠️ MONGODB_URI is not defined. TransitOps backend is falling back to lightweight local/JSON-file database mode.");
    isConnected = false;
    return false;
  }

  try {
    console.log("🔌 Connecting to enterprise MongoDB database...");
    await mongoose.connect(mongoUri, {
      autoIndex: true,
    });
    isConnected = true;
    console.log("✅ Successfully established connection to MongoDB.");
    return true;
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    isConnected = false;
    return false;
  }
}

export function getDatabaseStatus(): { isConnected: boolean; mode: string } {
  return {
    isConnected,
    mode: isConnected ? "MONGODB" : "LOCAL_JSON",
  };
}
