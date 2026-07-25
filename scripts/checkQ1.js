const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
const mongoose = require("mongoose");
const { resolveMongoUriForScript } = require("./mongo-atlas-doh");
const questionSchema = new mongoose.Schema({}, { strict: false });
const Question = mongoose.models.Question || mongoose.model("Question", questionSchema);

async function run() {
  const uri = await resolveMongoUriForScript(process.env.MONGODB_URI);
  await mongoose.connect(uri);
  const q1 = await Question.findOne({ importKey: "gate_ce_2024_1" }).lean();
  console.log("Q.1:");
  console.log(JSON.stringify(q1, null, 2));
  process.exit(0);
}
run();
