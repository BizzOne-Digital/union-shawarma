import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, Clock, Instagram, Facebook, MapPin } from 'lucide-react';
import './ContactPage.css';

const ContactPage = () => {
  const hours = [
    { day: 'Monday – Thursday', time: '11:30 AM – 9:00 PM' },
    { day: 'Friday', time: '11:30 AM – 12:00 AM' },
    { day: 'Saturday', time: '1:00 PM – 12:00 AM' },
    { day: 'Sunday', time: '1:00 PM – 9:00 PM' },
  ];

  return (
    <main style={{ paddingTop: '90px', paddingBottom: '80px' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p className="section-label" style={{ justifyContent: 'center' }}>📍 Get In Touch</p>
          <h1 className="section-title">We'd Love to Hear From You</h1>
          <p style={{ color: 'var(--gray)', marginTop: '12px', fontSize: '17px' }}>Have a question, catering inquiry, or just want to say hi?</p>
        </motion.div>

        <div className="contact-grid">
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '36px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>Contact Information</h3>
              {[
                { icon: <Phone size={20} />, label: 'Phone', value: '+1 289-389-3315', href: 'tel:+12893893315' },
                { icon: <Mail size={20} />, label: 'Email', value: 'theunionshawarma@gmail.com', href: 'mailto:theunionshawarma@gmail.com' },
                { icon: <MapPin size={20} />, label: 'Website', value: 'www.theunionshawarma.ca', href: 'https://www.theunionshawarma.ca' },
              ].map((c, i) => (
                <a key={i} href={c.href} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '12px', transition: 'all 0.2s', color: 'var(--dark)' }}
                  onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--orange)'; e.currentTarget.style.background = 'rgba(245,124,0,0.04)'; }}
                  onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'white'; }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'rgba(245,124,0,0.1)', color: 'var(--orange)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c.icon}</div>
                  <div style={{ minWidth: 0 }}><p style={{ fontSize: '12px', color: 'var(--gray)', marginBottom: '2px' }}>{c.label}</p><strong style={{ fontSize: '14px', wordBreak: 'break-word' }}>{c.value}</strong></div>
                </a>
              ))}
            </div>

            <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '28px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Clock size={18} style={{ color: 'var(--orange)' }} /> Hours of Operation</h3>
              {hours.map((h, i) => (
                <div key={i} className="hours-row" style={{ borderBottom: i < hours.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--dark)' }}>{h.day}</span>
                  <span style={{ fontSize: '14px', color: 'var(--orange)', fontWeight: '700' }}>{h.time}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '36px', boxShadow: '0 2px 16px rgba(0,0,0,0.06)', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '24px' }}>Follow Us</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[
                  { icon: <Instagram size={20} />, label: '@Theunionshawarma', href: 'https://www.instagram.com/theunionshawarma', color: '#E1306C' },
                  { icon: <Facebook size={20} />, label: 'Facebook', href: '#', color: '#1877F2' },
                ].map((s, i) => (
                  <a key={i} href={s.href} target="_blank" rel="noreferrer"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--dark)', transition: 'all 0.2s', fontWeight: '600', fontSize: '14px' }}>
                    <span style={{ color: s.color }}>{s.icon}</span>{s.label}
                  </a>
                ))}
              </div>
            </div>

            <div style={{ background: 'linear-gradient(135deg, var(--orange), var(--red))', borderRadius: 'var(--radius)', padding: '36px', textAlign: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>Order Online Now</h3>
              <p style={{ color: 'rgba(255,255,255,0.85)', marginBottom: '20px', fontSize: '15px' }}>Pick up fresh or get it delivered via your favourite app.</p>
              <a href="/menu" style={{ display: 'inline-block', background: 'white', color: 'var(--orange)', padding: '12px 28px', borderRadius: '50px', fontWeight: '700', fontSize: '15px' }}>View Menu</a>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '13px', marginTop: '16px' }}>Also available on Uber Eats, DoorDash & Skip the Dishes</p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;
