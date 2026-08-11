import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/cart.api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCartItems([]);
      return;
    }
    setLoading(true);
    try {
      const data = await cartAPI.getMyCart();
      setCartItems(data || []);
    } catch (err) {
      // 404 means cart is empty
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      showError('Please register or sign in to add items to your shopping bag.');
      window.location.href = '/register';
      return false;
    }
    try {
      await cartAPI.addToCart({ product_id: productId, quantity });
      showSuccess('Product added to bag successfully!');
      fetchCart();
      return true;
    } catch (err) {
      showError(err.formattedMessage || 'Failed to add item to cart.');
      return false;
    }
  };

  const updateQuantity = async (cartId, quantity) => {
    try {
      await cartAPI.updateCartItem(cartId, quantity);
      fetchCart();
    } catch (err) {
      showError(err.formattedMessage || 'Failed to update quantity.');
    }
  };

  const removeFromCart = async (cartId) => {
    try {
      await cartAPI.deleteCartItem(cartId);
      showSuccess('Item removed from cart.');
      fetchCart();
    } catch (err) {
      showError(err.formattedMessage || 'Failed to remove item.');
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeFromCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
