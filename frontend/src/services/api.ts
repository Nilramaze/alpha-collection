import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Inject auth token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Auth ────────────────────────────────────────
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/login', { email, password }),
  register: (name: string, email: string, password: string, password_confirmation: string) =>
    api.post('/register', { name, email, password, password_confirmation }),
  logout: () => api.post('/logout'),
  me: () => api.get('/me'),
};

// ── Products ────────────────────────────────────
export const productApi = {
  list: (params?: Record<string, any>) =>
    api.get('/products', { params }),
  get: (idOrSlug: string | number) =>
    api.get(`/products/${idOrSlug}`),
  featured: () =>
    api.get('/products/featured'),
  categories: () =>
    api.get('/categories'),
};

// ── Cart ────────────────────────────────────────
export const cartApi = {
  get: () => api.get('/cart'),
  add: (product_id: number, quantity: number, product_color_id?: number | null) =>
    api.post('/cart/add', { product_id, quantity, product_color_id }),
  update: (product_id: number, quantity: number, product_color_id?: number | null) =>
    api.post('/cart/update', { product_id, quantity, product_color_id }),
  remove: (product_id: number, product_color_id?: number | null) =>
    api.post('/cart/remove', { product_id, product_color_id }),
};

// ── Shipping Options ─────────────────────────────────
export const shippingApi = {
  list: (cartTotal: number) =>
    api.get('/shipping-options', { params: { cart_total: cartTotal } }),
};

export const adminShippingApi = {
  list: () => api.get('/admin/shipping-options'),
  create: (data: FormData) =>
    api.post('/admin/shipping-options', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: number, data: FormData) =>
    api.post(`/admin/shipping-options/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  toggle: (id: number, active: boolean) =>
    api.patch(`/admin/shipping-options/${id}`, { active }),
  destroy: (id: number) =>
    api.delete(`/admin/shipping-options/${id}`),
};

// ── Orders ──────────────────────────────────────
export const orderApi = {
  list: (params?: Record<string, any>) =>
    api.get('/orders', { params }),
  get: (id: number) =>
    api.get(`/orders/${id}`),
  create: (notes?: string, shippingOptionId?: number | null) =>
    api.post('/orders', { notes, shipping_option_id: shippingOptionId ?? null }),
};

// ── Address ──────────────────────────────────────
export const addressApi = {
  get: () => api.get('/address'),
  update: (data: Record<string, any>) => api.put('/address', data),
};

// ── Messages ────────────────────────────────────
export const messageApi = {
  list: () => api.get('/messages'),
  create: (subject: string, content: string) =>
    api.post('/messages', { subject, content }),
  get: (id: number) =>
    api.get(`/messages/${id}`),
};

// ── Admin ────────────────────────────────────────
export const adminOrderApi = {
  list: (params?: Record<string, any>) => api.get('/admin/orders', { params }),
  updateStatus: (id: number, status: string) => api.patch(`/admin/orders/${id}`, { status }),
  cancel: (id: number) => api.post(`/admin/orders/${id}/cancel`),
};

export const adminUserApi = {
  list: (params?: Record<string, any>) => api.get('/admin/users', { params }),
  create: (data: Record<string, any>) => api.post('/admin/users', data),
  update: (id: number, data: Record<string, any>) => api.put(`/admin/users/${id}`, data),
  destroy: (id: number) => api.delete(`/admin/users/${id}`),
  skontoGroups: () => api.get('/admin/skonto-groups'),
};

export const adminProductApi = {
  list: (params?: Record<string, any>) => api.get('/admin/products', { params }),
  create: (data: FormData) => api.post('/admin/products', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: number, data: FormData) => api.post(`/admin/products/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  destroy: (id: number) => api.delete(`/admin/products/${id}`),
};

export const adminSettingsApi = {
  get: () => api.get('/admin/settings'),
  update: (data: {
    stock_green_min: number;
    stock_yellow_min: number;
    notification_email?: string;
    notify_on_order?: boolean;
    notify_on_message?: boolean;
  }) => api.put('/admin/settings', data),
};

export const announcementApi = {
  list: () => api.get('/announcements'),
};

export const adminAnnouncementApi = {
  list: () => api.get('/admin/announcements'),
  create: (data: FormData) =>
    api.post('/admin/announcements', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: number, data: FormData) =>
    api.post(`/admin/announcements/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  toggle: (id: number, enabled: boolean) =>
    api.patch(`/admin/announcements/${id}`, { enabled }),
  reorder: (ids: number[]) =>
    api.post('/admin/announcements/reorder', { ids }),
  destroy: (id: number) =>
    api.delete(`/admin/announcements/${id}`),
};

export const adminSkontoApi = {
  list: () => api.get('/admin/skonto-groups'),
  create: (name: string) => api.post('/admin/skonto-groups', { name }),
  update: (id: number, name: string) => api.put(`/admin/skonto-groups/${id}`, { name }),
  destroy: (id: number) => api.delete(`/admin/skonto-groups/${id}`),
  addTier: (groupId: number, min_order_value: number, discount_percent: number) =>
    api.post(`/admin/skonto-groups/${groupId}/tiers`, { min_order_value, discount_percent }),
  updateTier: (groupId: number, tierId: number, min_order_value: number, discount_percent: number) =>
    api.put(`/admin/skonto-groups/${groupId}/tiers/${tierId}`, { min_order_value, discount_percent }),
  destroyTier: (groupId: number, tierId: number) =>
    api.delete(`/admin/skonto-groups/${groupId}/tiers/${tierId}`),
};

export const adminCategoryApi = {
  list: () => api.get('/admin/categories'),
  create: (name: string) => api.post('/admin/categories', { name }),
  update: (id: number, name: string) => api.put(`/admin/categories/${id}`, { name }),
  destroy: (id: number) => api.delete(`/admin/categories/${id}`),
};

export const certificateApi = {
  list: () => api.get('/certificates'),
};

export const adminCertificateApi = {
  list: () => api.get('/admin/certificates'),
  create: (data: FormData) =>
    api.post('/admin/certificates', data, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id: number, name: string) =>
    api.patch(`/admin/certificates/${id}`, { name }),
  destroy: (id: number) =>
    api.delete(`/admin/certificates/${id}`),
};
