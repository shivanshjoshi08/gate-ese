const mongoose = require("mongoose");

const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://shivanshjoshi:shivanshjoshi@cluster0.zowb09y.mongodb.net/gate-ese?retryWrites=true&w=majority";

const questionSchema = new mongoose.Schema({
  displayId: { type: String, required: true, unique: true },
  question: { type: String, required: true },
  type: { type: String, required: true },
  numerical: { type: Boolean, default: false },
  unit: { type: String },
  answerRange: {
    min: Number,
    max: Number,
  },
  options: [String],
  correct: Number,
  solution: { type: String, required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  marks: { type: Number, required: true },
  year: { type: Number, required: true },
  difficulty: { type: String, required: true },
  exam: { type: String, required: true },
  paper: { type: String },
  questionBank: { type: String, default: "ai" },
  branch: { type: String, required: true },
  examType: { type: String },
  sourceType: { type: String },
  slug: { type: String },
});

const Question =
  mongoose.models.Question || mongoose.model("Question", questionSchema);

const questionsToInsert = [
  {
    displayId: "gate_ce_2024_01",
    question:
      "If '→' denotes increasing order of intensity, then the meaning of the words\n\n[simmer → seethe → smolder] is analogous to [break → raze → ________ ].\n\nWhich one of the given options is appropriate to fill the blank?",
    type: "mcq",
    numerical: false,
    options: [
      "obfuscate",
      "obliterate",
      "fracture",
      "fissure"
    ],
    correct: 1, // (B)
    solution:
      "The sequence 'simmer → seethe → smolder' represents an increasing order of intensity of anger or heat. Similarly, 'break → raze' represents an increasing order of destruction. The word that denotes an even higher intensity of destruction than 'raze' is 'obliterate' (to destroy completely).",
    subject: "General Aptitude",
    topic: "Verbal Aptitude",
    marks: 1,
    year: 2024,
    difficulty: "Moderate",
    exam: "GATE",
    paper: "CE",
    branch: "CE",
    examType: "GATE",
    sourceType: "pyq",
  },
  {
    displayId: "gate_ce_2024_02",
    question:
      "In a locality, the houses are numbered in the following way:\n\nThe house-numbers on one side of a road are consecutive odd integers starting from 301, while the house-numbers on the other side of the road are consecutive even numbers starting from 302. The total number of houses is the same on both sides of the road.\n\nIf the difference of the sum of the house-numbers between the two sides of the road is 27, then the number of houses on each side of the road is",
    type: "mcq",
    numerical: false,
    options: [
      "27",
      "52",
      "54",
      "26"
    ],
    correct: 0, // (A)
    solution:
      "Let there be $n$ houses on each side.\nThe houses on side 1 (odd): 301, 303, 305, ..., $301 + 2(n-1)$\nThe houses on side 2 (even): 302, 304, 306, ..., $302 + 2(n-1)$\n\nPairing the houses, the difference between the $k$-th house on side 2 and side 1 is:\n$(302 + 2(k-1)) - (301 + 2(k-1)) = 1$\nSince there are $n$ pairs of houses, the total difference in the sums is $n \\times 1 = n$.\nGiven that the difference of the sums is 27, we have $n = 27$.",
    subject: "General Aptitude",
    topic: "Quantitative Aptitude",
    marks: 1,
    year: 2024,
    difficulty: "Easy",
    exam: "GATE",
    paper: "CE",
    branch: "CE",
    examType: "GATE",
    sourceType: "pyq",
  },
  {
    displayId: "gate_ce_2024_03",
    question:
      "For positive integers $p$ and $q$, with $\\frac{p}{q} \\neq 1$, $\\left(\\frac{p}{q}\\right)^{\\frac{p}{q}} = p^{\\left(\\frac{p}{q}-1\\right)}$. Then,",
    type: "mcq",
    numerical: false,
    options: [
      "$q^p = p^q$",
      "$q^p = p^{2q}$",
      "$\\sqrt{q} = \\sqrt{p}$",
      "$\\sqrt[p]{q} = \\sqrt[q]{p}$"
    ],
    correct: 0, // (A)
    solution:
      "Given: $\\left(\\frac{p}{q}\\right)^{\\frac{p}{q}} = p^{\\frac{p}{q}-1}$\n$\\Rightarrow \\frac{p^{\\frac{p}{q}}}{q^{\\frac{p}{q}}} = \\frac{p^{\\frac{p}{q}}}{p}$\nCanceling $p^{\\frac{p}{q}}$ from both sides (since $p$ is a positive integer):\n$\\frac{1}{q^{\\frac{p}{q}}} = \\frac{1}{p}$\n$\\Rightarrow q^{\\frac{p}{q}} = p$\nRaising both sides to the power of $q$:\n$q^p = p^q$",
    subject: "General Aptitude",
    topic: "Quantitative Aptitude",
    marks: 1,
    year: 2024,
    difficulty: "Moderate",
    exam: "GATE",
    paper: "CE",
    branch: "CE",
    examType: "GATE",
    sourceType: "pyq",
  },
  {
    displayId: "gate_ce_2024_04",
    question:
      "Which one of the given options is a possible value of $x$ in the following sequence?\n\n3, 7, 15, $x$, 63, 127, 255",
    type: "mcq",
    numerical: false,
    options: [
      "35",
      "40",
      "45",
      "31"
    ],
    correct: 3, // (D)
    solution:
      "The terms in the sequence follow the pattern $2^n - 1$.\n$2^2 - 1 = 3$\n$2^3 - 1 = 7$\n$2^4 - 1 = 15$\n$2^5 - 1 = 31 \\Rightarrow x = 31$\n$2^6 - 1 = 63$\n$2^7 - 1 = 127$\n$2^8 - 1 = 255$\nHence, $x = 31$.",
    subject: "General Aptitude",
    topic: "Analytical Aptitude",
    marks: 1,
    year: 2024,
    difficulty: "Easy",
    exam: "GATE",
    paper: "CE",
    branch: "CE",
    examType: "GATE",
    sourceType: "pyq",
  },
  {
    displayId: "gate_ce_2024_05",
    question:
      "On a given day, how many times will the second-hand and the minute-hand of a clock cross each other during the clock time 12:05:00 hours to 12:55:00 hours?",
    type: "mcq",
    numerical: false,
    options: [
      "51",
      "49",
      "50",
      "55"
    ],
    correct: 2, // (C)
    solution:
      "In a clock, the second-hand completes 1 revolution per minute. Therefore, it overtakes the minute-hand exactly once every minute.\nThe time duration from 12:05:00 to 12:55:00 is exactly 50 minutes.\nDuring this 50-minute interval, the second-hand will complete 50 revolutions relative to the minute-hand, thereby crossing it 50 times.",
    subject: "General Aptitude",
    topic: "Quantitative Aptitude",
    marks: 1,
    year: 2024,
    difficulty: "Moderate",
    exam: "GATE",
    paper: "CE",
    branch: "CE",
    examType: "GATE",
    sourceType: "pyq",
  },
  {
    displayId: "gate_ce_2024_06",
    question:
      "In the given text, the blanks are numbered (i)–(iv). Select the best match for all the blanks.\n\nFrom the ancient Athenian arena to the modern Olympic stadiums, athletics ______(i)______ the potential for a spectacle. The crowd ______(ii)______ with bated breath as the Olympian artist twists his body, stretching the javelin behind him. Twelve strides in, he begins to cross-step. Six cross-steps ______(iii)______ in an abrupt stop on his left foot. As his body ______(iv)______ like a door turning on a hinge, the javelin is launched skyward at a precise angle.",
    type: "mcq",
    numerical: false,
    options: [
      "(i) hold     (ii) waits    (iii) culminates    (iv) pivot",
      "(i) holds    (ii) wait     (iii) culminates    (iv) pivot",
      "(i) hold     (ii) wait     (iii) culminate     (iv) pivots",
      "(i) holds    (ii) waits    (iii) culminate     (iv) pivots"
    ],
    correct: 3, // (D)
    solution:
      "Let's match subject-verb agreement:\n(i) 'athletics' represents a single discipline or concept here, so it takes a singular verb: **holds**.\n(ii) 'The crowd' acts as a collective unit, taking a singular verb: **waits**.\n(iii) 'Six cross-steps' is plural, taking a plural verb: **culminate**.\n(iv) 'body' is singular, taking a singular verb: **pivots**.\nTherefore, the correct sequence is: holds, waits, culminate, pivots.",
    subject: "General Aptitude",
    topic: "Verbal Aptitude",
    marks: 2,
    year: 2024,
    difficulty: "Moderate",
    exam: "GATE",
    paper: "CE",
    branch: "CE",
    examType: "GATE",
    sourceType: "pyq",
  },
  {
    displayId: "gate_ce_2024_07",
    question:
      "Three distinct sets of indistinguishable twins are to be seated at a circular table that has 8 identical chairs. Unique seating arrangements are defined by the relative positions of the people.\n\nHow many unique seating arrangements are possible such that each person is sitting next to their twin?",
    type: "mcq",
    numerical: false,
    options: [
      "12",
      "14",
      "10",
      "28"
    ],
    correct: 0, // (A)
    solution:
      "Let the three sets of twins be $A, A, B, B, C, C$. They must sit next to their twin, so we can treat each pair as a single block: $(AA), (BB), (CC)$.\nSince the table has 8 chairs and there are 6 people, there are 2 empty chairs. Treat the empty chairs as two identical blocks: $E, E$.\nWe now need to arrange 5 items $(AA), (BB), (CC), E, E$ in a circle.\nThe number of circular permutations of $n$ items where $k$ items are identical is $(n-1)! / k!$.\nHere $n = 5$ items and 2 items ($E, E$) are identical. So, $(5 - 1)! / 2! = 4! / 2 = 12$.\nSince the twins are indistinguishable (e.g., $A_1$ and $A_2$ are identical), arranging them internally within their block does not create a new unique seating arrangement. Thus, the number of arrangements remains 12.",
    subject: "General Aptitude",
    topic: "Quantitative Aptitude",
    marks: 2,
    year: 2024,
    difficulty: "Hard",
    exam: "GATE",
    paper: "CE",
    branch: "CE",
    examType: "GATE",
    sourceType: "pyq",
  }
];

const { resolveMongoUriForScript } = require("./mongo-atlas-doh");

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
        console.log(`Inserted ${q.displayId}`);
      } else {
        await Question.updateOne({ displayId: q.displayId }, { $set: q });
        console.log(`Updated ${q.displayId}`);
      }
    }
    console.log(`Done! Inserted: ${inserted}, Updated: ${questionsToInsert.length - inserted}`);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
  }
}

main();
