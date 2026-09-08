import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBag, Users,
  Image, Settings, Tag, LogOut, Menu, ChevronRight, Heart, DollarSign
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getOrderStats } from '../../utils/api';
import PageTransition from '../common/PageTransition';
import './AdminLayout.css';

const POLL_MS = 20000;

// Beeps using the Web Audio API — no audio file needed.
const playAlertSound = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, 0.25, 0.5].forEach((delay) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + 0.2);
      osc.start(ctx.currentTime + delay);
      osc.stop(ctx.currentTime + delay + 0.2);
    });
  } catch { /* audio not available */ }
};

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
  { label: 'Menu Items', path: '/admin/menu', icon: <UtensilsCrossed size={20} /> },
  { label: 'Categories', path: '/admin/categories', icon: <Tag size={20} /> },
  { label: 'Orders', path: '/admin/orders', icon: <ShoppingBag size={20} /> },
  { label: 'Users', path: '/admin/users', icon: <Users size={20} /> },
  { label: 'Gallery', path: '/admin/gallery', icon: <Image size={20} /> },
  { label: 'Catering', path: '/admin/catering', icon: <Heart size={20} /> },
  { label: 'Coupons', path: '/admin/coupons', icon: <DollarSign size={20} /> },
  { label: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
];

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const lastCount = useRef(null); // null = not yet initialized, so we don't alert on first load
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const poll = () => {
      getOrderStats()
        .then((res) => {
          const count = res.data?.pendingOrders || 0;
          setPendingCount(count);
          document.title = count > 0 ? `(${count}) Admin Panel — The Union Shawarma` : 'The Union Shawarma';
          if (lastCount.current !== null && count > lastCount.current) {
            playAlertSound();
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('New order received!', { body: `${count} order(s) awaiting confirmation.` });
            }
          }
          lastCount.current = count;
        })
        .catch(() => {});
    };

    poll();
    const interval = setInterval(poll, POLL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`admin-layout ${collapsed ? 'collapsed' : ''}`}>
      {/* Mobile overlay */}
      {mobileOpen && <div className="admin-overlay" onClick={() => setMobileOpen(false)} />}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon">🌯</span>
            {!collapsed && (
              <div className="logo-text-wrap">
                <span>THE UNION</span>
                <span className="orange">ADMIN</span>
              </div>
            )}
          </div>
          <button className="collapse-btn desktop-only" onClick={() => setCollapsed(!collapsed)}>
            <ChevronRight size={16} className={collapsed ? '' : 'rotated'} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
              {item.path === '/admin/orders' && pendingCount > 0 && (
                <span className="nav-badge">{pendingCount}</span>
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          {!collapsed && (
            <div className="admin-user">
              <div className="admin-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
              <div>
                <p className="admin-name">{user?.name}</p>
                <p className="admin-role">Administrator</p>
              </div>
            </div>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="admin-main">
        <header className="admin-topbar">
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
            <Menu size={22} />
          </button>
          <h1 className="topbar-title">
            {navItems.find(n => n.path === location.pathname)?.label || 'Admin Panel'}
          </h1>
          <div className="topbar-actions">
            <Link to="/" className="view-site-btn" target="_blank">View Site</Link>
          </div>
        </header>
        <div className="admin-content"><PageTransition>{children}</PageTransition></div>
      </main>
    </div>
  );
};

export default AdminLayout;
