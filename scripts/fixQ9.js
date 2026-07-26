const { resolveMongoUriForScript } = require('./mongo-atlas-doh');
const mongoose = require('mongoose');

async function fix() {
  const uri = await resolveMongoUriForScript(process.env.MONGODB_URI);
  await mongoose.connect(uri);
  const collection = mongoose.connection.db.collection('questions');
  
  const updatedQuestionText = `In the 4 $\\times$ 4 array shown below, each cell of the first three columns has either a cross (X) or a number, as per the given rule.

$$
\\begin{array}{|c|c|c|c|}
\\hline
1 & 1 & 2 & \\quad \\\\
\\hline
2 & \\text{X} & 3 & \\quad \\\\
\\hline
2 & \\text{X} & 4 & \\quad \\\\
\\hline
1 & 2 & \\text{X} & \\quad \\\\
\\hline
\\end{array}
$$

Rule: The number in a cell represents the count of crosses around its immediate neighboring cells (left, right, top, bottom, diagonals).

As per this rule, the $\\textbf{maximum}$ number of crosses possible in the empty column is`;

  const res = await collection.updateOne(
    { displayId: 'gate_ce_2024_09' },
    { $set: { question: updatedQuestionText } }
  );
  
  console.log('Updated Q9 with LaTeX table and bold text:', res.modifiedCount);
  process.exit(0);
}

fix();
