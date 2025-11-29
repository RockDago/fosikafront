import axios from "../config/axios";

// ==================== TEAM API ====================
export const teamAPI = {
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
};

// ==================== UTILITAIRES TEAM ====================
export const teamUtils = {
  setAuthData: (token, userData, rememberMe = false, userRole) => {
    const storage = rememberMe ? localStorage : sessionStorage;

    // Clés spécifiques au rôle
    storage.setItem(`${userRole}_token`, token);
    storage.setItem(`${userRole}_user`, JSON.stringify(userData));

    // Clés génériques pour compatibilité
    storage.setItem("team_token", token);
    storage.setItem("team_user", JSON.stringify(userData));
    storage.setItem("user_type", userRole);

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  },

  getAuthToken: (userRole) => {
    // Priorité : rôle spécifique > clé générique
    return (
      localStorage.getItem(`${userRole}_token`) ||
      sessionStorage.getItem(`${userRole}_token`) ||
      localStorage.getItem("team_token") ||
      sessionStorage.getItem("team_token") ||
      null
    );
  },

  getAuthUser: (userRole) => {
    const userData =
      localStorage.getItem(`${userRole}_user`) ||
      sessionStorage.getItem(`${userRole}_user`) ||
      localStorage.getItem("team_user") ||
      sessionStorage.getItem("team_user");

    return userData ? JSON.parse(userData) : null;
  },

  isAuthenticated: (userRole) => {
    const token = teamUtils.getAuthToken(userRole);
    const user = teamUtils.getAuthUser(userRole);
    return !!(token && user);
  },

  // MÉTHODE MANQUANTE AJOUTÉE ICI
  getUserType: () => {
    // Priorité : clé spécifique > clé générique
    return (
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
      null
    );
  },

  logout: (userRole) => {
    const keysToRemove = [
      `${userRole}_token`,
      `${userRole}_user`,
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

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });

    delete axios.defaults.headers.common["Authorization"];
  },
};

export default teamAPI;
