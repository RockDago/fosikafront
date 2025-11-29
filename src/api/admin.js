import axios from "../config/axios";

// ==================== ADMIN API ====================
export const adminAPI = {
  // ==================== AUTHENTIFICATION ====================
  login: async (credentials) => {
    try {
      const response = await axios.post("/admin/login", credentials);

      // Injecter le token dans l'axios instance et stocker les données
      if (response.data.success && response.data.data?.token) {
        const token = response.data.data.token;
        const userData = response.data.data.user;

        // Utiliser les utilitaires pour stocker correctement
        adminUtils.setAuthData(token, userData, credentials.remember || false);

        return response.data;
      } else {
        throw new Error("Réponse de connexion invalide");
      }
    } catch (error) {
      console.error("Erreur login admin:", error);
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
        const userData = response.data.data.user;

        // Mettre à jour le stockage avec le nouveau token
        const currentUser = adminUtils.getAuthUser();
        const rememberMe = !!localStorage.getItem("admin_token"); // Vérifier si remember était activé

        adminUtils.setAuthData(token, userData || currentUser, rememberMe);
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

    // Nettoyer d'abord les anciennes données
    adminUtils.logout();

    // Stocker les nouvelles données
    storage.setItem("admin_token", token);
    storage.setItem("admin_user", JSON.stringify(userData));
    storage.setItem("user_type", "admin");

    // Injecter le token dans les headers axios
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    console.log("Auth data stored for admin:", {
      token: token ? "present" : "missing",
      userData: userData ? "present" : "missing",
      storage: rememberMe ? "localStorage" : "sessionStorage",
    });
  },

  getAuthToken: () => {
    const token =
      localStorage.getItem("admin_token") ||
      sessionStorage.getItem("admin_token");
    console.log("Retrieved admin token:", token ? "present" : "missing");
    return token;
  },

  getAuthUser: () => {
    const userData =
      localStorage.getItem("admin_user") ||
      sessionStorage.getItem("admin_user");
    const user = userData ? JSON.parse(userData) : null;
    console.log("Retrieved admin user:", user ? "present" : "missing");
    return user;
  },

  isAuthenticated: () => {
    const token = adminUtils.getAuthToken();
    const user = adminUtils.getAuthUser();
    const isAuth = !!(token && user);
    console.log("Admin authenticated:", isAuth);
    return isAuth;
  },

  logout: () => {
    console.log("Logging out admin...");

    const keys = [
      "admin_token",
      "admin_user",
      "user_type",
      // Nettoyer aussi les clés génériques pour éviter les conflits
      "team_token",
      "team_user",
    ];

    keys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    delete axios.defaults.headers.common["Authorization"];

    console.log("Admin logout completed");
  },

  isAdmin: () => {
    const userType =
      localStorage.getItem("user_type") || sessionStorage.getItem("user_type");
    const isAdmin = userType === "admin";
    console.log("Is admin:", isAdmin);
    return isAdmin;
  },

  // Nouvelle méthode pour initialiser l'authentification au chargement de l'app
  initializeAuth: () => {
    const token = adminUtils.getAuthToken();
    const user = adminUtils.getAuthUser();

    if (token && user) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      console.log("Auth initialized for admin");
      return true;
    }

    console.log("No auth found for admin");
    return false;
  },
};

export default adminAPI;
