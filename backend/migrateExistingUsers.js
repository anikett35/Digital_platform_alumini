/**
 * Run this ONCE after deploying the updated code to approve all existing users
 * that were registered before the approval flow was added.
 *
 * Usage:
 *   node migrateExistingUsers.js
 */
require('dotenv').config();
const mongoose = require('mongoose');

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const result = await mongoose.connection.db.collection('users').updateMany(
    { approvalStatus: { $exists: false } },
    { $set: { approvalStatus: 'approved', collegeId: 'LEGACY' } }
  );

  console.log(`✅ Migrated ${result.modifiedCount} existing users → approvalStatus: approved`);
  await mongoose.disconnect();
};

run().catch(err => { console.error(err); process.exit(1); });
