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
    importKey: "gate_ce_2024_48",
    slug: "gate-ce-2024-48",
    sourceType: "practice",
    exam: "GATE",
    branch: "CE",
    subject: "Engineering Mathematics",
    topic: "Linear Algebra",
    year: 2024,
    type: "numerical",
    numerical: true,
    question: "Consider two matrices $\\mathbf{A} = \\begin{bmatrix} 2 & 1 & 4 \\\\ 1 & 0 & 3 \\end{bmatrix}$ and $\\mathbf{B} = \\begin{bmatrix} -1 & 0 \\\\ 2 & 3 \\\\ 1 & 4 \\end{bmatrix}$.\n\nThe determinant of the matrix $\\mathbf{AB}$ is _______ (in integer).",
    answerRange: [10, 10],
    diagramRequired: false,
    status: "approved",
    images: []
  },
  {
    importKey: "gate_ce_2024_49",
    slug: "gate-ce-2024-49",
    sourceType: "practice",
    exam: "GATE",
    branch: "CE",
    subject: "Structural Engineering",
    topic: "Solid Mechanics",
    year: 2024,
    type: "numerical",
    numerical: true,
    question: "For the 6 m long horizontal cantilever beam PQR shown in the figure, Q is the mid-point. Segment PQ of the beam has flexural rigidity $EI = 2 \\times 10^5 \\text{ kN.m}^2$ whereas the segment QR has infinite flexural rigidity. Segment QR is subjected to uniformly distributed, vertically downward load of 5 kN/m.\n\nThe magnitude of the vertical displacement (in mm) at point Q is _______ (rounded off to 3 decimal places).",
    answerRange: [1.176, 1.186],
    diagramRequired: false,
    status: "approved",
    images: ["/images/gate_ce_2024_49.svg"]
  },
  {
    importKey: "gate_ce_2024_50",
    slug: "gate-ce-2024-50",
    sourceType: "practice",
    exam: "GATE",
    branch: "CE",
    subject: "Structural Engineering",
    topic: "Structural Analysis",
    year: 2024,
    type: "numerical",
    numerical: true,
    question: "The horizontal beam PQRS shown in the figure has a fixed support at point P, an internal hinge at point Q, and a pin support at point R. A concentrated vertically downward load ($V$) of 10 kN can act at any point over the entire length of the beam.\n\nThe maximum magnitude of the moment reaction (in kN.m) that can act at the support P due to $V$ is _______ (in integer).",
    answerRange: [150, 150],
    diagramRequired: false,
    status: "approved",
    images: ["/images/gate_ce_2024_50.svg"]
  },
  {
    importKey: "gate_ce_2024_51",
    slug: "gate-ce-2024-51",
    sourceType: "practice",
    exam: "GATE",
    branch: "CE",
    subject: "Structural Engineering",
    topic: "Concrete Structures",
    year: 2024,
    type: "numerical",
    numerical: true,
    question: "A concrete column section of size 300 mm $\\times$ 500 mm as shown in the figure is subjected to both axial compression and bending along the major axis. The depth of the neutral axis ($x_u$) is 1.1 times the depth of the column, as shown.\n\nThe maximum compressive strain ($\\varepsilon_c$) at highly compressive extreme fiber in concrete, where there is no tension in the section, is _______ $\\times 10^{-3}$ (rounded off to 2 decimal places).",
    answerRange: [3.20, 3.40],
    diagramRequired: false,
    status: "approved",
    images: ["/images/gate_ce_2024_51.svg"]
  },
  {
    importKey: "gate_ce_2024_52",
    slug: "gate-ce-2024-52",
    sourceType: "practice",
    exam: "GATE",
    branch: "CE",
    subject: "Construction Materials and Management",
    topic: "Construction Management",
    year: 2024,
    type: "numerical",
    numerical: true,
    question: "The table shows the activities and their durations and dependencies in a project.\n\n| Activity | Duration (Days) | Depends on |\n| :---: | :---: | :---: |\n| A | 8 | - |\n| B | 4 | A |\n| C | 4 | B |\n| D | 4 | C, L |\n| F | 4 | A |\n| G | 4 | F |\n| H | 6 | G, L |\n| K | 10 | A |\n| L | 6 | F, K |\n\nThe total duration (in days) of the project is _______ (in integer).",
    answerRange: [30, 30],
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
