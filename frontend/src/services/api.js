import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// =====================================================
// PROPERTIES API
// =====================================================
export const propertiesAPI = {
  // Get all properties with optional filters
  getAll: (params = {}) => api.get('/properties', { params }),

  // Get single property by ID
  getById: (id) => api.get(`/properties/${id}`),

  // Create new property (seller only)
  create: (propertyData) => api.post('/properties', propertyData),

  // Update property
  update: (id, propertyData) => api.put(`/properties/${id}`, propertyData),

  // Delete property
  delete: (id) => api.delete(`/properties/${id}`),

  // Get seller's listings
  getMyListings: () => api.get('/properties/seller/my-listings'),

  // Toggle favorite
  toggleFavorite: (id) => api.post(`/properties/${id}/favorite`),

  // Get user's favorites
  getFavorites: () => api.get('/properties/favorites/my-favorites'),
};

// =====================================================
// OFFERS API
// =====================================================
export const offersAPI = {
  // Get offers (role-based)
  getAll: (params = {}) => api.get('/offers', { params }),

  // Get single offer
  getById: (id) => api.get(`/offers/${id}`),

  // Create new offer (buyer only)
  create: (offerData) => api.post('/offers', offerData),

  // Update offer (counter, notes)
  update: (id, offerData) => api.put(`/offers/${id}`, offerData),

  // Accept offer (seller only)
  accept: (id) => api.post(`/offers/${id}/accept`),

  // Reject offer (seller only)
  reject: (id) => api.post(`/offers/${id}/reject`),

  // Withdraw offer (buyer only)
  withdraw: (id) => api.post(`/offers/${id}/withdraw`),
};

// =====================================================
// TRANSACTIONS API
// =====================================================
export const transactionsAPI = {
  // Get user's transactions
  getAll: (params = {}) => api.get('/transactions', { params }),

  // Get single transaction with all details
  getById: (id) => api.get(`/transactions/${id}`),

  // Update transaction details
  update: (id, data) => api.put(`/transactions/${id}`, data),

  // Update transaction status
  updateStatus: (id, status) => api.post(`/transactions/${id}/update-status`, { status }),

  // Get transaction timeline
  getTimeline: (id) => api.get(`/transactions/${id}/timeline`),

  // Get transaction documents
  getDocuments: (id) => api.get(`/transactions/${id}/documents`),
};

// =====================================================
// VENDORS API
// =====================================================
export const vendorsAPI = {
  // Get all vendors with filters
  getAll: (params = {}) => api.get('/vendors', { params }),

  // Get single vendor
  getById: (id) => api.get(`/vendors/${id}`),

  // Get current vendor's profile
  getMyProfile: () => api.get('/vendors/profile/me'),

  // Create vendor profile
  create: (vendorData) => api.post('/vendors', vendorData),

  // Update vendor profile
  updateProfile: (vendorData) => api.put('/vendors/profile', vendorData),

  // Upgrade vendor tier
  upgrade: (tier) => api.post('/vendors/upgrade', { tier }),

  // Get vendor types list
  getTypes: () => api.get('/vendors/types/list'),
};

// =====================================================
// DOCUMENTS API
// =====================================================
export const documentsAPI = {
  // Get documents
  getAll: (params = {}) => api.get('/documents', { params }),

  // Get single document
  getById: (id) => api.get(`/documents/${id}`),

  // Upload document
  create: (documentData) => api.post('/documents', documentData),

  // Sign document
  sign: (id) => api.post(`/documents/${id}/sign`),

  // Delete document
  delete: (id) => api.delete(`/documents/${id}`),

  // Get document types list
  getTypes: () => api.get('/documents/types/list'),
};

// =====================================================
// MESSAGES API
// =====================================================
export const messagesAPI = {
  // Get all messages
  getAll: (params = {}) => api.get('/messages', { params }),

  // Get messages for a transaction
  getByTransaction: (transactionId) => api.get(`/messages/transaction/${transactionId}`),

  // Send message
  send: (messageData) => api.post('/messages', messageData),

  // Mark as read
  markAsRead: (id) => api.put(`/messages/${id}/read`),

  // Get unread count
  getUnreadCount: () => api.get('/messages/unread/count'),

  // Delete message
  delete: (id) => api.delete(`/messages/${id}`),
};

// =====================================================
// NOTIFICATIONS API
// =====================================================
export const notificationsAPI = {
  // Get notifications
  getAll: (params = {}) => api.get('/notifications', { params }),

  // Get unread count
  getUnreadCount: () => api.get('/notifications/unread/count'),

  // Mark as read
  markAsRead: (id) => api.put(`/notifications/${id}/read`),

  // Mark all as read
  markAllAsRead: () => api.put('/notifications/read-all'),

  // Delete notification
  delete: (id) => api.delete(`/notifications/${id}`),

  // Clear all notifications
  clearAll: () => api.delete('/notifications/clear-all'),
};

// =====================================================
// DISCLOSURES API
// =====================================================
export const disclosuresAPI = {
  // Seller Disclosure
  getByProperty: (propertyId) => api.get(`/disclosures/property/${propertyId}`),
  createOrGet: (propertyId) => api.post(`/disclosures/property/${propertyId}`),
  autoSaveSection: (id, sectionNumber, data) =>
    api.patch(`/disclosures/${id}/section/${sectionNumber}`, { data }),
  update: (id, data) => api.put(`/disclosures/${id}`, data),
  validate: (id) => api.post(`/disclosures/${id}/validate`),
  complete: (id, force = false) => api.post(`/disclosures/${id}/complete`, { force }),
  signSeller: (id, signatureData) => api.post(`/disclosures/${id}/sign/seller`, signatureData),
  signBuyer: (id, signatureData) => api.post(`/disclosures/${id}/sign/buyer`, signatureData),
  getSellerDisclosures: () => api.get('/disclosures/seller'),

  // Attachments
  addAttachment: (id, attachmentData) => api.post(`/disclosures/${id}/attachments`, attachmentData),
  removeAttachment: (id, attachmentId) => api.delete(`/disclosures/${id}/attachments/${attachmentId}`),

  // PDF Generation
  generatePDF: (id) => api.post(`/disclosures/${id}/generate-pdf`),
  getPDF: (id) => api.get(`/disclosures/${id}/pdf`),

  // Sharing
  shareDisclosure: (id, { recipientEmail, recipientName, message }) =>
    api.post(`/disclosures/${id}/share`, { recipientEmail, recipientName, message }),

  // FSBO Checklist
  getFSBOChecklist: (propertyId = null) =>
    api.get('/disclosures/fsbo-checklist', { params: propertyId ? { propertyId } : {} }),
  createFSBOChecklist: (propertyId) => api.post(`/disclosures/fsbo-checklist/property/${propertyId}`),
  autoSaveFSBOCategory: (id, category, data) =>
    api.patch(`/disclosures/fsbo-checklist/${id}/category/${category}`, { data }),
  updateFSBOChecklist: (id, data) => api.put(`/disclosures/fsbo-checklist/${id}`, data),
  deleteFSBOChecklist: (id) => api.delete(`/disclosures/fsbo-checklist/${id}`),
};

// =====================================================
// BUYER API (for viewing shared disclosures)
// =====================================================
export const buyerAPI = {
  // Get dashboard stats
  getDashboardStats: () => api.get('/buyer/dashboard/stats'),

  // Get all shared disclosures
  getDisclosures: () => api.get('/buyer/disclosures'),

  // Get single shared disclosure
  getDisclosure: (id) => api.get(`/buyer/disclosures/${id}`),

  // Acknowledge disclosure
  acknowledgeDisclosure: (id) => api.post(`/buyer/disclosures/${id}/acknowledge`),

  // Sign disclosure (buyer acknowledgment)
  signDisclosure: (id, { signatureData, printedName }) =>
    api.post(`/buyer/disclosures/${id}/sign`, { signatureData, printedName }),

  // View disclosure by public token (no auth required)
  viewByToken: (token) => api.get(`/buyer/disclosures/view/${token}`),
};

// =====================================================
// AUTH API (Extended)
// =====================================================
export const authAPI = {
  // Login
  login: (email, password) => api.post('/auth/login', { email, password }),

  // Register
  register: (userData) => api.post('/auth/register', userData),

  // Get current user
  getMe: () => api.get('/auth/me'),

  // Update profile
  updateProfile: (updates) => api.put('/auth/update', updates),

  // Change password
  changePassword: (currentPassword, newPassword) =>
    api.put('/auth/password', { currentPassword, newPassword }),

  // Forgot password - request reset email
  forgotPassword: (email) => api.post('/auth/forgotpassword', { email }),

  // Reset password with token
  resetPassword: (token, password) => api.post('/auth/resetpassword', { token, password }),
};

export default api;
