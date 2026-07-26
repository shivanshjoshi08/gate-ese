const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
const mongoose = require("mongoose");
const { resolveMongoUriForScript } = require("./mongo-atlas-doh");
const questionSchema = new mongoose.Schema({}, { strict: false });
const Question = mongoose.models.Question || mongoose.model("Question", questionSchema);

async function run() {
  const uri = await resolveMongoUriForScript(process.env.MONGODB_URI);
  await mongoose.connect(uri);
  
  const keys = [];
  for (let i = 58; i <= 65; i++) {
    keys.push(`gate_ce_2024_${i}`);
  }

  const docs = await Question.find({ importKey: { $in: keys } }).lean();
  
  for (const d of docs) {
    console.log(`${d.importKey} - exam: ${d.exam} / examType: ${d.examType}`);
    
    // Check if the latex table is inside the question
    if (d.stem && d.stem.plainText && d.stem.plainText.includes("\\multicolumn")) {
      console.log(`Table found in ${d.importKey}`);
    }
  }

  process.exit(0);
}
run();
