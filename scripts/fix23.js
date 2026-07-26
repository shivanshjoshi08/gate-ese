const { resolveMongoUriForScript } = require('./mongo-atlas-doh');
const mongoose = require('mongoose');

async function fix() {
  const uri = await resolveMongoUriForScript(process.env.MONGODB_URI);
  await mongoose.connect(uri);
  const collection = mongoose.connection.db.collection('questions');
  
  const q22 = await collection.findOne({ displayId: 'gate_ce_2024_22' });
  const q23 = await collection.findOne({ displayId: 'gate_ce_2024_23' });
  
  console.log("Q22:", q22);
  
  // Fix Q23 text
  if (q23) {
    const newQuestion = q23.question.replace('(\\mu%)', '(%)');
    await collection.updateOne({ displayId: 'gate_ce_2024_23' }, { $set: { question: newQuestion } });
    console.log("Fixed Q23 text.");
  }
  
  process.exit(0);
}

fix();
