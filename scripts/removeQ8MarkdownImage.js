const { resolveMongoUriForScript } = require('./mongo-atlas-doh');
const mongoose = require('mongoose');

async function fix() {
  const uri = await resolveMongoUriForScript(process.env.MONGODB_URI);
  await mongoose.connect(uri);
  const collection = mongoose.connection.db.collection('questions');
  
  const doc = await collection.findOne({ displayId: 'gate_ce_2024_08' });
  
  if (doc) {
    const newQuestion = doc.question.replace('![Power Generation Chart](/images/q8-chart.png)\n\n', '')
                                    .replace('![Power Generation Chart](/images/q8-chart.png)', '');
    
    const res = await collection.updateOne(
      { displayId: 'gate_ce_2024_08' },
      { $set: { question: newQuestion } }
    );
    console.log('Removed markdown image from Q8:', res.modifiedCount);
  } else {
    console.log('Q8 not found!');
  }
  process.exit(0);
}

fix();
