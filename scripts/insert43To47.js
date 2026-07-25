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

const questions = [
  {
    importKey: "gate_ce_2024_43",
    slug: "gate-ce-2024-43",
    sourceType: "practice",
    exam: "GATE",
    branch: "CE",
    subject: "Transportation Engineering",
    topic: "Highway Engineering",
    year: 2024,
    type: "mcq",
    numerical: false,
    question: "The consolidated data of a spot speed study for a certain stretch of a highway is given in the table.\n\n| Speed range (kmph) | Number of observations |\n| :---: | :---: |\n| 0 - 10 | 7 |\n| 10 - 20 | 31 |\n| 20 - 30 | 76 |\n| 30 - 40 | 129 |\n| 40 - 50 | 104 |\n| 50 - 60 | 78 |\n| 60 - 70 | 29 |\n| 70 - 80 | 24 |\n| 80 - 90 | 13 |\n| 90 - 100 | 9 |\n\nThe \"upper speed limit\" (in kmph) for the traffic sign is",
    options: [
      { id: "A", text: "50", image: null },
      { id: "B", text: "55", image: null },
      { id: "C", text: "65", image: null },
      { id: "D", text: "70", image: null }
    ],
    correctOption: "B",
    diagramRequired: false,
    status: "approved",
    images: []
  },
  {
    importKey: "gate_ce_2024_44",
    slug: "gate-ce-2024-44",
    sourceType: "practice",
    exam: "GATE",
    branch: "CE",
    subject: "Engineering Mathematics",
    topic: "Vector Calculus",
    year: 2024,
    type: "msq",
    numerical: false,
    question: "Three vectors $\\vec{p}$, $\\vec{q}$, and $\\vec{r}$ are given as\n$$ \\vec{p} = \\hat{i} + \\hat{j} + \\hat{k} $$\n$$ \\vec{q} = \\hat{i} + 2\\hat{j} + 3\\hat{k} $$\n$$ \\vec{r} = 2\\hat{i} + 3\\hat{j} + 4\\hat{k} $$\nWhich of the following is/are CORRECT?",
    options: [
      { id: "A", text: "$\\vec{p} \\times (\\vec{q} \\times \\vec{r}) + \\vec{q} \\times (\\vec{r} \\times \\vec{p}) + \\vec{r} \\times (\\vec{p} \\times \\vec{q}) = \\vec{0}$", image: null },
      { id: "B", text: "$\\vec{p} \\times (\\vec{q} \\times \\vec{r}) = (\\vec{p} \\cdot \\vec{r})\\vec{q} - (\\vec{p} \\cdot \\vec{q})\\vec{r}$", image: null },
      { id: "C", text: "$\\vec{p} \\times (\\vec{q} \\times \\vec{r}) = (\\vec{p} \\times \\vec{q}) \\times \\vec{r}$", image: null },
      { id: "D", text: "$\\vec{r} \\cdot (\\vec{p} \\times \\vec{q}) = (\\vec{q} \\times \\vec{p}) \\cdot \\vec{r}$", image: null }
    ],
    correctOptions: ["A", "B", "D"],
    diagramRequired: false,
    status: "approved",
    images: []
  },
  {
    importKey: "gate_ce_2024_45",
    slug: "gate-ce-2024-45",
    sourceType: "practice",
    exam: "GATE",
    branch: "CE",
    subject: "Geotechnical Engineering",
    topic: "Permeability and Seepage",
    year: 2024,
    type: "msq",
    numerical: false,
    question: "Consider the statements P, Q, and R.\n\nP: Compacted fine-grained soils with flocculated structure have isotropic permeability.\nQ: Phreatic surface/line is the line along which the pore water pressure is always maximum.\nR: The piping phenomenon occurring below the dam foundation is typically known as blowout piping.\n\nWhich of the following option(s) is/are CORRECT?",
    options: [
      { id: "A", text: "Both P and R are TRUE", image: null },
      { id: "B", text: "P is FALSE and Q is TRUE", image: null },
      { id: "C", text: "P is TRUE and R is FALSE", image: null },
      { id: "D", text: "Both Q and R are FALSE", image: null }
    ],
    correctOptions: ["C", "D"],
    diagramRequired: false,
    status: "approved",
    images: []
  },
  {
    importKey: "gate_ce_2024_46",
    slug: "gate-ce-2024-46",
    sourceType: "practice",
    exam: "GATE",
    branch: "CE",
    subject: "Transportation Engineering",
    topic: "Pavement Materials",
    year: 2024,
    type: "msq",
    numerical: false,
    question: "In the context of pavement material characterization, the CORRECT statement(s) is/are",
    options: [
      { id: "A", text: "The load penetration curve of CBR test may need origin correction due to the non-vertical penetrating plunger of the loading machine.", image: null },
      { id: "B", text: "The toughness and hardness of road aggregates are determined by Los Angeles abrasion test and aggregate impact test, respectively.", image: null },
      { id: "C", text: "Grading of normal (unmodified) bitumen binders is done based on viscosity test results.", image: null },
      { id: "D", text: "In compacted bituminous mix, Voids in the Mineral Aggregate (VMA) is equal to the sum of total volume of air voids ($V_v$) and total volume of bitumen ($V_b$).", image: null }
    ],
    correctOptions: ["A", "C", "D"],
    diagramRequired: false,
    status: "approved",
    images: []
  },
  {
    importKey: "gate_ce_2024_47",
    slug: "gate-ce-2024-47",
    sourceType: "practice",
    exam: "GATE",
    branch: "CE",
    subject: "Construction Materials and Management",
    topic: "Engineering Economics",
    year: 2024,
    type: "numerical",
    numerical: true,
    question: "The expression for computing the effective interest rate ($i_{eff}$) using continuous compounding for a nominal interest rate of 5% is\n$$ i_{eff} = \\lim_{m \\to \\infty} \\left(1 + \\frac{0.05}{m}\\right)^m - 1 $$\nThe effective interest rate (in percentage) is _______ (rounded off to 2 decimal places).",
    answerRange: [5.11, 5.15],
    diagramRequired: false,
    status: "approved",
    images: []
  }
];

async function run() {
  await connectMongo();
  const now = new Date();
  let count = 0;
  
  for (const q of questions) {
    const doc = {
      ...q,
      createdAt: now,
      updatedAt: now,
      difficulty: "Medium",
      marks: 2
    };
    await Question.updateOne(
      { importKey: q.importKey },
      { $set: doc },
      { upsert: true }
    );
    count++;
  }
  
  console.log(`Successfully added/updated ${count} questions.`);
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
