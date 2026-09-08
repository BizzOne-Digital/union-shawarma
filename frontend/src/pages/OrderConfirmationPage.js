import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { confirmCloverPayment, getOrder } from '../utils/api';
import { useCart } from '../context/CartContext';

const OrderConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const orderId = searchParams.get('orderId');
  const cancelled = searchParams.get('status') === 'cancelled';
  const alreadyPlaced = searchParams.get('status') === 'placed';
  const [state, setState] = useState(cancelled ? 'cancelled' : alreadyPlaced ? 'placed' : 'checking');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) return;
    if (cancelled) return;

    if (alreadyPlaced) {
      getOrder(orderId).then((res) => setOrder(res.data)).catch(() => {});
      return;
    }

    confirmCloverPayment({ orderId })
      .then((res) => {
        if (res.data.paymentStatus === 'paid') {
          clearCart();
          setOrder(res.data.order);
          setState('paid');
        } else {
          setState('failed');
        }
      })
      .catch(() => setState('failed'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, cancelled, alreadyPlaced]);

  const content = {
    checking: {
      icon: <Loader2 size={48} className="spin" style={{ color: 'var(--orange)' }} />,
      title: 'Confirming your payment...',
      desc: 'Please wait a moment while we verify your payment with Clover.',
    },
    paid: {
      icon: <CheckCircle2 size={48} style={{ color: '#388E3C' }} />,
      title: 'Payment Successful!',
      desc: 'Your order has been placed and paid. We will start preparing it shortly.',
    },
    placed: {
      icon: <CheckCircle2 size={48} style={{ color: '#388E3C' }} />,
      title: 'Order Placed!',
      desc: 'Your order has been received. Pay at pickup — we will start preparing it shortly.',
    },
    failed: {
      icon: <XCircle size={48} style={{ color: 'var(--red)' }} />,
      title: 'Payment Not Completed',
      desc: "We couldn't confirm your payment. If you were charged, please contact us — otherwise you can try again.",
    },
    cancelled: {
      icon: <XCircle size={48} style={{ color: 'var(--gray)' }} />,
      title: 'Payment Cancelled',
      desc: 'You cancelled the payment. Your cart is still saved if you want to try again.',
    },
  }[state];

  return (
    <main style={{ paddingTop: '100px', paddingBottom: '80px', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', maxWidth: '440px', padding: '0 24px' }}
      >
        <div style={{ marginBottom: '16px' }}>{content.icon}</div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '800', marginBottom: '10px' }}>{content.title}</h1>
        <p style={{ color: 'var(--gray)', marginBottom: order ? '16px' : '28px', lineHeight: '1.6' }}>{content.desc}</p>

        {order && (state === 'paid' || state === 'placed') && (
          <div style={{ background: 'white', borderRadius: '14px', padding: '16px 20px', marginBottom: '24px', textAlign: 'left', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: '13px', color: 'var(--gray)', marginBottom: '4px' }}>Order Number</p>
            <p style={{ fontWeight: '700', marginBottom: '10px' }}>#{order._id?.slice(-8).toUpperCase()}</p>
            <p style={{ fontSize: '13px', color: 'var(--gray)', marginBottom: '4px' }}>Total</p>
            <p style={{ fontWeight: '700', color: 'var(--orange)' }}>${order.totalAmount?.toFixed(2)}</p>
          </div>
        )}

        {state === 'paid' || state === 'placed' ? (
          <Link to="/" className="btn btn-primary btn-lg">Back to Home</Link>
        ) : state !== 'checking' ? (
          <Link to="/checkout" className="btn btn-primary btn-lg">Return to Checkout</Link>
        ) : null}
      </motion.div>

      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
};

export default OrderConfirmationPage;
