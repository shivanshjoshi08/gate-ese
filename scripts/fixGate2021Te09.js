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
  const q = await Question.findOne({ importKey: "gate_ce_2021_te_09" });
  if (!q) {
    console.log("Question not found!");
    process.exit(1);
  }
  
  q.set("question", "Which of the following statements is always true regarding the relationship between time mean speed ($V_t$) and space mean speed ($V_s$) of a traffic stream?");
  
  q.set("options", [
    { id: "A", text: "$V_t < V_s$", image: null },
    { id: "B", text: "$V_t = V_s$ always", image: null },
    { id: "C", text: "$V_t \\ge V_s$", image: null },
    { id: "D", text: "$V_t$ is independent of $V_s$", image: null }
  ]);
  
  await q.save();
  console.log("Question and options updated with LaTeX successfully.");
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
