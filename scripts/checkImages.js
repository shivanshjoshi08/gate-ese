const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
const fs = require("fs");
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
  
  let missing = 0;
  for (const q of questions) {
    const images = q.get("images") || [];
    for (const img of images) {
      if (img.startsWith("/")) {
        const filePath = path.join(__dirname, "..", "public", img);
        if (!fs.existsSync(filePath)) {
          console.log(`Question ${q.get("importKey") || q._id} missing image: ${img}`);
          missing++;
        }
      } else {
        console.log(`Question ${q.get("importKey") || q._id} has remote image: ${img}`);
      }
    }
  }
  
  console.log(`Found ${missing} missing local images in DB.`);
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
