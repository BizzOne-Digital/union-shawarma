import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Upload, Search } from 'lucide-react';
import { getMenuItems, createMenuItem, updateMenuItem, deleteMenuItem, getAllCategories } from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminMenu.css';

const EMPTY_FORM = {
  name: '', description: '', price: '', category: '',
  isAvailable: true, isFeatured: false, isPopular: false, isMustTry: false,
  calories: '', allergens: '', order: 0,
};

const AdminMenu = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('all');

  const load = async () => {
    try {
      const [mRes, cRes] = await Promise.all([getMenuItems({ available: 'all' }), getAllCategories()]);
      setItems(mRes.data);
      setCategories(cRes.data);
    } catch { toast.error('Failed to load menu'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditItem(null); setForm(EMPTY_FORM); setImageFile(null); setImagePreview(''); setShowModal(true); };
  const openEdit = (item) => {
    setEditItem(item);
    setForm({
      name: item.name, description: item.description, price: item.price,
      category: item.category?._id || '', isAvailable: item.isAvailable,
      isFeatured: item.isFeatured, isPopular: item.isPopular, isMustTry: item.isMustTry,
      calories: item.calories || '', allergens: item.allergens?.join(', ') || '', order: item.order || 0,
    });
    setImagePreview(item.image || '');
    setImageFile(null);
    setShowModal(true);
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) return toast.error('Name, price, and category are required');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (form.allergens) fd.set('allergens', JSON.stringify(form.allergens.split(',').map(s => s.trim()).filter(Boolean)));
      else fd.set('allergens', JSON.stringify([]));
      if (imageFile) fd.append('image', imageFile);

      if (editItem) {
        await updateMenuItem(editItem._id, fd);
        toast.success('Menu item updated!');
      } else {
        await createMenuItem(fd);
        toast.success('Menu item added!');
      }
      setShowModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteMenuItem(id);
      toast.success('Item deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  const filtered = items.filter(item => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || item.category?._id === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="admin-menu-page">
      <div className="page-header">
        <div>
          <h2>Menu Items</h2>
          <p>{items.length} items in menu</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}><Plus size={18} /> Add Item</button>
      </div>

      <div className="menu-filters">
        <div className="filter-search">
          <Search size={16} />
          <input placeholder="Search items..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="form-control" style={{ width: 'auto' }}>
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-screen"><div className="spinner"></div></div>
      ) : (
        <div className="menu-items-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Price</th>
                <th>Tags</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item._id}>
                  <td>
                    <div className="item-cell">
                      <img src={item.image || '/placeholder-food.jpg'} alt={item.name} className="item-thumb" />
                      <div>
                        <strong>{item.name}</strong>
                        <p>{item.description?.slice(0, 50)}...</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="cat-pill">{item.category?.name || '—'}</span></td>
                  <td><strong style={{ color: 'var(--orange)' }}>${item.price?.toFixed(2)}</strong></td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                      {item.isPopular && <span className="tag-pill orange">Popular</span>}
                      {item.isMustTry && <span className="tag-pill red">Must Try</span>}
                      {item.isFeatured && <span className="tag-pill blue">Featured</span>}
                    </div>
                  </td>
                  <td>
                    <span className={`status-dot ${item.isAvailable ? 'green' : 'red'}`}>
                      {item.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="action-btn edit" onClick={() => openEdit(item)}><Edit2 size={16} /></button>
                      <button className="action-btn delete" onClick={() => handleDelete(item._id, item.name)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty-state"><p>No items found.</p></div>}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="modal-box" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{editItem ? 'Edit Menu Item' : 'Add Menu Item'}</h3>
                <button onClick={() => setShowModal(false)}><X size={20} /></button>
              </div>
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Item Name *</label>
                    <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="e.g. Chicken Shawarma Wrap" required />
                  </div>
                  <div className="form-group">
                    <label>Price ($) *</label>
                    <input className="form-control" type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})} placeholder="7.99" required />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description *</label>
                  <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe this menu item..." required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Category *</label>
                    <select className="form-control" value={form.category} onChange={e => setForm({...form, category: e.target.value})} required>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Calories</label>
                    <input className="form-control" type="number" value={form.calories} onChange={e => setForm({...form, calories: e.target.value})} placeholder="kcal" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Allergens (comma-separated)</label>
                  <input className="form-control" value={form.allergens} onChange={e => setForm({...form, allergens: e.target.value})} placeholder="e.g. gluten, dairy, sesame" />
                </div>
                <div className="form-group">
                  <label>Image</label>
                  <div className="upload-zone" onClick={() => document.getElementById('menuImg').click()}>
                    {imagePreview ? <img src={imagePreview} alt="preview" style={{ maxHeight: '140px', borderRadius: '8px' }} /> : (
                      <div className="upload-placeholder"><Upload size={32} /><p>Click to upload image</p><small>Cloudinary — JPG, PNG, WEBP</small></div>
                    )}
                  </div>
                  <input id="menuImg" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
                </div>
                <div className="checkbox-group">
                  {[
                    { key: 'isAvailable', label: 'Available' },
                    { key: 'isPopular', label: 'Popular' },
                    { key: 'isMustTry', label: 'Must Try' },
                    { key: 'isFeatured', label: 'Featured' },
                  ].map(({ key, label }) => (
                    <label key={key} className="checkbox-label">
                      <input type="checkbox" checked={form[key]} onChange={e => setForm({...form, [key]: e.target.checked})} />
                      {label}
                    </label>
                  ))}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editItem ? 'Update Item' : 'Add Item'}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminMenu;
