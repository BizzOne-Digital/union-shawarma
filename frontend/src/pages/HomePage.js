import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Leaf, Truck, Star, ArrowRight, Plus, ShoppingBag } from 'lucide-react';
import { getMenuItems, getSettings } from '../utils/api';
import { useCart } from '../context/CartContext';
import CustomizeModal from '../components/common/CustomizeModal';
import './HomePage.css';

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.6, ease: [0.4, 0, 0.2, 1] } }),
};

const MenuCard = ({ item }) => {
  const { addToCart } = useCart();
  const [customizeItem, setCustomizeItem] = useState(null);

  const handleAddClick = () => {
    if (item.customizationGroups?.length > 0) {
      setCustomizeItem(item);
    } else {
      addToCart(item);
    }
  };

  return (
    <motion.div className="menu-card" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
      <div className="menu-card-img">
        <img src={item.image || '/placeholder-food.jpg'} alt={item.name} loading="lazy" />
        {item.isPopular && <span className="menu-tag popular">🔥 Popular</span>}
        {item.isMustTry && <span className="menu-tag must-try">⭐ Must Try</span>}
      </div>
      <div className="menu-card-body">
        <h3>{item.name}</h3>
        <p>{item.description}</p>
        <div className="menu-card-footer">
          <span className="price">${item.price.toFixed(2)}</span>
          <button className="add-btn" onClick={handleAddClick} aria-label={`Add ${item.name} to cart`}>
            <Plus size={18} />
          </button>
        </div>
      </div>

      {customizeItem && (
        <CustomizeModal
          item={customizeItem}
          onClose={() => setCustomizeItem(null)}
          onConfirm={(selections) => { addToCart(customizeItem, selections); setCustomizeItem(null); }}
        />
      )}
    </motion.div>
  );
};

const HomePage = () => {
  const [popularItems, setPopularItems] = useState([]);
  const [mustTryItems, setMustTryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliveryPartners, setDeliveryPartners] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const [popRes, mustRes, settingsRes] = await Promise.all([
          getMenuItems({ popular: 'true' }),
          getMenuItems({ mustTry: 'true' }),
          getSettings(),
        ]);
        setPopularItems(popRes.data.slice(0, 3));
        setMustTryItems(mustRes.data.slice(0, 3));
        setDeliveryPartners(settingsRes.data?.deliveryPartners || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const features = [
    { icon: <Leaf size={22} />, title: 'Fresh Ingredients', desc: 'We use only the freshest produce and quality meats.' },
    { icon: <Flame size={22} />, title: 'Authentic Marinades', desc: 'Marinated to perfection for rich, bold flavour.' },
    { icon: <Truck size={22} />, title: 'Fast Pickup & Delivery', desc: 'Quick service when you dine in, pick up or order.' },
    { icon: <Star size={22} />, title: 'Friendly Service', desc: 'We treat every guest like part of the family.' },
  ];

  return (
    <main className="home-page">
      {/* ===== HERO ===== */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-shape-1"></div>
          <div className="hero-shape-2"></div>
        </div>
        <div className="hero-bg-img hero-bg-img-desktop" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/newhero.jpg)` }}></div>
        <div className="hero-bg-img hero-bg-img-mobile" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/mobile-hero2.png)` }}></div>
        <div className="container">
          <div className="hero-inner">
            <div className="hero-content">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <span className="hero-eyebrow">🍁 Proudly Canadian</span>
              </motion.div>
              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }}>
                THE UNION <span className="hero-highlight">SHAWARMA</span>
              </motion.h1>
              <motion.p className="hero-desc" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                Authentic marinades. Hand-rolled wraps.<br />Sauces made from scratch every day.
              </motion.p>
              <motion.div className="hero-actions" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                <Link to="/menu" className="btn btn-primary btn-lg">
                  <ShoppingBag size={20} /> Explore Menu
                </Link>
                <Link to="/about" className="btn btn-outline">
                  Our Story <ArrowRight size={18} />
                </Link>
              </motion.div>
              <motion.div className="hero-trust" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                <span>✅ Made Fresh. Made Local. Loved by Canadians.</span>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="features-strip">
        <div className="container">
          <div className="features-grid">
            {features.map((f, i) => (
              <motion.div key={i} className="feature-item" custom={i} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className="feature-icon">{f.icon}</div>
                <div>
                  <h4>{f.title}</h4>
                  <p>{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== POPULAR MENU ===== */}
      <section className="section-pad menu-section">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="section-label"><Flame size={16} /> Popular Menu</p>
              <h2 className="section-title">What People Love</h2>
            </div>
            <Link to="/menu" className="btn btn-outline">View Full Menu <ArrowRight size={16} /></Link>
          </div>
          {loading ? (
            <div className="loading-screen"><div className="spinner"></div></div>
          ) : popularItems.length > 0 ? (
            <div className="menu-grid">
              {popularItems.map(item => <MenuCard key={item._id} item={item} />)}
            </div>
          ) : (
            <div className="empty-state">
              <p>Menu items coming soon. Check back shortly!</p>
            </div>
          )}
        </div>
      </section>

      {/* ===== MUST TRY ===== */}
      {mustTryItems.length > 0 && (
        <section className="section-pad must-try-section">
          <div className="container">
            <div className="section-header">
              <div>
                <p className="section-label"><Star size={16} /> Must Try</p>
                <h2 className="section-title">Chef's Favourites</h2>
              </div>
              <Link to="/menu" className="btn btn-outline">See All Items <ArrowRight size={16} /></Link>
            </div>
            <div className="menu-grid">
              {mustTryItems.map(item => <MenuCard key={item._id} item={item} />)}
            </div>
          </div>
        </section>
      )}

      {/* ===== OUR STORY ===== */}
      <section className="section-pad story-section">
        <div className="container">
          <div className="story-grid">
            <motion.div className="story-content" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
              <p className="section-label">Our Story ♥</p>
              <h2 className="section-title">Food brings<br /><span className="text-orange">people together</span></h2>
              <p className="story-text">
                The Union Shawarma was built on a passion for real food and real connections. From our kitchen to your table, we're proud to serve freshly made meals using authentic recipes, high-quality ingredients and a lot of heart.
              </p>
              <div className="story-stats">
                {[['Premium Quality', 'Meats'], ['Fresh Daily', 'Produce'], ['Scratch-Made', 'Sauces'], ['Proudly', 'Canadian']].map(([line1, line2], i) => (
                  <div key={i} className="story-stat">
                    <span className="stat-line1">{line1}</span>
                    <span className="stat-line2">{line2}</span>
                  </div>
                ))}
              </div>
              <Link to="/about" className="btn btn-primary">Read Our Story <ArrowRight size={18} /></Link>
            </motion.div>
            <motion.div className="story-img-wrapper" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} custom={1}>
                <img src="/newabout.jpg"alt="Our kitchen" loading="lazy" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== ORDER YOUR WAY ===== */}
      <section className="delivery-section">
        <div className="container">
          <motion.div className="delivery-inner" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div className="delivery-text">
              <h2 className="section-title">Order Your Way</h2>
              <p>Choose the service that works best for you.</p>
            </div>
            <div className="delivery-options">
              <div className="delivery-option pickup">
                <ShoppingBag size={28} />
                <div>
                  <strong>Online Pickup</strong>
                  <span>Pick up fresh and fast</span>
                </div>
              </div>
              <div className="delivery-partners">
                {[
                  { label: 'Uber Eats', href: deliveryPartners.uberEats },
                  { label: 'DoorDash', href: deliveryPartners.doordash },
                  { label: 'Skip the Dishes', href: deliveryPartners.skipTheDishes },
                ].filter(p => p.href).map(p => (
                  <a key={p.label} href={p.href} rel="noreferrer" className="partner-badge">
                    <span>{p.label}</span>
                    <small>Delivered to your door</small>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== JOIN FAMILY / EMAIL SIGNUP ===== */}
      <section className="signup-section">
        <div className="container">
          <motion.div className="signup-inner" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
            <div>
              <h2>Join The Union Family</h2>
              <p>Create an account to save your favourites, earn rewards and get exclusive offers.</p>
            </div>
            <Link to="/register" className="btn btn-primary btn-lg">
              Sign Up Free <ArrowRight size={18} />
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
};

export default HomePage;
