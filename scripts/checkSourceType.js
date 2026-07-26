const { resolveMongoUriForScript } = require('./mongo-atlas-doh');
const mongoose = require('mongoose');

async function fix() {
  const uri = await resolveMongoUriForScript(process.env.MONGODB_URI);
  await mongoose.connect(uri);
  const collection = mongoose.connection.db.collection('questions');
  
  const docs = await collection.find({ displayId: { $in: ['gate_ce_2024_22', 'gate_ce_2024_23'] } }).toArray();
  
  docs.forEach(d => {
    console.log(`displayId: ${d.displayId}, sourceType: ${d.sourceType}, status: ${d.status}`);
  });
  
  process.exit(0);
}

fix();
