const MenuItem = require('../models/MenuItem');
const { cloudinary } = require('../config/cloudinary');

// @desc Get all menu items
// @route GET /api/menu
const getMenuItems = async (req, res) => {
  const { category, tag, featured, popular, mustTry, available } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (tag) filter.tags = { $in: [tag] };
  if (featured === 'true') filter.isFeatured = true;
  if (popular === 'true') filter.isPopular = true;
  if (mustTry === 'true') filter.isMustTry = true;
  if (available !== 'false') filter.isAvailable = true;

  const items = await MenuItem.find(filter)
    .populate('category', 'name slug')
    .sort({ order: 1, createdAt: -1 });

  res.json(items);
};

// @desc Get single menu item
// @route GET /api/menu/:id
const getMenuItemById = async (req, res) => {
  const item = await MenuItem.findById(req.params.id).populate('category', 'name slug');
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ message: 'Menu item not found' });
  }
};

// @desc Create menu item
// @route POST /api/menu
const createMenuItem = async (req, res) => {
  const { name, description, price, category, tags, isAvailable, isFeatured, isPopular, isMustTry, calories, allergens, order } = req.body;

  const item = new MenuItem({
    name, description, price, category,
    tags: tags ? JSON.parse(tags) : [],
    allergens: allergens ? JSON.parse(allergens) : [],
    isAvailable, isFeatured, isPopular, isMustTry, calories, order,
    image: req.file ? req.file.path : undefined,
    imagePublicId: req.file ? req.file.filename : undefined,
  });

  const created = await item.save();
  res.status(201).json(created);
};

// @desc Update menu item
// @route PUT /api/menu/:id
const updateMenuItem = async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Menu item not found' });

  // If new image uploaded, delete old from cloudinary
  if (req.file && item.imagePublicId) {
    await cloudinary.uploader.destroy(item.imagePublicId);
  }

  const fields = ['name','description','price','category','isAvailable','isFeatured','isPopular','isMustTry','calories','order'];
  fields.forEach(f => { if (req.body[f] !== undefined) item[f] = req.body[f]; });
  if (req.body.tags) item.tags = JSON.parse(req.body.tags);
  if (req.body.allergens) item.allergens = JSON.parse(req.body.allergens);
  if (req.file) {
    item.image = req.file.path;
    item.imagePublicId = req.file.filename;
  }

  const updated = await item.save();
  res.json(updated);
};

// @desc Delete menu item
// @route DELETE /api/menu/:id
const deleteMenuItem = async (req, res) => {
  const item = await MenuItem.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Menu item not found' });

  if (item.imagePublicId) {
    await cloudinary.uploader.destroy(item.imagePublicId);
  }

  await item.deleteOne();
  res.json({ message: 'Menu item removed' });
};

module.exports = { getMenuItems, getMenuItemById, createMenuItem, updateMenuItem, deleteMenuItem };
