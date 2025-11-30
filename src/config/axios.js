import axios from "axios";

export const API_URL = "http://127.0.0.1:8000/api";

// --- Création de l'instance Axios ---
const API = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000, // Augmenter le timeout
  withCredentials: false, // Changer à false pour éviter les problèmes CORS
});

// Supprimer l'intercepteur de requête problématique pour Admin
// Garder seulement l'intercepteur pour les tokens

// =========================================================
// =============== RÉCUPÉRATION DU TOKEN ===================
// =========================================================

const getStoredToken = (keys) => {
  for (let key of keys) {
    const token = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (token) {
      return token;
    }
  }
  return null;
};

// =========================================================
// =============== INTERCEPTEUR TOKEN BEARER ===============
// =========================================================

API.interceptors.request.use(
  (config) => {
    const url = config.url || "";

    // Endpoints publics → ne pas ajouter de token
    if (
      url.includes("/login") ||
      url.includes("/register") ||
      url.includes("/forgot-password") ||
      url.includes("/reset-password")
    ) {
      return config;
    }

    // Éviter les doublons
    if (config.headers.Authorization) {
      return config;
    }

    let token = null;

    if (url.includes("/admin/")) {
      token = getStoredToken(["admin_token"]);
    } else if (url.includes("/agent/")) {
      token = getStoredToken(["agent_token", "team_token"]);
    } else if (url.includes("/investigateur/")) {
      token = getStoredToken(["investigateur_token", "team_token"]);
    } else {
      token = getStoredToken([
        "team_token",
        "agent_token",
        "investigateur_token",
        "admin_token",
      ]);
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =========================================================
// =============== INTERCEPTEUR ERREURS ====================
// =========================================================

API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    // Gestion spécifique des erreurs réseau
    if (error.code === "ERR_NETWORK" || !error.response) {
      error.message =
        "Impossible de joindre le serveur. Vérifiez votre connexion et que le serveur backend est démarré.";

      window.dispatchEvent(
        new CustomEvent("networkError", {
          detail: {
            message: error.message,
            url: url,
          },
        })
      );
    } else if (status === 401) {
      if (!url.includes("/login")) {
        error.message = "Session expirée. Veuillez vous reconnecter.";
        window.dispatchEvent(new CustomEvent("tokenExpired"));
      }
    } else if (status === 403) {
      if (error.response?.data?.message?.includes("désactivé")) {
        window.dispatchEvent(new CustomEvent("accountDisabled"));
      }
    }

    return Promise.reject(error);
  }
);

export const initializeAuth = () => {
  const userType = getUserType();
  const token = getStoredToken([
    "admin_token",
    "team_token",
    "agent_token",
    "investigateur_token",
  ]);

  if (token && userType) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    return { userType, token };
  }

  return null;
};

// Méthodes utilitaires existantes...
export const setAdminAuthData = (token, remember = false) => {
  const store = remember ? localStorage : sessionStorage;
  store.setItem("admin_token", token);
  store.setItem("user_type", "admin");
  console.log("Admin auth data stored");
};

export const setTeamAuthData = (token, remember = false, userRole = "team") => {
  const store = remember ? localStorage : sessionStorage;
  store.setItem(`${userRole}_token`, token);
  store.setItem("team_token", token);
  store.setItem("user_type", userRole);
  console.log(`Team auth data stored for role: ${userRole}`);
};

export const clearAuthData = () => {
  const keys = [
    "admin_token",
    "team_token",
    "agent_token",
    "investigateur_token",
    "user_type",
    "admin_user",
    "team_user",
    "agent_user",
    "investigateur_user",
  ];

  keys.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

export const getUserType = () => {
  return (
    localStorage.getItem("user_type") || sessionStorage.getItem("user_type")
  );
};

// Initialiser l'auth
initializeAuth();

export default API;
