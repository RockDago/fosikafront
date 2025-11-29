import axios from "../config/axios";

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
          headers: {
            "Content-Type": "multipart/form-data",
          },
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

export const teamUtils = {
  setAuthData: (token, userData, rememberMe = false, userRole) => {
    const storage = rememberMe ? localStorage : sessionStorage;

    // 🔄 STOCKAGE DOUBLE POUR COMPATIBILITÉ
    // 1. Clé spécifique au rôle (agent_token, investigateur_token, admin_token)
    storage.setItem(`${userRole}_token`, token);
    storage.setItem(`${userRole}_user`, JSON.stringify(userData));

    // 2. Clé générique team_token pour compatibilité avec le code existant
    storage.setItem("team_token", token);
    storage.setItem("team_user", JSON.stringify(userData));

    storage.setItem("user_type", userRole);

  },

  getAuthToken: (userRole) => {
    // 🔍 RECHERCHE HIÉRARCHIQUE POUR COMPATIBILITÉ AMÉLIORÉE
    // 1. Chercher d'abord la clé spécifique au rôle
    const specificToken =
      localStorage.getItem(`${userRole}_token`) ||
      sessionStorage.getItem(`${userRole}_token`);
    if (specificToken) {
      return specificToken;
    }

    // 2. Si pas trouvé, chercher la clé générique team_token
    const genericToken =
      localStorage.getItem("team_token") ||
      sessionStorage.getItem("team_token");
    if (genericToken) {
      return genericToken;
    }

    // 3. NOUVEAU : Recherche étendue pour compatibilité avec teamService
    // Vérifier si un token existe avec n'importe quel rôle
    const possibleRoles = ["agent", "investigateur", "admin", "team"];
    for (const role of possibleRoles) {
      const token =
        localStorage.getItem(`${role}_token`) ||
        sessionStorage.getItem(`${role}_token`);
      if (token) {
        return token;
      }
    }

    // 4. Vérifier le user_type pour déterminer le rôle et chercher le token correspondant
    const userType =
      localStorage.getItem("user_type") || sessionStorage.getItem("user_type");
    if (userType) {
      const userTypeToken =
        localStorage.getItem(`${userType.toLowerCase()}_token`) ||
        sessionStorage.getItem(`${userType.toLowerCase()}_token`);
      if (userTypeToken) {
        return userTypeToken;
      }
    }

    // DEBUG: Afficher l'état complet du storage pour le débogage

    return null;
  },

  getAuthUser: (userRole) => {
    // 🔍 RECHERCHE HIÉRARCHIQUE POUR COMPATIBILITÉ AMÉLIORÉE
    // 1. Chercher d'abord la clé spécifique au rôle
    const specificUser =
      localStorage.getItem(`${userRole}_user`) ||
      sessionStorage.getItem(`${userRole}_user`);
    if (specificUser) {
      return JSON.parse(specificUser);
    }

    // 2. Si pas trouvé, chercher la clé générique team_user
    const genericUser =
      localStorage.getItem("team_user") || sessionStorage.getItem("team_user");
    if (genericUser) {
      return JSON.parse(genericUser);
    }

    // 3. NOUVEAU : Recherche étendue pour compatibilité
    const possibleRoles = ["agent", "investigateur", "admin", "team"];
    for (const role of possibleRoles) {
      const userData =
        localStorage.getItem(`${role}_user`) ||
        sessionStorage.getItem(`${role}_user`);
      if (userData) {
        return JSON.parse(userData);
      }
    }

    return null;
  },

  isAuthenticated: (userRole) => {
    const token = teamUtils.getAuthToken(userRole);
    const user = teamUtils.getAuthUser(userRole);
    const isAuth = !!(token && user);

    return isAuth;
  },

  logout: (userRole) => {
    // 🗑️ NETTOYAGE COMPLET POUR TOUTES LES CLÉS POSSIBLES
    const keysToRemove = [
      // Clés spécifiques au rôle
      `${userRole}_token`,
      `${userRole}_user`,
      // Clés génériques
      "team_token",
      "team_user",
      "user_type",
      // Clés pour tous les rôles possibles (pour être sûr)
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

    // DEBUG: Afficher l'état après nettoyage
    teamUtils.debugStorage();
  },

  // 🔍 MÉTHODE UTILITAIRE POUR DÉBOGUER LE STOCKAGE
  debugStorage: () => {
  },
};

export default teamAPI;
