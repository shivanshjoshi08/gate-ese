const { resolveMongoUriForScript } = require('./mongo-atlas-doh');
const mongoose = require('mongoose');

async function fix() {
  const uri = await resolveMongoUriForScript(process.env.MONGODB_URI);
  await mongoose.connect(uri);
  const collection = mongoose.connection.db.collection('questions');
  
  const docs = await collection.find({ displayId: { $in: ['gate_ce_2024_22', 'gate_ce_2024_23'] } }).toArray();
  
  console.log("Q22 exists:", docs.some(d => d.displayId === 'gate_ce_2024_22'));
  console.log("Q23 exists:", docs.some(d => d.displayId === 'gate_ce_2024_23'));
  
  if (docs.length === 2) {
    console.log("They have distinct unique IDs in the database.");
  }
  
  process.exit(0);
}

fix();
