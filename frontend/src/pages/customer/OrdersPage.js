import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Clock } from 'lucide-react';
import { getMyOrders } from '../../utils/api';

const STATUS_COLOR = {
  pending: '#F57C00', confirmed: '#1976D2', preparing: '#7B1FA2',
  ready: '#388E3C', completed: '#2E7D32', cancelled: '#D32F2F',
};

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders().then(res => setOrders(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ paddingTop: '100px', paddingBottom: '80px', background: 'var(--gray-light)', minHeight: '100vh' }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '800', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Package size={28} style={{ color: 'var(--orange)' }} /> My Orders
          </h1>
          {loading ? <div className="loading-screen"><div className="spinner"></div></div> :
          orders.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '60px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <Package size={48} style={{ color: 'var(--border)', margin: '0 auto 16px' }} />
              <h3 style={{ fontWeight: '700', marginBottom: '8px' }}>No orders yet</h3>
              <p style={{ color: 'var(--gray)' }}>Start ordering to see your history here.</p>
              <a href="/menu" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-flex' }}>Browse Menu</a>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map(order => (
                <motion.div key={order._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'white', borderRadius: 'var(--radius)', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div>
                      <p style={{ fontSize: '12px', color: 'var(--gray)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><Clock size={12} /> {new Date(order.createdAt).toLocaleString()}</p>
                      <code style={{ fontSize: '13px', background: 'var(--gray-light)', padding: '3px 8px', borderRadius: '6px' }}>#{order._id.slice(-8).toUpperCase()}</code>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ display: 'block', padding: '5px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '700', background: (STATUS_COLOR[order.status] || '#999') + '18', color: STATUS_COLOR[order.status] || '#999', textTransform: 'capitalize' }}>{order.status}</span>
                      <span style={{ fontSize: '20px', fontFamily: 'var(--font-display)', fontWeight: '800', color: 'var(--orange)' }}>${order.totalAmount?.toFixed(2)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {order.items?.map((item, i) => (
                      <div key={i} style={{ display: 'flex', gap: '12px', padding: '8px 12px', background: 'var(--gray-light)', borderRadius: '8px', fontSize: '13px' }}>
                        <span style={{ flex: 1, fontWeight: '500' }}>{item.name}</span>
                        <span style={{ color: 'var(--gray)' }}>x{item.quantity}</span>
                        <span style={{ fontWeight: '700', color: 'var(--orange)' }}>${(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <span style={{ padding: '4px 12px', borderRadius: '6px', background: 'rgba(245,124,0,0.1)', color: 'var(--orange)', fontSize: '12px', fontWeight: '700', textTransform: 'capitalize' }}>{order.orderType}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
};

export default OrdersPage;
