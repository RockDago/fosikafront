import axios from "axios";

// Instance Axios
const instance = axios.create({
  baseURL: "http://localhost:8000/api",
  timeout: 30000, // Augmenter le timeout
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// Récupérer token admin ou team
const getAuthData = () => {
  const adminToken =
    localStorage.getItem("admin_token") ||
    sessionStorage.getItem("admin_token");
  const teamToken =
    localStorage.getItem("team_token") || sessionStorage.getItem("team_token");
  return { adminToken, teamToken };
};

// Stocker token
export const setAuthData = (role, token, rememberMe = false) => {
  if (role === "admin") {
    if (rememberMe) localStorage.setItem("admin_token", token);
    else sessionStorage.setItem("admin_token", token);
  } else {
    if (rememberMe) localStorage.setItem("team_token", token);
    else sessionStorage.setItem("team_token", token);
  }
};

// Supprimer token
export const clearAuthData = () => {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("team_token");
  localStorage.removeItem("user_type");
  localStorage.removeItem("team_user");
  sessionStorage.removeItem("admin_token");
  sessionStorage.removeItem("team_token");
  sessionStorage.removeItem("user_type");
  sessionStorage.removeItem("team_user");
};

// Intercepteur pour ajouter token si existant
instance.interceptors.request.use(
  (config) => {
    const { adminToken, teamToken } = getAuthData();
    const token = adminToken || teamToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Token utilisé dans la requête");
    } else {
      console.log("👤 Aucun token, requête en tant que visiteur");
    }

    return config;
  },
  (error) => {
    console.error("❌ Erreur intercepteur requête:", error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
instance.interceptors.response.use(
  (response) => {
    console.log(
      `✅ ${response.config.method?.toUpperCase()} ${response.config.url}:`,
      response.status
    );
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        `❌ Erreur ${error.config?.method?.toUpperCase()} ${
          error.config?.url
        }:`,
        error.response.status,
        error.response.data
      );

      // Si non authentifié, on peut nettoyer les tokens
      if (error.response.status === 401) {
        console.log("🔒 Session expirée, nettoyage des tokens...");
        clearAuthData();
        // Rediriger vers la page de login si nécessaire
        window.dispatchEvent(new Event("sessionExpired"));
      }
    } else if (error.request) {
      console.error("🌐 Erreur réseau - Requête envoyée mais pas de réponse:", {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout,
      });
    } else {
      console.error("⚡ Erreur de configuration Axios:", error.message);
    }

    return Promise.reject(error);
  }
);

export default instance;
