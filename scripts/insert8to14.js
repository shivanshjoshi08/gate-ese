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
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Question = mongoose.models.Question || mongoose.model('Question', questionSchema);

const questionsToInsert = [
  {
    displayId: 'gate_ce_2024_08',
    exam: 'GATE',
    branch: 'CE',
    subject: 'General Aptitude',
    topic: 'Data Interpretation',
    year: 2024,
    paper: 'CE',
    type: 'mcq',
    numerical: false,
    question: `The chart given below compares the Installed Capacity (MW) of four power generation technologies, T1, T2, T3, and T4, and their Electricity Generation (MWh) in a time of 1000 hours (h).

| Power Generation Technology | Installed Capacity (MW) | Electricity Generation (MWh) |
| :--- | :--- | :--- |
| T1 | 20 | 10000 |
| T2 | 30 | 9000 |
| T3 | 15 | 7000 |
| T4 | 40 | 12000 |

The Capacity Factor of a power generation technology is:
$$Capacity Factor = \\frac{Electricity Generation (MWh)}{Installed Capacity (MW) \\times 1000 (h)}$$
Which one of the given technologies has the highest Capacity Factor?`,
    options: [
      { id: 'A', text: 'T1' },
      { id: 'B', text: 'T2' },
      { id: 'C', text: 'T3' },
      { id: 'D', text: 'T4' }
    ],
    correctOption: 'A',
    solution: {
      text: `Let's calculate the capacity factor for each technology:\n- T1: $\\frac{10000}{20 \\times 1000} = 0.50$\n- T2: $\\frac{9000}{30 \\times 1000} = 0.30$\n- T3: $\\frac{7000}{15 \\times 1000} \\approx 0.47$\n- T4: $\\frac{12000}{40 \\times 1000} = 0.30$\n\nTechnology T1 has the highest Capacity Factor.`
    },
    difficulty: 'Moderate',
    marks: 1,
    status: 'approved',
    sourceType: 'practice',
    importKey: 'gate_ce_2024_08'
  },
  {
    displayId: 'gate_ce_2024_09',
    exam: 'GATE',
    branch: 'CE',
    subject: 'General Aptitude',
    topic: 'Spatial Aptitude',
    year: 2024,
    paper: 'CE',
    type: 'mcq',
    numerical: false,
    question: `In the 4 $\\times$ 4 array shown below, each cell of the first three columns has either a cross (X) or a number, as per the given rule.

| | | | |
|:---:|:---:|:---:|:---:|
| 1 | 1 | 2 | |
| 2 | X | 3 | |
| 2 | X | 4 | |
| 1 | 2 | X | |

Rule: The number in a cell represents the count of crosses around its immediate neighboring cells (left, right, top, bottom, diagonals).

As per this rule, the **maximum** number of crosses possible in the empty column is`,
    options: [
      { id: 'A', text: '0' },
      { id: 'B', text: '1' },
      { id: 'C', text: '2' },
      { id: 'D', text: '3' }
    ],
    correctOption: 'C',
    solution: {
      text: `By analyzing the grid, the '2' in the top row needs 2 adjacent crosses. The adjacent cells are (1,2) with '1', (2,2) with 'X', and (2,3) with '3', plus the empty cells in the fourth column. \n\nSimilarly, tracing the requirements of all numbered cells downwards confirms the placement of crosses. The maximum number of crosses that can be placed in the fourth column without violating the rules of the adjacent numbers is 2.`
    },
    difficulty: 'Moderate',
    marks: 1,
    status: 'approved',
    sourceType: 'practice',
    importKey: 'gate_ce_2024_09'
  },
  {
    displayId: 'gate_ce_2024_10',
    exam: 'GATE',
    branch: 'CE',
    subject: 'General Aptitude',
    topic: 'Quantitative Aptitude',
    year: 2024,
    paper: 'CE',
    type: 'mcq',
    numerical: false,
    question: `During a half-moon phase, the Earth-Moon-Sun form a right triangle. If the Moon-Earth-Sun angle at this half-moon phase is measured to be $89.85^{\\circ}$, the ratio of the Earth-Sun and Earth-Moon distances is closest to`,
    options: [
      { id: 'A', text: '328' },
      { id: 'B', text: '382' },
      { id: 'C', text: '238' },
      { id: 'D', text: '283' }
    ],
    correctOption: 'B',
    solution: {
      text: `The Earth, Moon, and Sun form a right-angled triangle with the right angle at the Moon.\nThe Moon-Earth-Sun angle is $89.85^{\\circ}$.\n\nThe ratio of the Earth-Sun distance (Hypotenuse) to the Earth-Moon distance (Adjacent) is given by:\n$$\\sec(89.85^{\\circ}) = \\frac{1}{\\cos(89.85^{\\circ})}$$\n\n$$\\cos(89.85^{\\circ}) = \\cos(90^{\\circ} - 0.15^{\\circ}) = \\sin(0.15^{\\circ})$$\nConverting $0.15^{\\circ}$ to radians: $0.15 \\times \\frac{\\pi}{180} \\approx 0.002618$ rad.\nFor small angles, $\\sin(\\theta) \\approx \\theta$, so $\\sin(0.15^{\\circ}) \\approx 0.002618$.\n\nRatio = $\\frac{1}{0.002618} \\approx 382$.`
    },
    difficulty: 'Moderate',
    marks: 1,
    status: 'approved',
    sourceType: 'practice',
    importKey: 'gate_ce_2024_10'
  },
  {
    displayId: 'gate_ce_2024_11',
    exam: 'GATE',
    branch: 'CE',
    subject: 'Engineering Mathematics',
    topic: 'Calculus',
    year: 2024,
    paper: 'CE',
    type: 'mcq',
    numerical: false,
    question: `The smallest positive root of the equation\n$$x^5 - 5 x^4 - 10 x^3 + 50 x^2 + 9 x - 45 = 0$$\nlies in the range`,
    options: [
      { id: 'A', text: '$0 < x \\le 2$' },
      { id: 'B', text: '$2 < x \\le 4$' },
      { id: 'C', text: '$6 \\le x \\le 8$' },
      { id: 'D', text: '$10 \\le x \\le 100$' }
    ],
    correctOption: 'A',
    solution: {
      text: `Let's factorize the given equation:\n$$x^4(x - 5) - 10x^2(x - 5) + 9(x - 5) = 0$$\n$$(x^4 - 10x^2 + 9)(x - 5) = 0$$\n$$(x^2 - 1)(x^2 - 9)(x - 5) = 0$$\n$$(x - 1)(x + 1)(x - 3)(x + 3)(x - 5) = 0$$\n\nThe roots are $1, -1, 3, -3, 5$.\nThe positive roots are $1, 3, 5$.\nThe smallest positive root is $x = 1$.\n\nThe value 1 lies in the range $0 < x \\le 2$.`
    },
    difficulty: 'Moderate',
    marks: 1,
    status: 'approved',
    sourceType: 'practice',
    importKey: 'gate_ce_2024_11'
  },
  {
    displayId: 'gate_ce_2024_12',
    exam: 'GATE',
    branch: 'CE',
    subject: 'Engineering Mathematics',
    topic: 'Differential Equations',
    year: 2024,
    paper: 'CE',
    type: 'mcq',
    numerical: false,
    question: `The second-order differential equation in an unknown function $u: u(x, y)$ is defined as\n$$\\frac{\\partial^2 u}{\\partial x^2} = 2$$\nAssuming $g: g(x), f: f(y)$, and $h: h(y)$, the general solution of the above differential equation is`,
    options: [
      { id: 'A', text: '$u = x^2 + f(y) + g(x)$' },
      { id: 'B', text: '$u = x^2 + x f(y) + h(y)$' },
      { id: 'C', text: '$u = x^2 + x f(y) + g(x)$' },
      { id: 'D', text: '$u = x^2 + f(y) + y g(x)$' }
    ],
    correctOption: 'B',
    solution: {
      text: `Given the partial differential equation:\n$$\\frac{\\partial^2 u}{\\partial x^2} = 2$$\n\nIntegrating once with respect to $x$, we get:\n$$\\frac{\\partial u}{\\partial x} = 2x + f_1(y)$$\nwhere $f_1(y)$ is a function of $y$ acting as a constant of integration.\n\nIntegrating again with respect to $x$, we get:\n$$u = x^2 + x f_1(y) + h(y)$$\nwhere $h(y)$ is another function of $y$.\n\nReplacing $f_1(y)$ with $f(y)$, the general solution is $u = x^2 + x f(y) + h(y)$.`
    },
    difficulty: 'Easy',
    marks: 1,
    status: 'approved',
    sourceType: 'practice',
    importKey: 'gate_ce_2024_12'
  },
  {
    displayId: 'gate_ce_2024_13',
    exam: 'GATE',
    branch: 'CE',
    subject: 'Engineering Mathematics',
    topic: 'Probability and Statistics',
    year: 2024,
    paper: 'CE',
    type: 'mcq',
    numerical: false,
    question: `The probability that a student passes only in Mathematics is $\\frac{1}{3}$. The probability that the student passes only in English is $\\frac{4}{9}$. The probability that the student passes in both of these subjects is $\\frac{1}{6}$. The probability that the student will pass in at least one of these two subjects is`,
    options: [
      { id: 'A', text: '$\\frac{17}{18}$' },
      { id: 'B', text: '$\\frac{11}{18}$' },
      { id: 'C', text: '$\\frac{14}{18}$' },
      { id: 'D', text: '$\\frac{1}{18}$' }
    ],
    correctOption: 'A',
    solution: {
      text: `Let $P(M)$ be the probability of passing Mathematics and $P(E)$ be the probability of passing English.\n\nGiven:\n- Probability of passing *only* Mathematics: $P(M \\cap E') = \\frac{1}{3}$\n- Probability of passing *only* English: $P(E \\cap M') = \\frac{4}{9}$\n- Probability of passing both: $P(M \\cap E) = \\frac{1}{6}$\n\nThe probability of passing at least one subject is $P(M \\cup E)$.\nUsing the formula for mutually exclusive components:\n$$P(M \\cup E) = P(M \\cap E') + P(E \\cap M') + P(M \\cap E)$$\n$$P(M \\cup E) = \\frac{1}{3} + \\frac{4}{9} + \\frac{1}{6}$$\nTaking the common denominator 18:\n$$P(M \\cup E) = \\frac{6}{18} + \\frac{8}{18} + \\frac{3}{18} = \\frac{17}{18}$$`
    },
    difficulty: 'Easy',
    marks: 1,
    status: 'approved',
    sourceType: 'practice',
    importKey: 'gate_ce_2024_13'
  },
  {
    displayId: 'gate_ce_2024_14',
    exam: 'GATE',
    branch: 'CE',
    subject: 'Solid Mechanics',
    topic: 'Stress and Strain',
    year: 2024,
    paper: 'CE',
    type: 'mcq',
    numerical: false,
    question: `The three-dimensional state of stress at a point is given by\n$$\\sigma = \\begin{pmatrix} 10 & 0 & 0 \\\\ 0 & 40 & 0 \\\\ 0 & 0 & 0 \\end{pmatrix} \\text{ MPa}.$$\nThe maximum shear stress at the point is`,
    options: [
      { id: 'A', text: '20 MPa' },
      { id: 'B', text: '15 MPa' },
      { id: 'C', text: '5 MPa' },
      { id: 'D', text: '25 MPa' }
    ],
    correctOption: 'A',
    solution: {
      text: `The given stress matrix is a diagonal matrix, which means the normal stresses are already the principal stresses.\n$\\sigma_1 = 40$ MPa\n$\\sigma_2 = 10$ MPa\n$\\sigma_3 = 0$ MPa\n\nThe maximum shear stress $\\tau_{\\max}$ in 3D is given by the maximum of the three principal shear stresses:\n$$\\tau_{\\max} = \\max\\left( \\frac{|\\sigma_1 - \\sigma_2|}{2}, \\frac{|\\sigma_2 - \\sigma_3|}{2}, \\frac{|\\sigma_1 - \\sigma_3|}{2} \\right)$$\n$$\\tau_{\\max} = \\frac{|40 - 0|}{2} = 20 \\text{ MPa}$$`
    },
    difficulty: 'Moderate',
    marks: 1,
    status: 'approved',
    sourceType: 'practice',
    importKey: 'gate_ce_2024_14'
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
