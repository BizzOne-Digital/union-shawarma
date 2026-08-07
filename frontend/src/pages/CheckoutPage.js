import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, MapPin, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../utils/api';
import toast from 'react-hot-toast';
import './CartPage.css';

const CheckoutPage = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orderType, setOrderType] = useState('pickup');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '', phone: '' });
  const [placing, setPlacing] = useState(false);

  const tax = totalPrice * 0.13;
  const total = totalPrice + tax;

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return toast.error('Your cart is empty');
    if (!user && (!guestInfo.name || !guestInfo.email)) return toast.error('Please fill in your details');
    setPlacing(true);
    try {
      const orderData = {
        items: cartItems.map(i => ({ menuItem: i._id, name: i.name, price: i.price, quantity: i.quantity })),
        totalAmount: total,
        orderType,
        specialInstructions,
        ...(user ? {} : { guestName: guestInfo.name, guestEmail: guestInfo.email, guestPhone: guestInfo.phone }),
      };
      await createOrder(orderData);
      clearCart();
      toast.success('Order placed! We will confirm shortly.');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Order failed. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <main style={{ paddingTop: '100px', paddingBottom: '80px', background: 'var(--cream)', minHeight: '100vh' }}>
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '32px', fontWeight: '800', marginBottom: '32px' }}>Checkout</h1>
        </motion.div>

        <div className="cart-grid">
          <div>
            {/* Order Type */}
            <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '24px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontWeight: '700', marginBottom: '16px', fontSize: '17px' }}>How would you like your order?</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[
                  { val: 'pickup', label: 'Pickup', icon: <ShoppingBag size={18} />, sub: 'Ready in 15–20 min' },
                  { val: 'delivery', label: 'Delivery', icon: <MapPin size={18} />, sub: 'Via Uber Eats / DoorDash' },
                ].map(opt => (
                  <div key={opt.val} onClick={() => setOrderType(opt.val)}
                    style={{ flex: 1, border: `2px solid ${orderType === opt.val ? 'var(--orange)' : 'var(--border)'}`, borderRadius: '12px', padding: '16px', cursor: 'pointer', background: orderType === opt.val ? 'rgba(245,124,0,0.04)' : 'white', transition: 'all 0.2s' }}>
                    <div style={{ color: 'var(--orange)', marginBottom: '6px' }}>{opt.icon}</div>
                    <strong style={{ display: 'block', fontSize: '15px' }}>{opt.label}</strong>
                    <small style={{ color: 'var(--gray)' }}>{opt.sub}</small>
                  </div>
                ))}
              </div>
            </div>

            {/* Guest info if not logged in */}
            {!user && (
              <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '24px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontWeight: '700', marginBottom: '16px', fontSize: '17px' }}>Your Details</h3>
                <div className="form-group">
                  <label>Full Name *</label>
                  <input className="form-control" value={guestInfo.name} onChange={e => setGuestInfo({ ...guestInfo, name: e.target.value })} placeholder="John Doe" />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input className="form-control" type="email" value={guestInfo.email} onChange={e => setGuestInfo({ ...guestInfo, email: e.target.value })} placeholder="your@email.com" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input className="form-control" value={guestInfo.phone} onChange={e => setGuestInfo({ ...guestInfo, phone: e.target.value })} placeholder="+1 (647) 123-4567" />
                </div>
              </div>
            )}

            {/* Special instructions */}
            <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontWeight: '700', marginBottom: '12px', fontSize: '17px' }}>Special Instructions</h3>
              <textarea className="form-control" rows={3} placeholder="Allergies, extra sauce, no onions..." value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)} />
            </div>
          </div>

          <div className="cart-summary">
            <h3>Order Summary</h3>
            <div style={{ marginBottom: '20px' }}>
              {cartItems.map(item => (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                  <span>{item.name} x{item.quantity}</span>
                  <span style={{ fontWeight: '600' }}>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="summary-rows">
              <div className="summary-row"><span>Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
              <div className="summary-row"><span>HST (13%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--gray)', marginBottom: '16px' }}>
              <Clock size={14} /> Estimated wait: 15–25 minutes
            </div>
            <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={handlePlaceOrder} disabled={placing}>
              {placing ? 'Placing Order...' : `Place Order — $${total.toFixed(2)}`}
            </button>
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--gray)', marginTop: '12px' }}>
              Payment collected at pickup / via delivery partner
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CheckoutPage;
