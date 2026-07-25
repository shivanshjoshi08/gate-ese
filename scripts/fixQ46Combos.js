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

  const result = await Question.updateOne(
    { importKey: "gate_ce_2024_46" },
    {
      $set: {
        correctCombos: [["A", "C", "D"], ["A", "C"]]
      }
    }
  );

  console.log(`Updated Q.46 with correctCombos — modifiedCount: ${result.modifiedCount}`);

  // Verify
  const q = await Question.findOne({ importKey: "gate_ce_2024_46" }).lean();
  console.log("correctOptions:", q.correctOptions);
  console.log("correctCombos:", JSON.stringify(q.correctCombos));

  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
