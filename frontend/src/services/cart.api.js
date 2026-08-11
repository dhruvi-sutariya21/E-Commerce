import api from './api';

export const cartAPI = {
  // Get Logged In User Cart
  getMyCart: async () => {
    const response = await api.get('/my_cart');
    return response.data;
  },

  // Add Item to Cart
  addToCart: async (cartData) => {
    const response = await api.post('/add_cart', cartData);
    return response.data;
  },

  // Update Cart Quantity
  updateCartItem: async (cartId, quantity) => {
    const response = await api.put(`/update_cart/${cartId}`, { quantity });
    return response.data;
  },

  // Delete Cart Item
  deleteCartItem: async (cartId) => {
    const response = await api.delete(`/delete_cart/${cartId}`);
    return response.data;
  },

  // Single Cart Item
  getSingleCart: async (cartId) => {
    const response = await api.get(`/single_cart/${cartId}`);
    return response.data;
  },

  // All Carts (Admin)
  getAllCart: async () => {
    const response = await api.get('/all_cart');
    return response.data;
  },
};
