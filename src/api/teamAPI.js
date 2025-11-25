import axios from "../config/axios";

export const teamAPI = {
  // ==================== PROFIL TEAM ====================
  getProfile: async (userRole) => {
    try {
      console.log(`🔄 API Call: GET /${userRole}/profile`);
      const response = await axios.get(`/${userRole}/profile`);
      console.log("✅ Profil team récupéré:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération du profil team:", error);
      throw error;
    }
  },

  updateProfile: async (userRole, profileData) => {
    try {
      console.log(`🔄 API Call: PUT /${userRole}/profile`, profileData);
      const response = await axios.put(`/${userRole}/profile`, profileData);
      console.log("✅ Profil team mis à jour:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour du profil team:", error);
      throw error;
    }
  },

  updateAvatar: async (userRole, avatarFile) => {
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      console.log(`🔄 API Call: POST /${userRole}/profile/avatar`);
      const response = await axios.post(
        `/${userRole}/profile/avatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("✅ Avatar team mis à jour:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la mise à jour de l'avatar team:",
        error
      );
      throw error;
    }
  },

  updatePassword: async (userRole, passwordData) => {
    try {
      console.log(`🔄 API Call: POST /${userRole}/profile/password`);
      const response = await axios.post(
        `/${userRole}/profile/password`,
        passwordData
      );
      console.log("✅ Mot de passe team mis à jour:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ Erreur lors du changement de mot de passe team:",
        error
      );
      throw error;
    }
  },

  getPersonalStats: async (userRole) => {
    try {
      console.log(`🔄 API Call: GET /${userRole}/profile/stats`);
      const response = await axios.get(`/${userRole}/profile/stats`);
      console.log("✅ Stats personnelles récupérées:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des stats:", error);
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

    console.log(`🔑 Données auth ${userRole} stockées:`, {
      rememberMe,
      userData: userData?.email,
      specificToken: `${userRole}_token = ${
        storage.getItem(`${userRole}_token`) ? "OUI" : "NON"
      }`,
      genericToken: `team_token = ${
        storage.getItem("team_token") ? "OUI" : "NON"
      }`,
    });
  },

  getAuthToken: (userRole) => {
    // 🔍 RECHERCHE HIÉRARCHIQUE POUR COMPATIBILITÉ AMÉLIORÉE
    // 1. Chercher d'abord la clé spécifique au rôle
    const specificToken =
      localStorage.getItem(`${userRole}_token`) ||
      sessionStorage.getItem(`${userRole}_token`);
    if (specificToken) {
      console.log(`🔑 Token trouvé via clé spécifique: ${userRole}_token`);
      return specificToken;
    }

    // 2. Si pas trouvé, chercher la clé générique team_token
    const genericToken =
      localStorage.getItem("team_token") ||
      sessionStorage.getItem("team_token");
    if (genericToken) {
      console.log(`🔑 Token trouvé via clé générique: team_token`);
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
        console.log(`🔑 Token trouvé via recherche étendue: ${role}_token`);
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
        console.log(`🔑 Token trouvé via user_type: ${userType}_token`);
        return userTypeToken;
      }
    }

    console.log(`❌ Aucun token trouvé pour ${userRole}`);

    // DEBUG: Afficher l'état complet du storage pour le débogage
    console.log("🐛 État actuel du storage:", {
      localStorage: {
        agent_token: localStorage.getItem("agent_token"),
        investigateur_token: localStorage.getItem("investigateur_token"),
        admin_token: localStorage.getItem("admin_token"),
        team_token: localStorage.getItem("team_token"),
        user_type: localStorage.getItem("user_type"),
      },
      sessionStorage: {
        agent_token: sessionStorage.getItem("agent_token"),
        investigateur_token: sessionStorage.getItem("investigateur_token"),
        admin_token: sessionStorage.getItem("admin_token"),
        team_token: sessionStorage.getItem("team_token"),
        user_type: sessionStorage.getItem("user_type"),
      },
    });

    return null;
  },

  getAuthUser: (userRole) => {
    // 🔍 RECHERCHE HIÉRARCHIQUE POUR COMPATIBILITÉ AMÉLIORÉE
    // 1. Chercher d'abord la clé spécifique au rôle
    const specificUser =
      localStorage.getItem(`${userRole}_user`) ||
      sessionStorage.getItem(`${userRole}_user`);
    if (specificUser) {
      console.log(
        `👤 Données utilisateur trouvées via clé spécifique: ${userRole}_user`
      );
      return JSON.parse(specificUser);
    }

    // 2. Si pas trouvé, chercher la clé générique team_user
    const genericUser =
      localStorage.getItem("team_user") || sessionStorage.getItem("team_user");
    if (genericUser) {
      console.log(
        `👤 Données utilisateur trouvées via clé générique: team_user`
      );
      return JSON.parse(genericUser);
    }

    // 3. NOUVEAU : Recherche étendue pour compatibilité
    const possibleRoles = ["agent", "investigateur", "admin", "team"];
    for (const role of possibleRoles) {
      const userData =
        localStorage.getItem(`${role}_user`) ||
        sessionStorage.getItem(`${role}_user`);
      if (userData) {
        console.log(
          `👤 Données utilisateur trouvées via recherche étendue: ${role}_user`
        );
        return JSON.parse(userData);
      }
    }

    console.log(`❌ Aucune donnée utilisateur trouvée pour ${userRole}`);
    return null;
  },

  isAuthenticated: (userRole) => {
    const token = teamUtils.getAuthToken(userRole);
    const user = teamUtils.getAuthUser(userRole);
    const isAuth = !!(token && user);

    console.log(`🔐 Authentification ${userRole}:`, {
      authenticated: isAuth,
      hasToken: !!token,
      hasUser: !!user,
      userRole: user?.role,
    });
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

    console.log(
      `🔓 Déconnexion ${userRole} effectuée - toutes les données nettoyées`
    );

    // DEBUG: Afficher l'état après nettoyage
    teamUtils.debugStorage();
  },

  // 🔍 MÉTHODE UTILITAIRE POUR DÉBOGUER LE STOCKAGE
  debugStorage: () => {
    console.log("🐛 DEBUG STORAGE - Contenu actuel:", {
      localStorage: {
        agent_token: localStorage.getItem("agent_token") ? "PRESENT" : "ABSENT",
        investigateur_token: localStorage.getItem("investigateur_token")
          ? "PRESENT"
          : "ABSENT",
        admin_token: localStorage.getItem("admin_token") ? "PRESENT" : "ABSENT",
        team_token: localStorage.getItem("team_token") ? "PRESENT" : "ABSENT",
        user_type: localStorage.getItem("user_type"),
      },
      sessionStorage: {
        agent_token: sessionStorage.getItem("agent_token")
          ? "PRESENT"
          : "ABSENT",
        investigateur_token: sessionStorage.getItem("investigateur_token")
          ? "PRESENT"
          : "ABSENT",
        admin_token: sessionStorage.getItem("admin_token")
          ? "PRESENT"
          : "ABSENT",
        team_token: sessionStorage.getItem("team_token") ? "PRESENT" : "ABSENT",
        user_type: sessionStorage.getItem("user_type"),
      },
    });
  },
};

export default teamAPI;