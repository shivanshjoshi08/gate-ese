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

const newQuestions = [
  {
    importKey: "gate_ce_2024_53",
    slug: "gate-ce-2024-53",
    sourceType: "pyq",
    exam: "GATE",
    branch: "CE",
    subject: "Geotechnical Engineering",
    topic: "Seepage Analysis",
    year: 2024,
    type: "numerical",
    numerical: true,
    question: "A homogeneous earth dam has a maximum water head difference of 15 m between the upstream and downstream sides. A flownet was drawn with the number of potential drops as 10 and the average length of the element as 3 m. Specific gravity of the soil is 2.65. For a factor of safety of 2.0 against piping failure, void ratio of the soil is _______ (rounded off to 2 decimal places).",
    answerRange: [0.63, 0.67],
    diagramRequired: false,
    status: "approved",
    images: []
  },
  {
    importKey: "gate_ce_2024_54",
    slug: "gate-ce-2024-54",
    sourceType: "pyq",
    exam: "GATE",
    branch: "CE",
    subject: "Geotechnical Engineering",
    topic: "Soil Properties",
    year: 2024,
    type: "numerical",
    numerical: true,
    question: "The in-situ percentage of voids of a sand deposit is 50%. The maximum and minimum densities of sand determined from the laboratory tests are $1.8 \\text{ g/cm}^3$ and $1.3 \\text{ g/cm}^3$, respectively. Assume the specific gravity of sand as 2.7.\n\nThe relative density index of the in-situ sand is _______ (rounded off to 2 decimal places).",
    answerRange: [0.12, 0.14],
    answerRanges: [[0.12, 0.14], [12, 14]],
    diagramRequired: false,
    status: "approved",
    images: []
  },
  {
    importKey: "gate_ce_2024_55",
    slug: "gate-ce-2024-55",
    sourceType: "pyq",
    exam: "GATE",
    branch: "CE",
    subject: "Geotechnical Engineering",
    topic: "Shear Strength",
    year: 2024,
    type: "numerical",
    numerical: true,
    question: "A drained triaxial test was conducted on a saturated sand specimen using a stress-path triaxial testing system. The specimen failed when the axial stress reached a value of $100 \\text{ kN/m}^2$ from an initial confining pressure of $300 \\text{ kN/m}^2$.\n\nThe angle of shearing plane (in degrees) with respect to horizontal is _______ (rounded off to the nearest integer).",
    answerRange: [30, 30],
    diagramRequired: false,
    status: "approved",
    images: []
  },
  {
    importKey: "gate_ce_2024_56",
    slug: "gate-ce-2024-56",
    sourceType: "pyq",
    exam: "GATE",
    branch: "CE",
    subject: "Water Resources Engineering",
    topic: "Hydrology",
    year: 2024,
    type: "numerical",
    numerical: true,
    question: "A storm with a recorded precipitation of 11.0 cm, as shown in the table, produced a direct run-off of 6.0 cm.\n\n$$\n\\begin{array}{|c|c|c|c|c|c|c|c|c|}\n\\hline\n\\text{Time from start (hours)} & 1 & 2 & 3 & 4 & 5 & 6 & 7 & 8 \\\\\n\\hline\n\\text{Recorded cumulative precipitation (cm)} & 0.5 & 1.5 & 3.1 & 5.5 & 7.3 & 8.9 & 10.2 & 11.0 \\\\\n\\hline\n\\end{array}\n$$\n\nThe $\\phi$-index of this storm is _______ cm/hr (rounded off to 2 decimal places).",
    answerRange: [0.64, 0.65],
    diagramRequired: false,
    status: "approved",
    images: []
  },
  {
    importKey: "gate_ce_2024_57",
    slug: "gate-ce-2024-57",
    sourceType: "pyq",
    exam: "GATE",
    branch: "CE",
    subject: "Environmental Engineering",
    topic: "Water Distribution",
    year: 2024,
    type: "numerical",
    numerical: true,
    question: "A 500 m long water distribution pipeline P with diameter 1.0 m, is used to convey $0.1 \\text{ m}^3\\text{/s}$ of flow. A new pipeline Q, with the same length and flow rate, is to replace P. The friction factors for P and Q are 0.04 and 0.01, respectively. The diameter of the pipeline Q (in meters) is _______ (rounded off to 2 decimal places).",
    answerRange: [0.70, 0.80],
    diagramRequired: false,
    status: "approved",
    images: []
  }
];

async function run() {
  await connectMongo();
  const now = new Date();
  
  // 1. Update 48 to 52 to be 'pyq'
  await Question.updateMany(
    { importKey: { $in: ["gate_ce_2024_48", "gate_ce_2024_49", "gate_ce_2024_50", "gate_ce_2024_51", "gate_ce_2024_52"] } },
    { $set: { sourceType: "pyq" } }
  );
  
  // 2. Upsert 53 to 57
  for (const q of newQuestions) {
    const doc = {
      ...q,
      createdAt: now,
      updatedAt: now,
      difficulty: "Medium",
      marks: 2,
      appearances: [{ exam: "GATE", year: 2024 }]
    };
    await Question.updateOne(
      { importKey: q.importKey },
      { $set: doc },
      { upsert: true }
    );
  }
  
  // 3. Fetch IDs of 48-52
  const qs48To52 = await Question.find({ importKey: { $in: ["gate_ce_2024_48", "gate_ce_2024_49", "gate_ce_2024_50", "gate_ce_2024_51", "gate_ce_2024_52"] } }, { _id: 1, importKey: 1 });
  console.log("IDs of 48 to 52:");
  qs48To52.forEach(q => console.log(`${q.importKey}: ${q._id}`));
  
  // 4. Fetch IDs of 53-57
  const qs53To57 = await Question.find({ importKey: { $in: ["gate_ce_2024_53", "gate_ce_2024_54", "gate_ce_2024_55", "gate_ce_2024_56", "gate_ce_2024_57"] } }, { _id: 1, importKey: 1 });
  console.log("IDs of 53 to 57:");
  qs53To57.forEach(q => console.log(`${q.importKey}: ${q._id}`));
  
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
