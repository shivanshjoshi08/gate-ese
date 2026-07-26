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
    const tiptapDoc = {
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Differential levelling is carried out from point P (BM: " },
            { type: "inlineMath", attrs: { latex: "+200.000" } },
            { type: "text", text: " m) to point R. The readings taken are given in the table." }
          ]
        },
        {
          type: "html",
          attrs: {
            html: "<table class='table-auto w-full border-collapse border border-zinc-300 dark:border-zinc-700 my-6'><thead><tr><th class='border border-zinc-300 dark:border-zinc-700 px-4 py-2 font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/50'>Points</th><th class='border border-zinc-300 dark:border-zinc-700 px-4 py-2 font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/50' colspan='2'>Staff readings (m)</th><th class='border border-zinc-300 dark:border-zinc-700 px-4 py-2 font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800/50'>Remarks</th></tr><tr><th class='border border-zinc-300 dark:border-zinc-700 px-4 py-2 bg-zinc-50 dark:bg-zinc-800/30'></th><th class='border border-zinc-300 dark:border-zinc-700 px-4 py-2 font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800/30'>Back Sight</th><th class='border border-zinc-300 dark:border-zinc-700 px-4 py-2 font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-800/30'>Fore Sight</th><th class='border border-zinc-300 dark:border-zinc-700 px-4 py-2 bg-zinc-50 dark:bg-zinc-800/30'></th></tr></thead><tbody><tr><td class='border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-center'>P</td><td class='border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-center'>(-)2.050</td><td class='border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-center'></td><td class='border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-center'>BM: +200.000 m</td></tr><tr><td class='border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-center'>Q</td><td class='border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-center'>1.050</td><td class='border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-center'>0.950</td><td class='border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-center'>Q is a change point</td></tr><tr><td class='border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-center'>R</td><td class='border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-center'></td><td class='border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-center'>(-)1.655</td><td class='border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-center'></td></tr></tbody></table>"
          }
        },
        {
          type: "paragraph",
          content: [
            { type: "text", text: "Reduced Level (in meters) of the point R is ________ (rounded off to 3 decimal places)." }
          ]
        }
      ]
    };

    await Question.updateOne(
      { importKey: "gate_ce_2024_65" },
      {
        $set: {
          "stem.doc": tiptapDoc
        }
      }
    );
    console.log("Successfully added TipTap doc with beautiful HTML table to Q.65!");
  } else {
    console.log("Q.65 not found.");
  }
  process.exit(0);
}
run();
