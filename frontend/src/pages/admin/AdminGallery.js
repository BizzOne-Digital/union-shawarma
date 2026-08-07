import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Upload, X, Image } from 'lucide-react';
import { getAllGallery, addGalleryItem, deleteGalleryItem } from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminGallery.css';

const AdminGallery = () => {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { const res = await getAllGallery(); setGallery(res.data); }
    catch { toast.error('Failed to load gallery'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return toast.error('Please select an image');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('image', imageFile);
      if (title) fd.append('title', title);
      await addGalleryItem(fd);
      toast.success('Image added to gallery!');
      setShowModal(false);
      setImageFile(null);
      setImagePreview('');
      setTitle('');
      load();
    } catch { toast.error('Upload failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this image from gallery?')) return;
    try { await deleteGalleryItem(id); toast.success('Image removed'); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="admin-gallery-page">
      <div className="page-header">
        <div><h2>Gallery</h2><p>{gallery.length} photos</p></div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> Add Photo</button>
      </div>

      {loading ? <div className="loading-screen"><div className="spinner"></div></div> : (
        gallery.length === 0 ? (
          <div className="gallery-empty">
            <Image size={48} />
            <h3>No photos yet</h3>
            <p>Start building your gallery by uploading photos of your food and restaurant.</p>
            <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={18} /> Upload First Photo</button>
          </div>
        ) : (
          <div className="gallery-grid">
            {gallery.map((item, i) => (
              <motion.div key={item._id} className="gallery-item" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                <img src={item.image} alt={item.title || 'Gallery'} loading="lazy" />
                <div className="gallery-overlay">
                  {item.title && <p>{item.title}</p>}
                  <button className="delete-gallery-btn" onClick={() => handleDelete(item._id)}><Trash2 size={16} /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-box" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
              <div className="modal-header">
                <h3>Add Gallery Photo</h3>
                <button onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="modal-form">
                <div
                  className="upload-zone large-upload"
                  onClick={() => document.getElementById('galleryImg').click()}
                  onDrop={handleDrop}
                  onDragOver={e => e.preventDefault()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="preview" style={{ maxHeight: '240px', borderRadius: '10px', objectFit: 'cover', width: '100%' }} />
                  ) : (
                    <div className="upload-placeholder">
                      <Upload size={40} />
                      <p>Drag & drop or click to upload</p>
                      <small>Uploaded to Cloudinary — JPG, PNG, WEBP — Max 10MB</small>
                    </div>
                  )}
                </div>
                <input id="galleryImg" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
                <div className="form-group" style={{ marginTop: '16px' }}>
                  <label>Caption (optional)</label>
                  <input className="form-control" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Fresh Chicken Shawarma" />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Uploading...' : 'Upload Photo'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminGallery;
