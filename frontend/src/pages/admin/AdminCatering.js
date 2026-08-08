import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Mail, Phone, MapPin, Calendar, Users } from 'lucide-react';
import { getCateringRequests, updateCateringStatus } from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminOrders.css';

const STATUSES = ['new', 'contacted', 'closed'];
const STATUS_COLOR = { new: '#F57C00', contacted: '#1976D2', closed: '#388E3C' };

const AdminCatering = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getCateringRequests();
      setRequests(res.data);
    } catch { toast.error('Failed to load catering requests'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await updateCateringStatus(id, { status });
      toast.success(`Marked as ${status}`);
      setRequests((prev) => prev.map((r) => r._id === id ? { ...r, status } : r));
    } catch { toast.error('Failed to update status'); }
    finally { setUpdatingId(null); }
  };

  return (
    <div className="admin-orders-page">
      <div className="page-header">
        <div><h2>Catering Requests</h2><p>{requests.length} total inquiries</p></div>
        <button className="btn btn-outline" onClick={load}><RefreshCw size={16} /> Refresh</button>
      </div>

      {loading ? <div className="loading-screen"><div className="spinner"></div></div> : (
        <div className="orders-wrap">
          {requests.length === 0 ? (
            <div className="empty-state"><p>No catering requests yet.</p></div>
          ) : requests.map((r, i) => (
            <motion.div key={r._id} className="order-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className="order-card-header">
                <div className="order-id-row">
                  <span className="order-id">{r.name}</span>
                  <span className="order-date">{new Date(r.createdAt).toLocaleString()}</span>
                </div>
                <div className="order-status-control">
                  <select
                    value={r.status}
                    disabled={updatingId === r._id}
                    onChange={(e) => handleStatusChange(r._id, e.target.value)}
                    style={{ borderColor: STATUS_COLOR[r.status], color: STATUS_COLOR[r.status] }}
                    className="status-select"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div className="order-card-body">
                <div className="order-customer">
                  <p className="customer-email"><Mail size={13} /> {r.email}</p>
                  <p className="customer-phone"><Phone size={13} /> {r.phone}</p>
                </div>
                <div className="order-items-list">
                  <div className="order-item-row"><span><MapPin size={13} /> Location</span><span>{r.location}</span></div>
                  {r.eventDate && <div className="order-item-row"><span><Calendar size={13} /> Event Date</span><span>{r.eventDate}</span></div>}
                  {r.guestCount && <div className="order-item-row"><span><Users size={13} /> Guests</span><span>{r.guestCount}</span></div>}
                  {r.message && <div className="order-item-row"><span>Message</span><span>{r.message}</span></div>}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCatering;
