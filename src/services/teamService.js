import instance from "../config/axios";

class TeamService {
  // ==================== AUTHENTIFICATION ====================
  async login(credentials) {
    try {
      const response = await instance.post("/team/login", credentials);

      if (response.data.success && response.data.data?.token) {
        const token = response.data.data.token;
        const userData = response.data.data.user;
        const userRole = userData?.role?.toLowerCase() || "agent";

        const storage = credentials.remember ? localStorage : sessionStorage;
        storage.setItem("team_token", token);
        storage.setItem("user_type", userRole);
        storage.setItem(`${userRole}_token`, token);
        storage.setItem(`${userRole}_user`, JSON.stringify(userData));

        instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        return response.data;
      } else {
        throw new Error("Réponse de connexion invalide");
      }
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      const response = await instance.post("/team/logout");
      this.clearAuthTokens();
      return response.data;
    } catch (error) {
      this.clearAuthTokens();
      throw this.handleError(error);
    }
  }

  async getCurrentUser() {
    try {
      const response = await instance.get("/team/user");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async checkAuth() {
    try {
      const response = await instance.get("/team/check-auth");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==================== RÔLES ET DÉPARTEMENTS (MOCK) ====================
  async getRoles() {
    const mockRoles = [
      { id: 1, name: "Administrateur", code: "admin" },
      { id: 2, name: "Agent de Suivi", code: "agent_suivi" },
      { id: 3, name: "Investigateur", code: "investigateur" },
    ];
    return { success: true, data: mockRoles };
  }

  async getDepartements() {
    const mockDepartements = [
      { id: 1, name: "DAAQ" },
      { id: 2, name: "DRSE" },
      { id: 3, name: "CAC" },
      { id: 4, name: "DAGI" },
    ];
    return { success: true, data: mockDepartements };
  }

  async updateRolePermissions(roleId, permissionsData) {
    return {
      success: true,
      message: "Permissions mises à jour avec succès",
      data: { roleId, ...permissionsData },
    };
  }

  // ==================== UTILISATEURS ====================
  async getAllUsers() {
    try {
      const response = await instance.get("/team/users");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUserById(id) {
    try {
      const response = await instance.get(`/team/users/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async createUser(userData) {
    try {
      const apiData = {
        nom_complet: userData.nom_complet?.trim() || "",
        email: userData.email?.trim() || "",
        telephone: userData.telephone?.replace(/\s/g, "") || "",
        adresse: userData.adresse?.trim() || "",
        departement: userData.departement || "",
        username: userData.username?.trim() || "",
        password: userData.password || "",
        password_confirmation: userData.password_confirmation || "",
        role_id: parseInt(userData.role_id) || 0,
        responsabilites: userData.responsabilites?.trim() || "",
        specialisations: Array.isArray(userData.specialisations)
          ? userData.specialisations
          : [],
        statut: Boolean(userData.statut),
      };

      if (!apiData.role_id) throw new Error("Le rôle est obligatoire");

      const response = await instance.post("/team/users", apiData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 422) throw error.response.data;
      throw this.handleError(error);
    }
  }

  async updateUser(id, userData) {
    try {
      const apiData = {
        nom_complet: userData.nom_complet?.trim() || "",
        email: userData.email?.trim() || "",
        telephone: userData.telephone?.replace(/\s/g, "") || "",
        adresse: userData.adresse?.trim() || "",
        departement: userData.departement || "",
        username: userData.username?.trim() || "",
        role_id: parseInt(userData.role_id) || 0,
        responsabilites: userData.responsabilites?.trim() || "",
        specialisations: Array.isArray(userData.specialisations)
          ? userData.specialisations
          : [],
        statut: Boolean(userData.statut),
      };

      if (!apiData.role_id) throw new Error("Le rôle est obligatoire");

      const response = await instance.put(`/team/users/${id}`, apiData);
      return response.data;
    } catch (error) {
      if (error.response?.status === 422) throw error.response.data;
      throw this.handleError(error);
    }
  }

  async deleteUser(id) {
    try {
      const response = await instance.delete(`/team/users/${id}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async toggleStatus(id) {
    try {
      const response = await instance.post(`/team/users/${id}/toggle-status`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async resetPassword(id, passwordData) {
    try {
      const response = await instance.post(
        `/team/users/${id}/reset-password`,
        passwordData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getStats() {
    try {
      const response = await instance.get("/team/users/stats");
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==================== PROFIL ET MOT DE PASSE ====================
  async updateProfile(profileData) {
    try {
      const response = await instance.put("/team/profile", profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async changePassword(passwordData) {
    try {
      const response = await instance.post(
        "/team/change-password",
        passwordData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==================== MÉTHODES UTILITAIRES ====================
  clearAuthTokens() {
    const keys = [
      "team_token",
      "team_user",
      "user_type",
      "agent_token",
      "agent_user",
      "investigateur_token",
      "investigateur_user",
      "admin_token",
      "admin_user",
    ];
    keys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    delete instance.defaults.headers.common["Authorization"];
  }

  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      const url = error.config?.url || "";
      let message = data.message || "Une erreur est survenue";

      if (status === 401) {
        message = url.includes("/login")
          ? data.message || "Email ou mot de passe incorrect"
          : "Session expirée. Veuillez vous reconnecter.";
      } else if (status === 403) {
        message = data.message || "Accès refusé";
      }

      return { message, status, data };
    } else if (error.request) {
      return {
        message: "Erreur de réseau - Impossible de contacter le serveur",
        status: 0,
      };
    } else {
      return { message: error.message || "Erreur inconnue", status: -1 };
    }
  }

  isAuthenticated() {
    const token =
      localStorage.getItem("team_token") ||
      sessionStorage.getItem("team_token");
    return !!token;
  }

  getToken() {
    return (
      localStorage.getItem("team_token") || sessionStorage.getItem("team_token")
    );
  }

  initializeAuth() {
    const token = this.getToken();
    if (token) {
      instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }
}

export const teamService = new TeamService();
export default TeamService;
