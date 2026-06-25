import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgotpassword', { email }),
  resetPassword: (token, password) => api.put(`/auth/resetpassword/${token}`, { password }),
  updatePassword: (data) => api.put('/auth/updatepassword', data),
};

export const userService = {
  updateProfile: (data) => api.put('/users/profile', data),
  updateProfilePicture: (formData) => api.put('/users/profile-picture', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  submitKYC: (formData) => api.post('/users/kyc', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  deactivateAccount: () => api.delete('/users/account'),
};

export const accountService = {
  getAccounts: () => api.get('/accounts'),
  getAccount: (id) => api.get(`/accounts/${id}`),
  createAccount: (data) => api.post('/accounts', data),
  getStatement: (id, params) => api.get(`/accounts/${id}/statement`, { params }),
  freezeAccount: (id) => api.put(`/accounts/${id}/freeze`),
  getSummary: () => api.get('/accounts/summary'),
};

export const transactionService = {
  transfer: (data) => api.post('/transactions/transfer', data),
  deposit: (data) => api.post('/transactions/deposit', data),
  withdraw: (data) => api.post('/transactions/withdraw', data),
  payBill: (data) => api.post('/transactions/bill-payment', data),
  getTransactions: (params) => api.get('/transactions', { params }),
  getTransaction: (id) => api.get(`/transactions/${id}`),
  getSpendingAnalytics: (params) => api.get('/transactions/analytics/spending', { params }),
};

export const loanService = {
  apply: (data) => api.post('/loans/apply', data),
  getLoans: () => api.get('/loans'),
  getLoan: (id) => api.get(`/loans/${id}`),
  repay: (id, data) => api.post(`/loans/${id}/repay`, data),
  calculateEMI: (params) => api.get('/loans/calculate-emi', { params }),
};

export const cardService = {
  getCards: () => api.get('/cards'),
  getCard: (id) => api.get(`/cards/${id}`),
  createCard: (data) => api.post('/cards', data),
  activate: (id) => api.put(`/cards/${id}/activate`),
  block: (id, reason) => api.put(`/cards/${id}/block`, { reason }),
  setPin: (id, pin) => api.put(`/cards/${id}/set-pin`, { pin }),
  updateLimits: (id, data) => api.put(`/cards/${id}/limits`, data),
};

export const notificationService = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export const adminService = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateKycStatus: (id, status) => api.put(`/admin/users/${id}/kyc`, { status }),
  toggleUserStatus: (id, isActive) => api.put(`/admin/users/${id}/status`, { isActive }),
  getLoans: (params) => api.get('/admin/loans', { params }),
  reviewLoan: (id, data) => api.put(`/admin/loans/${id}/review`, data),
  disburseLoan: (id) => api.put(`/admin/loans/${id}/disburse`),
  getTransactions: (params) => api.get('/admin/transactions', { params }),
};
