const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
const mongoose = require("mongoose");
const { resolveMongoUriForScript } = require("./mongo-atlas-doh");
const questionSchema = new mongoose.Schema({}, { strict: false });
const Question = mongoose.models.Question || mongoose.model("Question", questionSchema);

async function run() {
  const rawUri = process.env.MONGODB_URI;
  const uri = await resolveMongoUriForScript(rawUri);
  await mongoose.connect(uri);

  const q = await Question.findOne({ importKey: "gate_ce_2024_53" }).lean();
  console.log("Q.53 Data:");
  console.log(JSON.stringify(q, null, 2));

  process.exit(0);
}
run().catch(console.error);
