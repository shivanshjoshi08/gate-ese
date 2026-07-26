const { resolveMongoUriForScript } = require('./mongo-atlas-doh');
const mongoose = require('mongoose');

async function fix() {
  const uri = await resolveMongoUriForScript(process.env.MONGODB_URI);
  await mongoose.connect(uri);
  const collection = mongoose.connection.db.collection('questions');
  
  const q = await collection.findOne({ displayId: 'gate_ce_2024_08' });
  
  // Replace the markdown table with the image link
  const updatedQuestionText = `The chart given below compares the Installed Capacity (MW) of four power generation technologies, T1, T2, T3, and T4, and their Electricity Generation (MWh) in a time of 1000 hours (h).

![Power Generation Chart](/images/q8-chart.png)

The Capacity Factor of a power generation technology is:
$$Capacity Factor = \\frac{Electricity Generation (MWh)}{Installed Capacity (MW) \\times 1000 (h)}$$
Which one of the given technologies has the highest Capacity Factor?`;
  
  const res = await collection.updateOne(
    { displayId: 'gate_ce_2024_08' },
    { $set: { question: updatedQuestionText, images: ['/images/q8-chart.png'] } }
  );
  
  console.log('Updated Q8 to use image:', res.modifiedCount);
  process.exit(0);
}

fix();
