import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Upload } from 'lucide-react';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminMenu.css';

const EMPTY = { name: '', slug: '', description: '', isActive: true, order: 0 };

const AdminCategories = () => {
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { const res = await getAllCategories(); setCats(res.data); }
    catch { toast.error('Failed to load categories'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditCat(null); setForm(EMPTY); setImageFile(null); setImagePreview(''); setShowModal(true); };
  const openEdit = (cat) => {
    setEditCat(cat);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '', isActive: cat.isActive, order: cat.order || 0 });
    setImagePreview(cat.image || '');
    setImageFile(null);
    setShowModal(true);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const autoSlug = (name) => name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);
      if (editCat) { await updateCategory(editCat._id, fd); toast.success('Category updated!'); }
      else { await createCategory(fd); toast.success('Category created!'); }
      setShowModal(false);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try { await deleteCategory(id); toast.success('Deleted'); load(); }
    catch { toast.error('Delete failed'); }
  };

  return (
    <div className="admin-menu-page">
      <div className="page-header">
        <div><h2>Categories</h2><p>{cats.length} categories</p></div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> Add Category</button>
      </div>

      {loading ? <div className="loading-screen"><div className="spinner"></div></div> : (
        <div className="menu-items-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Image</th><th>Name</th><th>Slug</th><th>Order</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {cats.map(cat => (
                <tr key={cat._id}>
                  <td><img src={cat.image || '/placeholder-food.jpg'} alt={cat.name} className="item-thumb" /></td>
                  <td><strong>{cat.name}</strong></td>
                  <td><code style={{ background: 'var(--gray-light)', padding: '3px 8px', borderRadius: '6px', fontSize: '12px' }}>{cat.slug}</code></td>
                  <td>{cat.order}</td>
                  <td><span className={`status-dot ${cat.isActive ? 'green' : 'red'}`}>{cat.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn edit" onClick={() => openEdit(cat)}><Edit2 size={16} /></button>
                      <button className="action-btn delete" onClick={() => handleDelete(cat._id, cat.name)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {cats.length === 0 && <div className="empty-state"><p>No categories yet. Add your first one!</p></div>}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-box" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editCat ? 'Edit Category' : 'Add Category'}</h3>
                <button onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Name *</label>
                    <input className="form-control" value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value, slug: autoSlug(e.target.value) })}
                      placeholder="e.g. Wraps" required />
                  </div>
                  <div className="form-group">
                    <label>Slug *</label>
                    <input className="form-control" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="e.g. wraps" required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea className="form-control" rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Sort Order</label>
                    <input className="form-control" type="number" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} />
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'flex-end' }}>
                    <label className="checkbox-label">
                      <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} />
                      Active
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>Image</label>
                  <div className="upload-zone" onClick={() => document.getElementById('catImg').click()}>
                    {imagePreview ? <img src={imagePreview} alt="preview" style={{ maxHeight: '120px', borderRadius: '8px' }} /> : (
                      <div className="upload-placeholder"><Upload size={28} /><p>Click to upload</p></div>
                    )}
                  </div>
                  <input id="catImg" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editCat ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminCategories;
