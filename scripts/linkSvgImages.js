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
  
  await Question.updateOne(
    { importKey: "gate_ce_2024_22" },
    { $set: { images: ["/images/gate_ce_2024_22.svg"] } }
  );
  
  await Question.updateOne(
    { importKey: "gate_ce_2024_24" },
    { $set: { images: ["/images/gate_ce_2024_24.svg"] } }
  );
  
  await Question.updateOne(
    { importKey: "gate_ce_2024_33" },
    { $set: { images: ["/images/gate_ce_2024_33.svg"] } }
  );
  
  console.log("Images array updated successfully for the 3 diagram questions.");
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
