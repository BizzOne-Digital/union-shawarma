import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus } from 'lucide-react';
import { getMenuItems, getCategories, getSettings } from '../utils/api';
import { useCart } from '../context/CartContext';
import CustomizeModal from '../components/common/CustomizeModal';
import './MenuPage.css';

const MenuPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [customizeItem, setCustomizeItem] = useState(null);
  const [specialOffer, setSpecialOffer] = useState(null);
  const { addToCart } = useCart();

  const handleAddClick = (item) => {
    if (item.customizationGroups?.length > 0) {
      setCustomizeItem(item);
    } else {
      addToCart(item);
    }
  };

  const handleConfirmCustomization = (selections) => {
    addToCart(customizeItem, selections);
    setCustomizeItem(null);
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [menuRes, catRes, settingsRes] = await Promise.all([getMenuItems(), getCategories(), getSettings()]);
        setItems(menuRes.data);
        setCategories(catRes.data);
        setSpecialOffer(settingsRes.data?.specialOffer || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = items.filter(item => {
    const matchCat = activeCategory === 'all' || item.category?._id === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <main className="menu-page" style={{ paddingTop: '90px' }}>
      <div className="menu-hero">
        <div className="container">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <p className="section-label" style={{ justifyContent: 'center' }}>🔥 Our Menu</p>
            <h1 className="section-title text-center">Authentic Flavours</h1>
            <p style={{ textAlign: 'center', color: 'var(--gray)', marginTop: '12px', fontSize: '17px' }}>
              Every item made fresh, every day.
            </p>
          </motion.div>

          <div className="menu-search">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search menu items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="category-tabs">
            <button className={activeCategory === 'all' ? 'active' : ''} onClick={() => setActiveCategory('all')}>
              All Items
            </button>
            {categories.map(cat => (
              <button key={cat._id} className={activeCategory === cat._id ? 'active' : ''} onClick={() => setActiveCategory(cat._id)}>
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '48px 24px' }}>
        {loading ? (
          <div className="loading-screen"><div className="spinner"></div></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>No items found. Try a different search or category.</p>
          </div>
        ) : (
          <motion.div className="full-menu-grid" layout>
            <AnimatePresence>
              {filtered.map(item => (
                <motion.div
                  key={item._id}
                  className="menu-item-card"
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="item-img">
                    <img src={item.image || '/placeholder-food.jpg'} alt={item.name} loading="lazy" />
                    <div className="item-tags">
                      {item.isPopular && <span className="menu-tag popular">🔥</span>}
                      {item.isMustTry && <span className="menu-tag must-try">⭐</span>}
                      {!item.isAvailable && <span className="menu-tag unavailable">Unavailable</span>}
                    </div>
                  </div>
                  <div className="item-body">
                    <div className="item-cat-label">{item.category?.name}</div>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                    {item.allergens?.length > 0 && (
                      <p className="allergens">⚠️ Contains: {item.allergens.join(', ')}</p>
                    )}
                    <div className="item-footer">
                      <span className="price">${item.price.toFixed(2)}</span>
                      <button
                        className="add-btn"
                        onClick={() => handleAddClick(item)}
                        disabled={!item.isAvailable}
                        aria-label={`Add ${item.name} to cart`}
                      >
                        <Plus size={18} /> Add
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Online special banner */}
      {specialOffer?.isActive && (
        <div className="online-special-banner">
          <div className="container">
            <p>🎉 <strong>Online Special:</strong> {specialOffer.title} for just <strong>{specialOffer.price}</strong> when you order online!</p>
          </div>
        </div>
      )}

      {customizeItem && (
        <CustomizeModal
          item={customizeItem}
          onClose={() => setCustomizeItem(null)}
          onConfirm={handleConfirmCustomization}
        />
      )}
    </main>
  );
};

export default MenuPage;
