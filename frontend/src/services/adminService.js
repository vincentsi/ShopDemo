import api from './api';

// Admin Product Management
export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const updateProduct = async (id, productData) => {
  const response = await api.put(`/products/${id}`, productData);
  return response.data;
};

export const deleteProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

export const getAdminProducts = async (params = {}) => {
  const response = await api.get('/products', { params });
  return response.data;
};

// Admin Category Management
export const createCategory = async (categoryData) => {
  const response = await api.post('/admin/categories', categoryData);
  return response.data;
};

export const updateCategory = async (id, categoryData) => {
  const response = await api.put(`/admin/categories/${id}`, categoryData);
  return response.data;
};

export const deleteCategory = async (id) => {
  const response = await api.delete(`/admin/categories/${id}`);
  return response.data;
};

// Admin Order Management
export const getAdminOrders = async (params = {}) => {
  const response = await api.get('/admin/orders', { params });
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const response = await api.put(`/admin/orders/${id}/status`, { status });
  return response.data;
};

// Admin User Management
export const getAdminUsers = async (params = {}) => {
  const response = await api.get('/admin/users', { params });
  return response.data;
};

export const updateUserRole = async (id, role) => {
  const response = await api.put(`/admin/users/${id}/role`, { role });
  return response.data;
};

// Admin Dashboard
export const getDashboardStats = async (period = '30') => {
  const response = await api.get('/admin/dashboard', { params: { period } });
  return response.data;
};
