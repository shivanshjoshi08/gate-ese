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

const fixes = [
  {
    importKey: "gate_ce_2024_43",
    question: `The consolidated data of a spot speed study for a certain stretch of a highway is given in the table.

$$
\\begin{array}{|c|c|}
\\hline
\\textbf{Speed range (kmph)} & \\textbf{Number of observations} \\\\
\\hline
0 - 10 & 7 \\\\
10 - 20 & 31 \\\\
20 - 30 & 76 \\\\
30 - 40 & 129 \\\\
40 - 50 & 104 \\\\
50 - 60 & 78 \\\\
60 - 70 & 29 \\\\
70 - 80 & 24 \\\\
80 - 90 & 13 \\\\
90 - 100 & 9 \\\\
\\hline
\\end{array}
$$

The "upper speed limit" (in kmph) for the traffic sign is`
  },
  {
    importKey: "gate_ce_2024_52",
    question: `The table shows the activities and their durations and dependencies in a project.

$$
\\begin{array}{|c|c|c|}
\\hline
\\textbf{Activity} & \\textbf{Duration (Days)} & \\textbf{Depends on} \\\\
\\hline
\\text{A} & 8 & - \\\\
\\text{B} & 4 & \\text{A} \\\\
\\text{C} & 4 & \\text{B} \\\\
\\text{D} & 4 & \\text{C, L} \\\\
\\text{F} & 4 & \\text{A} \\\\
\\text{G} & 4 & \\text{F} \\\\
\\text{H} & 6 & \\text{G, L} \\\\
\\text{K} & 10 & \\text{A} \\\\
\\text{L} & 6 & \\text{F, K} \\\\
\\hline
\\end{array}
$$

The total duration (in days) of the project is _______ (in integer).`
  }
];

async function run() {
  await connectMongo();
  let count = 0;

  for (const fix of fixes) {
    const result = await Question.updateOne(
      { importKey: fix.importKey },
      { $set: { question: fix.question } }
    );
    if (result.modifiedCount > 0) {
      console.log(`Fixed table in ${fix.importKey}`);
      count++;
    } else {
      console.log(`No change for ${fix.importKey} (not found or already correct)`);
    }
  }

  console.log(`\nDone. Fixed ${count} question(s).`);
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
