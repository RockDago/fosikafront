import axios from "axios";

export const API_URL = "http://127.0.0.1:8000/api";

// --- Création de l'instance Axios ---
const API = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 20000,
  withCredentials: false,
});

// =========================================================
// =============== INTERCEPTEUR ACCESS ADMIN ===============
// =========================================================

API.interceptors.request.use(
  (config) => {
    const rawUserType =
      localStorage.getItem("user_type") ||
      sessionStorage.getItem("user_type") ||
      "";
    const userType = rawUserType.toString().toLowerCase();

    const url = config.url || "";

    // Bloquer l'accès aux endpoints Admin pour les non-admins
    const isAdminEndpoint = url.includes("/admin/");
    const isAuthEndpoint =
      url.includes("/admin/check") ||
      url.includes("/admin/login") ||
      url.includes("/admin/logout") ||
      url.includes("/admin/register");

    if (isAdminEndpoint && !isAuthEndpoint && userType !== "admin") {
      return Promise.reject(new Error("Accès non autorisé à cette ressource"));
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =========================================================
// =============== RÉCUPÉRATION DU TOKEN ===================
// =========================================================

const getStoredToken = (keys) => {
  for (let key of keys) {
    const token = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (token) return token;
  }
  return null;
};

// =========================================================
// =============== STOCKAGE DES TOKENS ======================
// =========================================================

export const setAdminAuthData = (token, remember = false) => {
  const store = remember ? localStorage : sessionStorage;
  store.setItem("admin_token", token);
  store.setItem("user_type", "admin");

  localStorage.removeItem("team_token");
  sessionStorage.removeItem("team_token");
};

export const setTeamAuthData = (token, remember = false) => {
  const store = remember ? localStorage : sessionStorage;
  store.setItem("team_token", token);
  store.setItem("user_type", "team");

  localStorage.removeItem("admin_token");
  sessionStorage.removeItem("admin_token");
};

export const clearAuthData = () => {
  const keys = [
    "admin_token",
    "team_token",
    "agent_token",
    "investigateur_token",
    "user_type",
  ];

  keys.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

export const clearTeamAuthData = () => {
  ["team_token", "agent_token", "investigateur_token", "user_type"].forEach(
    (key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    }
  );
};

export const clearAdminAuthData = () => {
  ["admin_token", "user_type"].forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });
};

export const getUserType = () => {
  return (
    localStorage.getItem("user_type") ||
    sessionStorage.getItem("user_type") ||
    null
  );
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
      url.includes("/logout") ||
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
      token = getStoredToken([
        "agent_token",
        "team_token",
        "investigateur_token",
      ]);
    } else if (url.includes("/investigateur/")) {
      token = getStoredToken([
        "investigateur_token",
        "team_token",
        "agent_token",
      ]);
    } else {
      token = getStoredToken([
        "team_token",
        "agent_token",
        "investigateur_token",
      ]);
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// =========================================================
// =============== INTERCEPTEUR ERREURS =====================
// =========================================================

API.interceptors.response.use(
  (response) => response,

  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";

    if (status === 401) {
      const isAuth =
        url.includes("/login") ||
        url.includes("/logout") ||
        url.includes("/register") ||
        url.includes("/forgot-password");

      if (!isAuth) {
        error.message =
          "Votre session a expiré ou vous vous êtes connecté depuis un autre appareil.";

        window.dispatchEvent(
          new CustomEvent("tokenExpired", {
            detail: {
              message: error.message,
              originalData: error.response?.data,
            },
          })
        );
      }
    }

    if (status === 403) {
      if (error.response?.data?.message?.includes("désactivé")) {
        clearAuthData();
        window.dispatchEvent(
          new CustomEvent("accountDisabled", {
            detail: error.response?.data,
          })
        );
      }
    }

    if (status === 429) {
      error.message =
        "Trop de requêtes. Veuillez attendre quelques secondes avant de réessayer.";
    }

    if (status === 500) {
      error.message = "Erreur interne du serveur. Veuillez réessayer.";
    }

    if (error.code === "ERR_NETWORK") {
      error.message = "Erreur de réseau. Vérifiez votre connexion internet.";
    }

    return Promise.reject(error);
  }
);

export default API;
