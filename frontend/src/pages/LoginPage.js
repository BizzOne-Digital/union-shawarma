import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const { login, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch {}
  };

  return (
    <main className="auth-page">
      <div className="auth-bg">
        <div className="auth-img-side">
          <img src="https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?w=800&q=80" alt="Shawarma" />
          <div className="auth-img-overlay">
            <div className="auth-quote">
              <h2>Great food brings people together.</h2>
              <p>Sign in to your Union Shawarma account.</p>
            </div>
          </div>
        </div>
        <div className="auth-form-side">
          <motion.div className="auth-box" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="auth-logo">🌯 THE UNION SHAWARMA</div>
            <h1>Welcome back</h1>
            <p className="auth-sub">Sign in to your account to continue</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-icon-wrap">
                  <Mail size={18} />
                  <input className="form-control" type="email" placeholder="your@email.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Password</label>
                <div className="input-icon-wrap">
                  <Lock size={18} />
                  <input className="form-control" type={showPw ? 'text' : 'password'} placeholder="Your password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
            </form>

            <p className="auth-switch">Don't have an account? <Link to="/register">Create one free</Link></p>
          </motion.div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
