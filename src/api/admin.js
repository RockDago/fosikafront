import axios from "../config/axios";

export const adminAPI = {
  // ==================== AUTHENTIFICATION ====================
  login: async (credentials) => {
    try {
      console.log("🔄 API Call: POST /admin/login");
      const response = await axios.post("/admin/login", credentials);
      console.log("✅ Connexion réussie:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la connexion:", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      console.log("🔄 API Call: POST /admin/logout");
      const response = await axios.post("/admin/logout");
      console.log("✅ Déconnexion réussie:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la déconnexion:", error);
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      console.log("🔄 API Call: GET /admin/check");
      const response = await axios.get("/admin/check");
      console.log("✅ Vérification auth:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur vérification auth:", error);
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      console.log("🔄 API Call: GET /admin/user");
      const response = await axios.get("/admin/user");
      console.log("✅ Utilisateur courant:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur récupération utilisateur:", error);
      throw error;
    }
  },

  // ==================== PROFIL ADMIN ====================
  getProfile: async () => {
    try {
      console.log("🔄 API Call: GET /admin/profile");
      const response = await axios.get("/admin/profile");
      console.log("✅ Profil admin récupéré:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération du profil:", error);
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      console.log("🔄 API Call: PUT /admin/profile", profileData);
      const response = await axios.put("/admin/profile", profileData);
      console.log("✅ Profil mis à jour:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour du profil:", error);
      throw error;
    }
  },

  updateAvatar: async (avatarFile) => {
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      console.log("🔄 API Call: POST /admin/profile/avatar");
      const response = await axios.post("/admin/profile/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("✅ Avatar mis à jour:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour de l'avatar:", error);
      throw error;
    }
  },

  deleteAvatar: async () => {
    try {
      console.log("🔄 API Call: DELETE /admin/profile/avatar");
      const response = await axios.delete("/admin/profile/avatar");
      console.log("✅ Avatar supprimé:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la suppression de l'avatar:", error);
      throw error;
    }
  },

  updatePassword: async (passwordData) => {
    try {
      console.log("🔄 API Call: POST /admin/profile/password");
      const response = await axios.post(
        "/admin/profile/password",
        passwordData
      );
      console.log("✅ Mot de passe mis à jour:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors du changement de mot de passe:", error);
      throw error;
    }
  },

  // ==================== RAPPORTS (REPORTS) ====================
  getReports: async (params = {}) => {
    try {
      console.log("🔄 API Call: GET /reports", params);
      const response = await axios.get("/reports", { params });
      console.log("✅ Rapports récupérés:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des rapports:", error);
      throw error;
    }
  },

  getReport: async (reference) => {
    try {
      console.log("🔄 API Call: GET /reports/" + reference);
      const response = await axios.get(`/reports/${reference}`);
      console.log("✅ Rapport récupéré:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération du rapport:", error);
      throw error;
    }
  },

  updateReportStatus: async (id, statusData) => {
    try {
      console.log("🔄 API Call: PUT /reports/" + id + "/status", statusData);
      const response = await axios.put(`/reports/${id}/status`, statusData);
      console.log("✅ Statut du rapport mis à jour:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour du statut:", error);
      throw error;
    }
  },

  updateReportWorkflow: async (id, workflowData) => {
    try {
      console.log("🔄 API Call: PUT /reports/" + id + "/workflow", workflowData);
      const response = await axios.put(`/reports/${id}/workflow`, workflowData);
      console.log("✅ Workflow du rapport mis à jour:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour du workflow:", error);
      throw error;
    }
  },

  // ==================== STATISTIQUES ====================
  getStats: async () => {
    try {
      console.log("🔄 API Call: GET /stats");
      const response = await axios.get("/stats");
      console.log("✅ Statistiques récupérées:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des stats:", error);
      throw error;
    }
  },

  // ==================== TRACKING ====================
  checkTracking: async (reference) => {
    try {
      console.log("🔄 API Call: GET /tracking/" + reference);
      const response = await axios.get(`/tracking/${reference}`);
      console.log("✅ Statut tracking récupéré:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors du check tracking:", error);
      throw error;
    }
  },

  // ==================== RAPPORTS PUBLICS ====================
  createReport: async (reportData) => {
    try {
      console.log("🔄 API Call: POST /reports", reportData);
      const response = await axios.post("/reports", reportData);
      console.log("✅ Rapport créé:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la création du rapport:", error);
      throw error;
    }
  },

  // ==================== SESSION & SÉCURITÉ ====================
  validateSession: async (sessionId) => {
    try {
      console.log("🔄 API Call: POST /admin/validate-session");
      const response = await axios.post("/admin/validate-session", { session_id: sessionId });
      console.log("✅ Session validée:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la validation de session:", error);
      throw error;
    }
  },

  refreshToken: async () => {
    try {
      console.log("🔄 API Call: POST /admin/refresh-token");
      const response = await axios.post("/admin/refresh-token");
      console.log("✅ Token rafraîchi:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors du rafraîchissement du token:", error);
      throw error;
    }
  }
};

// ==================== UTILITAIRES ====================
export const adminUtils = {
  // Stocker les données d'authentification
  setAuthData: (token, userData, rememberMe = false) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem("admin_token", token);
    storage.setItem("admin_user", JSON.stringify(userData));
    storage.setItem("user_type", "admin");
    
    console.log("🔑 Données auth stockées:", { rememberMe, userData: userData?.email });
  },

  // Récupérer le token
  getAuthToken: () => {
    return localStorage.getItem("admin_token") || sessionStorage.getItem("admin_token");
  },

  // Récupérer les données utilisateur
  getAuthUser: () => {
    const userData = localStorage.getItem("admin_user") || sessionStorage.getItem("admin_user");
    return userData ? JSON.parse(userData) : null;
  },

  // Vérifier si l'admin est authentifié
  isAuthenticated: () => {
    const token = adminUtils.getAuthToken();
    const user = adminUtils.getAuthUser();
    return !!(token && user);
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
    localStorage.removeItem("user_type");
    sessionStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_user");
    sessionStorage.removeItem("user_type");
    
    console.log("🔓 Déconnexion effectuée - données nettoyées");
  },

  // Vérifier le type d'utilisateur
  isAdmin: () => {
    const userType = localStorage.getItem("user_type") || sessionStorage.getItem("user_type");
    return userType === "admin";
  }
};

export default adminAPI;