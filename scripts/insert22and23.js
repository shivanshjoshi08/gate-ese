const { resolveMongoUriForScript } = require('./mongo-atlas-doh');
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

// ... keeping only 22 and 23 since 15-21 were inserted successfully
const questionsToInsert = [
  {
    displayId: 'gate_ce_2024_22',
    exam: 'GATE',
    branch: 'CE',
    subject: 'Transportation Engineering',
    topic: 'Highway Geometric Design',
    year: 2024,
    paper: 'CE',
    type: 'mcq',
    numerical: false,
    question: `A car is travelling at a speed of 60 km/hr on a section of a National Highway having a downward gradient of $2\\%$. The driver of the car suddenly observes a stopped vehicle on the car path at a distance 130 m ahead, and applies brake. If the brake efficiency is $60\\%$, coefficient of friction is $0.7$, driver's reaction time is $2.5\\text{ s}$, and acceleration due to gravity is $9.81\\text{ m/s}^2$, the distance (in meters) required by the driver to bring the car to a safe stop lies in the range`,
    options: [
      { id: 'A', text: '126 to 130' },
      { id: 'B', text: '41 to 45' },
      { id: 'C', text: '33 to 37' },
      { id: 'D', text: '75 to 79' }
    ],
    correctOption: 'D',
    solution: {
      text: `Speed of the car, $v = 60\\text{ km/hr} = 60 \\times \\frac{5}{18} = 16.67\\text{ m/s}$.\nReaction time, $t_r = 2.5\\text{ s}$.\nLag distance $d_1 = v \\times t_r = 16.67 \\times 2.5 = 41.675\\text{ m}$.\n\nThe braking distance $d_2$ is given by:\n$$d_2 = \\frac{v^2}{2g(f_{\\text{eff}} - n)}$$\nwhere downward gradient $n = 2\\% = 0.02$.\nEffective friction $f_{\\text{eff}} = f \\times \\eta = 0.7 \\times 0.6 = 0.42$.\n\n$$d_2 = \\frac{(16.67)^2}{2 \\times 9.81 \\times (0.42 - 0.02)}$$\n$$d_2 = \\frac{277.889}{19.62 \\times 0.40} = \\frac{277.889}{7.848} \\approx 35.408\\text{ m}$$\n\nTotal Stopping Sight Distance (SSD) = $d_1 + d_2 = 41.675 + 35.408 = 77.08\\text{ m}$.\n\nThis distance lies in the range of 75 to 79.`
    },
    difficulty: 'Moderate',
    marks: 1,
    status: 'approved',
    sourceType: 'practice',
    importKey: 'gate_ce_2024_22'
  },
  {
    displayId: 'gate_ce_2024_23',
    exam: 'GATE',
    branch: 'CE',
    subject: 'Transportation Engineering',
    topic: 'Airport Engineering',
    year: 2024,
    paper: 'CE',
    type: 'mcq',
    numerical: false,
    question: `As per the International Civil Aviation Organization (ICAO), the basic runway length is increased by $x$ ($\\mu$%) for every $y$ (m) raise in elevation from the Mean Sea Level (MSL). The values of $x$ and $y$, respectively, are`,
    options: [
      { id: 'A', text: '$7\\%$ and $300\\text{ m}$' },
      { id: 'B', text: '$5\\%$ and $200\\text{ m}$' },
      { id: 'C', text: '$4\\%$ and $500\\text{ m}$' },
      { id: 'D', text: '$10\\%$ and $1000\\text{ m}$' }
    ],
    correctOption: 'A',
    solution: {
      text: `According to ICAO (International Civil Aviation Organization) guidelines for geometric design of runways, the correction for elevation states that the basic runway length should be increased by **7%** for every **300 meters** rise in elevation above Mean Sea Level (MSL).\n\nTherefore, $x = 7$ and $y = 300$.`
    },
    difficulty: 'Easy',
    marks: 1,
    status: 'approved',
    sourceType: 'practice',
    importKey: 'gate_ce_2024_23'
  }
];

async function main() {
  try {
    const uri = await resolveMongoUriForScript(MONGODB_URI);
    await mongoose.connect(uri);
    const collection = mongoose.connection.db.collection('questions');
    
    for (const q of questionsToInsert) {
      q.slug = q.displayId.replace(/_/g, "-");
      
      const existing = await collection.findOne({ $or: [{ displayId: q.displayId }, { slug: q.slug }] });
      if (!existing) {
        await collection.insertOne(q);
        console.log(`Inserted: ${q.displayId}`);
      } else {
        await collection.updateOne({ _id: existing._id }, { $set: q });
        console.log(`Updated existing document with id: ${existing._id} for ${q.displayId}`);
      }
    }
    console.log('Finished 22 and 23.');
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

main();
