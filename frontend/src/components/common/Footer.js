import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Clock, Instagram, Facebook } from 'lucide-react';
import { getSettings } from '../../utils/api';
import './Footer.css';

const Footer = () => {
  const [deliveryPartners, setDeliveryPartners] = useState({});
  const [socialLinks, setSocialLinks] = useState({});

  useEffect(() => {
    getSettings().then((res) => {
      setDeliveryPartners(res.data?.deliveryPartners || {});
      setSocialLinks(res.data?.socialLinks || {});
    }).catch(() => {});
  }, []);

  const hours = [
    { day: 'Mon – Thu', time: '11:30 AM – 9:00 PM' },
    { day: 'Friday', time: '11:30 AM – 12:00 AM' },
    { day: 'Saturday', time: '1:00 PM – 12:00 AM' },
    { day: 'Sunday', time: '1:00 PM – 9:00 PM' },
  ];

  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Link to="/" className="footer-logo">
                <img src="/logo.png" alt="The Union Shawarma" className="logo-img" />
              </Link>
              <p>Authentic marinades. Hand-rolled wraps. Sauces made from scratch every day. Proudly Canadian.</p>
              <div className="footer-socials">
                <a href="https://www.instagram.com/theunionshawarma" target="_blank" rel="noreferrer" aria-label="Instagram">
                  <Instagram size={18} />
                </a>
                <a href={socialLinks.facebook || 'https://www.facebook.com'} target="_blank" rel="noreferrer" aria-label="Facebook">
                  <Facebook size={18} />
                </a>
              </div>
              <div className="footer-delivery">
                <p style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Also Available On</p>
                <div className="delivery-logos">
                  {[
                    { label: 'Uber Eats', href: deliveryPartners.uberEats },
                    { label: 'DoorDash', href: deliveryPartners.doordash },
                    { label: 'Skip', href: deliveryPartners.skipTheDishes },
                  ].map((p) => (
                    p.href
                      ? <a key={p.label} href={p.href} rel="noreferrer" className="delivery-badge">{p.label}</a>
                      : <span key={p.label} className="delivery-badge">{p.label}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="footer-col">
              <h4>Quick Links</h4>
              <ul>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/menu">Menu</Link></li>
                <li><Link to="/catering">Catering</Link></li>
                <li><Link to="/pricing">Pricing</Link></li>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Hours of Operation</h4>
              <ul className="hours-list">
                {hours.map((h, i) => (
                  <li key={i}>
                    <Clock size={14} />
                    <div>
                      <span className="day">{h.day}</span>
                      <span className="time">{h.time}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="footer-col">
              <h4>Contact Us</h4>
              <ul className="contact-list">
                <li><Phone size={16} /> <span>+1 289-389-3315</span></li>
                <li><Mail size={16} /> <span>theunionshawarma@gmail.com</span></li>
                <li><MapPin size={16} /> <span>www.theunionshawarma.ca</span></li>
              </ul>
              <div className="footer-special">
                <p className="special-label">Online Special</p>
                <p className="special-offer">Chicken Shawarma Wrap <strong>$7.99</strong></p>
                <Link to="/menu" className="btn btn-primary" style={{ marginTop: '12px', padding: '10px 20px', fontSize: '13px' }}>
                  Order Online
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>© 2024 The Union Shawarma. All Rights Reserved.</p>
          <div className="footer-bottom-links">
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>
            {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
            <a href="#" onClick={(e) => e.preventDefault()}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
