const { resolveMongoUriForScript } = require('./mongo-atlas-doh');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const questionSchema = new mongoose.Schema({
  displayId: { type: String, required: true, unique: true },
  importKey: { type: String, unique: true, sparse: true },
  slug: { type: String },
  sourceType: { type: String },
  exam: { type: String, required: true },
  branch: { type: String },
  subject: { type: String, required: true },
  topic: { type: String },
  year: { type: Number, required: true },
  paper: { type: String },
  type: { type: String, required: true },
  numerical: { type: Boolean, default: false },
  question: { type: String, required: true },
  options: [{
    id: String,
    text: String
  }],
  correctOption: { type: String },
  solution: {
    text: String,
    latex: String,
    images: [String]
  },
  difficulty: { type: String },
  marks: { type: Number },
  status: { type: String },
  images: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);

const questionsToInsert = [
  {
    displayId: 'gate_ce_2024_15',
    exam: 'GATE',
    branch: 'CE',
    subject: 'Design of Concrete Structures',
    topic: 'Concrete Mix Design',
    year: 2024,
    paper: 'CE',
    type: 'mcq',
    numerical: false,
    question: `Concrete of characteristic strength 30 MPa is required. If 40 specimens of concrete cubes are to be tested, the minimum number of specimens having at least 30 MPa strength should be`,
    options: [
      { id: 'A', text: '35' },
      { id: 'B', text: '37' },
      { id: 'C', text: '38' },
      { id: 'D', text: '39' }
    ],
    correctOption: 'C',
    solution: {
      text: `As per IS 456:2000, characteristic strength is defined as the strength of material below which not more than 5% of the test results are expected to fall.\n\nMaximum number of specimens that can have strength less than 30 MPa = $5\\%$ of $40 = \\frac{5}{100} \\times 40 = 2$.\n\nTherefore, the minimum number of specimens having at least 30 MPa strength should be $40 - 2 = 38$.`
    },
    difficulty: 'Easy',
    marks: 1,
    status: 'approved',
    sourceType: 'practice',
    importKey: 'gate_ce_2024_15'
  },
  {
    displayId: 'gate_ce_2024_16',
    exam: 'GATE',
    branch: 'CE',
    subject: 'Construction Management',
    topic: 'Estimation and Costing',
    year: 2024,
    paper: 'CE',
    type: 'mcq',
    numerical: false,
    question: `Consider the statements P and Q.

P: Client's Preliminary Estimate is used for budgeting costs toward the end of planning and design phase.
Q: Client's Detailed Estimate is used for controlling costs during the execution of the project.

Which one of the following options is CORRECT?`,
    options: [
      { id: 'A', text: 'Both P and Q are TRUE' },
      { id: 'B', text: 'P is TRUE and Q is FALSE' },
      { id: 'C', text: 'Both P and Q are FALSE' },
      { id: 'D', text: 'P is FALSE and Q is TRUE' }
    ],
    correctOption: 'A',
    solution: {
      text: `Statement P is TRUE: A preliminary (or approximate) estimate is prepared in the initial stages (planning and design) to evaluate the feasibility of the project and budget the approximate cost.\n\nStatement Q is TRUE: A detailed estimate provides accurate item-wise quantities and costs. It serves as a baseline during the execution phase to control and monitor the actual expenditures of the project.\n\nHence, both statements P and Q are true.`
    },
    difficulty: 'Easy',
    marks: 1,
    status: 'approved',
    sourceType: 'practice',
    importKey: 'gate_ce_2024_16'
  },
  {
    displayId: 'gate_ce_2024_17',
    exam: 'GATE',
    branch: 'CE',
    subject: 'Construction Management',
    topic: 'Formwork',
    year: 2024,
    paper: 'CE',
    type: 'mcq',
    numerical: false,
    question: `The following figure shows the arrangement of formwork for casting a cantilever RC beam.

The correct sequence of removing the Shores/Props is`,
    images: ['/images/gate_ce_2024_17.svg'],
    options: [
      { id: 'A', text: 'S1 $\\rightarrow$ S2 $\\rightarrow$ S3 $\\rightarrow$ S4 $\\rightarrow$ S5' },
      { id: 'B', text: 'S5 $\\rightarrow$ S4 $\\rightarrow$ S3 $\\rightarrow$ S2 $\\rightarrow$ S1' },
      { id: 'C', text: 'S3 $\\rightarrow$ S2 $\\rightarrow$ S4 $\\rightarrow$ S1 $\\rightarrow$ S5' },
      { id: 'D', text: 'S3 $\\rightarrow$ S4 $\\rightarrow$ S2 $\\rightarrow$ S5 $\\rightarrow$ S1' }
    ],
    correctOption: 'B',
    solution: {
      text: `For a cantilever beam, the maximum bending moment occurs at the fixed support (the column), and the maximum deflection occurs at the free end. \n\nWhen removing shores/props from a cantilever structure, they must be removed sequentially starting from the free end (S5) and moving towards the fixed support (S1). \nIf the prop near the fixed support (S1) is removed first, the beam could suddenly experience excessive bending stresses causing failure before gaining full self-supporting strength. \n\nTherefore, the correct sequence is S5 $\\rightarrow$ S4 $\\rightarrow$ S3 $\\rightarrow$ S2 $\\rightarrow$ S1.`
    },
    difficulty: 'Moderate',
    marks: 1,
    status: 'approved',
    sourceType: 'practice',
    importKey: 'gate_ce_2024_17'
  },
  {
    displayId: 'gate_ce_2024_18',
    exam: 'GATE',
    branch: 'CE',
    subject: 'Geotechnical Engineering',
    topic: 'Shallow Foundations',
    year: 2024,
    paper: 'CE',
    type: 'mcq',
    numerical: false,
    question: `A 2 m wide strip footing is founded at a depth of 1.5 m below the ground level in a homogeneous pure clay bed. The clay bed has unit cohesion of 40 kPa. Due to seasonal fluctuations of water table from peak summer to peak monsoon period, the net ultimate bearing capacity of the footing, as per Terzaghi's theory, will`,
    options: [
      { id: 'A', text: 'remain the same' },
      { id: 'B', text: 'decrease' },
      { id: 'C', text: 'increase' },
      { id: 'D', text: 'become zero' }
    ],
    correctOption: 'A',
    solution: {
      text: `According to Terzaghi's bearing capacity theory, for a strip footing, the ultimate bearing capacity is given by:\n$$q_u = c N_c + \\sigma' N_q + 0.5 \\gamma B N_\\gamma$$\n\nFor pure clay, the angle of internal friction $\\phi = 0^{\\circ}$. Therefore, the bearing capacity factors are:\n$N_c = 5.7$, $N_q = 1$, and $N_\\gamma = 0$.\n\nSubstituting these values, the ultimate bearing capacity is:\n$$q_u = 5.7 c + \\sigma'$$\nwhere $\\sigma' = \\gamma D_f$ (effective overburden pressure).\n\nThe net ultimate bearing capacity ($q_{nu}$) is the ultimate bearing capacity minus the effective overburden pressure:\n$$q_{nu} = q_u - \\sigma' = (5.7 c + \\sigma') - \\sigma' = 5.7 c$$\n\nAs we can see, $q_{nu}$ depends only on the cohesion ($c$). It does not depend on the unit weight ($\\gamma$) or the water table position. Hence, the net ultimate bearing capacity will remain the same.`
    },
    difficulty: 'Moderate',
    marks: 1,
    status: 'approved',
    sourceType: 'practice',
    importKey: 'gate_ce_2024_18'
  },
  {
    displayId: 'gate_ce_2024_19',
    exam: 'GATE',
    branch: 'CE',
    subject: 'Geotechnical Engineering',
    topic: 'Soil Properties',
    year: 2024,
    paper: 'CE',
    type: 'mcq',
    numerical: false,
    question: `Consider the statements P and Q.\n\nP: Soil particles formed by mechanical weathering, and close to their origin are generally subrounded.\nQ: Activity of the clay physically signifies its swell potential.\n\nWhich one of the following options is CORRECT?`,
    options: [
      { id: 'A', text: 'Both P and Q are TRUE' },
      { id: 'B', text: 'P is TRUE and Q is FALSE' },
      { id: 'C', text: 'Both P and Q are FALSE' },
      { id: 'D', text: 'P is FALSE and Q is TRUE' }
    ],
    correctOption: 'D',
    solution: {
      text: `Statement P is FALSE: Soil particles formed by mechanical weathering and located close to their origin (e.g., talus deposits) are typically highly angular, not subrounded. Subrounded or rounded particles undergo significant transportation and abrasion (e.g., in rivers).\n\nStatement Q is TRUE: The Activity ($A$) of clay is defined as the ratio of its Plasticity Index ($I_p$) to the percentage of clay-sized particles (finer than $2 \\mu m$). It physically signifies the water-holding capacity and swell-shrink potential of the clay. Highly active clays (like Bentonite/Montmorillonite) have high swell potential.\n\nTherefore, P is FALSE and Q is TRUE.`
    },
    difficulty: 'Moderate',
    marks: 1,
    status: 'approved',
    sourceType: 'practice',
    importKey: 'gate_ce_2024_19'
  },
  {
    displayId: 'gate_ce_2024_20',
    exam: 'GATE',
    branch: 'CE',
    subject: 'Fluid Mechanics',
    topic: 'Open Channel Flow',
    year: 2024,
    paper: 'CE',
    type: 'mcq',
    numerical: false,
    question: `The number of degrees of freedom for a natural open channel flow with a mobile bed is`,
    options: [
      { id: 'A', text: '2' },
      { id: 'B', text: '3' },
      { id: 'C', text: '4' },
      { id: 'D', text: '5' }
    ],
    correctOption: 'C',
    solution: {
      text: `For a natural open channel with a mobile bed (alluvial channel), the stream can adjust its geometry and characteristics over time. There are typically 4 degrees of freedom, which represent the parameters the channel can adjust to attain equilibrium/regime conditions:\n1. Depth of flow ($y$)\n2. Channel width ($B$)\n3. Bed slope ($S$)\n4. Channel planform / Bed forms (which affects roughness/velocity)\n\nTherefore, the number of degrees of freedom is 4.`
    },
    difficulty: 'Moderate',
    marks: 1,
    status: 'approved',
    sourceType: 'practice',
    importKey: 'gate_ce_2024_20'
  },
  {
    displayId: 'gate_ce_2024_21',
    exam: 'GATE',
    branch: 'CE',
    subject: 'Environmental Engineering',
    topic: 'Solid Waste Management',
    year: 2024,
    paper: 'CE',
    type: 'mcq',
    numerical: false,
    question: `The following table gives various components of Municipal Solid Waste (MSW) and a list of treatment/separation techniques.\n\n$$
\\begin{array}{|l|l|}
\\hline
\\textbf{Component of MSW} & \\textbf{Treatment/separation technique} \\\\
\\hline
\\text{P - Ferrous metals} & \\text{i - Incineration} \\\\
\\text{Q - Aluminum and copper} & \\text{ii - Rapid composting} \\\\
\\text{R - Food waste} & \\text{iii - Eddy current separator} \\\\
\\text{S - Cardboard} & \\text{iv - Magnetic separator} \\\\
\\hline
\\end{array}
$$\n\nThe CORRECT match is`,
    options: [
      { id: 'A', text: 'P-iii, Q-iv, R-i, S-ii' },
      { id: 'B', text: 'P-iv, Q-iii, R-ii, S-i' },
      { id: 'C', text: 'P-iii, Q-iv, R-ii, S-i' },
      { id: 'D', text: 'P-iv, Q-iii, R-i, S-ii' }
    ],
    correctOption: 'B',
    solution: {
      text: `- **P - Ferrous metals:** Separated using a Magnetic separator (iv).\n- **Q - Aluminum and copper:** These are non-ferrous conducting metals. They are separated using an Eddy current separator (iii) which repels them.\n- **R - Food waste:** Highly organic and biodegradable material, treated best by Rapid composting (ii).\n- **S - Cardboard:** High calorific value and combustible, treated effectively by Incineration (i).\n\nThe correct match is P-iv, Q-iii, R-ii, S-i.`
    },
    difficulty: 'Easy',
    marks: 1,
    status: 'approved',
    sourceType: 'practice',
    importKey: 'gate_ce_2024_21'
  },
  {
    displayId: 'gate_ce_2024_22',
    exam: 'GATE',
    branch: 'CE',
    subject: 'Transportation Engineering',
    topic: 'Highway Geometric Design',
    year: 2024,
    paper: 'CE',
    type: 'mcq',
    numerical: false,
    question: `A car is travelling at a speed of 60 km/hr on a section of a National Highway having a downward gradient of $2\\%$. The driver of the car suddenly observes a stopped vehicle on the car path at a distance 130 m ahead, and applies brake. If the brake efficiency is $60\\%$, coefficient of friction is $0.7$, driver's reaction time is $2.5\\text{ s}$, and acceleration due to gravity is $9.81\\text{ m/s}^2$, the distance (in meters) required by the driver to bring the car to a safe stop lies in the range`,
    options: [
      { id: 'A', text: '126 to 130' },
      { id: 'B', text: '41 to 45' },
      { id: 'C', text: '33 to 37' },
      { id: 'D', text: '75 to 79' }
    ],
    correctOption: 'D',
    solution: {
      text: `Speed of the car, $v = 60\\text{ km/hr} = 60 \\times \\frac{5}{18} = 16.67\\text{ m/s}$.\nReaction time, $t_r = 2.5\\text{ s}$.\nLag distance $d_1 = v \\times t_r = 16.67 \\times 2.5 = 41.675\\text{ m}$.\n\nThe braking distance $d_2$ is given by:\n$$d_2 = \\frac{v^2}{2g(f_{\\text{eff}} - n)}$$\nwhere downward gradient $n = 2\\% = 0.02$.\nEffective friction $f_{\\text{eff}} = f \\times \\eta = 0.7 \\times 0.6 = 0.42$.\n\n$$d_2 = \\frac{(16.67)^2}{2 \\times 9.81 \\times (0.42 - 0.02)}$$\n$$d_2 = \\frac{277.889}{19.62 \\times 0.40} = \\frac{277.889}{7.848} \\approx 35.408\\text{ m}$$\n\nTotal Stopping Sight Distance (SSD) = $d_1 + d_2 = 41.675 + 35.408 = 77.08\\text{ m}$.\n\nThis distance lies in the range of 75 to 79.`
    },
    difficulty: 'Moderate',
    marks: 1,
    status: 'approved',
    sourceType: 'practice',
    importKey: 'gate_ce_2024_22'
  },
  {
    displayId: 'gate_ce_2024_23',
    exam: 'GATE',
    branch: 'CE',
    subject: 'Transportation Engineering',
    topic: 'Airport Engineering',
    year: 2024,
    paper: 'CE',
    type: 'mcq',
    numerical: false,
    question: `As per the International Civil Aviation Organization (ICAO), the basic runway length is increased by $x$ ($\\mu$%) for every $y$ (m) raise in elevation from the Mean Sea Level (MSL). The values of $x$ and $y$, respectively, are`,
    options: [
      { id: 'A', text: '$7\\%$ and $300\\text{ m}$' },
      { id: 'B', text: '$5\\%$ and $200\\text{ m}$' },
      { id: 'C', text: '$4\\%$ and $500\\text{ m}$' },
      { id: 'D', text: '$10\\%$ and $1000\\text{ m}$' }
    ],
    correctOption: 'A',
    solution: {
      text: `According to ICAO (International Civil Aviation Organization) guidelines for geometric design of runways, the correction for elevation states that the basic runway length should be increased by **7%** for every **300 meters** rise in elevation above Mean Sea Level (MSL).\n\nTherefore, $x = 7$ and $y = 300$.`
    },
    difficulty: 'Easy',
    marks: 1,
    status: 'approved',
    sourceType: 'practice',
    importKey: 'gate_ce_2024_23'
  }
];

async function main() {
  try {
    const uri = await resolveMongoUriForScript(MONGODB_URI);
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    let inserted = 0;
    for (const q of questionsToInsert) {
      if (!q.slug) {
        q.slug = q.displayId.replace(/_/g, "-");
      }
      const existing = await Question.findOne({ displayId: q.displayId });
      if (!existing) {
        await Question.create(q);
        inserted++;
        console.log(`Inserted: ${q.displayId}`);
      } else {
        await Question.updateOne({ displayId: q.displayId }, { $set: q });
        console.log(`Updated: ${q.displayId}`);
      }
    }
    console.log(`Finished processing. Inserted ${inserted} new questions.`);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
