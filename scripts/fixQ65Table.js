const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
const mongoose = require("mongoose");
const { resolveMongoUriForScript } = require("./mongo-atlas-doh");
const questionSchema = new mongoose.Schema({}, { strict: false });
const Question = mongoose.models.Question || mongoose.model("Question", questionSchema);

async function run() {
  const uri = await resolveMongoUriForScript(process.env.MONGODB_URI);
  await mongoose.connect(uri);
  
  const q65 = await Question.findOne({ importKey: "gate_ce_2024_65" }).lean();
  if (q65) {
    console.log("Original text:");
    console.log(q65.stem.plainText);
    
    // Markdown table replacement
    const newText = `Differential levelling is carried out from point P (BM: $+200.000$ m) to point R. The readings taken are given in the table.

| Points | Staff readings (m) - Back Sight | Staff readings (m) - Fore Sight | Remarks |
| :--- | :---: | :---: | :--- |
| P | $(-)2.050$ | | BM: $+200.000$ m |
| Q | $1.050$ | $0.950$ | Q is a change point |
| R | | $(-)1.655$ | |

Reduced Level (in meters) of the point R is ________ (rounded off to 3 decimal places).`;

    await Question.updateOne(
      { importKey: "gate_ce_2024_65" },
      {
        $set: {
          "stem.plainText": newText,
          "stem.text": newText
        }
      }
    );
    console.log("\\n\\nSuccessfully updated Q.65 table to Markdown!");
  } else {
    console.log("Q.65 not found.");
  }
  process.exit(0);
}
run();
