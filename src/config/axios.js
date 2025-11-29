import axios from "axios";

export const API_URL = "http://127.0.0.1:8000/api";

// Création d'une instance Axios
const API = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 20000,
  withCredentials: false,
});

// --- Gestion des tokens pour Admin ET Team ---

// Intercepteur pour bloquer les requêtes admin non autorisées
API.interceptors.request.use(
  (config) => {
    const rawUserType =
      localStorage.getItem("user_type") ||
      sessionStorage.getItem("user_type") ||
      "";
    const userType = rawUserType.toString().toLowerCase();

    const url = config.url || "";

    // Bloquer l'accès aux endpoints /admin/ si l'utilisateur n'est pas admin
    // mais EXCLURE les endpoints d'authentification (login/logout/register/check)
    if (
      url.includes("/admin/") &&
      !url.includes("/admin/check") &&
      !url.includes("/admin/login") &&
      !url.includes("/admin/logout") &&
      !url.includes("/admin/register") &&
      userType !== "admin"
    ) {
      console.warn(
        "🔒 Tentative d'accès admin bloquée pour user_type=",
        userType,
        "url=",
        url
      );
      return Promise.reject(new Error("Accès non autorisé à cette ressource"));
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Récupérer le token selon le type d'utilisateur
const getAuthToken = () => {
  const teamToken =
    localStorage.getItem("team_token") || sessionStorage.getItem("team_token");
  if (teamToken) {
    return { token: teamToken, type: "team" };
  }

  const adminToken =
    localStorage.getItem("admin_token") ||
    sessionStorage.getItem("admin_token");
  if (adminToken) {
    return { token: adminToken, type: "admin" };
  }

  return null;
};

// Stocker token admin
export const setAdminAuthData = (token, rememberMe = false) => {
  if (rememberMe) {
    localStorage.setItem("admin_token", token);
    localStorage.setItem("user_type", "admin");
    localStorage.removeItem("team_token");
    sessionStorage.removeItem("team_token");
  } else {
    sessionStorage.setItem("admin_token", token);
    sessionStorage.setItem("user_type", "admin");
    localStorage.removeItem("team_token");
    sessionStorage.removeItem("team_token");
  }
};

// Stocker token team
export const setTeamAuthData = (token, rememberMe = false) => {
  if (rememberMe) {
    localStorage.setItem("team_token", token);
    localStorage.setItem("user_type", "team");
    localStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_token");
  } else {
    sessionStorage.setItem("team_token", token);
    sessionStorage.setItem("user_type", "team");
    localStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_token");
  }
};

// Supprimer tous les tokens
export const clearAuthData = () => {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("user_type");
  sessionStorage.removeItem("admin_token");
  sessionStorage.removeItem("user_type");

  localStorage.removeItem("team_token");
  sessionStorage.removeItem("team_token");

  // Nettoyer aussi les tokens spécifiques
  localStorage.removeItem("agent_token");
  sessionStorage.removeItem("agent_token");
  localStorage.removeItem("investigateur_token");
  sessionStorage.removeItem("investigateur_token");
};

// Supprimer uniquement les tokens team
export const clearTeamAuthData = () => {
  localStorage.removeItem("team_token");
  sessionStorage.removeItem("team_token");
  localStorage.removeItem("user_type");
  sessionStorage.removeItem("user_type");
  localStorage.removeItem("agent_token");
  sessionStorage.removeItem("agent_token");
  localStorage.removeItem("investigateur_token");
  sessionStorage.removeItem("investigateur_token");
};

// Supprimer uniquement les tokens admin
export const clearAdminAuthData = () => {
  localStorage.removeItem("admin_token");
  sessionStorage.removeItem("admin_token");
  localStorage.removeItem("user_type");
  sessionStorage.removeItem("user_type");
};

// Vérifier le type d'utilisateur connecté
export const getUserType = () => {
  return (
    localStorage.getItem("user_type") ||
    sessionStorage.getItem("user_type") ||
    null
  );
};

// --- Intercepteur pour ajouter le token Bearer ---
API.interceptors.request.use(
  (config) => {
    const url = config.url || "";

    // ⚠️ NE PAS ajouter de token pour les endpoints publics
    if (
      url.includes("/login") ||
      url.includes("/logout") ||
      url.includes("/register") ||
      url.includes("/forgot-password") ||
      url.includes("/reset-password")
    ) {
      return config;
    }

    // Éviter les doublons d'Authorization header
    if (config.headers.Authorization) {
      return config;
    }

    // Choix du token en fonction de l'endpoint cible:
    let tokenToUse = null;

    if (url.includes("/admin/")) {
      tokenToUse =
        localStorage.getItem("admin_token") ||
        sessionStorage.getItem("admin_token");
    } else if (url.includes("/agent/")) {
      tokenToUse =
        localStorage.getItem("agent_token") ||
        sessionStorage.getItem("agent_token") ||
        localStorage.getItem("team_token") ||
        sessionStorage.getItem("team_token");
    } else if (url.includes("/investigateur/")) {
      tokenToUse =
        localStorage.getItem("investigateur_token") ||
        sessionStorage.getItem("investigateur_token") ||
        localStorage.getItem("team_token") ||
        sessionStorage.getItem("team_token");
    } else {
      // fallback: team / generic token
      tokenToUse =
        localStorage.getItem("team_token") ||
        sessionStorage.getItem("team_token") ||
        localStorage.getItem("agent_token") ||
        sessionStorage.getItem("agent_token") ||
        localStorage.getItem("investigateur_token") ||
        sessionStorage.getItem("investigateur_token");
    }

    if (tokenToUse) {
      config.headers.Authorization = `Bearer ${tokenToUse}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Intercepteur pour gérer les erreurs ---
API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        const url = error.config?.url || "";

        // Ne déclencher tokenExpired que pour les endpoints protégés, pas pour login/logout
        if (
          !url.includes("/login") &&
          !url.includes("/logout") &&
          !url.includes("/register") &&
          !url.includes("/forgot-password")
        ) {
          console.warn("⚠️ Erreur 401 détectée - Token potentiellement expiré");

          error.message =
            "Votre session a expiré ou vous vous êtes connecté depuis un autre appareil.";

          window.dispatchEvent(
            new CustomEvent("tokenExpired", {
              detail: {
                message: error.message,
                originalData: error.response.data,
              },
            })
          );
        }
      } else if (error.response.status === 403) {
        if (error.response.data?.message?.includes("désactivé")) {
          clearAuthData();
          window.dispatchEvent(
            new CustomEvent("accountDisabled", {
              detail: error.response.data,
            })
          );
        }
      } else if (error.response.status === 429) {
        // Trop de requêtes - rate limiting
        console.warn(
          "⚠️ Rate limiting détecté (429) - Trop de requêtes",
          error.config?.url
        );
        error.message =
          "Trop de requêtes. Veuillez attendre quelques secondes avant de réessayer.";
      } else if (error.response.status === 500) {
        console.error("❌ Erreur serveur 500:", error.config?.url);
        error.message = "Erreur interne du serveur. Veuillez réessayer.";
      }
    } else if (error.code === "ERR_NETWORK") {
      error.message = "Erreur de réseau. Vérifiez votre connexion internet.";
    }

    return Promise.reject(error);
  }
);

export default API;
