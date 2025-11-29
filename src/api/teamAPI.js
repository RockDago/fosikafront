import axios from "../config/axios";

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

        // Utiliser les utilitaires pour stocker correctement
        teamUtils.setAuthData(
          token,
          userData,
          credentials.remember || false,
          userRole
        );

        return response.data;
      } else {
        throw new Error("Réponse de connexion invalide");
      }
    } catch (error) {
      console.error("Erreur login team:", error);
      throw error;
    }
  },

  logout: async (userRole) => {
    try {
      const response = await axios.post("/team/logout");
      teamUtils.logout(userRole);
      return response.data;
    } catch (error) {
      teamUtils.logout(userRole);
      throw error;
    }
  },

  checkAuth: async (userRole) => {
    try {
      const response = await axios.get(`/${userRole}/check`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: async (userRole) => {
    try {
      const response = await axios.get(`/${userRole}/user`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ==================== PROFIL TEAM ====================
  getProfile: async (userRole) => {
    try {
      const response = await axios.get(`/${userRole}/profile`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateProfile: async (userRole, profileData) => {
    try {
      const response = await axios.put(`/${userRole}/profile`, profileData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateAvatar: async (userRole, avatarFile) => {
    try {
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

  updatePassword: async (userRole, passwordData) => {
    try {
      const response = await axios.post(
        `/${userRole}/profile/password`,
        passwordData
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getPersonalStats: async (userRole) => {
    try {
      const response = await axios.get(`/${userRole}/profile/stats`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // ==================== RAPPORTS TEAM ====================
  getAssignedReports: async (userRole, params = {}) => {
    try {
      const response = await axios.get(`/${userRole}/reports`, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getReport: async (userRole, reference) => {
    try {
      const response = await axios.get(`/${userRole}/reports/${reference}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  updateReportStatus: async (userRole, id, statusData) => {
    try {
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
  refreshToken: async (userRole) => {
    try {
      const response = await axios.post(`/${userRole}/refresh-token`);
      if (response.data.success && response.data.data?.token) {
        const token = response.data.data.token;
        const userData = response.data.data.user;
        const currentUser = teamUtils.getAuthUser(userRole);
        const rememberMe = !!localStorage.getItem(`${userRole}_token`);

        teamUtils.setAuthData(
          token,
          userData || currentUser,
          rememberMe,
          userRole
        );
      }
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

// ==================== UTILITAIRES TEAM ====================
export const teamUtils = {
  setAuthData: (token, userData, rememberMe = false, userRole) => {
    const storage = rememberMe ? localStorage : sessionStorage;

    // Nettoyer d'abord les anciennes données
    teamUtils.logout(userRole);

    // Clés spécifiques au rôle
    storage.setItem(`${userRole}_token`, token);
    storage.setItem(`${userRole}_user`, JSON.stringify(userData));

    // Clés génériques pour compatibilité
    storage.setItem("team_token", token);
    storage.setItem("team_user", JSON.stringify(userData));
    storage.setItem("user_type", userRole);

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    console.log("Auth data stored for team:", {
      userRole,
      token: token ? "present" : "missing",
      userData: userData ? "present" : "missing",
      storage: rememberMe ? "localStorage" : "sessionStorage",
    });
  },

  getAuthToken: (userRole = null) => {
    const targetRole = userRole || teamUtils.getUserType();

    if (targetRole) {
      // Priorité : rôle spécifique > clé générique
      const token =
        localStorage.getItem(`${targetRole}_token`) ||
        sessionStorage.getItem(`${targetRole}_token`) ||
        localStorage.getItem("team_token") ||
        sessionStorage.getItem("team_token") ||
        null;

      console.log(
        `Retrieved token for ${targetRole}:`,
        token ? "present" : "missing"
      );
      return token;
    }

    // Fallback: chercher dans tous les rôles possibles
    const roles = ["agent", "investigateur", "admin"];
    for (let role of roles) {
      const token =
        localStorage.getItem(`${role}_token`) ||
        sessionStorage.getItem(`${role}_token`);
      if (token) {
        console.log(`Found token for role: ${role}`);
        return token;
      }
    }

    console.log("No token found");
    return null;
  },

  getAuthUser: (userRole = null) => {
    const targetRole = userRole || teamUtils.getUserType();

    if (targetRole) {
      const userData =
        localStorage.getItem(`${targetRole}_user`) ||
        sessionStorage.getItem(`${targetRole}_user`) ||
        localStorage.getItem("team_user") ||
        sessionStorage.getItem("team_user");

      const user = userData ? JSON.parse(userData) : null;
      console.log(
        `Retrieved user for ${targetRole}:`,
        user ? "present" : "missing"
      );
      return user;
    }

    // Fallback: chercher dans tous les rôles possibles
    const roles = ["agent", "investigateur", "admin"];
    for (let role of roles) {
      const userData =
        localStorage.getItem(`${role}_user`) ||
        sessionStorage.getItem(`${role}_user`);
      if (userData) {
        const user = JSON.parse(userData);
        console.log(`Found user for role: ${role}`);
        return user;
      }
    }

    console.log("No user data found");
    return null;
  },

  isAuthenticated: (userRole = null) => {
    const token = teamUtils.getAuthToken(userRole);
    const user = teamUtils.getAuthUser(userRole);
    const isAuth = !!(token && user);
    console.log(
      `Team authenticated${userRole ? ` for ${userRole}` : ""}:`,
      isAuth
    );
    return isAuth;
  },

  getUserType: () => {
    // Priorité : clé spécifique > clé générique
    const userType =
      localStorage.getItem("user_type") ||
      sessionStorage.getItem("user_type") ||
      // Fallback : vérifier les tokens existants pour déterminer le rôle
      (localStorage.getItem("agent_token") ||
      sessionStorage.getItem("agent_token")
        ? "agent"
        : null) ||
      (localStorage.getItem("investigateur_token") ||
      sessionStorage.getItem("investigateur_token")
        ? "investigateur"
        : null) ||
      (localStorage.getItem("admin_token") ||
      sessionStorage.getItem("admin_token")
        ? "admin"
        : null) ||
      null;

    console.log("Detected user type:", userType);
    return userType;
  },

  logout: (userRole = null) => {
    console.log(
      "Logging out team...",
      userRole ? `for role: ${userRole}` : "all roles"
    );

    let keysToRemove = [];

    if (userRole) {
      // Déconnexion d'un rôle spécifique
      keysToRemove = [
        `${userRole}_token`,
        `${userRole}_user`,
        "team_token",
        "team_user",
        "user_type",
      ];
    } else {
      // Déconnexion complète (tous les rôles)
      keysToRemove = [
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
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    delete axios.defaults.headers.common["Authorization"];

    console.log("Team logout completed");
  },

  // Nouvelle méthode pour initialiser l'authentification au chargement de l'app
  initializeAuth: () => {
    const userType = teamUtils.getUserType();
    const token = teamUtils.getAuthToken(userType);
    const user = teamUtils.getAuthUser(userType);

    if (token && user && userType) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      console.log(`Auth initialized for ${userType}`);
      return { userType, user, token };
    }

    console.log("No team auth found");
    return null;
  },

  // Méthode pour vérifier les permissions basées sur le rôle
  hasPermission: (requiredPermission, userRole = null) => {
    const role = userRole || teamUtils.getUserType();
    const user = teamUtils.getAuthUser(role);

    if (!user || !user.permissions) return false;

    return user.permissions.includes(requiredPermission);
  },

  // Méthode pour obtenir le rôle actuel de manière sécurisée
  getCurrentRole: () => {
    return teamUtils.getUserType();
  },
};

export default teamAPI;
