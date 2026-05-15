import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('access_token');
  const lang = localStorage.getItem('fresh_market_lang') || 'ru';
  if (token) config.headers.Authorization = `Bearer ${token}`;
  config.headers['Accept-Language'] = lang;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refresh = sessionStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh/`, { refresh });
          sessionStorage.setItem('access_token', data.access);
          original.headers.Authorization = `Bearer ${data.access}`;
          return api(original);
        } catch {
          sessionStorage.removeItem('access_token');
          sessionStorage.removeItem('refresh_token');
        }
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (username, password) => api.post('/auth/login/', { username, password }),
  register: (data) => api.post('/auth/register/', data),
  me: () => api.get('/users/me/'),
  updateMe: (data) => api.patch('/users/me/', data),
  sellerProfile: () => api.get('/users/seller-profile/'),
  updateSellerProfile: (data) => api.patch('/users/seller-profile/', data),
};

export const productsApi = {
  categories: () => api.get('/categories/'),
  list: (params) => api.get('/products/', { params }),
  detail: (slug) => api.get(`/products/${slug}/`),
  sellerList: (params) => api.get('/seller/products/', { params }),
  sellerCreate: (data) => api.post('/seller/products/', data),
  sellerUpdate: (id, data) => api.patch(`/seller/products/${id}/`, data),
  sellerDelete: (id) => api.delete(`/seller/products/${id}/`),
};

export const ordersApi = {
  checkout: (data) => api.post('/orders/checkout/', data),
  list: (params) => api.get('/orders/', { params }),
  detail: (id) => api.get(`/orders/${id}/`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status/`, { status }),
  sellerList: (params) => api.get('/seller/orders/', { params }),
};

export const adminApi = {
  users: (params) => api.get('/admin/users/', { params }),
  updateUser: (id, data) => api.patch(`/admin/users/${id}/`, data),
  blockUser: (id, is_blocked) => api.patch(`/admin/users/${id}/block/`, { is_blocked }),
  analytics: (params) => api.get('/admin/analytics/', { params }),
  moderation: () => api.get('/admin/moderation/'),
  moderateProduct: (id, status) => api.patch(`/admin/moderation/products/${id}/`, { moderation_status: status }),
  moderateSeller: (id, status) => api.patch(`/admin/moderation/sellers/${id}/`, { moderation_status: status }),
  exportCsv: (params) => api.get('/admin/analytics/export.csv', { params, responseType: 'blob' }),
  exportXlsx: (params) => api.get('/admin/analytics/export.xlsx', { params, responseType: 'blob' }),
};

export const analyticsApi = {
  seller: (params) => api.get('/seller/analytics/', { params }),
};

export default api;
