import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut, ChevronDown, Heart, Package } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => { setIsOpen(false); setUserMenuOpen(false); }, [location]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Menu', path: '/menu' },
    { label: 'About', path: '/about' },
    { label: 'Catering', path: '/catering' },
    { label: 'Pricing', path: '/pricing' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            <img src="/logo.png" alt="The Union Shawarma" className="logo-img" />
          </Link>

          <ul className={`nav-links ${isOpen ? 'open' : ''}`}>
            {navLinks.map(link => (
              <li key={link.path}>
                <Link to={link.path} className={location.pathname === link.path ? 'active' : ''}>
                  {link.label}
                </Link>
              </li>
            ))}
            {isAdmin && (
              <li><Link to="/admin" className="admin-link">Admin Panel</Link></li>
            )}

            <li className="mobile-account">
              {isAuthenticated ? (
                <>
                  <Link to="/profile"><User size={16} /> Profile</Link>
                  <Link to="/my-orders"><Package size={16} /> My Orders</Link>
                  <Link to="/favourites"><Heart size={16} /> Favourites</Link>
                  <button onClick={handleLogout} className="logout-btn"><LogOut size={16} /> Logout</button>
                </>
              ) : (
                <Link to="/login" className="btn btn-primary mobile-signin">Sign In</Link>
              )}
            </li>
          </ul>

          <div className="nav-actions">
            <Link to="/cart" className="cart-btn">
              <ShoppingCart size={20} />
              {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
            </Link>

            <div className="desktop-account">
              {isAuthenticated ? (
                <div className="user-menu-wrapper">
                  <button className="user-btn" onClick={() => setUserMenuOpen(!userMenuOpen)}>
                    <div className="user-avatar">{user.name?.charAt(0).toUpperCase()}</div>
                    <span className="user-name">{user.name?.split(' ')[0]}</span>
                    <ChevronDown size={16} className={userMenuOpen ? 'rotated' : ''} />
                  </button>
                  {userMenuOpen && (
                    <div className="user-dropdown">
                      <Link to="/profile"><User size={16} /> Profile</Link>
                      <Link to="/my-orders"><Package size={16} /> My Orders</Link>
                      <Link to="/favourites"><Heart size={16} /> Favourites</Link>
                      {isAdmin && <Link to="/admin" className="admin-link-dd">Admin Panel</Link>}
                      <button onClick={handleLogout} className="logout-btn"><LogOut size={16} /> Logout</button>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
                  Sign In
                </Link>
              )}
            </div>

            <button className="hamburger" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
