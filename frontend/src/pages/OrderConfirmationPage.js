import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { confirmCloverPayment } from '../utils/api';
import { useCart } from '../context/CartContext';

const OrderConfirmationPage = () => {
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const orderId = searchParams.get('orderId');
  const cancelled = searchParams.get('status') === 'cancelled';
  const [state, setState] = useState(cancelled ? 'cancelled' : 'checking');

  useEffect(() => {
    if (cancelled || !orderId) return;
    confirmCloverPayment({ orderId })
      .then((res) => {
        if (res.data.paymentStatus === 'paid') {
          clearCart();
          setState('paid');
        } else {
          setState('failed');
        }
      })
      .catch(() => setState('failed'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, cancelled]);

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
        <p style={{ color: 'var(--gray)', marginBottom: '28px', lineHeight: '1.6' }}>{content.desc}</p>

        {state === 'paid' ? (
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
