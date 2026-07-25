const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });
const mongoose = require("mongoose");
const { resolveMongoUriForScript } = require("./mongo-atlas-doh");
const questionSchema = new mongoose.Schema({}, { strict: false });
const Question = mongoose.models.Question || mongoose.model("Question", questionSchema);

const newQuestions = [
  {
    importKey: "gate_ce_2024_58",
    sourceType: "practice",
    exam: "GATE",
    year: 2024,
    subject: "Fluid Mechanics",
    topic: "Fluid Dynamics",
    type: "numerical",
    numerical: true,
    question: "A $2 \\text{ m} \\times 1.5 \\text{ m}$ tank of $6 \\text{ m}$ height is provided with a $100 \\text{ mm}$ diameter orifice at the center of its base. The orifice is plugged and the tank is filled up to $5 \\text{ m}$ height. Consider the average value of discharge coefficient as $0.6$ and acceleration due to gravity ($g$) as $10 \\text{ m/s}^2$. After unplugging the orifice, the time (in seconds) taken for the water level to drop from $5 \\text{ m}$ to $3.5 \\text{ m}$ under free discharge condition is ________ (rounded off to 2 decimal places).",
    answerRanges: [[102.00, 106.00]],
    solution: { text: "The correct answer is 102.00 to 106.00.", latex: "", images: [] },
    marks: 2,
    negativeMarks: 0,
    difficulty: "Medium"
  },
  {
    importKey: "gate_ce_2024_59",
    sourceType: "practice",
    exam: "GATE",
    year: 2024,
    subject: "Fluid Mechanics",
    topic: "Open Channel Flow",
    type: "numerical",
    numerical: true,
    question: "A rectangular channel is $4.0 \\text{ m}$ wide and carries a discharge of $2.0 \\text{ m}^3\\text{/s}$ with a depth of $0.4 \\text{ m}$. The channel transitions to a maximum width contraction at a downstream location, without influencing the upstream flow conditions. The width (in meters) at the maximum contraction is ________ (rounded off to 2 decimal places).",
    answerRanges: [[3.30, 3.70]],
    solution: { text: "The correct answer is 3.30 to 3.70.", latex: "", images: [] },
    marks: 2,
    negativeMarks: 0,
    difficulty: "Medium"
  },
  {
    importKey: "gate_ce_2024_60",
    sourceType: "practice",
    exam: "GATE",
    year: 2024,
    subject: "Environmental Engineering",
    topic: "Waste Water",
    type: "numerical",
    numerical: true,
    question: "A circular settling tank is to be designed for primary treatment of sewage at a flow rate of $10 \\text{ million liters/day}$. Assume a detention period of $2.0 \\text{ hours}$ and surface loading rate of $40000 \\text{ liters/m}^2\\text{/day}$. The height (in meters) of the water column in the tank is ________ (rounded off to 2 decimal places).",
    answerRanges: [[3.00, 3.40]],
    solution: { text: "The correct answer is 3.00 to 3.40.", latex: "", images: [] },
    marks: 2,
    negativeMarks: 0,
    difficulty: "Medium"
  },
  {
    importKey: "gate_ce_2024_61",
    sourceType: "practice",
    exam: "GATE",
    year: 2024,
    subject: "Environmental Engineering",
    topic: "Solid Waste Management",
    type: "numerical",
    numerical: true,
    question: "An organic waste is represented as $\\text{C}_{240}\\text{O}_{200}\\text{H}_{180}\\text{N}_{5}\\text{S}$.\n\n(Atomic weights: S-32, H-1, C-12, O-16, N-14).\n\nAssume complete conversion of S to $\\text{SO}_2$ while burning.\n\n$\\text{SO}_2$ generated (in grams) per kg of this waste is ________ (rounded off to 1 decimal place).",
    answerRanges: [[9.9, 10.2]],
    solution: { text: "The correct answer is 9.9 to 10.2.", latex: "", images: [] },
    marks: 2,
    negativeMarks: 0,
    difficulty: "Medium"
  },
  {
    importKey: "gate_ce_2024_62",
    sourceType: "practice",
    exam: "GATE",
    year: 2024,
    subject: "Transportation Engineering",
    topic: "Railway Engineering",
    type: "numerical",
    numerical: true,
    question: "A horizontal curve of radius $1080 \\text{ m}$ (with transition curves on either side) in a Broad Gauge railway track is designed and constructed for an equilibrium speed of $70 \\text{ kmph}$. However, a few years after construction, the Railway Authorities decided to run express trains on this track. The maximum allowable cant deficiency is $10 \\text{ cm}$.\n\nThe maximum restricted speed (in kmph) of the express trains running on this track is ________ (rounded off to the nearest integer).",
    answerRanges: [[112, 116]],
    solution: { text: "The correct answer is 112 to 116.", latex: "", images: [] },
    marks: 2,
    negativeMarks: 0,
    difficulty: "Medium"
  },
  {
    importKey: "gate_ce_2024_63",
    sourceType: "practice",
    exam: "GATE",
    year: 2024,
    subject: "Transportation Engineering",
    topic: "Highway Geometric Design",
    type: "numerical",
    numerical: true,
    question: "A vertical summit curve on a freight corridor is formed at the intersection of two gradients, $+3.0\\%$ and $-5.0\\%$.\n\nAssume the following:\nOnly large-sized trucks are allowed on this corridor\nDesign speed = $80 \\text{ kmph}$\nEye height of truck drivers above the road surface = $2.30 \\text{ m}$\nHeight of object above the road surface for which trucks need to stop = $0.35 \\text{ m}$\nTotal reaction time of the truck drivers = $2.0 \\text{ s}$\nCoefficient of longitudinal friction of the road = $0.36$\nStopping sight distance gets compensated on the gradient\n\nThe design length of the summit curve (in meters) to accommodate the stopping sight distance is ________ (rounded off to 2 decimal places).",
    answerRanges: [[117.00, 120.00]],
    solution: { text: "The correct answer is 117.00 to 120.00.", latex: "", images: [] },
    marks: 2,
    negativeMarks: 0,
    difficulty: "Medium"
  },
  {
    importKey: "gate_ce_2024_64",
    sourceType: "practice",
    exam: "GATE",
    year: 2024,
    subject: "Geomatics Engineering",
    topic: "Surveying",
    type: "numerical",
    numerical: true,
    question: "A child walks on a level surface from point P to point Q at a bearing of $30^\\circ$, from point Q to point R at a bearing of $90^\\circ$ and then directly returns to the starting point P at a bearing of $240^\\circ$. The straight-line paths PQ and QR are $4 \\text{ m}$ each. Assuming that all bearings are measured from the magnetic north in degrees, the straight-line path length RP (in meters) is ________ (rounded off to the nearest integer).",
    answerRanges: [[6, 8]],
    solution: { text: "The correct answer is 6 to 8.", latex: "", images: [] },
    marks: 2,
    negativeMarks: 0,
    difficulty: "Medium"
  },
  {
    importKey: "gate_ce_2024_65",
    sourceType: "practice",
    exam: "GATE",
    year: 2024,
    subject: "Geomatics Engineering",
    topic: "Levelling",
    type: "numerical",
    numerical: true,
    question: "Differential levelling is carried out from point P (BM: $+200.000 \\text{ m}$) to point R. The readings taken are given in the table.\n\n$$\n\\begin{array}{|c|c|c|c|}\n\\hline\n\\text{Points} & \\multicolumn{2}{|c|}{\\text{Staff readings (m)}} & \\text{Remarks} \\\\\n\\cline{2-3}\n & \\text{Back Sight} & \\text{Fore Sight} & \\\\\n\\hline\n\\text{P} & (-)2.050 & & \\text{BM: } +200.000 \\text{ m} \\\\\n\\hline\n\\text{Q} & 1.050 & 0.950 & \\text{Q is a change point} \\\\\n\\hline\n\\text{R} & & (-)1.655 & \\\\\n\\hline\n\\end{array}\n$$\n\nReduced Level (in meters) of the point R is ________ (rounded off to 3 decimal places).",
    answerRanges: [[199.704, 199.706]],
    solution: { text: "The correct answer is 199.704 to 199.706.", latex: "", images: [] },
    marks: 2,
    negativeMarks: 0,
    difficulty: "Medium"
  }
];

async function run() {
  try {
    const uri = await resolveMongoUriForScript(process.env.MONGODB_URI);
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");

    for (const data of newQuestions) {
      const q = {
        ...data,
        slug: data.importKey.replace(/_/g, "-"),
        branch: "CE",
        status: "approved",
        createdAt: new Date(),
        updatedAt: new Date(),
        diagramRequired: false,
        images: []
      };

      await Question.findOneAndUpdate(
        { importKey: q.importKey },
        { $set: q },
        { upsert: true, new: true }
      );
      console.log(`Upserted ${q.importKey}`);
    }
  } catch (err) {
    console.error("Error:", err);
  } finally {
    process.exit(0);
  }
}

run();
