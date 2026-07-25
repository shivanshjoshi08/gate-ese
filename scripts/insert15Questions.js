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
    importKey: "gate_ce_2024_22",
    slug: "gate-ce-2024-22",
    sourceType: "practice",
    exam: "GATE",
    branch: "CE",
    subject: "Geotechnical Engineering",
    topic: "Shallow Foundation",
    year: 2024,
    type: "mcq",
    numerical: false,
    question: "The contact pressure distribution shown in the figure belongs to a",
    options: [
      { id: "A", text: "rigid footing resting on a cohesionless soil.", image: null },
      { id: "B", text: "rigid footing resting on a cohesive soil.", image: null },
      { id: "C", text: "flexible footing resting on a cohesionless soil.", image: null },
      { id: "D", text: "flexible footing resting on a cohesive soil.", image: null }
    ],
    correctOption: "B",
    diagramRequired: true
  },
  {
    importKey: "gate_ce_2024_23",
    slug: "gate-ce-2024-23",
    sourceType: "practice",
    exam: "GATE",
    branch: "CE",
    subject: "Geotechnical Engineering",
    topic: "Soil Mechanics",
    year: 2024,
    type: "mcq",
    numerical: false,
    question: "Which one of the following saturated fine-grained soils can attain a negative Skempton's pore pressure coefficient ($A$)?",
    options: [
      { id: "A", text: "Quick clays", image: null },
      { id: "B", text: "Normally-consolidated clays", image: null },
      { id: "C", text: "Lightly-consolidated clays", image: null },
      { id: "D", text: "Over-consolidated clays", image: null }
    ],
    correctOption: "D"
  },
  {
    importKey: "gate_ce_2024_24",
    slug: "gate-ce-2024-24",
    sourceType: "practice",
    exam: "GATE",
    branch: "CE",
    subject: "Fluid Mechanics",
    topic: "Fluid Properties",
    year: 2024,
    type: "mcq",
    numerical: false,
    question: "The following figure shows a plot between shear stress and velocity gradient for materials/fluids P, Q, R, S, and T.\n\nWhich one of the following options is CORRECT?",
    options: [
      { id: "A", text: "P $\\rightarrow$ Ideal Fluid; Q $\\rightarrow$ Ideal Bingham plastic; R $\\rightarrow$ Non-Newtonian fluid; S $\\rightarrow$ Newtonian fluid", image: null },
      { id: "B", text: "P $\\rightarrow$ Real solid; Q $\\rightarrow$ Ideal Bingham plastic; S $\\rightarrow$ Newtonian fluid; T $\\rightarrow$ Ideal Fluid", image: null },
      { id: "C", text: "P $\\rightarrow$ Ideal Fluid; Q $\\rightarrow$ Ideal Bingham plastic; R $\\rightarrow$ Non-Newtonian fluid; T $\\rightarrow$ Real solid", image: null },
      { id: "D", text: "P $\\rightarrow$ Real solid; Q $\\rightarrow$ Newtonian fluid; R $\\rightarrow$ Ideal Bingham plastic; T $\\rightarrow$ Ideal Fluid", image: null }
    ],
    correctOption: "B",
    diagramRequired: true
  },
  {
    importKey: "gate_ce_2024_25",
    slug: "gate-ce-2024-25",
    sourceType: "practice",
    exam: "GATE",
    branch: "CE",
    subject: "Environmental Engineering",
    topic: "Air Pollution",
    year: 2024,
    type: "mcq",
    numerical: false,
    question: "What is the CORRECT match between the air pollutants and treatment techniques given in the table?\n\n| Air pollutants | Treatment techniques |\n|---|---|\n| P - NO$_2$ | i - Flaring |\n| Q - SO$_2$ | ii - Cyclonic separator |\n| R - CO | iii - Lime scrubbing |\n| S - Particles | iv - NH$_3$ injection |",
    options: [
      { id: "A", text: "P-i, Q-ii, R-iii, S-iv", image: null },
      { id: "B", text: "P-ii, Q-i, R-iv, S-iii", image: null },
      { id: "C", text: "P-ii, Q-iii, R-iv, S-i", image: null },
      { id: "D", text: "P-iv, Q-iii, R-i, S-ii", image: null }
    ],
    correctOption: "D"
  },
  {
    importKey: "gate_ce_2024_26",
    slug: "gate-ce-2024-26",
    sourceType: "practice",
    exam: "GATE",
    branch: "CE",
    subject: "Environmental Engineering",
    topic: "Waste Water",
    year: 2024,
    type: "mcq",
    numerical: false,
    question: "Which one of the following products is NOT obtained in anaerobic decomposition of glucose?",
    options: [
      { id: "A", text: "CO$_2$", image: null },
      { id: "B", text: "CH$_4$", image: null },
      { id: "C", text: "H$_2$S", image: null },
      { id: "D", text: "H$_2$O", image: null }
    ],
    correctOption: "C"
  },
  {
    importKey: "gate_ce_2024_27",
    slug: "gate-ce-2024-27",
    sourceType: "practice",
    exam: "GATE",
    branch: "CE",
    subject: "Transportation Engineering",
    topic: "Airport Engineering",
    year: 2024,
    type: "mcq",
    numerical: false,
    question: "The longitudinal sections of a runway have gradients as shown in the table.\n\n| End to end for sections of runway (m) | Gradient (%) |\n|---|---|\n| 0 to 200 | +1.0 |\n| 200 to 600 | -1.0 |\n| 600 to 1200 | +0.8 |\n| 1200 to 1600 | +0.2 |\n| 1600 to 2000 | -0.5 |\n\nConsider the reduced level (RL) at the starting point of the runway as $100 \\text{ m}$.\nThe effective gradient of the runway is",
    options: [
      { id: "A", text: "0.02%", image: null },
      { id: "B", text: "0.35%", image: null },
      { id: "C", text: "0.28%", image: null },
      { id: "D", text: "0.18%", image: null }
    ],
    correctOption: "C"
  },
  {
    importKey: "gate_ce_2024_28",
    slug: "gate-ce-2024-28",
    sourceType: "practice",
    exam: "GATE",
    branch: "CE",
    subject: "Transportation Engineering",
    topic: "Highway Engineering",
    year: 2024,
    type: "mcq",
    numerical: false,
    question: "In general, the outer edge is raised above the inner edge in horizontal curves for",
    options: [
      { id: "A", text: "Highways, Railways, and Taxiways", image: null },
      { id: "B", text: "Highways and Railways only", image: null },
      { id: "C", text: "Railways and Taxiways only", image: null },
      { id: "D", text: "Highways only", image: null }
    ],
    correctOption: "B"
  },
  {
    importKey: "gate_ce_2024_29",
    slug: "gate-ce-2024-29",
    sourceType: "practice",
    exam: "GATE",
    branch: "CE",
    subject: "Transportation Engineering",
    topic: "Pavement Design",
    year: 2024,
    type: "mcq",
    numerical: false,
    question: "Various stresses in jointed plain concrete pavement with slab size of $3.5 \\text{ m} \\times 4.5 \\text{ m}$ are denoted as follows:\n\nWheel load stress at interior = $S_{wl}^i$\nWheel load stress at edge = $S_{wl}^e$\nWheel load stress at corner = $S_{wl}^c$\nWarping stress at interior = $S_t^i$\nWarping stress at edge = $S_t^e$\nWarping stress at corner = $S_t^c$\nFrictional stress between slab and supporting layer = $S_f$\n\nThe critical stress combination in the concrete slab during a summer midnight is",
    options: [
      { id: "A", text: "$S_{wl}^c + S_t^c$", image: null },
      { id: "B", text: "$S_{wl}^e + S_t^e + S_f$", image: null },
      { id: "C", text: "$S_{wl}^e + S_t^e - S_f$", image: null },
      { id: "D", text: "$S_{wl}^c + S_t^c + S_f$", image: null }
    ],
    correctOption: "A"
  },
  {
    importKey: "gate_ce_2024_30",
    slug: "gate-ce-2024-30",
    sourceType: "practice",
    exam: "GATE",
    branch: "CE",
    subject: "Geomatics Engineering",
    topic: "Photogrammetry",
    year: 2024,
    type: "mcq",
    numerical: false,
    question: "For a reconnaissance survey, it is necessary to obtain vertical aerial photographs of a terrain at an average scale of 1: 13000 using a camera. If the permissible flying height is assumed as $3000 \\text{ m}$ above a datum and the average terrain elevation is $1050 \\text{ m}$ above the datum, the required focal length (in mm) of the camera is",
    options: [
      { id: "A", text: "100", image: null },
      { id: "B", text: "150", image: null },
      { id: "C", text: "125", image: null },
      { id: "D", text: "200", image: null }
    ],
    correctOption: "B"
  },
  {
    importKey: "gate_ce_2024_31",
    slug: "gate-ce-2024-31",
    sourceType: "practice",
    exam: "GATE",
    branch: "CE",
    subject: "Geomatics Engineering",
    topic: "Surveying Instruments",
    year: 2024,
    type: "mcq",
    numerical: false,
    question: "What is the CORRECT match between the survey instruments/parts of instruments shown in the table and the operations carried out with them?\n\n| Instruments/Parts of instruments | Operations |\n|---|---|\n| P - Bubble tube | i - Tacheometry |\n| Q - Plumb bob | ii - Minor movements |\n| R - Tangent screw | iii - Centering |\n| S - Stadia cross-wire | iv - Levelling |",
    options: [
      { id: "A", text: "P-ii, Q-iii, R-iv, S-i", image: null },
      { id: "B", text: "P-iv, Q-iii, R-ii, S-i", image: null },
      { id: "C", text: "P-i, Q-iii, R-ii, S-iv", image: null },
      { id: "D", text: "P-iii, Q-iv, R-i, S-ii", image: null }
    ],
    correctOption: "B"
  },
  {
    importKey: "gate_ce_2024_32",
    slug: "gate-ce-2024-32",
    sourceType: "practice",
    exam: "GATE",
    branch: "CE",
    subject: "Geomatics Engineering",
    topic: "Surveying",
    year: 2024,
    type: "mcq",
    numerical: false,
    question: "To finalize the direction of a survey, four surveyors set up a theodolite at a station P and performed all the temporary adjustments. From the station P, each of the surveyors observed the bearing to a tower located at station Q with the same instrument without shifting it. The bearings observed by the surveyors are $30^\\circ 30' 00''$, $30^\\circ 29' 40''$, $30^\\circ 30' 20''$ and $30^\\circ 31' 20''$. Assuming that each measurement is taken with equal precision, the most probable value of the bearing is",
    options: [
      { id: "A", text: "$30^\\circ 29' 40''$", image: null },
      { id: "B", text: "$30^\\circ 30' 20''$", image: null },
      { id: "C", text: "$30^\\circ 30' 00''$", image: null },
      { id: "D", text: "$30^\\circ 31' 20''$", image: null }
    ],
    correctOption: "B"
  },
  {
    importKey: "gate_ce_2024_33",
    slug: "gate-ce-2024-33",
    sourceType: "practice",
    exam: "GATE",
    branch: "CE",
    subject: "Solid Mechanics",
    topic: "Bending and Shear",
    year: 2024,
    type: "nat",
    numerical: true,
    question: "The steel angle section shown in the figure has elastic section modulus of $150.92 \\text{ cm}^3$ about the horizontal X-X axis, which passes through the centroid of the section.\n\nThe shape factor of the section is _______ (rounded off to 2 decimal places).",
    options: [],
    correctOption: null,
    answerRange: [1.75, 1.85],
    diagramRequired: true
  },
  {
    importKey: "gate_ce_2024_34",
    slug: "gate-ce-2024-34",
    sourceType: "practice",
    exam: "GATE",
    branch: "CE",
    subject: "Geotechnical Engineering",
    topic: "Deep Foundation",
    year: 2024,
    type: "nat",
    numerical: true,
    question: "A reinforced concrete pile of $10 \\text{ m}$ length and $0.7 \\text{ m}$ diameter is embedded in a saturated pure clay with unit cohesion of $50 \\text{ kPa}$. If the adhesion factor is $0.5$, the net ultimate uplift pullout capacity (in kN) of the pile is _______ (rounded off to the nearest integer).",
    options: [],
    correctOption: null,
    answerRange: [545, 555]
  },
  {
    importKey: "gate_ce_2024_35",
    slug: "gate-ce-2024-35",
    sourceType: "practice",
    exam: "GATE",
    branch: "CE",
    subject: "Fluid Mechanics",
    topic: "Open Channel Flow",
    year: 2024,
    type: "nat",
    numerical: true,
    question: "A $2 \\text{ m}$ wide rectangular channel is carrying a discharge of $30 \\text{ m}^3/\\text{s}$ at a bed slope of $1 \\text{ in } 300$. Assuming the energy correction factor as $1.1$ and acceleration due to gravity as $10 \\text{ m/s}^2$, the critical depth of flow (in meters) is _______ (rounded off to 2 decimal places).",
    options: [],
    correctOption: null,
    answerRange: [2.88, 2.94]
  },
  {
    importKey: "gate_ce_2024_36",
    slug: "gate-ce-2024-36",
    sourceType: "practice",
    exam: "GATE",
    branch: "CE",
    subject: "Engineering Mathematics",
    topic: "Probability and Statistics",
    year: 2024,
    type: "mcq",
    numerical: false,
    question: "In a sample of 100 heart patients, each patient has $80\\%$ chance of having a heart attack without medicine X. It is clinically known that medicine X reduces the probability of having a heart attack by $50\\%$. Medicine X is taken by 50 of these 100 patients. The probability that a randomly selected patient, out of the 100 patients, takes medicine X and has a heart attack is",
    options: [
      { id: "A", text: "40%", image: null },
      { id: "B", text: "60%", image: null },
      { id: "C", text: "20%", image: null },
      { id: "D", text: "30%", image: null }
    ],
    correctOption: "C"
  }
];

async function run() {
  await connectMongo();
  for (const data of questions) {
    let q = await Question.findOne({ importKey: data.importKey });
    if (!q) {
      q = new Question(data);
    } else {
      Object.assign(q, data);
    }
    await q.save();
    console.log("Upserted:", data.importKey);
  }
  console.log("All 15 questions added successfully.");
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
