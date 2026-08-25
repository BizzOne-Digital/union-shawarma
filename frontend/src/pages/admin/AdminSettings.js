import React, { useState, useEffect } from 'react';
import { Save, Upload } from 'lucide-react';
import { getSettings, updateSettings } from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminSettings.css';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [hours, setHours] = useState([]);
  const [specialOffer, setSpecialOffer] = useState({});
  const [contact, setContact] = useState({});
  const [social, setSocial] = useState({});
  const [delivery, setDelivery] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const res = await getSettings();
        const s = res.data;
        setSettings(s);
        setLogoPreview(s.logo || '');
        setSpecialOffer(s.specialOffer || {});
        setContact(s.contactInfo || {});
        setSocial(s.socialLinks || {});
        setDelivery(s.deliveryPartners || {});
        setHours(s.businessHours?.length ? s.businessHours : DAYS.map(d => ({ day: d, open: '', close: '', isClosed: false })));
      } catch { toast.error('Failed to load settings'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const handleLogo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleHour = (idx, field, value) => {
    setHours(prev => prev.map((h, i) => i === idx ? { ...h, [field]: value } : h));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('contactInfo', JSON.stringify(contact));
      fd.append('businessHours', JSON.stringify(hours));
      fd.append('specialOffer', JSON.stringify(specialOffer));
      fd.append('socialLinks', JSON.stringify(social));
      fd.append('deliveryPartners', JSON.stringify(delivery));
      if (settings?.heroTitle) fd.append('heroTitle', settings.heroTitle);
      if (logoFile) fd.append('logo', logoFile);
      await updateSettings(fd);
      toast.success('Settings saved!');
    } catch { toast.error('Save failed'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="admin-settings-page">
      <div className="page-header">
        <div><h2>Site Settings</h2><p>Manage your restaurant information</p></div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}><Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}</button>
      </div>

      <form onSubmit={handleSave}>
        <div className="settings-grid">
          {/* Logo */}
          <div className="settings-card">
            <h3>Logo</h3>
            <div className="logo-upload-zone" onClick={() => document.getElementById('logoInput').click()}>
              {logoPreview ? <img src={logoPreview} alt="Logo" style={{ maxHeight: '100px', objectFit: 'contain' }} /> : (
                <div className="upload-placeholder"><Upload size={28} /><p>Click to upload logo</p></div>
              )}
            </div>
            <input id="logoInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogo} />
            <small style={{ color: 'var(--gray)', marginTop: '8px', display: 'block' }}>Uploaded to Cloudinary</small>
          </div>

          {/* Contact */}
          <div className="settings-card">
            <h3>Contact Information</h3>
            <div className="form-group">
              <label>Phone</label>
              <input className="form-control" value={contact.phone || ''} onChange={e => setContact({ ...contact, phone: e.target.value })} placeholder="+1 289-389-3315" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input className="form-control" type="email" value={contact.email || ''} onChange={e => setContact({ ...contact, email: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input className="form-control" value={contact.address || ''} onChange={e => setContact({ ...contact, address: e.target.value })} />
            </div>
          </div>

          {/* Special Offer */}
          <div className="settings-card">
            <h3>Special Offer</h3>
            <div className="form-group">
              <label>Offer Title</label>
              <input className="form-control" value={specialOffer.title || ''} onChange={e => setSpecialOffer({ ...specialOffer, title: e.target.value })} placeholder="Chicken Shawarma Wrap" />
            </div>
            <div className="form-group">
              <label>Price</label>
              <input className="form-control" value={specialOffer.price || ''} onChange={e => setSpecialOffer({ ...specialOffer, price: e.target.value })} placeholder="$7.99" />
            </div>
            <div className="form-group">
              <label>Description</label>
              <input className="form-control" value={specialOffer.description || ''} onChange={e => setSpecialOffer({ ...specialOffer, description: e.target.value })} placeholder="Online order exclusive" />
            </div>
            <label className="checkbox-label">
              <input type="checkbox" checked={specialOffer.isActive || false} onChange={e => setSpecialOffer({ ...specialOffer, isActive: e.target.checked })} />
              Show on website
            </label>
          </div>

          {/* Social & Delivery */}
          <div className="settings-card">
            <h3>Social Media</h3>
            <div className="form-group">
              <label>Instagram</label>
              <input className="form-control" value={social.instagram || ''} onChange={e => setSocial({ ...social, instagram: e.target.value })} placeholder="@Theunionshawarma" />
            </div>
            <div className="form-group">
              <label>Facebook</label>
              <input className="form-control" value={social.facebook || ''} onChange={e => setSocial({ ...social, facebook: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Twitter / X</label>
              <input className="form-control" value={social.twitter || ''} onChange={e => setSocial({ ...social, twitter: e.target.value })} placeholder="https://x.com/yourhandle" />
            </div>
            <h3 style={{ marginTop: '20px' }}>Delivery Partners</h3>
            {[['uberEats', 'Uber Eats Link'], ['doordash', 'DoorDash Link'], ['skipTheDishes', 'Skip The Dishes Link']].map(([key, label]) => (
              <div className="form-group" key={key}>
                <label>{label}</label>
                <input className="form-control" value={delivery[key] || ''} onChange={e => setDelivery({ ...delivery, [key]: e.target.value })} placeholder="https://" />
              </div>
            ))}
          </div>
        </div>

        {/* Business Hours */}
        <div className="settings-card full-width">
          <h3>Business Hours</h3>
          <div className="hours-settings-grid">
            {hours.map((h, i) => (
              <div key={i} className="hour-row">
                <span className="day-name">{h.day}</span>
                <label className="checkbox-label compact">
                  <input type="checkbox" checked={h.isClosed} onChange={e => handleHour(i, 'isClosed', e.target.checked)} />
                  Closed
                </label>
                {!h.isClosed && (
                  <>
                    <input className="form-control time-input" type="text" value={h.open} onChange={e => handleHour(i, 'open', e.target.value)} placeholder="11:30 AM" disabled={h.isClosed} />
                    <span style={{ color: 'var(--gray)', fontSize: '14px' }}>to</span>
                    <input className="form-control time-input" type="text" value={h.close} onChange={e => handleHour(i, 'close', e.target.value)} placeholder="9:00 PM" disabled={h.isClosed} />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}><Save size={18} /> {saving ? 'Saving...' : 'Save All Settings'}</button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
