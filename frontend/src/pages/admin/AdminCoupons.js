import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, getMenuItems } from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminOrders.css';

const EMPTY_FORM = { code: '', discountType: 'percent', discountValue: '', minOrderAmount: '', expiresAt: '', usageLimit: '', applicableItems: [] };

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [couponsRes, menuRes] = await Promise.all([getCoupons(), getMenuItems()]);
      setCoupons(couponsRes.data);
      setMenuItems(menuRes.data);
    } catch { toast.error('Failed to load coupons'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleApplicableItem = (id) => {
    setForm((prev) => ({
      ...prev,
      applicableItems: prev.applicableItems.includes(id)
        ? prev.applicableItems.filter((i) => i !== id)
        : [...prev.applicableItems, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code || (form.discountType !== 'bogo50' && !form.discountValue)) return toast.error('Code and discount value are required');
    setSaving(true);
    try {
      await createCoupon({
        code: form.code,
        discountType: form.discountType,
        discountValue: form.discountType === 'bogo50' ? 0 : Number(form.discountValue),
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
        expiresAt: form.expiresAt || undefined,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
        applicableItems: form.discountType === 'bogo50' ? form.applicableItems : [],
      });
      toast.success('Coupon created!');
      setForm(EMPTY_FORM);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (coupon) => {
    try {
      await updateCoupon(coupon._id, { isActive: !coupon.isActive });
      setCoupons((prev) => prev.map((c) => c._id === coupon._id ? { ...c, isActive: !c.isActive } : c));
    } catch { toast.error('Failed to update coupon'); }
  };

  const handleDelete = async (id, code) => {
    if (!window.confirm(`Delete coupon "${code}"?`)) return;
    try {
      await deleteCoupon(id);
      toast.success('Coupon deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="admin-orders-page">
      <div className="page-header">
        <div><h2>Coupons</h2><p>{coupons.length} total coupons</p></div>
      </div>

      <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 'var(--radius)', padding: '20px', marginBottom: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', alignItems: 'end' }}>
        <div className="form-group">
          <label>Code *</label>
          <input className="form-control" value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SAVE10" />
        </div>
        <div className="form-group">
          <label>Type</label>
          <select className="form-control" value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}>
            <option value="percent">Percent (%)</option>
            <option value="fixed">Fixed ($)</option>
            <option value="bogo50">Buy 1 Get 1 50% Off</option>
          </select>
        </div>
        {form.discountType !== 'bogo50' && (
          <div className="form-group">
            <label>Value *</label>
            <input className="form-control" type="number" min="0" value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })} placeholder="10" />
          </div>
        )}
        <div className="form-group">
          <label>Min Order ($)</label>
          <input className="form-control" type="number" min="0" value={form.minOrderAmount} onChange={e => setForm({ ...form, minOrderAmount: e.target.value })} placeholder="0" />
        </div>
        <div className="form-group">
          <label>Expires</label>
          <input className="form-control" type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })} />
        </div>
        <div className="form-group">
          <label>Usage Limit</label>
          <input className="form-control" type="number" min="0" value={form.usageLimit} onChange={e => setForm({ ...form, usageLimit: e.target.value })} placeholder="Unlimited" />
        </div>
        <button type="submit" className="btn btn-primary" disabled={saving} style={{ justifyContent: 'center' }}>
          <Plus size={16} /> {saving ? 'Saving...' : 'Add Coupon'}
        </button>

        {form.discountType === 'bogo50' && (
          <div className="form-group" style={{ gridColumn: '1 / -1' }}>
            <label>Applies to (leave empty for any item)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '160px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px' }}>
              {menuItems.map((item) => (
                <label key={item._id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', padding: '4px 10px', borderRadius: '20px', background: form.applicableItems.includes(item._id) ? 'rgba(245,124,0,0.1)' : 'var(--gray-light)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.applicableItems.includes(item._id)} onChange={() => toggleApplicableItem(item._id)} />
                  {item.name}
                </label>
              ))}
            </div>
          </div>
        )}
      </form>

      {loading ? (
        <div className="loading-screen"><div className="spinner"></div></div>
      ) : coupons.length === 0 ? (
        <div className="empty-state"><p>No coupons yet.</p></div>
      ) : (
        <div className="orders-wrap">
          {coupons.map((c) => (
            <div className="order-card" key={c._id}>
              <div className="order-card-header">
                <div className="order-id-row">
                  <span className="order-id"><Tag size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />{c.code}</span>
                  <span className="order-date">
                    {c.discountType === 'percent' ? `${c.discountValue}% off` : c.discountType === 'bogo50' ? 'Buy 1 Get 1 50% Off' : `$${c.discountValue} off`}
                    {c.discountType === 'bogo50' && (c.applicableItems?.length > 0
                      ? ` · Applies to: ${c.applicableItems.map((id) => menuItems.find((m) => m._id === id)?.name || '—').join(', ')}`
                      : ' · Applies to: any item')}
                    {c.minOrderAmount > 0 && ` · Min $${c.minOrderAmount}`}
                    {c.expiresAt && ` · Expires ${new Date(c.expiresAt).toLocaleDateString()}`}
                    {' · Used '}{c.usedCount}{c.usageLimit ? `/${c.usageLimit}` : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ padding: '6px 14px', fontSize: 12, color: c.isActive ? '#388E3C' : 'var(--gray)' }}
                    onClick={() => toggleActive(c)}
                  >
                    {c.isActive ? 'Active' : 'Inactive'}
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(c._id, c.code)}><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
