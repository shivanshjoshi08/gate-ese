const { resolveMongoUriForScript } = require('./mongo-atlas-doh');
const mongoose = require('mongoose');

async function fix() {
  const uri = await resolveMongoUriForScript(process.env.MONGODB_URI);
  await mongoose.connect(uri);
  const collection = mongoose.connection.db.collection('questions');
  
  const docs = await collection.find({ $or: [{ slug: 'gate-ce-2024-22' }, { slug: 'gate-ce-2024-23' }, { displayId: 'gate_ce_2024_22' }, { displayId: 'gate_ce_2024_23' }] }).toArray();
  
  console.log("Found", docs.length, "documents");
  docs.forEach(d => {
    console.log(`_id: ${d._id}, displayId: ${d.displayId}, slug: ${d.slug}`);
  });
  
  process.exit(0);
}

fix();
