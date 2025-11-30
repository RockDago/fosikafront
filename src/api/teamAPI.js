import axios from "../config/axios";

// ==================== UTILITAIRES PARTAGÉS ====================
export const authUtils = {
  setAuthData: (token, userData, rememberMe = false, userRole) => {
    const storage = rememberMe ? localStorage : sessionStorage;

    // Nettoyer d'abord les anciennes données
    authUtils.clearAuthData();

    // Stocker les données d'authentification
    storage.setItem(`${userRole}_token`, token);
    storage.setItem(`${userRole}_user`, JSON.stringify(userData));
    storage.setItem("user_type", userRole);

    // Pour compatibilité
    if (userRole !== "admin") {
      storage.setItem("team_token", token);
      storage.setItem("team_user", JSON.stringify(userData));
    }

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  },

  getAuthToken: (userRole = null) => {
    const targetRole = userRole || authUtils.getUserType();

    if (targetRole) {
      return (
        localStorage.getItem(`${targetRole}_token`) ||
        sessionStorage.getItem(`${targetRole}_token`) ||
        localStorage.getItem("team_token") ||
        sessionStorage.getItem("team_token")
      );
    }

    return null;
  },

  getAuthUser: (userRole = null) => {
    const targetRole = userRole || authUtils.getUserType();

    if (targetRole) {
      const userData =
        localStorage.getItem(`${targetRole}_user`) ||
        sessionStorage.getItem(`${targetRole}_user`) ||
        localStorage.getItem("team_user") ||
        sessionStorage.getItem("team_user");

      // ✅ CORRECTION : Vérifier que userData existe et est valide avant de parser
      if (userData && userData !== "undefined" && userData !== "null") {
        try {
          return JSON.parse(userData);
        } catch (error) {
          console.error("Erreur parsing user data:", error);
          return null;
        }
      }
    }

    return null;
  },

  getUserType: () => {
    const userType =
      localStorage.getItem("user_type") || sessionStorage.getItem("user_type");
    // ✅ CORRECTION : Vérifier que le userType n'est pas "undefined" ou "null"
    return userType && userType !== "undefined" && userType !== "null"
      ? userType
      : null;
  },

  clearAuthData: () => {
    const keys = [
      "team_token",
      "team_user",
      "user_type",
      "agent_token",
      "agent_user",
      "investigateur_token",
      "investigateur_user",
      "admin_token",
      "admin_user",
    ];

    keys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    delete axios.defaults.headers.common["Authorization"];
  },

  isAuthenticated: (userRole = null) => {
    return !!(
      authUtils.getAuthToken(userRole) && authUtils.getAuthUser(userRole)
    );
  },

  initializeAuth: () => {
    const userType = authUtils.getUserType();
    const token = authUtils.getAuthToken(userType);

    if (token && userType) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      return { userType, token, user: authUtils.getAuthUser(userType) };
    }

    return null;
  },
};

// ==================== TEAM UTILS (CONSERVÉ POUR COMPATIBILITÉ) ====================
export const teamUtils = {
  setAuthData: (token, userData, rememberMe = false, userRole) => {
    authUtils.setAuthData(token, userData, rememberMe, userRole);
  },

  getAuthToken: (userRole = null) => {
    return authUtils.getAuthToken(userRole);
  },

  getAuthUser: (userRole = null) => {
    return authUtils.getAuthUser(userRole);
  },

  getUserType: () => {
    return authUtils.getUserType();
  },

  isAuthenticated: (userRole = null) => {
    return authUtils.isAuthenticated(userRole);
  },

  logout: (userRole = null) => {
    authUtils.clearAuthData();
  },

  initializeAuth: () => {
    return authUtils.initializeAuth();
  },

  getCurrentRole: () => {
    return authUtils.getUserType();
  },

  hasPermission: (requiredPermission, userRole = null) => {
    const user = authUtils.getAuthUser(userRole);
    return user?.permissions?.includes(requiredPermission) || false;
  },

  // Méthode pour diagnostiquer l'état de l'authentification
  diagnoseAuth: () => {
    const token = authUtils.getAuthToken();
    const user = authUtils.getAuthUser();
    const userType = authUtils.getUserType();

    return {
      token: {
        present: !!token,
        source: localStorage.getItem("team_token")
          ? "localStorage"
          : sessionStorage.getItem("team_token")
          ? "sessionStorage"
          : "none",
      },
      user: {
        present: !!user,
        data: user ? { id: user.id, email: user.email, role: user.role } : null,
      },
      userType: userType,
      headers: {
        hasAuth: !!axios.defaults.headers.common["Authorization"],
      },
    };
  },
};

// ==================== TEAM API ====================
export const teamAPI = {
  // ==================== AUTHENTIFICATION TEAM ====================
  login: async (credentials) => {
    try {
      const response = await axios.post("/team/login", credentials);

      if (response.data.success && response.data.data?.token) {
        const token = response.data.data.token;
        const userData = response.data.data.user;
        const userRole = userData?.role?.toLowerCase() || "agent";

        teamUtils.setAuthData(
          token,
          userData,
          credentials.remember || false,
          userRole
        );
        return response.data;
      } else {
        throw new Error(
          response.data?.message || "Réponse de connexion invalide"
        );
      }
    } catch (error) {
      console.error("Erreur login team:", error);
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await axios.post("/team/logout");
      teamUtils.logout();
      return response.data;
    } catch (error) {
      teamUtils.logout();
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      const userRole = teamUtils.getUserType();
      const response = await axios.get(`/${userRole}/check`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const userRole = teamUtils.getUserType();
      const response = await axios.get(`/${userRole}/user`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ==================== PROFIL TEAM ====================
  getProfile: async () => {
    try {
      const userRole = teamUtils.getUserType();
      const response = await axios.get(`/${userRole}/profile`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (profileData) => {
    try {
      const userRole = teamUtils.getUserType();
      const response = await axios.put(`/${userRole}/profile`, profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateAvatar: async (avatarFile) => {
    try {
      const userRole = teamUtils.getUserType();
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const response = await axios.post(
        `/${userRole}/profile/avatar`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updatePassword: async (passwordData) => {
    try {
      const userRole = teamUtils.getUserType();
      const response = await axios.post(
        `/${userRole}/profile/password`,
        passwordData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPersonalStats: async () => {
    try {
      const userRole = teamUtils.getUserType();
      const response = await axios.get(`/${userRole}/profile/stats`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ==================== RAPPORTS TEAM ====================
  getAssignedReports: async (params = {}) => {
    try {
      const userRole = teamUtils.getUserType();
      const response = await axios.get(`/${userRole}/reports`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getReport: async (reference) => {
    try {
      const userRole = teamUtils.getUserType();
      const response = await axios.get(`/${userRole}/reports/${reference}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateReportStatus: async (id, statusData) => {
    try {
      const userRole = teamUtils.getUserType();
      const response = await axios.put(
        `/${userRole}/reports/${id}/status`,
        statusData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ==================== RÉINITIALISATION DE TOKEN ====================
  refreshToken: async () => {
    try {
      const userRole = teamUtils.getUserType();
      const response = await axios.post(`/${userRole}/refresh-token`);

      if (response.data.success && response.data.data?.token) {
        const token = response.data.data.token;
        const userData = response.data.data.user;
        const rememberMe = !!localStorage.getItem(`${userRole}_token`);

        teamUtils.setAuthData(token, userData, rememberMe, userRole);
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// Dans votre admin.js ou teamAPI.js, ajoutez cette fonction
export const fileAPI = {
  getAvatar: async (avatarPath) => {
    try {
      const response = await axios.get(`/file/avatar-proxy`, {
        params: { path: avatarPath },
        responseType: "blob",
      });
      return URL.createObjectURL(response.data);
    } catch (error) {
      console.error("Error loading avatar via proxy:", error);
      return null;
    }
  },
};

// ✅ CORRECTION : Initialiser l'authentification de manière sécurisée
try {
  teamUtils.initializeAuth();
} catch (error) {
  console.error(
    "Erreur lors de l'initialisation de l'authentification:",
    error
  );
  // En cas d'erreur, nettoyer les données d'authentification corrompues
  authUtils.clearAuthData();
}

export default teamAPI;
