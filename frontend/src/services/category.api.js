import api from './api';

export const categoryAPI = {
  // Fetch All Categories from Database
  getAllCategories: async () => {
    try {
      const response = await api.get('/all_category');
      return response.data;
    } catch (e) {
      return [];
    }
  },

  // Search Category by Name
  searchCategory: async (c_name) => {
    const response = await api.get('/search_category', { params: { c_name } });
    return response.data;
  },

  // Get Single Category
  getCategoryById: async (id) => {
    const response = await api.get(`/single_category/${id}`);
    return response.data;
  },

  // Add Category (Admin)
  addCategory: async (categoryData) => {
    const response = await api.post('/add_category', categoryData);
    return response.data;
  },

  // Update Category (Admin)
  updateCategory: async (id, categoryData) => {
    const response = await api.put(`/update_category/${id}`, categoryData);
    return response.data;
  },

  // Delete Category (Admin)
  deleteCategory: async (id) => {
    const response = await api.delete(`/delete_category/${id}`);
    return response.data;
  },
};

