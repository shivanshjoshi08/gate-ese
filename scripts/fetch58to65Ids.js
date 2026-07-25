const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
const mongoose = require("mongoose");
const { resolveMongoUriForScript } = require("./mongo-atlas-doh");
const questionSchema = new mongoose.Schema({}, { strict: false });
const Question = mongoose.models.Question || mongoose.model("Question", questionSchema);

async function run() {
  try {
    const uri = await resolveMongoUriForScript(process.env.MONGODB_URI);
    await mongoose.connect(uri);
    
    const keys = [];
    for (let i = 58; i <= 65; i++) {
      keys.push(`gate_ce_2024_${i}`);
    }

    const questions = await Question.find({ importKey: { $in: keys } }, { _id: 1, importKey: 1, slug: 1 }).lean();
    
    questions.forEach(q => {
      console.log(`${q.importKey}: ${q._id.toString()}`);
    });
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}
run();
