import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import './CartPage.css';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <main className="cart-page empty-cart" style={{ paddingTop: '100px' }}>
        <div className="container">
          <div className="empty-cart-inner">
            <ShoppingBag size={64} />
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything yet. Browse our menu and find something delicious!</p>
            <Link to="/menu" className="btn btn-primary btn-lg">Explore Menu <ArrowRight size={18} /></Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="cart-page" style={{ paddingTop: '100px' }}>
      <div className="container">
        <div className="cart-header">
          <h1>Your Cart <span>({totalItems} items)</span></h1>
          <button className="clear-btn" onClick={clearCart}>Clear All</button>
        </div>

        <div className="cart-grid">
          <div className="cart-items">
            <AnimatePresence>
              {cartItems.map(item => (
                <motion.div key={item.cartId} className="cart-item" layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <img src={item.image || '/placeholder-food.jpg'} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-info">
                    <h3>{item.name}</h3>
                    <p>${item.price.toFixed(2)} each</p>
                    {item.customizations && Object.keys(item.customizations).length > 0 && (
                      <div className="cart-item-customizations">
                        {Object.entries(item.customizations).map(([group, options]) => (
                          <span key={group} className="customization-tag">{options.join(', ')}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="cart-item-controls">
                    <div className="qty-control">
                      <button onClick={() => updateQuantity(item.cartId, item.quantity - 1)}><Minus size={14} /></button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.cartId, item.quantity + 1)}><Plus size={14} /></button>
                    </div>
                    <span className="item-subtotal">${(item.price * item.quantity).toFixed(2)}</span>
                    <button className="remove-btn" onClick={() => removeFromCart(item.cartId)}><Trash2 size={16} /></button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div className="summary-rows">
              <div className="summary-row"><span>Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
              <div className="summary-row"><span>Tax (13% HST)</span><span>${(totalPrice * 0.13).toFixed(2)}</span></div>
              <div className="summary-row total"><span>Total</span><span>${(totalPrice * 1.13).toFixed(2)}</span></div>
            </div>
            <div className="special-note-box">🎉 <strong>Online Special:</strong> Chicken Shawarma Wrap — $7.99!</div>
            <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={() => navigate('/checkout')}>
              Proceed to Checkout <ArrowRight size={18} />
            </button>
            <Link to="/menu" className="continue-shopping">← Continue Shopping</Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CartPage;
