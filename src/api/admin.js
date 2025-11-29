import axios from "../config/axios";

// ==================== ADMIN API ====================
export const adminAPI = {
  // ==================== AUTHENTIFICATION ====================
  login: async (credentials) => {
    try {
      const response = await axios.post("/admin/login", credentials);
      // Injecter le token dans l'axios instance
      if (response.data.success && response.data.data?.token) {
        const token = response.data.data.token;
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await axios.post("/admin/logout");
      adminUtils.logout(); // nettoyer le storage et le header
      return response.data;
    } catch (error) {
      adminUtils.logout();
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      const response = await axios.get("/admin/check");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await axios.get("/admin/user");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ==================== PROFIL ADMIN ====================
  getProfile: async () => {
    try {
      const response = await axios.get("/admin/profile");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const response = await axios.put("/admin/profile", profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateAvatar: async (avatarFile) => {
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const response = await axios.post("/admin/profile/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  deleteAvatar: async () => {
    try {
      const response = await axios.delete("/admin/profile/avatar");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updatePassword: async (passwordData) => {
    try {
      const response = await axios.post(
        "/admin/profile/password",
        passwordData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ==================== RAPPORTS ====================
  getReports: async (params = {}) => {
    try {
      const response = await axios.get("/reports", { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getReport: async (reference) => {
    try {
      const response = await axios.get(`/reports/${reference}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateReportStatus: async (id, statusData) => {
    try {
      const response = await axios.put(`/reports/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateReportWorkflow: async (id, workflowData) => {
    try {
      const response = await axios.put(`/reports/${id}/workflow`, workflowData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ==================== STATISTIQUES ====================
  getStats: async () => {
    try {
      const response = await axios.get("/stats");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ==================== TRACKING ====================
  checkTracking: async (reference) => {
    try {
      const response = await axios.get(`/tracking/${reference}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ==================== RAPPORTS PUBLICS ====================
  createReport: async (reportData) => {
    try {
      const response = await axios.post("/reports", reportData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ==================== SESSION & SÉCURITÉ ====================
  validateSession: async (sessionId) => {
    try {
      const response = await axios.post("/admin/validate-session", {
        session_id: sessionId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  refreshToken: async () => {
    try {
      const response = await axios.post("/admin/refresh-token");
      // Mettre à jour le header après refresh
      if (response.data.success && response.data.data?.token) {
        const token = response.data.data.token;
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ==================== UTILITAIRES ====================
export const adminUtils = {
  setAuthData: (token, userData, rememberMe = false) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("admin_token", token);
    storage.setItem("admin_user", JSON.stringify(userData));
    storage.setItem("user_type", "admin");

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  },

  getAuthToken: () => {
    return (
      localStorage.getItem("admin_token") ||
      sessionStorage.getItem("admin_token")
    );
  },

  getAuthUser: () => {
    const userData =
      localStorage.getItem("admin_user") ||
      sessionStorage.getItem("admin_user");
    return userData ? JSON.parse(userData) : null;
  },

  isAuthenticated: () => {
    const token = adminUtils.getAuthToken();
    const user = adminUtils.getAuthUser();
    return !!(token && user);
  },

  logout: () => {
    const keys = ["admin_token", "admin_user", "user_type"];
    keys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    delete axios.defaults.headers.common["Authorization"];
  },

  isAdmin: () => {
    const userType =
      localStorage.getItem("user_type") || sessionStorage.getItem("user_type");
    return userType === "admin";
  },
};

export default adminAPI;
