// utils/authUtils.js

export const authUtils = {
  // Sauvegarde token + type user (admin)
  saveToken: (token, remember = false) => {
    if (remember) {
      localStorage.setItem("admin_token", token);
      localStorage.setItem("user_type", "admin");
    } else {
      sessionStorage.setItem("admin_token", token);
      sessionStorage.setItem("user_type", "admin");
    }
  },

  // Récupère le token depuis localStorage ou sessionStorage
  getToken: () => {
    return (
      localStorage.getItem("admin_token") ||
      sessionStorage.getItem("admin_token") ||
      null
    );
  },

  // Vérifie l'authentification
  isAuthenticated: () => {
    const token =
      localStorage.getItem("admin_token") ||
      sessionStorage.getItem("admin_token");

    const userType =
      localStorage.getItem("user_type") || sessionStorage.getItem("user_type");

    // doit être admin + avoir un token
    return !!token && userType === "admin";
  },

  // Déconnexion propre
  logout: () => {
    localStorage.removeItem("admin_token");
    sessionStorage.removeItem("admin_token");

    localStorage.removeItem("user_type");
    sessionStorage.removeItem("user_type");

    window.location.href = "/login";
  },

  // Indique le type de stockage utilisé (utile pour remember-me)
  getStorageType: () => {
    if (localStorage.getItem("admin_token")) return "local";
    if (sessionStorage.getItem("admin_token")) return "session";
    return null;
  },
};
