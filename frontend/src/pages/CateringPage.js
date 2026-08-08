import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Calendar, MapPin, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { getMenuItems, submitCateringRequest } from '../utils/api';
import './CateringPage.css';

const CateringPage = () => {
  const [featured, setFeatured] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', phone: '', location: '', eventDate: '', guestCount: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getMenuItems({ popular: 'true' }).then((res) => setFeatured(res.data.slice(0, 3))).catch(() => {});
  }, []);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.location) {
      return toast.error('Please fill in name, email, phone, and location.');
    }
    setSubmitting(true);
    try {
      await submitCateringRequest(form);
      setSubmitted(true);
      toast.success('Catering request sent! We will get back to you shortly.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const scrollToForm = () => document.getElementById('catering-form')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <main className="catering-page">
      <section className="catering-hero">
        <div className="catering-hero-bg" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/catering-hero.jpg)` }} />
        <div className="catering-hero-overlay" />
        <div className="container catering-hero-inner">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1>Catering Made Easy<br />For Every Gathering</h1>
            <p>From small team lunches to large events, The Union Shawarma catering makes it simple. Customize for groups of 10+ people.</p>
            <button className="btn btn-primary btn-lg" onClick={scrollToForm}>Order Catering Now</button>
          </motion.div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="section-pad catering-featured">
          <div className="container">
            <p className="section-label" style={{ justifyContent: 'center' }}>🍽️ Crowd Favourites</p>
            <h2 className="section-title text-center">Great for Groups</h2>
            <div className="catering-featured-grid">
              {featured.map((item) => (
                <div className="catering-featured-card" key={item._id}>
                  <img src={item.image || '/placeholder-food.jpg'} alt={item.name} />
                  <div>
                    <h4>{item.name}</h4>
                    <p>{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section-pad catering-form-section" id="catering-form">
        <div className="container catering-form-wrap">
          {submitted ? (
            <motion.div className="catering-success" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <CheckCircle2 size={48} />
              <h2>Thank you, {form.name.split(' ')[0]}!</h2>
              <p>We've received your catering inquiry and will reach out shortly to confirm the details.</p>
            </motion.div>
          ) : (
            <>
              <div className="catering-form-intro">
                <p className="section-label">📋 Get a Quote</p>
                <h2 className="section-title">We'd love to cater your event!</h2>
                <p>Let us know the details below. Please allow 24–48 hours notice for any catering orders.</p>
              </div>
              <form className="catering-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Your Name *</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="First & Last Name" required />
                  </div>
                  <div className="form-group">
                    <label>Your Email *</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Your Phone Number *</label>
                    <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="+1 (___) ___-____" required />
                  </div>
                  <div className="form-group">
                    <label><MapPin size={14} /> Location *</label>
                    <input type="text" name="location" value={form.location} onChange={handleChange} placeholder="Address, city or zip code" required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label><Calendar size={14} /> Event Date</label>
                    <input type="date" name="eventDate" value={form.eventDate} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label><Users size={14} /> Number of Guests</label>
                    <input type="number" min="10" name="guestCount" value={form.guestCount} onChange={handleChange} placeholder="10+" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Tell us more about your event</label>
                  <textarea name="message" rows={4} value={form.message} onChange={handleChange} placeholder="Type of event, dietary preferences, budget, etc." />
                </div>
                <button type="submit" className="btn btn-primary btn-lg w-full" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Submit Catering Request'}
                </button>
              </form>
            </>
          )}
        </div>
      </section>
    </main>
  );
};

export default CateringPage;
