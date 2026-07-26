const { resolveMongoUriForScript } = require('./mongo-atlas-doh');
const mongoose = require('mongoose');

async function fix() {
  const uri = await resolveMongoUriForScript(process.env.MONGODB_URI);
  await mongoose.connect(uri);
  const res = await mongoose.connection.db.collection('questions').updateMany(
    { displayId: { $in: ['gate_ce_2024_01', 'gate_ce_2024_02', 'gate_ce_2024_03', 'gate_ce_2024_04', 'gate_ce_2024_05', 'gate_ce_2024_06', 'gate_ce_2024_07'] } },
    { $set: { status: 'approved' } }
  );
  console.log('Updated:', res.modifiedCount);
  process.exit(0);
}

fix();
