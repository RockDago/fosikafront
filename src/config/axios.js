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

    // NE PAS bloquer l'accès aux endpoints d'authentification Admin
    const isAuthEndpoint =
      url.includes("/admin/login") ||
      url.includes("/admin/logout") ||
      url.includes("/admin/check") ||
      url.includes("/admin/register");

    // Autoriser TOUJOURS les endpoints d'authentification
    if (isAuthEndpoint) {
      return config;
    }

    // Bloquer l'accès aux endpoints Admin seulement pour les non-admins
    const isAdminEndpoint = url.includes("/admin/");
    if (isAdminEndpoint && userType !== "admin") {
      console.warn("Tentative d'accès non autorisé à une ressource admin");
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
    if (token) {
      console.log(`Token trouvé pour la clé: ${key}`);
      return token;
    }
  }
  console.log('Aucun token trouvé pour les clés:', keys);
  return null;
};

// =========================================================
// =============== STOCKAGE DES TOKENS ======================
// =========================================================

export const setAdminAuthData = (token, remember = false) => {
  const store = remember ? localStorage : sessionStorage;
  store.setItem("admin_token", token);
  store.setItem("user_type", "admin");

  // Nettoyer les tokens team pour éviter les conflits
  localStorage.removeItem("team_token");
  sessionStorage.removeItem("team_token");
  localStorage.removeItem("agent_token");
  sessionStorage.removeItem("agent_token");
  localStorage.removeItem("investigateur_token");
  sessionStorage.removeItem("investigateur_token");

  console.log('Admin auth data stored');
};

export const setTeamAuthData = (token, remember = false, userRole = "team") => {
  const store = remember ? localStorage : sessionStorage;
  
  // Stocker les clés spécifiques au rôle
  store.setItem(`${userRole}_token`, token);
  store.setItem("team_token", token);
  store.setItem("user_type", userRole);

  // Nettoyer les tokens admin pour éviter les conflits
  localStorage.removeItem("admin_token");
  sessionStorage.removeItem("admin_token");

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

  console.log('All auth data cleared');
};

export const clearTeamAuthData = () => {
  const keys = [
    "team_token", 
    "agent_token", 
    "investigateur_token", 
    "user_type",
    "team_user",
    "agent_user",
    "investigateur_user"
  ];
  
  keys.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  console.log('Team auth data cleared');
};

export const clearAdminAuthData = () => {
  const keys = [
    "admin_token", 
    "user_type",
    "admin_user"
  ];
  
  keys.forEach((key) => {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  });

  console.log('Admin auth data cleared');
};

export const getUserType = () => {
  const userType = localStorage.getItem("user_type") || sessionStorage.getItem("user_type");
  console.log('Current user type:', userType);
  return userType;
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
      url.includes("/reset-password") ||
      url.includes("/public/")
    ) {
      console.log('Endpoint public, pas de token ajouté');
      return config;
    }

    // Éviter les doublons
    if (config.headers.Authorization) {
      return config;
    }

    let token = null;
    let tokenSource = "";

    if (url.includes("/admin/")) {
      token = getStoredToken(["admin_token"]);
      tokenSource = "admin";
    } else if (url.includes("/agent/")) {
      token = getStoredToken([
        "agent_token",
        "team_token",
      ]);
      tokenSource = "agent";
    } else if (url.includes("/investigateur/")) {
      token = getStoredToken([
        "investigateur_token",
        "team_token",
      ]);
      tokenSource = "investigateur";
    } else {
      // Pour les endpoints génériques, essayer tous les tokens
      token = getStoredToken([
        "team_token",
        "agent_token",
        "investigateur_token",
        "admin_token"
      ]);
      tokenSource = "generic";
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`Token ${tokenSource} ajouté à la requête: ${url}`);
    } else {
      console.log(`Aucun token trouvé pour la requête: ${url}`);
    }

    return config;
  },
  (error) => {
    console.error('Erreur intercepteur requête:', error);
    return Promise.reject(error);
  }
);

// =========================================================
// =============== INTERCEPTEUR ERREURS =====================
// =========================================================

API.interceptors.response.use(
  (response) => {
    console.log(`Réponse API ${response.config.url}:`, response.status);
    return response;
  },

  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const method = error.config?.method || "";

    console.error(`Erreur API ${method} ${url}:`, status, error.message);

    if (status === 401) {
      const isAuth =
        url.includes("/login") ||
        url.includes("/logout") ||
        url.includes("/register") ||
        url.includes("/forgot-password");

      if (!isAuth) {
        error.message = "Votre session a expiré. Veuillez vous reconnecter.";

        console.log('Déclenchement événement tokenExpired');
        window.dispatchEvent(
          new CustomEvent("tokenExpired", {
            detail: {
              message: error.message,
              originalData: error.response?.data,
              url: url
            },
          })
        );
        
        // Nettoyer les données d'authentification
        clearAuthData();
      }
    }

    if (status === 403) {
      if (error.response?.data?.message?.includes("désactivé")) {
        clearAuthData();
        console.log('Déclenchement événement accountDisabled');
        window.dispatchEvent(
          new CustomEvent("accountDisabled", {
            detail: error.response?.data,
          })
        );
      }
    }

    if (status === 404) {
      error.message = "Ressource non trouvée.";
    }

    if (status === 422) {
      error.message = "Données invalides. Veuillez vérifier les informations saisies.";
    }

    if (status === 429) {
      error.message = "Trop de requêtes. Veuillez attendre quelques secondes avant de réessayer.";
    }

    if (status === 500) {
      error.message = "Erreur interne du serveur. Veuillez réessayer.";
    }

    if (error.code === "ERR_NETWORK") {
      error.message = "Erreur de réseau. Vérifiez votre connexion internet.";
      
      window.dispatchEvent(
        new CustomEvent("networkError", {
          detail: {
            message: error.message,
          },
        })
      );
    }

    if (error.code === "ECONNABORTED") {
      error.message = "La requête a expiré. Veuillez réessayer.";
    }

    return Promise.reject(error);
  }
);

// =========================================================
// =============== MÉTHODES UTILITAIRES ====================
// =========================================================

export const initializeAuth = () => {
  const userType = getUserType();
  const token = getStoredToken([
    "admin_token",
    "team_token", 
    "agent_token",
    "investigateur_token"
  ]);

  if (token && userType) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    console.log(`Auth initialisée pour ${userType}`);
    return { userType, token };
  }

  console.log('Aucune auth à initialiser');
  return null;
};

// Initialiser l'auth au chargement du module
initializeAuth();

export default API;