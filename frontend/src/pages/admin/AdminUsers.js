import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Users, Mail, Bell } from 'lucide-react';
import { getAllUsers, getUserStats, getPromoSubscribers } from '../../utils/api';
import toast from 'react-hot-toast';
import '../admin/AdminOrders.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showPromo, setShowPromo] = useState(false);
  const [promoList, setPromoList] = useState([]);

  const load = async () => {
    setLoading(true);
    try {
      const [uRes, sRes] = await Promise.all([getAllUsers({ page, limit: 20, search }), getUserStats()]);
      setUsers(uRes.data.users);
      setTotal(uRes.data.total);
      setPages(uRes.data.pages);
      setStats(sRes.data);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, search]);

  const loadPromo = async () => {
    try {
      const res = await getPromoSubscribers();
      setPromoList(res.data.users);
      setShowPromo(true);
    } catch { toast.error('Failed to load subscribers'); }
  };

  return (
    <div className="admin-menu-page">
      <div className="page-header">
        <div><h2>Customers</h2><p>{total} registered customers</p></div>
        <button className="btn btn-primary" onClick={loadPromo}><Bell size={16} /> Promo List</button>
      </div>

      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { icon: <Users size={20} />, label: 'Total Customers', value: stats.totalUsers, color: '#1976D2' },
            { icon: <Bell size={20} />, label: 'Promo Subscribers', value: stats.promoUsers, color: '#F57C00' },
            { icon: <Users size={20} />, label: 'New This Month', value: stats.newThisMonth, color: '#2E7D32' },
          ].map((s, i) => (
            <motion.div key={i} className="stat-card" style={{ '--accent': s.color }} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <div className="stat-icon" style={{ background: s.color + '18', color: s.color }}>{s.icon}</div>
              <div className="stat-info"><p className="stat-label">{s.label}</p><h2 className="stat-value">{s.value}</h2></div>
            </motion.div>
          ))}
        </div>
      )}

      <div className="menu-filters">
        <div className="filter-search">
          <Search size={16} />
          <input placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      {loading ? <div className="loading-screen"><div className="spinner"></div></div> : (
        <div className="menu-items-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th>Promo Opt-in</th><th>Joined</th></tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.email}</td>
                  <td>{user.phone || '—'}</td>
                  <td><span className={`status-dot ${user.promoOptIn ? 'green' : 'red'}`}>{user.promoOptIn ? 'Yes' : 'No'}</span></td>
                  <td style={{ fontSize: '12px', color: 'var(--gray)' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <div className="empty-state"><p>No customers yet.</p></div>}
        </div>
      )}

      {pages > 1 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn btn-outline">Previous</button>
          <span>Page {page} of {pages}</span>
          <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="btn btn-primary">Next</button>
        </div>
      )}

      {showPromo && (
        <div className="modal-overlay" onClick={() => setShowPromo(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Promo Subscribers ({promoList.length})</h3>
              <button onClick={() => setShowPromo(false)}>✕</button>
            </div>
            <div style={{ padding: '20px', maxHeight: '400px', overflowY: 'auto' }}>
              <p style={{ fontSize: '13px', color: 'var(--gray)', marginBottom: '16px' }}>
                These customers have opted in to receive promotions via email or phone.
              </p>
              {promoList.map(u => (
                <div key={u._id} style={{ padding: '10px 14px', borderRadius: '10px', border: '1px solid var(--border)', marginBottom: '8px' }}>
                  <strong style={{ fontSize: '14px' }}>{u.name}</strong>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '4px', fontSize: '12px', color: 'var(--gray)' }}>
                    <span><Mail size={12} style={{ display: 'inline', marginRight: '4px' }} />{u.email}</span>
                    {u.phone && <span>{u.phone}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
