import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, Plus } from 'lucide-react';
import { getProfile } from '../../utils/api';
import { useCart } from '../../context/CartContext';

const FavouritesPage = () => {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    getProfile().then(res => setFavourites(res.data.favourites || [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ paddingTop: '100px', paddingBottom: '80px', background: 'var(--gray-light)', minHeight: '100vh' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '28px', fontWeight: '800', marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Heart size={28} style={{ color: 'var(--red)' }} /> My Favourites
          </h1>
          {loading ? <div className="loading-screen"><div className="spinner"></div></div> :
          favourites.length === 0 ? (
            <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '60px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <Heart size={48} style={{ color: 'var(--border)', margin: '0 auto 16px' }} />
              <h3 style={{ fontWeight: '700', marginBottom: '8px' }}>No favourites yet</h3>
              <p style={{ color: 'var(--gray)' }}>Save your favourite items from the menu.</p>
              <a href="/menu" className="btn btn-primary" style={{ marginTop: '20px', display: 'inline-flex' }}>Browse Menu</a>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              {favourites.map(item => (
                <motion.div key={item._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ background: 'white', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                  <img src={item.image || '/placeholder-food.jpg'} alt={item.name} style={{ width: '100%', height: '180px', objectFit: 'cover' }} />
                  <div style={{ padding: '16px' }}>
                    <h3 style={{ fontWeight: '700', marginBottom: '4px' }}>{item.name}</h3>
                    <p style={{ fontSize: '13px', color: 'var(--gray)', marginBottom: '12px' }}>{item.description?.slice(0, 60)}...</p>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '800', color: 'var(--orange)' }}>${item.price?.toFixed(2)}</span>
                      <button style={{ background: 'var(--orange)', color: 'white', border: 'none', borderRadius: '10px', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }} onClick={() => addToCart(item)}>
                        <Plus size={16} /> Add
                      </button>
                    </div>
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

export default FavouritesPage;
