import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
});

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('unionUser') || 'null');
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getProfile = () => API.get('/auth/profile');
export const updateProfile = (data) => API.put('/auth/profile', data);

// Menu
export const getMenuItems = (params) => API.get('/menu', { params });
export const getMenuItemById = (id) => API.get(`/menu/${id}`);
export const createMenuItem = (data) => API.post('/menu', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateMenuItem = (id, data) => API.put(`/menu/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteMenuItem = (id) => API.delete(`/menu/${id}`);

// Categories
export const getCategories = () => API.get('/categories');
export const getAllCategories = () => API.get('/categories/all');
export const createCategory = (data) => API.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateCategory = (id, data) => API.put(`/categories/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteCategory = (id) => API.delete(`/categories/${id}`);

// Orders
export const createOrder = (data) => API.post('/orders', data);
export const getMyOrders = () => API.get('/orders/my');
export const getAllOrders = (params) => API.get('/orders', { params });
export const updateOrderStatus = (id, data) => API.put(`/orders/${id}/status`, data);
export const getOrderStats = () => API.get('/orders/stats');

// Users
export const getAllUsers = (params) => API.get('/users', { params });
export const getPromoSubscribers = () => API.get('/users/promo-subscribers');
export const getUserStats = () => API.get('/users/stats');
export const toggleFavourite = (menuItemId) => API.post('/users/favourites', { menuItemId });

// Gallery
export const getGallery = () => API.get('/gallery');
export const getAllGallery = () => API.get('/gallery/all');
export const addGalleryItem = (data) => API.post('/gallery', data, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteGalleryItem = (id) => API.delete(`/gallery/${id}`);

// Settings
export const getSettings = () => API.get('/settings');
export const updateSettings = (data) => API.put('/settings', data, { headers: { 'Content-Type': 'multipart/form-data' } });

// Catering
export const submitCateringRequest = (data) => API.post('/catering', data);
export const getCateringRequests = () => API.get('/catering');
export const updateCateringStatus = (id, data) => API.put(`/catering/${id}/status`, data);

// Payments (Clover)
export const createCloverCheckout = (data) => API.post('/payments/clover/checkout', data);
export const confirmCloverPayment = (data) => API.post('/payments/clover/confirm', data);
export const getOrder = (id) => API.get(`/orders/${id}`);

export default API;
