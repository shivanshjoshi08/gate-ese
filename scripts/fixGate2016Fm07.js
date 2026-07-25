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
  const q = await Question.findOne({ importKey: "gate_ce_2016_fm_07" });
  if (!q) {
    console.log("Question not found!");
    process.exit(1);
  }
  
  q.set("question", "For a laminar boundary layer over a flat plate, the boundary layer thickness $\\delta$ varies with the distance $x$ from the leading edge as:");
  
  q.set("options", [
    { id: "A", text: "$x^{1/2}$", image: null },
    { id: "B", text: "$x^{4/5}$", image: null },
    { id: "C", text: "$x$", image: null },
    { id: "D", text: "$x^{1/7}$", image: null }
  ]);
  
  await q.save();
  console.log("Question and options updated with LaTeX successfully.");
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
