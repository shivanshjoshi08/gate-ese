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

const q25Text = `What is the CORRECT match between the air pollutants and treatment techniques given in the table?

$$
\\begin{array}{|l|l|}
\\hline
\\textbf{Air pollutants} & \\textbf{Treatment techniques} \\\\
\\hline
\\text{P - NO}_2 & \\text{i - Flaring} \\\\
\\text{Q - SO}_2 & \\text{ii - Cyclonic separator} \\\\
\\text{R - CO} & \\text{iii - Lime scrubbing} \\\\
\\text{S - Particles} & \\text{iv - NH}_3 \\text{ injection} \\\\
\\hline
\\end{array}
$$`;

const q27Text = `The longitudinal sections of a runway have gradients as shown in the table.

$$
\\begin{array}{|l|c|}
\\hline
\\textbf{End to end for sections of runway (m)} & \\textbf{Gradient (\\%)} \\\\
\\hline
0 \\text{ to } 200 & +1.0 \\\\
200 \\text{ to } 600 & -1.0 \\\\
600 \\text{ to } 1200 & +0.8 \\\\
1200 \\text{ to } 1600 & +0.2 \\\\
1600 \\text{ to } 2000 & -0.5 \\\\
\\hline
\\end{array}
$$

Consider the reduced level (RL) at the starting point of the runway as $100 \\text{ m}$.
The effective gradient of the runway is`;

const q31Text = `What is the CORRECT match between the survey instruments/parts of instruments shown in the table and the operations carried out with them?

$$
\\begin{array}{|l|l|}
\\hline
\\textbf{Instruments/Parts of instruments} & \\textbf{Operations} \\\\
\\hline
\\text{P - Bubble tube} & \\text{i - Tacheometry} \\\\
\\text{Q - Plumb bob} & \\text{ii - Minor movements} \\\\
\\text{R - Tangent screw} & \\text{iii - Centering} \\\\
\\text{S - Stadia cross-wire} & \\text{iv - Levelling} \\\\
\\hline
\\end{array}
$$`;

async function run() {
  await connectMongo();
  
  await Question.updateOne(
    { importKey: "gate_ce_2024_25" },
    { $set: { question: q25Text } }
  );
  
  await Question.updateOne(
    { importKey: "gate_ce_2024_27" },
    { $set: { question: q27Text } }
  );
  
  await Question.updateOne(
    { importKey: "gate_ce_2024_31" },
    { $set: { question: q31Text } }
  );
  
  console.log("Tables updated to LaTeX for Q25, Q27, Q31.");
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
