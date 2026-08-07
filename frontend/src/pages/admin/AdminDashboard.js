import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Users, DollarSign, Clock, TrendingUp, ArrowRight, AlertCircle } from 'lucide-react';
import { getOrderStats, getUserStats, getAllOrders } from '../../utils/api';
import './AdminDashboard.css';

const StatCard = ({ icon, label, value, sub, color, delay }) => (
  <motion.div
    className="stat-card"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    style={{ '--accent': color }}
  >
    <div className="stat-icon" style={{ background: color + '18', color }}>{icon}</div>
    <div className="stat-info">
      <p className="stat-label">{label}</p>
      <h2 className="stat-value">{value}</h2>
      {sub && <p className="stat-sub">{sub}</p>}
    </div>
  </motion.div>
);

const STATUS_COLOR = {
  pending: '#F57C00',
  confirmed: '#1976D2',
  preparing: '#7B1FA2',
  ready: '#388E3C',
  completed: '#2E7D32',
  cancelled: '#D32F2F',
};

const AdminDashboard = () => {
  const [orderStats, setOrderStats] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [oRes, uRes, ordRes] = await Promise.all([
          getOrderStats(), getUserStats(), getAllOrders({ limit: 5 })
        ]);
        setOrderStats(oRes.data);
        setUserStats(uRes.data);
        setRecentOrders(ordRes.data.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner"></div></div>;

  return (
    <div className="admin-dashboard">
      <div className="dash-header">
        <div>
          <h2>Welcome back! 👋</h2>
          <p>Here's what's happening with The Union Shawarma today.</p>
        </div>
        <Link to="/admin/orders" className="btn btn-primary">View All Orders <ArrowRight size={16} /></Link>
      </div>

      <div className="stats-grid">
        <StatCard icon={<ShoppingBag size={24} />} label="Total Orders" value={orderStats?.totalOrders || 0} sub={`${orderStats?.todayOrders || 0} today`} color="#F57C00" delay={0} />
        <StatCard icon={<DollarSign size={24} />} label="Total Revenue" value={`$${(orderStats?.totalRevenue || 0).toFixed(2)}`} sub="All time" color="#2E7D32" delay={0.1} />
        <StatCard icon={<Clock size={24} />} label="Pending Orders" value={orderStats?.pendingOrders || 0} sub="Needs attention" color="#D32F2F" delay={0.2} />
        <StatCard icon={<Users size={24} />} label="Total Customers" value={userStats?.totalUsers || 0} sub={`${userStats?.promoUsers || 0} subscribed to promos`} color="#1976D2" delay={0.3} />
      </div>

      <div className="dash-grid">
        <motion.div className="admin-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="card-header">
            <h3>Recent Orders</h3>
            <Link to="/admin/orders" className="view-all">View All <ArrowRight size={14} /></Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="empty-state"><p>No orders yet.</p></div>
          ) : (
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order._id}>
                      <td><strong>{order.user?.name || order.guestName || 'Guest'}</strong><br /><small>{order.user?.email || order.guestEmail}</small></td>
                      <td>{order.items?.length} item(s)</td>
                      <td><strong style={{ color: 'var(--orange)' }}>${order.totalAmount?.toFixed(2)}</strong></td>
                      <td>
                        <span className="status-badge" style={{ background: (STATUS_COLOR[order.status] || '#999') + '18', color: STATUS_COLOR[order.status] || '#999' }}>
                          {order.status}
                        </span>
                      </td>
                      <td><span className="type-badge">{order.orderType}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        <motion.div className="admin-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <div className="card-header"><h3>Quick Actions</h3></div>
          <div className="quick-actions">
            {[
              { label: 'Add Menu Item', path: '/admin/menu', icon: '🍽️', desc: 'Add new food to the menu' },
              { label: 'Manage Orders', path: '/admin/orders', icon: '📦', desc: 'Update order statuses' },
              { label: 'View Customers', path: '/admin/users', icon: '👥', desc: 'See promo subscribers' },
              { label: 'Update Gallery', path: '/admin/gallery', icon: '🖼️', desc: 'Add or remove photos' },
              { label: 'Site Settings', path: '/admin/settings', icon: '⚙️', desc: 'Update hours, contact, offers' },
            ].map(a => (
              <Link key={a.path} to={a.path} className="quick-action-item">
                <span className="qa-icon">{a.icon}</span>
                <div>
                  <strong>{a.label}</strong>
                  <span>{a.desc}</span>
                </div>
                <ArrowRight size={16} />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>

      {(orderStats?.pendingOrders || 0) > 0 && (
        <motion.div className="alert-banner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <AlertCircle size={20} />
          <span>You have <strong>{orderStats.pendingOrders} pending order(s)</strong> that need attention.</span>
          <Link to="/admin/orders?status=pending" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '13px' }}>
            Review Now
          </Link>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;
