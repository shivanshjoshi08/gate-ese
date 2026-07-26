const { resolveMongoUriForScript } = require('./mongo-atlas-doh');
const mongoose = require('mongoose');

async function check() {
  const uri = await resolveMongoUriForScript(process.env.MONGODB_URI);
  await mongoose.connect(uri);
  const q = await mongoose.connection.db.collection('questions').findOne({ displayId: 'gate_ce_2024_01' });
  console.log(q);
  process.exit(0);
}
check();
