import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, MapPin, Clock, X, CreditCard, Banknote, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder, getSettings, createCloverCheckout, validateCoupon } from '../utils/api';
import toast from 'react-hot-toast';
import './CartPage.css';

const CheckoutPage = () => {
  const { cartItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orderType, setOrderType] = useState('pickup');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [guestInfo, setGuestInfo] = useState({ name: '', email: '', phone: '' });
  const [placing, setPlacing] = useState(false);
  const [deliveryPartners, setDeliveryPartners] = useState({});
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    getSettings().then((res) => setDeliveryPartners(res.data?.deliveryPartners || {})).catch(() => {});
  }, []);

  const discount = appliedCoupon?.discount || 0;
  const discountedSubtotal = Math.max(0, totalPrice - discount);
  const tax = discountedSubtotal * 0.13;
  const total = discountedSubtotal + tax;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await validateCoupon({
        code: couponInput.trim(),
        subtotal: totalPrice,
        items: cartItems.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
      });
      setAppliedCoupon(data);
      toast.success(`Coupon "${data.code}" applied!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => { setAppliedCoupon(null); setCouponInput(''); };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return toast.error('Your cart is empty');
    if (!user && (!guestInfo.name || !guestInfo.email)) return toast.error('Please fill in your details');
    setPlacing(true);
    try {
      const orderData = {
        items: cartItems.map(i => ({ menuItem: i._id, name: i.name, price: i.price, quantity: i.quantity, customizations: i.customizations })),
        totalAmount: total,
        orderType,
        specialInstructions,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        discountAmount: discount,
        ...(user ? {} : { guestName: guestInfo.name, guestEmail: guestInfo.email, guestPhone: guestInfo.phone }),
      };
      const { data: order } = await createOrder(orderData);

      if (paymentMethod === 'clover') {
        const returnBase = `${window.location.origin}/order-confirmation?orderId=${order._id}`;
        const { data: checkout } = await createCloverCheckout({
          orderId: order._id,
          items: cartItems.map(i => ({ name: i.name, price: i.price, quantity: i.quantity })),
          totalAmount: total,
          successUrl: returnBase,
          cancelUrl: `${returnBase}&status=cancelled`,
        });
        window.location.href = checkout.href;
        return;
      }

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
                  <div key={opt.val} onClick={() => opt.val === 'delivery' ? setShowDeliveryModal(true) : setOrderType(opt.val)}
                    style={{ flex: 1, border: `2px solid ${orderType === opt.val ? 'var(--orange)' : 'var(--border)'}`, borderRadius: '12px', padding: '16px', cursor: 'pointer', background: orderType === opt.val ? 'rgba(245,124,0,0.04)' : 'white', transition: 'all 0.2s' }}>
                    <div style={{ color: 'var(--orange)', marginBottom: '6px' }}>{opt.icon}</div>
                    <strong style={{ display: 'block', fontSize: '15px' }}>{opt.label}</strong>
                    <small style={{ color: 'var(--gray)' }}>{opt.sub}</small>
                  </div>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div style={{ background: 'white', borderRadius: 'var(--radius)', padding: '24px', marginBottom: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
              <h3 style={{ fontWeight: '700', marginBottom: '16px', fontSize: '17px' }}>How would you like to pay?</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[
                  { val: 'cash', label: 'Pay at Pickup', icon: <Banknote size={18} />, sub: 'Cash or card in-store' },
                  { val: 'clover', label: 'Pay Online Now', icon: <CreditCard size={18} />, sub: 'Secure card checkout' },
                ].map(opt => (
                  <div key={opt.val} onClick={() => setPaymentMethod(opt.val)}
                    style={{ flex: 1, border: `2px solid ${paymentMethod === opt.val ? 'var(--orange)' : 'var(--border)'}`, borderRadius: '12px', padding: '16px', cursor: 'pointer', background: paymentMethod === opt.val ? 'rgba(245,124,0,0.04)' : 'white', transition: 'all 0.2s' }}>
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
                <div key={item.cartId} style={{ padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                    <span>{item.name} x{item.quantity}</span>
                    <span style={{ fontWeight: '600' }}>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                  {item.customizations && Object.keys(item.customizations).length > 0 && (
                    <div style={{ fontSize: '11px', color: 'var(--gray)', marginTop: '2px' }}>
                      {Object.values(item.customizations).flat().join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="coupon-box">
              {appliedCoupon ? (
                <div className="coupon-applied">
                  <span><Tag size={14} /> <strong>{appliedCoupon.code}</strong> applied</span>
                  <button type="button" onClick={handleRemoveCoupon}>Remove</button>
                </div>
              ) : (
                <div className="coupon-input-row">
                  <input
                    className="form-control"
                    placeholder="Coupon code"
                    value={couponInput}
                    onChange={e => setCouponInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                  />
                  <button type="button" className="btn btn-outline" onClick={handleApplyCoupon} disabled={couponLoading}>
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
              )}
            </div>
            <div className="summary-rows">
              <div className="summary-row"><span>Subtotal</span><span>${totalPrice.toFixed(2)}</span></div>
              {discount > 0 && <div className="summary-row" style={{ color: 'var(--orange)' }}><span>Discount ({appliedCoupon.code})</span><span>-${discount.toFixed(2)}</span></div>}
              <div className="summary-row"><span>HST (13%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--gray)', marginBottom: '16px' }}>
              <Clock size={14} /> Estimated wait: 15–25 minutes
            </div>
            <button className="btn btn-primary w-full" style={{ justifyContent: 'center' }} onClick={handlePlaceOrder} disabled={placing}>
              {placing ? 'Processing...' : paymentMethod === 'clover' ? `Continue to Payment — $${total.toFixed(2)}` : `Place Order — $${total.toFixed(2)}`}
            </button>
            <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--gray)', marginTop: '12px' }}>
              {paymentMethod === 'clover' ? "You'll be redirected to our secure payment page." : 'Payment collected at pickup.'}
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showDeliveryModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
            onClick={() => setShowDeliveryModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.97 }}
              style={{ position: 'relative', background: 'white', borderRadius: '20px', maxWidth: '400px', width: '100%', padding: '32px', textAlign: 'center' }}
              onClick={(e) => e.stopPropagation()}
            >
              <button onClick={() => setShowDeliveryModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px', borderRadius: '50%', background: 'var(--gray-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--dark)' }}>
                <X size={18} />
              </button>
              <MapPin size={32} style={{ color: 'var(--orange)', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '10px' }}>We Don't Deliver Directly — Yet!</h3>
              <p style={{ fontSize: '14px', color: 'var(--gray)', marginBottom: '24px', lineHeight: '1.6' }}>
                We don't have our own delivery service yet, but you can order for delivery through one of our partners below.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { label: 'Order on Uber Eats', href: deliveryPartners.uberEats },
                  { label: 'Order on DoorDash', href: deliveryPartners.doordash },
                  { label: 'Order on Skip the Dishes', href: deliveryPartners.skipTheDishes },
                ].filter(p => p.href).map(p => (
                  <a key={p.label} href={p.href} rel="noreferrer" className="btn btn-primary" style={{ justifyContent: 'center' }}>
                    {p.label}
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default CheckoutPage;
