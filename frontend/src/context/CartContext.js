import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

const buildCartId = (itemId, customizations) => `${itemId}::${JSON.stringify(customizations || {})}`;

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('unionCart')) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('unionCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item, customizations = {}) => {
    const cartId = buildCartId(item._id, customizations);
    setCartItems((prev) => {
      const existing = prev.find((i) => i.cartId === cartId);
      if (existing) {
        toast.success('Quantity updated!');
        return prev.map((i) => i.cartId === cartId ? { ...i, quantity: i.quantity + 1 } : i);
      }
      toast.success(`${item.name} added to cart!`);
      return [...prev, { ...item, customizations, cartId, quantity: 1 }];
    });
  };

  const removeFromCart = (cartId) => {
    setCartItems((prev) => prev.filter((i) => i.cartId !== cartId));
  };

  const updateQuantity = (cartId, quantity) => {
    if (quantity < 1) return removeFromCart(cartId);
    setCartItems((prev) => prev.map((i) => i.cartId === cartId ? { ...i, quantity } : i));
  };

  const clearCart = () => setCartItems([]);

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
