const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const fs = require('fs');
const os = require('os');
const sharp = require('sharp');
const mongoose = require('mongoose');
const { cloudinary } = require('../config/cloudinary');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

const PRODUCTS_DIR = path.join(__dirname, '..', '..', 'frontend', 'public', 'products');
const ALL_FILES = fs.readdirSync(PRODUCTS_DIR);
const TMP_DIR = path.join(os.tmpdir(), 'union-shawarma-uploads');
fs.mkdirSync(TMP_DIR, { recursive: true });

const shrinkForUpload = async (filePath, filename) => {
  const outPath = path.join(TMP_DIR, filename);
  await sharp(filePath).resize({ width: 1600, withoutEnlargement: true }).jpeg({ quality: 78 }).toFile(outPath);
  return outPath;
};

// ===== Customization groups (shared per format, per customer's spreadsheet) =====
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

const SAUCE_ONLY_CUSTOMIZATION = [
  { name: 'Select Sauces', required: true, multiSelect: false, options: ['Shawarma Sauce', 'Hot Sauce', 'Chipotle Sauce', 'No Sauce'] },
];

const SALAD_CUSTOMIZATION = [
  { name: 'Select Salad', required: true, multiSelect: false, options: ['Garden', 'Greek'] },
  { name: 'Select Sauces', required: true, multiSelect: false, options: ['Shawarma Sauce', 'Hot Sauce', 'Chipotle Sauce', 'No Sauce'] },
];

// ===== Products: protein x format, mapped to the images actually provided =====
const PROTEINS = {
  'Beef Shawarma': 'beefy delight',
  'Chicken Souvlaki': 'texas style tender chicken',
  Falafel: 'classic chickpea fritter',
  'Mix Chicken and Beef': 'bowl o mixto',
  'Chicken Shawarma': 'mediterranean chicken',
};

const FORMATS = [
  { key: 'wrap', label: 'Wrap', category: 'Wraps', price: 8.99, customization: WRAP_CUSTOMIZATION, match: (n) => n.endsWith('wrap.jpg') },
  { key: 'bowl', label: 'Bowl', category: 'Bowls', price: 10.99, customization: SAUCE_ONLY_CUSTOMIZATION, match: (n) => n.endsWith('bowl.jpg') && !n.includes('rice bowl') },
  { key: 'riceBowl', label: 'Rice Bowl', category: 'Bowls', price: 11.49, customization: SAUCE_ONLY_CUSTOMIZATION, match: (n) => n.includes('rice bowl') },
  { key: 'salad', label: 'Salad', category: 'Salads', price: 9.99, customization: SALAD_CUSTOMIZATION, match: (n) => n.endsWith('salad.jpg') },
  { key: 'fries', label: 'on Fries', category: 'On Fries', price: 10.49, customization: SAUCE_ONLY_CUSTOMIZATION, match: (n) => n.includes('on coated fries') },
];

// Which format images actually exist per protein (per the files provided)
const AVAILABLE = {
  'Beef Shawarma': ['wrap', 'bowl', 'riceBowl', 'salad', 'fries'],
  'Chicken Souvlaki': ['wrap', 'bowl', 'riceBowl', 'salad', 'fries'],
  Falafel: ['wrap', 'bowl', 'riceBowl', 'salad', 'fries'],
  'Mix Chicken and Beef': ['bowl', 'riceBowl', 'salad'],
  'Chicken Shawarma': ['wrap', 'salad'],
};

const DESCRIPTIONS = {
  wrap: (protein) => `${protein}, hand-rolled in a warm wrap with your choice of sauce and toppings.`,
  bowl: (protein) => `${protein} served over a fresh bowl base with your choice of sauce.`,
  riceBowl: (protein) => `${protein} served over seasoned rice with your choice of sauce.`,
  salad: (protein) => `${protein} on a bed of your choice of salad with your choice of sauce.`,
  fries: (protein) => `${protein} served on our signature coated fries with your choice of sauce.`,
};

const findFile = (photoName, format) => {
  const needle = photoName.toLowerCase();
  return ALL_FILES.find((f) => {
    const lower = f.toLowerCase();
    return lower.startsWith('bowloramamenurevamp_') && lower.includes(needle) && format.match(lower);
  });
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  await MenuItem.deleteMany({});
  await Category.deleteMany({});
  console.log('Cleared existing menu items & categories');

  const categoryNames = ['Wraps', 'Bowls', 'Salads', 'On Fries'];
  const categories = {};
  for (const name of categoryNames) {
    const slug = name.toLowerCase().replace(/\s+/g, '-');
    categories[name] = await Category.create({ name, slug });
    console.log(`Created category: ${name}`);
  }

  let created = 0;
  let skipped = 0;

  for (const [proteinName, photoName] of Object.entries(PROTEINS)) {
    const formatKeys = AVAILABLE[proteinName] || [];
    for (const formatKey of formatKeys) {
      const format = FORMATS.find((f) => f.key === formatKey);
      const filename = findFile(photoName, format);

      if (!filename) {
        console.error(`No file found for "${proteinName}" (${format.label})`);
        skipped++;
        continue;
      }

      const filePath = path.join(PRODUCTS_DIR, filename);
      let imageUrl, imagePublicId;
      try {
        const uploadPath = await shrinkForUpload(filePath, filename);
        const result = await cloudinary.uploader.upload(uploadPath, {
          folder: 'union-shawarma/menu',
          transformation: [{ width: 800, height: 800, crop: 'fill', quality: 'auto' }],
        });
        imageUrl = result.secure_url;
        imagePublicId = result.public_id;
      } catch (err) {
        console.error(`Failed to upload "${filename}":`, err.message);
        skipped++;
        continue;
      }

      const name = `${proteinName} ${format.label}`;
      await MenuItem.create({
        name,
        description: DESCRIPTIONS[formatKey](proteinName),
        price: format.price,
        category: categories[format.category]._id,
        image: imageUrl,
        imagePublicId,
        customizationGroups: format.customization,
      });
      console.log(`Created menu item: ${name} (${filename})`);
      created++;
    }
  }

  console.log(`\nDone. Created ${created} menu items, skipped ${skipped}.`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
