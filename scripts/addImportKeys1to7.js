const { resolveMongoUriForScript } = require('./mongo-atlas-doh');
const mongoose = require('mongoose');

async function fix() {
  const uri = await resolveMongoUriForScript(process.env.MONGODB_URI);
  await mongoose.connect(uri);
  const collection = mongoose.connection.db.collection('questions');
  
  const ids = ['gate_ce_2024_01', 'gate_ce_2024_02', 'gate_ce_2024_03', 'gate_ce_2024_04', 'gate_ce_2024_05', 'gate_ce_2024_06', 'gate_ce_2024_07'];
  
  for (const id of ids) {
    await collection.updateOne(
      { displayId: id },
      { $set: { importKey: id } }
    );
  }
  
  console.log('Updated importKeys.');
  process.exit(0);
}

fix();
