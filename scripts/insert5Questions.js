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
    importKey: "gate_ce_2024_37",
    slug: "gate-ce-2024-37",
    sourceType: "pyq",
    exam: "GATE",
    branch: "CE",
    subject: "Solid Mechanics",
    topic: "Dynamics",
    year: 2024,
    type: "mcq",
    numerical: false,
    question: "A linearly elastic beam of length $2l$ with flexural rigidity $EI$ has negligible mass. A massless spring with a spring constant $k$ and a rigid block of mass $m$ are attached to the beam as shown in the figure.\n\n[Diagram required]\n\nThe natural frequency of this system is",
    options: [
      { id: "A", text: "$\\sqrt{\\frac{kl^3 + 6EI}{ml^3}}$", image: null },
      { id: "B", text: "$\\sqrt{\\frac{kl^3 + 48EI}{ml^3}}$", image: null },
      { id: "C", text: "$\\sqrt{\\frac{6EIk}{(kl^3 + 6EI)m}}$", image: null },
      { id: "D", text: "$\\sqrt{\\frac{48EIk}{(kl^3 + 48EI)m}}$", image: null }
    ],
    correctOption: "A",
    diagramRequired: true,
    status: "approved",
    images: ["/images/gate_ce_2024_37.svg"]
  },
  {
    importKey: "gate_ce_2024_39",
    slug: "gate-ce-2024-39",
    sourceType: "pyq",
    exam: "GATE",
    branch: "CE",
    subject: "Solid Mechanics",
    topic: "Thermal Stresses",
    year: 2024,
    type: "mcq",
    numerical: false,
    question: "A homogeneous, prismatic, linearly elastic steel bar fixed at both the ends has a slenderness ratio ($l/r$) of $105$, where $l$ is the bar length and $r$ is the radius of gyration. The coefficient of thermal expansion of steel is $12 \\times 10^{-6} \\text{ }^\\circ\\text{C}^{-1}$. Consider the effective length of the steel bar as $0.5l$ and neglect the self-weight of the bar.\n\nThe differential increase in temperature (*rounded off to the nearest integer*) at which the bar buckles is",
    options: [
      { id: "A", text: "$298\\ ^\\circ\\text{C}$", image: null },
      { id: "B", text: "$85\\ ^\\circ\\text{C}$", image: null },
      { id: "C", text: "$400\\ ^\\circ\\text{C}$", image: null },
      { id: "D", text: "$250\\ ^\\circ\\text{C}$", image: null }
    ],
    correctOption: "A",
    diagramRequired: false,
    status: "approved",
    images: []
  },
  {
    importKey: "gate_ce_2024_40",
    slug: "gate-ce-2024-40",
    sourceType: "pyq",
    exam: "GATE",
    branch: "CE",
    subject: "Geotechnical Engineering",
    topic: "Retaining Walls",
    year: 2024,
    type: "mcq",
    numerical: false,
    question: "Consider the statements P and Q related to the analysis/design of retaining walls.\n\nP: When a rough retaining wall moves toward the backfill, the wall friction force/resistance mobilizes in upward direction along the wall.\n\nQ: Most of the earth pressure theories calculate the earth pressure due to surcharge by neglecting the actual distribution of stresses due to surcharge.\n\nWhich one of the following options is CORRECT?",
    options: [
      { id: "A", text: "Both P and Q are TRUE", image: null },
      { id: "B", text: "P is TRUE and Q is FALSE", image: null },
      { id: "C", text: "Both P and Q are FALSE", image: null },
      { id: "D", text: "P is FALSE and Q is TRUE", image: null }
    ],
    correctOption: "D",
    diagramRequired: false,
    status: "approved",
    images: []
  },
  {
    importKey: "gate_ce_2024_41",
    slug: "gate-ce-2024-41",
    sourceType: "pyq",
    exam: "GATE",
    branch: "CE",
    subject: "Fluid Mechanics",
    topic: "Open Channel Flow",
    year: 2024,
    type: "mcq",
    numerical: false,
    question: "A round-bottom triangular lined canal is to be laid at a slope of $1$ in $1500$, to carry a discharge of $25 \\text{ m}^3\\text{/s}$. The side slopes of the canal cross-section are to be kept at $1.25\\text{H} : 1\\text{V}$. If Manning's roughness coefficient is $0.013$, the flow depth (in meters) will be in the range of",
    options: [
      { id: "A", text: "$2.39$ to $2.42$", image: null },
      { id: "B", text: "$1.94$ to $1.97$", image: null },
      { id: "C", text: "$2.24$ to $2.27$", image: null },
      { id: "D", text: "$2.61$ to $2.64$", image: null }
    ],
    correctOption: "A",
    diagramRequired: false,
    status: "approved",
    images: []
  },
  {
    importKey: "gate_ce_2024_42",
    slug: "gate-ce-2024-42",
    sourceType: "pyq",
    exam: "GATE",
    branch: "CE",
    subject: "Environmental Engineering",
    topic: "Water Treatment",
    year: 2024,
    type: "mcq",
    numerical: false,
    question: "A hypothetical multimedia filter, consisting of anthracite particles (specific gravity: $1.50$), silica sand (specific gravity: $2.60$), and ilmenite sand (specific gravity: $4.20$), is to be designed for treating water/wastewater. After backwashing, the particles should settle forming three layers: coarse anthracite particles at the top of the bed, silica sand in the middle, and small ilmenite sand particles at the bottom of the bed.\n\nAssume\n(i) Slow discrete settling (Stoke's law is applicable)\n(ii) All particles are spherical\n(iii) Diameter of silica sand particles is $0.20 \\text{ mm}$\n\nThe CORRECT option fulfilling the diameter requirements for this filter media is",
    options: [
      { id: "A", text: "diameter of anthracite particles is slightly less than $0.35 \\text{ mm}$ and diameter of ilmenite particles is slightly greater than $0.141 \\text{ mm}$.", image: null },
      { id: "B", text: "diameter of anthracite particles is slightly greater than $0.35 \\text{ mm}$ and diameter of ilmenite particles is slightly less than $0.141 \\text{ mm}$.", image: null },
      { id: "C", text: "diameter of anthracite particles is slightly less than $0.64 \\text{ mm}$ and diameter of ilmenite particles is slightly less than $0.10 \\text{ mm}$.", image: null },
      { id: "D", text: "diameter of anthracite particles is slightly greater than $0.64 \\text{ mm}$ and diameter of ilmenite particles is slightly less than $0.10 \\text{ mm}$.", image: null }
    ],
    correctOption: "A",
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
