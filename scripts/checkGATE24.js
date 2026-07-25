const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
const mongoose = require("mongoose");
const { resolveMongoUriForScript } = require("./mongo-atlas-doh");
const questionSchema = new mongoose.Schema({}, { strict: false });
const Question = mongoose.models.Question || mongoose.model("Question", questionSchema);

async function run() {
  const uri = await resolveMongoUriForScript(process.env.MONGODB_URI);
  await mongoose.connect(uri);
  const qs = await Question.find({ exam: "GATE", year: 2024, importKey: { $ne: null } }).limit(2).lean();
  console.log("GATE 2024 qs:");
  console.log(JSON.stringify(qs, null, 2));
  process.exit(0);
}
run();
