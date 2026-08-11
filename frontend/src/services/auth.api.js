import api from './api';

export const authAPI = {
  // Login
  login: async (credentials) => {
    const response = await api.post('/user_login', credentials);
    return response.data;
  },

  // Register
  register: async (userData) => {
    const response = await api.post('/user_register', userData);
    return response.data;
  },

  // Admin Register
  adminRegister: async (userData) => {
    const response = await api.post('/admin_register', userData);
    return response.data;
  },

  // Get My Profile
  getProfile: async () => {
    const response = await api.get('/my_profile');
    return response.data;
  },

  // Update Profile
  updateProfile: async (userId, updateData) => {
    const response = await api.put(`/update_user/${userId}`, updateData);
    return response.data;
  },

  // Forgot Password / Send OTP
  forgotPassword: async (email) => {
    const response = await api.post('/forgot_password', { email });
    return response.data;
  },

  // Generate OTP
  generateOtp: async (email) => {
    const response = await api.post('/otp_generate', { email });
    return response.data;
  },

  // Verify OTP
  verifyOtp: async (email, otp) => {
    const response = await api.post('/otp_verify', { email, otp });
    return response.data;
  },

  // Reset Password
  resetPassword: async (resetData) => {
    const response = await api.put('/reset_password', resetData);
    return response.data;
  },

  // All Users (Admin)
  getAllUsers: async () => {
    const response = await api.get('/all_user');
    return response.data;
  },

  // Delete User (Admin)
  deleteUser: async (id) => {
    const response = await api.delete(`/delete_user/${id}`);
    return response.data;
  },

  // Get User Data by ID
  getUserData: async (id) => {
    const response = await api.get(`/user_data/${id}`);
    return response.data;
  },
};
