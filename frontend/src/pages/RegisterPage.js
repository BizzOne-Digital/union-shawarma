import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', promoOptIn: true });
  const [showPw, setShowPw] = useState(false);
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/');
    } catch {}
  };

  return (
    <main className="auth-page">
      <div className="auth-bg">
        <div className="auth-img-side">
          <img src="/hero.png" alt="Shawarma" />
          <div className="auth-img-overlay">
            <div className="auth-quote">
              <h2>Join The Union Family</h2>
              <p>Create an account to save favourites, earn rewards, and get exclusive offers.</p>
            </div>
          </div>
        </div>
        <div className="auth-form-side">
          <motion.div className="auth-box" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="auth-logo">🌯 THE UNION SHAWARMA</div>
            <h1>Create Account</h1>
            <p className="auth-sub">Join thousands of happy customers</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <div className="input-icon-wrap">
                  <User size={18} />
                  <input className="form-control" type="text" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-icon-wrap">
                  <Mail size={18} />
                  <input className="form-control" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Phone (optional)</label>
                <div className="input-icon-wrap">
                  <Phone size={18} />
                  <input className="form-control" type="tel" placeholder="+1 (647) 123-4567" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="input-icon-wrap">
                  <Lock size={18} />
                  <input className="form-control" type={showPw ? 'text' : 'password'} placeholder="Min. 6 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={6} />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
              <label className="checkbox-label promo-check">
                <input type="checkbox" checked={form.promoOptIn} onChange={e => setForm({ ...form, promoOptIn: e.target.checked })} />
                <span>Yes, send me exclusive offers and promotions</span>
              </label>
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>{loading ? 'Creating account...' : 'Create Account'}</button>
            </form>

            <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default RegisterPage;
