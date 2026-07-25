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
  
  const q = await Question.findOne({ importKey: "gate_ce_2024_37" });
  if (q && q.question) {
    const updatedQuestion = q.question.replace(/\n\n\[Diagram required\]/g, "");
    await Question.updateOne(
      { importKey: "gate_ce_2024_37" },
      { $set: { question: updatedQuestion } }
    );
    console.log("Successfully removed '[Diagram required]' from Q.37");
  } else {
    console.log("Question not found or has no question text.");
  }
  
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
