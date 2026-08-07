const Gallery = require('../models/Gallery');
const { cloudinary } = require('../config/cloudinary');

const getGallery = async (req, res) => {
  const items = await Gallery.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
  res.json(items);
};

const getAllGallery = async (req, res) => {
  const items = await Gallery.find().sort({ order: 1, createdAt: -1 });
  res.json(items);
};

const addGalleryItem = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'Image required' });
  const item = await Gallery.create({
    title: req.body.title,
    order: req.body.order || 0,
    image: req.file.path,
    imagePublicId: req.file.filename,
  });
  res.status(201).json(item);
};

const deleteGalleryItem = async (req, res) => {
  const item = await Gallery.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Gallery item not found' });
  if (item.imagePublicId) await cloudinary.uploader.destroy(item.imagePublicId);
  await item.deleteOne();
  res.json({ message: 'Gallery item removed' });
};

module.exports = { getGallery, getAllGallery, addGalleryItem, deleteGalleryItem };
