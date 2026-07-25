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
  const q = await Question.findOne({ importKey: "gate_ce_math_12" });
  if (!q) {
    console.log("Question not found!");
    process.exit(1);
  }
  
  q.set("question", "The general solution of $\\frac{\\partial^2 u}{\\partial x^2} = \\frac{\\partial^2 u}{\\partial y^2}$ is:");
  
  q.set("options", [
    { id: "A", text: "$u = f(x+y) + g(x-y)$", image: null },
    { id: "B", text: "$u = f(x) + g(y)$", image: null },
    { id: "C", text: "$u = f(xy)$", image: null },
    { id: "D", text: "$u = x f(y) + y g(x)$", image: null }
  ]);
  
  await q.save();
  console.log("Question and options updated with LaTeX successfully.");
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
