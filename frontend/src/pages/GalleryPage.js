import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';
import { getGallery } from '../utils/api';

const GalleryPage = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getGallery().then(res => setPhotos(res.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const fallbackPhotos = [
    { _id: '1', image: 'https://images.unsplash.com/photo-1604467707625-7e94d4ef7b38?w=600&q=80', title: 'Chicken Shawarma Wrap' },
    { _id: '2', image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&q=80', title: 'Fresh Ingredients' },
    { _id: '3', image: 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=600&q=80', title: 'Our Kitchen' },
    { _id: '4', image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&q=80', title: 'Beef Shawarma' },
    { _id: '5', image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80', title: 'Fresh Veggies' },
    { _id: '6', image: 'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=600&q=80', title: 'Shawarma Plate' },
  ];

  const displayPhotos = photos.length > 0 ? photos : fallbackPhotos;

  return (
    <main style={{ paddingTop: '90px', paddingBottom: '80px' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '48px' }}>
          <p className="section-label" style={{ justifyContent: 'center' }}>📸 Our Gallery</p>
          <h1 className="section-title">A Taste Through Our Lens</h1>
          <p style={{ color: 'var(--gray)', marginTop: '12px', fontSize: '17px' }}>See the freshness and flavour we pour into every dish.</p>
        </motion.div>

        {loading ? <div className="loading-screen"><div className="spinner"></div></div> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {displayPhotos.map((photo, i) => (
              <motion.div key={photo._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', cursor: 'pointer', aspectRatio: i % 5 === 0 ? '16/10' : '1' }}
                onClick={() => setSelected(photo)}>
                <img src={photo.image} alt={photo.title || 'Gallery'} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s ease' }}
                  onMouseOver={e => e.target.style.transform = 'scale(1.06)'} onMouseOut={e => e.target.style.transform = 'scale(1)'} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.35)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0)'}>
                  <ZoomIn size={32} style={{ color: 'white', opacity: 0 }} />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}
            onClick={() => setSelected(null)}>
            <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white', width: '44px', height: '44px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={24} />
            </button>
            <motion.img src={selected.image} alt={selected.title} initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              style={{ maxWidth: '90vw', maxHeight: '80vh', objectFit: 'contain', borderRadius: '16px' }} onClick={e => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default GalleryPage;
