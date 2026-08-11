import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistAPI } from '../services/wishlist.api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { showSuccess, showError } = useToast();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    if (!isAuthenticated) {
      setWishlistItems([]);
      return;
    }
    setLoading(true);
    try {
      const res = await wishlistAPI.getUserWishlist();
      setWishlistItems(res?.data || []);
    } catch (err) {
      setWishlistItems([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const toggleWishlist = async (productId) => {
    if (!isAuthenticated) {
      showError('Please register or sign in to save items to your wishlist.');
      window.location.href = '/register';
      return false;
    }
    const existing = wishlistItems.find((item) => item.product_id === productId);
    if (existing) {
      try {
        await wishlistAPI.removeWishlist(existing.id);
        showSuccess('Removed from wishlist.');
        fetchWishlist();
        return false;
      } catch (err) {
        showError(err.formattedMessage || 'Failed to remove from wishlist.');
        return true;
      }
    } else {
      try {
        await wishlistAPI.addToWishlist(productId, user?.id || '');
        showSuccess('Saved to wishlist!');
        fetchWishlist();
        return true;
      } catch (err) {
        showError(err.formattedMessage || 'Failed to add to wishlist.');
        return false;
      }
    }
  };

  const removeFromWishlist = async (wishlistId) => {
    try {
      await wishlistAPI.removeWishlist(wishlistId);
      showSuccess('Item removed from wishlist.');
      fetchWishlist();
    } catch (err) {
      showError(err.formattedMessage || 'Failed to remove item.');
    }
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item.product_id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount: wishlistItems.length,
        loading,
        fetchWishlist,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
