import axios from "axios";

export const API_URL = "http://127.0.0.1:8000/api";

// Création d'une instance Axios
const API = axios.create({
  baseURL: API_URL, // Utilisation de la constante API_URL
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 20000, // Timeout 20 secondes
  withCredentials: false,
});

console.log(`🚀 Configuration Axios - URL de base: ${API_URL}`);

// --- Gestion des tokens pour Admin ET Team ---

// Intercepteur pour bloquer les requêtes admin non autorisées
API.interceptors.request.use(
  (config) => {
    // Ne pas envoyer de requêtes /admin/* si l'utilisateur est un team admin
    const userType =
      localStorage.getItem("user_type") || sessionStorage.getItem("user_type");

    if (
      userType === "Admin" &&
      config.url.includes("/admin/") &&
      !config.url.includes("/admin/check")
    ) {
      console.log("🚫 Blocage requête admin pour team admin:", config.url);
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
  // Nettoyer admin
  localStorage.removeItem("admin_token");
  localStorage.removeItem("user_type");
  sessionStorage.removeItem("admin_token");
  sessionStorage.removeItem("user_type");

  // Nettoyer team
  localStorage.removeItem("team_token");
  sessionStorage.removeItem("team_token");
};

// Supprimer uniquement les tokens team
export const clearTeamAuthData = () => {
  localStorage.removeItem("team_token");
  sessionStorage.removeItem("team_token");
  localStorage.removeItem("user_type");
  sessionStorage.removeItem("user_type");
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
    const authData = getAuthToken();

    if (authData) {
      config.headers.Authorization = `Bearer ${authData.token}`;
      console.log(
        `🔑 Token ${
          authData.type
        } utilisé pour: ${config.method?.toUpperCase()} ${config.url}`
      );
    } else {
      console.log(
        `👤 Aucun token pour: ${config.method?.toUpperCase()} ${config.url}`
      );
    }

    return config;
  },
  (error) => {
    console.error("❌ Erreur intercepteur request:", error);
    return Promise.reject(error);
  }
);

// --- Intercepteur pour gérer les erreurs - CORRIGÉ AVEC GESTION COMPTE DÉSACTIVÉ ---
API.interceptors.response.use(
  (response) => {
    console.log(
      `✅ ${response.config.method?.toUpperCase()} ${
        response.config.url
      } - Succès`
    );
    return response;
  },
  (error) => {
    if (error.code === "ERR_NETWORK") {
      console.error(
        `🌐 Erreur réseau: Le serveur backend n'est pas accessible à ${API_URL}`
      );
      console.error(
        "Vérifiez que le serveur Laravel est démarré et accessible"
      );
    } else if (error.response) {
      console.error(
        `❌ Erreur ${error.response.status} sur ${error.config?.url}:`,
        error.response.data
      );

      if (error.response.status === 401) {
        console.log("🔒 401 - Session expirée ou non autorisée");
        console.log("📍 Nettoyage des tokens sans redirection automatique");
        clearAuthData();
      } else if (error.response.status === 403) {
        console.log("🚫 403 - Accès refusé (compte désactivé)");

        // Gestion spécifique pour les comptes désactivés
        if (error.response.data?.message?.includes("désactivé")) {
          console.log("🚫 COMPTE DÉSACTIVÉ - Déconnexion automatique");
          clearAuthData();

          // Déclencher un événement global pour informer l'application
          window.dispatchEvent(
            new CustomEvent("accountDisabled", {
              detail: error.response.data,
            })
          );
        }
      } else if (error.response.status === 404) {
        console.warn(`🔍 404 - Endpoint non trouvé: ${error.config?.url}`);
      } else if (error.response.status === 422) {
        console.warn(
          "📝 422 - Erreur de validation:",
          error.response.data.errors
        );
      } else if (error.response.status === 500) {
        console.error("💥 500 - Erreur serveur interne:", error.response.data);
      }
    } else if (error.request) {
      console.error("🌐 Aucune réponse reçue:", error.request);
    } else {
      console.error("⚠️ Erreur Axios:", error.message);
    }

    return Promise.reject(error);
  }
);

export default API;
