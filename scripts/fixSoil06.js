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

const newStem = "A clay layer of thickness $10 \\text{ m}$ with double drainage has a coefficient of consolidation $c_v = 10^{-3} \\text{ cm}^2\\text{/s}$. The time required for $50\\%$ consolidation ($T_v = 0.197$) is approximately:";

async function run() {
  await connectMongo();
  
  const result = await Question.updateOne(
    { importKey: "gate_ce_2012_soil_06" },
    { $set: { question: newStem } }
  );
  
  console.log(`Updated gate_ce_2012_soil_06: ${result.modifiedCount}`);
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
