const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  let category = await Category.findOne({ slug: 'shawarma-wraps' });
  if (!category) {
    category = await Category.create({ name: 'Shawarma Wraps', slug: 'shawarma-wraps' });
    console.log('Created category: Shawarma Wraps');
  }

  const products = [
    {
      name: 'Chicken Shawarma Wrap',
      description: 'Marinated grilled chicken, fresh veggies, garlic sauce, hand-rolled in warm pita.',
      price: 7.99,
      category: category._id,
      image: '/hero.png',
      tags: ['popular'],
      isPopular: true,
      isFeatured: true,
    },
    {
      name: 'Beef Shawarma Wrap',
      description: 'Slow-marinated beef strips with pickles, onions, and tahini sauce.',
      price: 8.99,
      category: category._id,
      image: '/hero.png',
      tags: ['must-try'],
      isMustTry: true,
    },
    {
      name: 'Falafel Wrap',
      description: 'Crispy homemade falafel, fresh salad, and creamy hummus in a soft wrap.',
      price: 6.99,
      category: category._id,
      image: '/hero.png',
      tags: ['new'],
    },
  ];

  for (const p of products) {
    const exists = await MenuItem.findOne({ name: p.name });
    if (exists) {
      console.log(`Skipped (already exists): ${p.name}`);
      continue;
    }
    await MenuItem.create(p);
    console.log(`Created: ${p.name}`);
  }

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
