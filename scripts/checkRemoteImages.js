const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
const mongoose = require("mongoose");
const { resolveMongoUriForScript } = require("./mongo-atlas-doh");

const questionSchema = new mongoose.Schema({}, { strict: false });
const Question = mongoose.models.Question || mongoose.model("Question", questionSchema);

async function connectMongo() {
  if (mongoose.connection.readyState >= 1) return;
  const rawUri = process.env.MONGODB_URI;
  if (!rawUri) throw new Error("No MONGODB_URI");
  
  const uri = await resolveMongoUriForScript(rawUri);
  return mongoose.connect(uri);
}

async function run() {
  await connectMongo();
  const questions = await Question.find({ "images.0": { $exists: true } });
  
  const hosts = new Set();
  for (const q of questions) {
    const images = q.get("images") || [];
    for (const img of images) {
      if (!img.startsWith("/")) {
        try {
          const url = new URL(img);
          hosts.add(url.hostname);
        } catch (e) {}
      }
    }
  }
  
  console.log(`Remote image hosts found in DB:`, Array.from(hosts));
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
