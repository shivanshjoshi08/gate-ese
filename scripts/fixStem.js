const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
const mongoose = require("mongoose");
const { resolveMongoUriForScript } = require("./mongo-atlas-doh");
const questionSchema = new mongoose.Schema({}, { strict: false });
const Question = mongoose.models.Question || mongoose.model("Question", questionSchema);

async function run() {
  const uri = await resolveMongoUriForScript(process.env.MONGODB_URI);
  await mongoose.connect(uri);
  
  // Find all questions inserted recently (48 to 65)
  const keys = [];
  for (let i = 48; i <= 65; i++) {
    keys.push(`gate_ce_2024_${i}`);
  }

  const docs = await Question.find({ importKey: { $in: keys } }).lean();

  for (const doc of docs) {
    // If it has question string and NO stem, we fix it
    if (typeof doc.question === "string" && !doc.stem) {
      console.log(`Fixing ${doc.importKey}...`);
      
      const update = {
        $set: {
          stem: { text: doc.question, plainText: doc.question, format: "markdown" },
        },
        $unset: {
          question: ""
        }
      };

      if (doc.solution && typeof doc.solution.text === "string" && !doc.solution.plainText) {
        update.$set.solution = {
          text: doc.solution.text,
          plainText: doc.solution.text,
          latex: doc.solution.latex || "",
          images: doc.solution.images || []
        };
      }

      await Question.updateOne({ _id: doc._id }, update);
    }
  }

  console.log("Fixed all missing stems.");
  process.exit(0);
}
run();
