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
  const q = await Question.findOne({ importKey: "gate_ce_found_01" });
  if (!q) {
    const qs = await Question.find({ question: { $regex: /Terzaghi/i } });
    console.log("Found by text:", qs.map(q => q.importKey || q._id));
    process.exit(1);
  }
  
  q.set("question", "According to Terzaghi's bearing capacity theory, the ultimate bearing capacity of a square footing is given by:");
  
  q.set("options", [
    { id: "A", text: "$q_u = 1.3 c N_c + \\gamma D_f N_q + 0.4 \\gamma B N_\\gamma$", image: null },
    { id: "B", text: "$q_u = c N_c + \\gamma D_f N_q + 0.5 \\gamma B N_\\gamma$", image: null },
    { id: "C", text: "$q_u = 1.3 c N_c + \\gamma D_f N_q + 0.5 \\gamma B N_\\gamma$", image: null },
    { id: "D", text: "$q_u = c N_c + q N_q + 0.5 \\gamma B N_\\gamma$", image: null }
  ]);
  
  await q.save();
  console.log("Question and options updated with LaTeX successfully.");
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
