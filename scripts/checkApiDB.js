const { resolveMongoUriForScript } = require('./mongo-atlas-doh');
const mongoose = require('mongoose');
async function check() {
  const uri = await resolveMongoUriForScript(process.env.MONGODB_URI);
  await mongoose.connect(uri);
  const filter = { sourceType: 'pyq', status: { $in: ['approved', 'published'] } };
  const rows = await mongoose.connection.db.collection('questions').find(filter).sort({ updatedAt: -1 }).limit(10).toArray();
  console.log(rows.map(r => r.displayId));
  process.exit(0);
}
check();
