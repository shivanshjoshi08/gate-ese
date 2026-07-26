const { resolveMongoUriForScript } = require('./mongo-atlas-doh');
const mongoose = require('mongoose');

async function fix() {
  const uri = await resolveMongoUriForScript(process.env.MONGODB_URI);
  await mongoose.connect(uri);
  const collection = mongoose.connection.db.collection('questions');
  
  await collection.updateOne(
    { displayId: 'gate_ce_2024_22' },
    { $unset: { images: "", diagramRequired: "" } }
  );
  console.log("Fixed Q22: Removed phantom images and diagramRequired.");
  
  process.exit(0);
}

fix();
