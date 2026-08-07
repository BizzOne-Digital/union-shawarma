import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, UtensilsCrossed, ShoppingBag, Users,
  Image, Settings, Tag, LogOut, Menu, X, ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PageTransition from '../common/PageTransition';
import './AdminLayout.css';

const navItems = [
  { label: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
  { label: 'Menu Items', path: '/admin/menu', icon: <UtensilsCrossed size={20} /> },
  { label: 'Categories', path: '/admin/categories', icon: <Tag size={20} /> },
  { label: 'Orders', path: '/admin/orders', icon: <ShoppingBag size={20} /> },
  { label: 'Users', path: '/admin/users', icon: <Users size={20} /> },
  { label: 'Gallery', path: '/admin/gallery', icon: <Image size={20} /> },
  { label: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
];

const AdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

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
