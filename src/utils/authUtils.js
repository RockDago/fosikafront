// utils/authUtils.js
export const authUtils = {
  getToken: () => {
    return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
  },
  
  isAuthenticated: () => {
    return !!(localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token'));
  },
  
  logout: () => {
    localStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_token');
    localStorage.removeItem('user_type');
    sessionStorage.removeItem('user_type');
    window.location.href = '/login';
  },
  
  // Nouvelle méthode pour obtenir le type de stockage
  getStorageType: () => {
    return localStorage.getItem('admin_token') ? 'local' : 'session';
  }
};