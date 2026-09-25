const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Bypass the Mongoose schema (which now expects objects) by reading/writing raw documents,
  // since we need to inspect the OLD string-array shape to migrate it.
  const db = mongoose.connection.db;
  const items = await db.collection('menuitems').find({ 'customizationGroups.0': { $exists: true } }).toArray();

  let migrated = 0;
  for (const item of items) {
    let changed = false;
    const newGroups = (item.customizationGroups || []).map((group) => {
      const newOptions = (group.options || []).map((opt) => {
        if (typeof opt === 'string') {
          changed = true;
          return { label: opt, extraPrice: 0 };
        }
        return opt; // already migrated
      });
      return { ...group, options: newOptions };
    });

    if (changed) {
      await db.collection('menuitems').updateOne({ _id: item._id }, { $set: { customizationGroups: newGroups } });
      migrated++;
      console.log(`Migrated: ${item.name}`);
    }
  }

  console.log(`\nDone. Migrated ${migrated} of ${items.length} items with customization groups.`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
