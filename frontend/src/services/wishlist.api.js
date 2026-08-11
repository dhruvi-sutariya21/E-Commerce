import api from './api';

export const wishlistAPI = {
  // Get User Wishlist
  getUserWishlist: async () => {
    const response = await api.get('/user_wishlist');
    return response.data;
  },

  // Add Item to Wishlist
  addToWishlist: async (productId, userId) => {
    const response = await api.post('/add_wishlist', { user_id: userId, product_id: productId });
    return response.data;
  },

  // Remove Item from Wishlist
  removeWishlist: async (wishlistId) => {
    const response = await api.delete(`/remove_wishlist/${wishlistId}`);
    return response.data;
  },

  // Single Wishlist Item
  getSingleWishlist: async (id) => {
    const response = await api.get(`/single_wishlist/${id}`);
    return response.data;
  },

  // All Wishlist Items (Admin)
  getAllWishlist: async () => {
    const response = await api.get('/all_wishlist');
    return response.data;
  },
};
