import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, ChevronDown } from 'lucide-react';
import { getAllOrders, updateOrderStatus } from '../../utils/api';
import toast from 'react-hot-toast';
import './AdminOrders.css';

const STATUSES = ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'];
const STATUS_COLOR = {
  pending: '#F57C00', confirmed: '#1976D2', preparing: '#7B1FA2',
  ready: '#388E3C', completed: '#2E7D32', cancelled: '#D32F2F',
};

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAllOrders({ status: filterStatus || undefined, page, limit: 15 });
      setOrders(res.data.orders);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [filterStatus, page]);

  const handleStatusChange = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      toast.success(`Order marked as ${newStatus}`);
      load();
    } catch { toast.error('Update failed'); }
    finally { setUpdatingId(null); }
  };

  return (
    <div className="admin-orders-page">
      <div className="page-header">
        <div><h2>Orders</h2><p>{total} total orders</p></div>
        <button className="btn btn-outline" onClick={load}><RefreshCw size={16} /> Refresh</button>
      </div>

      <div className="order-filters">
        <button className={!filterStatus ? 'active' : ''} onClick={() => { setFilterStatus(''); setPage(1); }}>All</button>
        {STATUSES.map(s => (
          <button key={s} className={filterStatus === s ? 'active' : ''} onClick={() => { setFilterStatus(s); setPage(1); }}
            style={filterStatus === s ? { background: STATUS_COLOR[s], borderColor: STATUS_COLOR[s], color: 'white' } : {}}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? <div className="loading-screen"><div className="spinner"></div></div> : (
        <div className="orders-wrap">
          {orders.length === 0 ? (
            <div className="empty-state"><p>No orders found.</p></div>
          ) : orders.map((order, i) => (
            <motion.div key={order._id} className="order-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div className="order-card-header">
                <div className="order-id-row">
                  <span className="order-id">#{order._id.slice(-8).toUpperCase()}</span>
                  <span className="order-date">{new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <div className="order-status-control">
                  <select
                    value={order.status}
                    disabled={updatingId === order._id}
                    onChange={e => handleStatusChange(order._id, e.target.value)}
                    style={{ borderColor: STATUS_COLOR[order.status], color: STATUS_COLOR[order.status] }}
                    className="status-select"
                  >
                    {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
              </div>

              <div className="order-card-body">
                <div className="order-customer">
                  <p className="customer-name">{order.user?.name || order.guestName || 'Guest'}</p>
                  <p className="customer-email">{order.user?.email || order.guestEmail}</p>
                  {(order.user?.phone || order.guestPhone) && <p className="customer-phone">{order.user?.phone || order.guestPhone}</p>}
                </div>
                <div className="order-items-list">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="order-item-row">
                      <span>{item.name || item.menuItem?.name}</span>
                      <span>x{item.quantity}</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="order-meta">
                  <span className={`type-badge ${order.orderType}`}>{order.orderType}</span>
                  {order.specialInstructions && <p className="special-note">📝 {order.specialInstructions}</p>}
                </div>
              </div>

              <div className="order-card-footer">
                <span className="order-total">Total: <strong>${order.totalAmount?.toFixed(2)}</strong></span>
                <span className={`payment-status ${order.paymentStatus}`}>{order.paymentStatus}</span>
              </div>
            </motion.div>
          ))}

          {pages > 1 && (
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn btn-outline">Previous</button>
              <span>Page {page} of {pages}</span>
              <button disabled={page === pages} onClick={() => setPage(p => p + 1)} className="btn btn-primary">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
