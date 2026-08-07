import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Leaf, Heart, Star } from 'lucide-react';
import './AboutPage.css';

const AboutPage = () => {
  const values = [
    { icon: <Flame size={28} />, title: 'Authentic Recipes', desc: 'Every marinade and sauce is made from original recipes passed through tradition.' },
    { icon: <Leaf size={28} />, title: 'Fresh Daily', desc: 'We source fresh ingredients every day — no frozen shortcuts, ever.' },
    { icon: <Heart size={28} />, title: 'Made with Love', desc: 'Every wrap is hand-rolled with care. We treat every order like it\'s for family.' },
    { icon: <Star size={28} />, title: 'Proudly Canadian', desc: 'Built in Canada, serving bold Mediterranean flavours to our community.' },
  ];

  return (
    <main className="about-page" style={{ paddingTop: '90px' }}>
      <section className="about-hero">
        <div className="container">
          <div className="about-hero-grid">
            <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
              <p className="section-label">Our Story ♥</p>
              <h1 className="section-title">At The Union Shawarma, <span className="text-orange">great food brings people together.</span></h1>
              <p className="about-text">
                Our kitchen is built on tradition — authentic marinades, hand-rolled wraps, and sauces made from scratch every day. Whether you're grabbing a quick wrap on your lunch break or sitting down for a full plate, we're here to make every bite count.
              </p>
              <p className="about-text">
                We believe food is more than sustenance — it's connection. It's the lunch shared between colleagues. The Friday treat after a long week. The comfort meal that feels like home. That's what we're serving at every location.
              </p>
              <div className="about-flags">
                <span>🍁 Proudly Canadian</span>
                <span>🌯 Authentically Delicious</span>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }}>
              <img src="https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=700&q=80" alt="Our Food" style={{ borderRadius: '24px', width: '100%', height: '480px', objectFit: 'cover', boxShadow: 'var(--shadow-lg)' }} />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="values-section section-pad">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p className="section-label" style={{ justifyContent: 'center' }}>What We Stand For</p>
            <h2 className="section-title">Our Values</h2>
          </div>
          <div className="values-grid">
            {values.map((v, i) => (
              <motion.div key={i} className="value-card" initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <div className="value-icon">{v.icon}</div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="about-cta" style={{ background: 'linear-gradient(135deg, var(--orange), var(--red))', padding: '80px 0', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '36px', fontWeight: '800', color: 'white', marginBottom: '16px' }}>Ready to taste the difference?</h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '17px', marginBottom: '32px' }}>Order online and pick up fresh — or find us on Uber Eats, DoorDash, and Skip.</p>
          <a href="/menu" className="btn" style={{ background: 'white', color: 'var(--orange)', padding: '16px 36px', borderRadius: '50px', fontWeight: '700', fontSize: '16px' }}>Order Online Now</a>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;
