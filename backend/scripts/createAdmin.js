const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const EMAIL = 'admin@theunionshawarma.ca';
const PASSWORD = 'Union@Shawarma123';
const NAME = 'The Union Shawarma Admin';

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  let user = await User.findOne({ email: EMAIL });

  if (user) {
    user.role = 'admin';
    user.password = PASSWORD;
    await user.save();
    console.log(`Updated existing user to admin: ${EMAIL}`);
  } else {
    user = await User.create({ name: NAME, email: EMAIL, password: PASSWORD, role: 'admin' });
    console.log(`Created new admin: ${EMAIL}`);
  }

  console.log(`Login with -> email: ${EMAIL} | password: ${PASSWORD}`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
