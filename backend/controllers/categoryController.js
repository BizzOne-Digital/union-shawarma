const Category = require('../models/Category');
const { cloudinary } = require('../config/cloudinary');

const getCategories = async (req, res) => {
  const cats = await Category.find({ isActive: true }).sort({ order: 1 });
  res.json(cats);
};

const getAllCategories = async (req, res) => {
  const cats = await Category.find().sort({ order: 1 });
  res.json(cats);
};

const createCategory = async (req, res) => {
  const { name, slug, description, order } = req.body;
  const existing = await Category.findOne({ slug });
  if (existing) return res.status(400).json({ message: 'Slug already exists' });

  const cat = await Category.create({
    name, slug, description, order,
    image: req.file ? req.file.path : undefined,
    imagePublicId: req.file ? req.file.filename : undefined,
  });
  res.status(201).json(cat);
};

const updateCategory = async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return res.status(404).json({ message: 'Category not found' });

  if (req.file && cat.imagePublicId) {
    await cloudinary.uploader.destroy(cat.imagePublicId);
  }

  ['name','slug','description','isActive','order'].forEach(f => {
    if (req.body[f] !== undefined) cat[f] = req.body[f];
  });
  if (req.file) { cat.image = req.file.path; cat.imagePublicId = req.file.filename; }

  const updated = await cat.save();
  res.json(updated);
};

const deleteCategory = async (req, res) => {
  const cat = await Category.findById(req.params.id);
  if (!cat) return res.status(404).json({ message: 'Category not found' });
  if (cat.imagePublicId) await cloudinary.uploader.destroy(cat.imagePublicId);
  await cat.deleteOne();
  res.json({ message: 'Category removed' });
};

module.exports = { getCategories, getAllCategories, createCategory, updateCategory, deleteCategory };
