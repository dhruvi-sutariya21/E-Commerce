import api from './api';

export const orderAPI = {
  // Place Order
  placeOrder: async (orderData) => {
    const response = await api.post('/place_order', orderData);
    return response.data;
  },

  // Get My Orders
  getMyOrders: async () => {
    const response = await api.get('/my_orders');
    return response.data;
  },

  // Get Single Order Details
  getSingleOrder: async (id) => {
    const response = await api.get(`/single_order/${id}`);
    return response.data;
  },

  // Cancel Order
  cancelOrder: async (id) => {
    const response = await api.put(`/cancel_order/${id}`);
    return response.data;
  },

  // Track Order Status
  trackOrder: async (id) => {
    const response = await api.get(`/track_order/${id}`);
    return response.data;
  },

  // Get All Orders (Admin)
  getAllOrders: async () => {
    const response = await api.get('/all_orders');
    return response.data;
  },

  // Update Order Status (Admin)
  updateOrderStatus: async (id, order_status) => {
    const response = await api.put(`/update_order/${id}`, { order_status });
    return response.data;
  },
};
