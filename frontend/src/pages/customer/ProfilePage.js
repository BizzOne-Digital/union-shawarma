import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { updateProfile } from '../../utils/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', promoOptIn: user?.promoOptIn ?? true, password: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { name: form.name, phone: form.phone, promoOptIn: form.promoOptIn };
      if (form.password) data.password = form.password;
      await updateProfile(data);
      toast.success('Profile updated!');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  return (
    <main style={{ paddingTop: '100px', paddingBottom: '80px', background: 'var(--gray-light)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '600px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '36px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', fontWeight: '800', color: 'white' }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--dark)' }}>{user?.name}</h1>
                <p style={{ color: 'var(--gray)', fontSize: '14px' }}>{user?.email}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
                  <input className="form-control" style={{ paddingLeft: '44px' }} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Email (cannot be changed)</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
                  <input className="form-control" style={{ paddingLeft: '44px', background: 'var(--gray-light)' }} value={user?.email} disabled />
                </div>
              </div>
              <div className="form-group">
                <label>Phone</label>
                <div style={{ position: 'relative' }}>
                  <Phone size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray)' }} />
                  <input className="form-control" style={{ paddingLeft: '44px' }} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+1 (647) 123-4567" />
                </div>
              </div>
              <div className="form-group">
                <label>New Password (leave blank to keep current)</label>
                <input className="form-control" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="New password..." minLength={6} />
              </div>
              <label className="checkbox-label" style={{ marginBottom: '24px' }}>
                <input type="checkbox" checked={form.promoOptIn} onChange={e => setForm({ ...form, promoOptIn: e.target.checked })} />
                Receive exclusive offers and promotions
              </label>
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={saving}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </main>
  );
};

export default ProfilePage;
