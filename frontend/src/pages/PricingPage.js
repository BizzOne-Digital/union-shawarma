import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { getMenuItems, getCategories } from '../utils/api';
import { useCart } from '../context/CartContext';

const PricingPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    Promise.all([getMenuItems(), getCategories()])
      .then(([mRes, cRes]) => { setItems(mRes.data); setCategories(cRes.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeTab === 'all' ? items : items.filter(i => i.category?._id === activeTab);

  return (
    <main style={{ paddingTop: '90px', paddingBottom: '80px', background: 'var(--gray-light)' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p className="section-label" style={{ justifyContent: 'center' }}>💰 Menu Pricing</p>
          <h1 className="section-title">Fresh Food, Fair Prices</h1>
          <p style={{ color: 'var(--gray)', marginTop: '12px', fontSize: '17px' }}>Honest pricing on every item, every day.</p>
        </motion.div>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '36px' }}>
          <button className={`category-tab-btn ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>All</button>
          {categories.map(c => (
            <button key={c._id} className={`category-tab-btn ${activeTab === c._id ? 'active' : ''}`} onClick={() => setActiveTab(c._id)}>{c.name}</button>
          ))}
        </div>

        {loading ? <div className="loading-screen"><div className="spinner"></div></div> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            {filtered.map((item, i) => (
              <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                style={{ background: 'white', borderRadius: 'var(--radius)', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'transform 0.2s', cursor: 'default' }}
                whileHover={{ y: -2 }}>
                <img src={item.image || '/placeholder-food.jpg'} alt={item.name} style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>{item.name}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--gray)', lineHeight: '1.4' }}>{item.description?.slice(0, 60)}...</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '800', color: 'var(--orange)' }}>${item.price?.toFixed(2)}</div>
                  <button style={{ marginTop: '8px', background: 'var(--orange)', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => addToCart(item)}>
                    <Plus size={14} /> Add
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '48px', background: 'linear-gradient(135deg, var(--orange), var(--red))', borderRadius: '20px', padding: '36px', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>🎉 Online Special</h3>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '16px' }}>Chicken Shawarma Wrap for just <strong>$7.99</strong> when you order online!</p>
          <a href="/menu" style={{ display: 'inline-block', marginTop: '20px', background: 'white', color: 'var(--orange)', padding: '12px 28px', borderRadius: '50px', fontWeight: '700', fontSize: '15px' }}>Order Online Now</a>
        </div>
      </div>

      <style>{`.category-tab-btn { padding: 10px 22px; border-radius: 50px; border: 2px solid var(--border); background: white; font-size: 14px; font-weight: 600; color: var(--gray); cursor: pointer; transition: all 0.2s; } .category-tab-btn:hover { border-color: var(--orange); color: var(--orange); } .category-tab-btn.active { background: var(--orange); border-color: var(--orange); color: white; }`}</style>
    </main>
  );
};

export default PricingPage;
