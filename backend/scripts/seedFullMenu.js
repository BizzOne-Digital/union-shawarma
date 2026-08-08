const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const mongoose = require('mongoose');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

// ===== Shared customization groups (per customer's spreadsheet) =====
const WRAP_CUSTOMIZATION = [
  { name: 'Base Sauce', required: true, multiSelect: false, options: ['Hummus', 'Tzatziki', 'Garlic', 'No Sauce'] },
  {
    name: 'Toppings',
    required: true,
    multiSelect: true,
    options: ['Lettuce', 'Tomatoes', 'Onion', 'Cucumber', 'Tabouli', 'Pickles', 'Turnips', 'Black Olives', 'Hot Banana Peppers', 'Feta Cheese', 'No Toppings'],
  },
  { name: 'Select Sauces', required: true, multiSelect: false, options: ['Shawarma Sauce', 'Hot Sauce', 'Chipotle Sauce', 'No Sauce'] },
];

const SAUCE_ONLY = [
  { name: 'Select Sauces', required: true, multiSelect: false, options: ['Shawarma Sauce', 'Hot Sauce', 'Chipotle Sauce', 'No Sauce'] },
];

const SALAD_CUSTOMIZATION = [
  { name: 'Select Salad', required: true, multiSelect: false, options: ['Garden', 'Greek'] },
  { name: 'Select Sauces', required: true, multiSelect: false, options: ['Shawarma Sauce', 'Hot Sauce', 'Chipotle Sauce', 'No Sauce'] },
];

const WINGS_CUSTOMIZATION = [
  { name: 'Select Sauces', required: true, multiSelect: false, options: ['Mild', 'Medium', 'Hot', 'Dry Cajun', 'Lemon Pepper', 'Plain'] },
];

const CAN_POP_CUSTOMIZATION = [
  { name: 'Select Pop', required: true, multiSelect: false, options: ['Coke', 'Diet Coke', 'Coke Zero', 'Ginger Ale', 'Sprite', 'Fuze', 'Pepsi', 'Diet Pepsi', 'Root Beer', '7up'] },
];

const BOTTLE_POP_CUSTOMIZATION = [
  { name: 'Select Pop', required: true, multiSelect: false, options: ['Coke', 'Diet Coke', 'Coke Zero', 'Ginger Ale', 'Sprite', 'Fuze'] },
];

// Proteins that already have real photography uploaded to Cloudinary (from the earlier seed run)
const PHOTOGRAPHED_PROTEINS = ['Chicken Shawarma', 'Beef Shawarma', 'Chicken Souvlaki', 'Falafel', 'Mix Chicken and Beef'];

// Maps our old format keys (from the first seed) to the sheet's category names
const OLD_FORMAT_TO_CATEGORY = {
  wrap: 'Wraps',
  riceBowl: 'On the Rice',
  fries: 'On the Fries',
  salad: 'Salads',
  bowl: 'Plates',
};

const CATEGORY_NAMES = ['Wraps', 'On the Rice', 'On the Fries', 'Salads', 'Plates', 'Sides', 'Poutine', 'Wings', 'Drinks'];

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Grab existing images before wiping, keyed by "<Protein>|<Category>"
  const existingItems = await MenuItem.find({});
  const imageLookup = {};
  for (const item of existingItems) {
    for (const [oldKey, categoryName] of Object.entries(OLD_FORMAT_TO_CATEGORY)) {
      // old item names looked like "Beef Shawarma Wrap", "Beef Shawarma Bowl", "Beef Shawarma Rice Bowl", etc.
      const suffixes = { wrap: 'Wrap', riceBowl: 'Rice Bowl', fries: 'on Fries', salad: 'Salad', bowl: 'Bowl' };
      const suffix = suffixes[oldKey];
      if (item.name.endsWith(` ${suffix}`) && item.image) {
        const protein = item.name.slice(0, item.name.length - suffix.length - 1);
        imageLookup[`${protein}|${categoryName}`] = { image: item.image, imagePublicId: item.imagePublicId };
      }
    }
  }
  console.log(`Recovered ${Object.keys(imageLookup).length} existing images to reuse`);

  await MenuItem.deleteMany({});
  await Category.deleteMany({});
  console.log('Cleared menu items & categories');

  const categories = {};
  for (const name of CATEGORY_NAMES) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    categories[name] = await Category.create({ name, slug });
    console.log(`Created category: ${name}`);
  }

  const getImage = (protein, categoryName) => imageLookup[`${protein}|${categoryName}`] || {};

  const items = [];

  // ===== Wraps =====
  const WRAP_PROTEINS = ['Chicken Shawarma', 'Beef Shawarma', 'Chicken Souvlaki', 'Gyro', 'Veg Samosa', 'Falafel', 'Mix Chicken and Beef'];
  for (const protein of WRAP_PROTEINS) {
    items.push({
      name: `${protein} Wrap`,
      description: `${protein}, hand-rolled in a warm wrap with your choice of sauce and toppings.`,
      price: 8.99,
      category: categories['Wraps']._id,
      customizationGroups: WRAP_CUSTOMIZATION,
      ...getImage(protein, 'Wraps'),
    });
  }

  // ===== On the Rice =====
  const RICE_PROTEINS = ['Chicken Shawarma', 'Beef Shawarma', 'Chicken Souvlaki', 'Gyro', 'Falafel', 'Mix Chicken and Beef'];
  for (const protein of RICE_PROTEINS) {
    items.push({
      name: `${protein} on Rice`,
      description: `${protein} served over seasoned rice with your choice of sauce.`,
      price: 11.49,
      category: categories['On the Rice']._id,
      customizationGroups: SAUCE_ONLY,
      ...getImage(protein, 'On the Rice'),
    });
  }

  // ===== On the Fries =====
  const FRIES_PROTEINS = ['Chicken Shawarma', 'Beef Shawarma', 'Chicken Souvlaki', 'Gyro', 'Falafel', 'Mix Chicken and Beef'];
  for (const protein of FRIES_PROTEINS) {
    items.push({
      name: `${protein} on Fries`,
      description: `${protein} served on our signature coated fries with your choice of sauce.`,
      price: 10.49,
      category: categories['On the Fries']._id,
      customizationGroups: SAUCE_ONLY,
      ...getImage(protein, 'On the Fries'),
    });
  }

  // ===== Salads =====
  const SALAD_PROTEINS = ['Chicken Shawarma', 'Beef Shawarma', 'Chicken Souvlaki', 'Gyro', 'Falafel', 'Mix Chicken and Beef'];
  for (const protein of SALAD_PROTEINS) {
    items.push({
      name: `${protein} Salad`,
      description: `${protein} on a bed of your choice of salad with your choice of sauce.`,
      price: 9.99,
      category: categories['Salads']._id,
      customizationGroups: SALAD_CUSTOMIZATION,
      ...getImage(protein, 'Salads'),
    });
  }
  items.push({ name: 'Garden Salad', description: 'Fresh garden salad. No customization required.', price: 7.99, category: categories['Salads']._id, customizationGroups: [] });
  items.push({ name: 'Greek Salad', description: 'Classic Greek salad. No customization required.', price: 7.99, category: categories['Salads']._id, customizationGroups: [] });

  // ===== Plates =====
  const PLATE_PROTEINS = ['Chicken Shawarma', 'Beef Shawarma', 'Chicken Souvlaki', 'Gyro', 'Falafel', 'Mix Chicken and Beef'];
  for (const protein of PLATE_PROTEINS) {
    items.push({
      name: `${protein} Plate`,
      description: `${protein} plate served with your choice of salad and sauce.`,
      price: 12.99,
      category: categories['Plates']._id,
      customizationGroups: SALAD_CUSTOMIZATION,
      ...getImage(protein, 'Plates'),
    });
  }

  // ===== Sides =====
  const SIDES = [
    { name: 'French Fries', price: 4.99 },
    { name: 'Greek Fries', price: 5.99 },
    { name: 'Onion Rings', price: 5.49 },
    { name: 'Chicken Nuggets (8pcs)', price: 7.99 },
    { name: 'Falafel Balls (5pcs)', price: 6.99 },
    { name: 'Baklava (4pcs)', price: 5.99 },
    { name: 'Chicken Samosa (5pcs)', price: 6.99 },
    { name: 'Beef Samosa (5pcs)', price: 6.99 },
    { name: 'Veg Samosa (1pcs)', price: 2.49 },
    { name: 'Fish and Chips', price: 9.99 },
  ];
  for (const side of SIDES) {
    items.push({ name: side.name, description: side.name, price: side.price, category: categories['Sides']._id, customizationGroups: [] });
  }

  // ===== Poutine =====
  const POUTINE_PROTEINS = ['Chicken Shawarma', 'Beef Shawarma', 'Chicken Souvlaki', 'Samosa (2pcs)', 'Falafel'];
  for (const protein of POUTINE_PROTEINS) {
    items.push({
      name: `${protein} Poutine`,
      description: `Poutine topped with ${protein.toLowerCase()} and your choice of sauce.`,
      price: 8.99,
      category: categories['Poutine']._id,
      customizationGroups: SAUCE_ONLY,
    });
  }

  // ===== Wings =====
  const WINGS = [
    { name: '8 pcs Wings', price: 9.99 },
    { name: '10 pcs Wings', price: 11.99 },
    { name: '14 pcs Wings', price: 15.99 },
    { name: '20 pcs Wings', price: 21.99 },
  ];
  for (const w of WINGS) {
    items.push({ name: w.name, description: w.name, price: w.price, category: categories['Wings']._id, customizationGroups: WINGS_CUSTOMIZATION });
  }

  // ===== Drinks =====
  items.push({ name: 'Can Pop', description: 'Choice of canned soft drink.', price: 2.49, category: categories['Drinks']._id, customizationGroups: CAN_POP_CUSTOMIZATION });
  items.push({ name: 'Bottle Pop', description: 'Choice of bottled soft drink.', price: 3.49, category: categories['Drinks']._id, customizationGroups: BOTTLE_POP_CUSTOMIZATION });
  items.push({ name: 'Juice', description: 'Bottled juice.', price: 3.49, category: categories['Drinks']._id, customizationGroups: [] });
  items.push({ name: 'Ayran', description: 'Traditional yogurt drink.', price: 3.49, category: categories['Drinks']._id, customizationGroups: [] });
  items.push({ name: 'Gatorade', description: 'Sports drink.', price: 3.99, category: categories['Drinks']._id, customizationGroups: [] });

  await MenuItem.insertMany(items);
  console.log(`\nCreated ${items.length} menu items across ${CATEGORY_NAMES.length} categories.`);

  const withImages = items.filter((i) => i.image).length;
  console.log(`${withImages} items have real photos (from ${PHOTOGRAPHED_PROTEINS.join(', ')}). The rest use the placeholder image until real photos are provided.`);

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
