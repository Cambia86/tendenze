const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI;

async function connectToMongo() {
  if (!MONGO_URI) {
    console.warn(
      "[mongo] MONGO_URI is not set, skipping real database connection."
    );
    return;
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("[mongo] Connected to MongoDB");
  } catch (err) {
    console.error("[mongo] Failed to connect to MongoDB", err);
  }
}

module.exports = { mongoose, connectToMongo };

