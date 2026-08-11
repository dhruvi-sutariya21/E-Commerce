import api from './api';

export const productAPI = {
  // Fetch All Products (Customer)
  getAllProducts: async () => {
    const response = await api.get('/all_products');
    return response.data;
  },

  // Fetch All Products (Admin)
  getAdminAllProducts: async () => {
    const response = await api.get('/admin/all_products');
    return response.data;
  },

  // Get Single Product
  getProductById: async (id) => {
    const response = await api.get(`/single_product/${id}`);
    return response.data;
  },

  // Search Products by Name
  searchProducts: async (name) => {
    const response = await api.get('/search_product', { params: { name } });
    return response.data;
  },

  // Get Products by Category ID
  getCategoryProducts: async (categoryId) => {
    const response = await api.get(`/category_products/${categoryId}`);
    return response.data;
  },

  // Get Out of Stock Products (Admin)
  getOutOfStockProducts: async () => {
    const response = await api.get('/out_of_stock_products');
    return response.data;
  },

  // Add Product (Admin, FormData for image file upload)
  addProduct: async (formData) => {
    const response = await api.post('/add_product', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update Product (Admin)
  updateProduct: async (id, productData) => {
    const response = await api.put(`/update_product/${id}`, productData);
    return response.data;
  },

  // Update Stock (Admin)
  updateStock: async (id, stock) => {
    const response = await api.patch(`/update_stock/${id}`, null, {
      params: { stock },
    });
    return response.data;
  },

  // Delete Product (Admin)
  deleteProduct: async (id) => {
    const response = await api.delete(`/delete_product/${id}`);
    return response.data;
  },
};
