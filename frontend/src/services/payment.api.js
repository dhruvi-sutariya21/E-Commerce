import api from './api';

export const paymentAPI = {
  // Create Payment
  createPayment: async (paymentData) => {
    const response = await api.post('/create_payment', paymentData);
    return response.data;
  },

  // Get Payment by Payment ID
  getPaymentById: async (id) => {
    const response = await api.get(`/payment/${id}`);
    return response.data;
  },

  // Get Payment by Order ID
  getPaymentByOrderId: async (orderId) => {
    const response = await api.get(`/payment/order/${orderId}`);
    return response.data;
  },

  // Get All Payments (Admin)
  getAllPayments: async () => {
    const response = await api.get('/all_payment');
    return response.data;
  },

  // Verify Payment (Admin)
  verifyPayment: async (id) => {
    const response = await api.put(`/verify_payment/${id}`);
    return response.data;
  },
};
