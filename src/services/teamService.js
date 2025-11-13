import axios from "../config/axios";

export const teamService = {
  // Récupérer tous les agents avec gestion d'erreur améliorée
  getAgents: async () => {
    try {
      console.log("Tentative de récupération des agents...");
      const response = await axios.get("/team/agents");
      console.log("Réponse agents:", response);
      return response.data;
    } catch (error) {
      console.error("Erreur détaillée getAgents:", {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      // Retourner une structure cohérente même en cas d'erreur
      return { 
        success: false, 
        error: error.response?.data?.message || "Erreur de connexion",
        data: [] 
      };
    }
  },

  // Récupérer tous les investigateurs avec gestion d'erreur améliorée
  getInvestigateurs: async () => {
    try {
      console.log("Tentative de récupération des investigateurs...");
      const response = await axios.get("/team/investigateurs");
      console.log("Réponse investigateurs:", response);
      return response.data;
    } catch (error) {
      console.error("Erreur détaillée getInvestigateurs:", {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      return { 
        success: false, 
        error: error.response?.data?.message || "Erreur de connexion",
        data: [] 
      };
    }
  },

  // ... autres méthodes avec la même gestion d'erreur
  createUser: async (userData) => {
    try {
      const response = await axios.post("/team/users", userData);
      return response.data;
    } catch (error) {
      console.error("Erreur création utilisateur:", error.response?.data);
      throw error;
    }
  },

  updateUser: async (id, userData) => {
    try {
      const response = await axios.put(`/team/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error("Erreur modification utilisateur:", error.response?.data);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      const response = await axios.delete(`/team/users/${id}`);
      return response.data;
    } catch (error) {
      console.error("Erreur suppression utilisateur:", error.response?.data);
      throw error;
    }
  },

  toggleStatus: async (id) => {
    try {
      const response = await axios.post(`/team/users/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      console.error("Erreur changement statut:", error.response?.data);
      throw error;
    }
  },

  resetPassword: async (id, passwordData) => {
    try {
      const response = await axios.post(
        `/team/users/${id}/reset-password`,
        passwordData
      );
      return response.data;
    } catch (error) {
      console.error("Erreur réinitialisation mot de passe:", error.response?.data);
      throw error;
    }
  },

  // Méthodes d'authentification existantes...
  login: async (credentials) => {
    try {
      const response = await axios.post("/team/login", credentials);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: async () => {
    try {
      const response = await axios.get("/team/user");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  checkAuth: async () => {
    try {
      const response = await axios.get("/team/check");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      const response = await axios.post("/team/logout");
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};