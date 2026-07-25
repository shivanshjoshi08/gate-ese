const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
const mongoose = require("mongoose");
const { resolveMongoUriForScript } = require("./mongo-atlas-doh");

const questionSchema = new mongoose.Schema({
  importKey: { type: String, sparse: true, unique: true },
  sourceType: { type: String },
  exam: { type: String },
  subject: { type: String },
  year: { type: Number },
}, { strict: false });

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
  const questions = await Question.find({ importKey: { $exists: false } });
  
  let count = 0;
  for (const q of questions) {
    const prefix = q.sourceType === "pyq" ? "PYQ" : "PRAC";
    const exam = q.exam || "UNK";
    const subject = q.subject || "SUB";
    const shortSub = subject.substring(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '');
    const year = q.year || "0000";
    const shortId = q._id.toString().slice(-6).toUpperCase();
    
    const newKey = `${prefix}_${exam}_${shortSub}_${year}_${shortId}`;
    
    q.importKey = newKey;
    await q.save();
    count++;
  }
  
  console.log(`Successfully assigned readable IDs to ${count} questions.`);
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
