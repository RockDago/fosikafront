import axios from "../config/axios";
import { teamUtils } from './teamAPI'; // Utiliser teamUtils pour la cohérence

// ==================== ADMIN API ====================
export const adminAPI = {
  // ==================== AUTHENTIFICATION ====================
  login: async (credentials) => {
    try {
      const response = await axios.post("/admin/login", credentials);

      if (response.data.success && response.data.data?.token) {
        const token = response.data.data.token;
        const userData = response.data.data.user;

        teamUtils.setAuthData(token, userData, credentials.remember || false, "admin");
        return response.data;
      } else {
        throw new Error(response.data?.message || "Réponse de connexion invalide");
      }
    } catch (error) {
      console.error("Erreur de connexion admin:", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await axios.post("/admin/logout");
      teamUtils.logout();
      return response.data;
    } catch (error) {
      teamUtils.logout();
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

  // ==================== VALIDATION TOKEN ====================
  validateToken: async () => {
    try {
      const response = await axios.get("/admin/validate-token");
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
        headers: { "Content-Type": "multipart/form-data" },
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
      const response = await axios.post("/admin/profile/password", passwordData);
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

      if (response.data.success && response.data.data?.token) {
        const token = response.data.data.token;
        const userData = response.data.data.user;
        const rememberMe = !!localStorage.getItem("admin_token");

        teamUtils.setAuthData(token, userData, rememberMe, "admin");
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ==================== UTILITAIRES ADMIN SPÉCIFIQUES ====================
export const adminUtils = {
  isAdmin: () => {
    return teamUtils.getUserType() === "admin";
  },

  validateAndRefreshAuth: async () => {
    try {
      const token = teamUtils.getAuthToken();
      const user = teamUtils.getAuthUser();

      if (!token || !user) {
        return { valid: false, reason: "missing_data" };
      }

      const result = await adminAPI.validateToken();

      if (result.success) {
        return { valid: true };
      } else {
        try {
          const refreshResult = await adminAPI.refreshToken();
          if (refreshResult.success) {
            return { valid: true, refreshed: true };
          }
        } catch (refreshError) {
          console.error("Échec rafraîchissement token:", refreshError);
        }

        teamUtils.logout();
        return { valid: false, reason: "invalid_token" };
      }
    } catch (error) {
      console.error("Erreur validation auth admin:", error);

      if (error.code === "ERR_NETWORK") {
        return { valid: true, networkError: true };
      }

      teamUtils.logout();
      return { valid: false, reason: "validation_error" };
    }
  },

  diagnoseAuth: () => {
    return teamUtils.diagnoseAuth();
  }
};

export default adminAPI;