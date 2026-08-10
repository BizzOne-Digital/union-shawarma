import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { getMenuItems, getCategories } from '../utils/api';
import { useCart } from '../context/CartContext';
import CustomizeModal from '../components/common/CustomizeModal';

const PricingPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [customizeItem, setCustomizeItem] = useState(null);
  const { addToCart } = useCart();

  useEffect(() => {
    Promise.all([getMenuItems(), getCategories()])
      .then(([mRes, cRes]) => { setItems(mRes.data); setCategories(cRes.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = activeTab === 'all' ? items : items.filter(i => i.category?._id === activeTab);

  const handleAddClick = (item) => {
    if (item.customizationGroups?.length > 0) {
      setCustomizeItem(item);
    } else {
      addToCart(item);
    }
  };

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
          <div className="pricing-grid">
            {filtered.map((item, i) => (
              <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="pricing-card"
                whileHover={{ y: -2 }}>
                <img src={item.image || '/placeholder-food.jpg'} alt={item.name} style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: '15px', fontWeight: '700', marginBottom: '4px' }}>{item.name}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--gray)', lineHeight: '1.4' }}>{item.description?.slice(0, 60)}...</p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '800', color: 'var(--orange)' }}>${item.price?.toFixed(2)}</div>
                  <button style={{ marginTop: '8px', background: 'var(--orange)', color: 'white', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handleAddClick(item)}>
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

      {customizeItem && (
        <CustomizeModal
          item={customizeItem}
          onClose={() => setCustomizeItem(null)}
          onConfirm={(selections) => { addToCart(customizeItem, selections); setCustomizeItem(null); }}
        />
      )}

      <style>{`
        .category-tab-btn { padding: 10px 22px; border-radius: 50px; border: 2px solid var(--border); background: white; font-size: 14px; font-weight: 600; color: var(--gray); cursor: pointer; transition: all 0.2s; }
        .category-tab-btn:hover { border-color: var(--orange); color: var(--orange); }
        .category-tab-btn.active { background: var(--orange); border-color: var(--orange); color: white; }
        .pricing-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
        .pricing-card { background: white; border-radius: var(--radius); padding: 20px; display: flex; align-items: center; gap: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.05); cursor: default; }
        @media (max-width: 480px) {
          .pricing-card { flex-wrap: wrap; }
        }
      `}</style>
    </main>
  );
};

export default PricingPage;
