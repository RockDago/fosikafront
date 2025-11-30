import instance from "../config/axios";

class TeamService {
  // Authentification
  async login(credentials) {
    try {
      console.log("🔐 Tentative de connexion team...", { 
        email: credentials.email, 
        remember: credentials.remember 
      });
      
      const response = await instance.post("/team/login", credentials);

      if (response.data.success && response.data.data?.token) {
        const token = response.data.data.token;
        const userData = response.data.data.user;
        const userRole = userData?.role?.toLowerCase() || 'agent';
        
        // Stockage double pour compatibilité
        if (credentials.remember) {
          localStorage.setItem("team_token", token);
          localStorage.setItem("user_type", userRole);
          localStorage.setItem(`${userRole}_token`, token);
          localStorage.setItem(`${userRole}_user`, JSON.stringify(userData));
        } else {
          sessionStorage.setItem("team_token", token);
          sessionStorage.setItem("user_type", userRole);
          sessionStorage.setItem(`${userRole}_token`, token);
          sessionStorage.setItem(`${userRole}_user`, JSON.stringify(userData));
        }

        // Mettre à jour le header Authorization
        instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        console.log(`✅ Token ${userRole} stocké avec succès`);
        return response.data;
      } else {
        throw new Error("Réponse de connexion invalide");
      }
    } catch (error) {
      console.error("❌ Erreur connexion team:", error);
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      const response = await instance.post("/team/logout");
      // Nettoyer uniquement les tokens team
      this.clearAuthTokens();
      return response.data;
    } catch (error) {
      console.error("❌ Erreur déconnexion team:", error);
      this.clearAuthTokens();
      throw this.handleError(error);
    }
  }

  async getCurrentUser() {
    try {
      const response = await instance.get("/team/user");
      return response.data;
    } catch (error) {
      console.error("❌ Erreur récupération utilisateur team:", error);
      throw this.handleError(error);
    }
  }

  async checkAuth() {
    try {
      const response = await instance.get("/team/check-auth");
      return response.data;
    } catch (error) {
      console.error("❌ Erreur vérification auth team:", error);
      throw this.handleError(error);
    }
  }

  // Rôles et départements
  async getRoles() {
    try {
      console.log("🎯 Tentative d'appel GET /team/roles");

      // Données mockées car l'endpoint n'existe pas encore
      const mockRoles = [
        { id: 1, name: "Administrateur", code: "admin" },
        { id: 2, name: "Agent de Suivi", code: "agent_suivi" },
        { id: 3, name: "Investigateur", code: "investigateur" },
      ];

      console.log("✅ Retour des rôles mockés:", mockRoles);
      return { success: true, data: mockRoles };
    } catch (error) {
      console.error("❌ Erreur récupération rôles:", error);
      // Retourner des données mockées en cas d'erreur
      const mockRoles = [
        { id: 1, name: "Administrateur", code: "admin" },
        { id: 2, name: "Agent de Suivi", code: "agent_suivi" },
        { id: 3, name: "Investigateur", code: "investigateur" },
      ];
      return { success: true, data: mockRoles };
    }
  }

  async getDepartements() {
    try {
      console.log("🏢 Tentative d'appel GET /team/departements");

      // Données mockées car l'endpoint n'existe pas encore
      const mockDepartements = [
        { id: 1, name: "DAAQ" },
        { id: 2, name: "DRSE" },
        { id: 3, name: "CAC" },
        { id: 4, name: "DAGI" },
      ];

      console.log("✅ Retour des départements mockés:", mockDepartements);
      return { success: true, data: mockDepartements };
    } catch (error) {
      console.error("❌ Erreur récupération départements:", error);
      // Retourner des données mockées en cas d'erreur
      const mockDepartements = [
        { id: 1, name: "DAAQ" },
        { id: 2, name: "DRSE" },
        { id: 3, name: "CAC" },
        { id: 4, name: "DAGI" },
      ];
      return { success: true, data: mockDepartements };
    }
  }

  async updateRolePermissions(roleId, permissionsData) {
    try {
      console.log(
        "🔑 Mise à jour permissions pour rôle:",
        roleId,
        permissionsData
      );
      // Simuler une mise à jour réussie (endpoint pas encore implémenté)
      return {
        success: true,
        message: "Permissions mises à jour avec succès",
        data: { roleId, ...permissionsData },
      };
    } catch (error) {
      console.error("❌ Erreur mise à jour permissions:", error);
      return {
        success: false,
        message: "Erreur lors de la mise à jour des permissions",
      };
    }
  }

  // ==================== MÉTHODES UTILISATEURS CORRIGÉES ====================

  // Méthode getAllUsers qui manquait
  async getAllUsers() {
    try {
      console.log("📋 Appel GET /team/users");
      const response = await instance.get("/team/users");
      console.log("✅ Réponse tous les utilisateurs:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur récupération tous les utilisateurs:", error);
      console.error("URL appelée:", error.config?.url);
      console.error("Status:", error.response?.status);
      throw this.handleError(error);
    }
  }

  // Alias pour compatibilité
  async getUsers() {
    return this.getAllUsers();
  }

  async getAgents() {
    try {
      console.log("📋 Appel GET /team/users/agents");
      const response = await instance.get("/team/users/agents");
      console.log("✅ Réponse agents:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur récupération agents:", error);
      // Fallback: utiliser getAllUsers et filtrer
      try {
        const allUsers = await this.getAllUsers();
        const agents = allUsers.data?.filter(user => 
          user.role?.toLowerCase().includes('agent') || 
          user.departement?.match(/DAAQ|DRSE/i)
        ) || [];
        return { success: true, data: agents };
      } catch (fallbackError) {
        throw this.handleError(error);
      }
    }
  }

  async getInvestigateurs() {
    try {
      console.log("🔍 Appel GET /team/users/investigateurs");
      const response = await instance.get("/team/users/investigateurs");
      console.log("✅ Réponse investigateurs:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur récupération investigateurs:", error);
      // Fallback: utiliser getAllUsers et filtrer
      try {
        const allUsers = await this.getAllUsers();
        const investigateurs = allUsers.data?.filter(user => 
          user.role?.toLowerCase().includes('investigateur') || 
          user.departement?.match(/CAC|DAGI/i)
        ) || [];
        return { success: true, data: investigateurs };
      } catch (fallbackError) {
        throw this.handleError(error);
      }
    }
  }

  async getAdministrateurs() {
    try {
      console.log("👑 Appel GET /team/users/administrateurs");
      const response = await instance.get("/team/users/administrateurs");
      console.log("✅ Réponse administrateurs:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur récupération administrateurs:", error);
      // Fallback: utiliser getAllUsers et filtrer
      try {
        const allUsers = await this.getAllUsers();
        const admins = allUsers.data?.filter(user => 
          user.role?.toLowerCase().includes('admin')
        ) || [];
        return { success: true, data: admins };
      } catch (fallbackError) {
        throw this.handleError(error);
      }
    }
  }

  async createUser(userData) {
    try {
      console.log("👤 Création utilisateur - Données reçues:", userData);

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

      if (!apiData.role_id || apiData.role_id === 0) {
        throw new Error("Le rôle est obligatoire");
      }

      console.log("📤 Envoi des données:", apiData);
      const createResponse = await instance.post("/team/users", apiData);
      console.log("✅ Utilisateur créé:", createResponse.data);
      return createResponse.data;
    } catch (error) {
      console.error("❌ Erreur création utilisateur:", error);
      console.error("📋 Détails erreur:", error.response?.data);
      if (error.response?.status === 422) throw error.response.data;
      throw this.handleError(error);
    }
  }

  async updateUser(id, userData) {
    try {
      console.log("✏️ Mise à jour utilisateur:", id, userData);

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

      if (!apiData.role_id || apiData.role_id === 0) {
        throw new Error("Le rôle est obligatoire");
      }

      console.log("📤 Envoi des données de mise à jour:", apiData);
      const response = await instance.put(`/team/users/${id}`, apiData);
      console.log("✅ Utilisateur modifié:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur modification utilisateur:", error);

      if (error.response?.status === 422) {
        throw error.response.data;
      }

      throw this.handleError(error);
    }
  }

  async deleteUser(id) {
    try {
      console.log("🗑️ Suppression utilisateur:", id);
      const response = await instance.delete(`/team/users/${id}`);
      console.log("✅ Utilisateur supprimé:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur suppression utilisateur:", error);
      throw this.handleError(error);
    }
  }

  async toggleStatus(id) {
    try {
      console.log("🔄 Changement statut utilisateur:", id);
      const response = await instance.post(`/team/users/${id}/toggle-status`);
      console.log("✅ Statut modifié:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur changement statut:", error);
      throw this.handleError(error);
    }
  }

  async resetPassword(id, passwordData) {
    try {
      console.log("🔑 Réinitialisation mot de passe:", id);
      const response = await instance.post(
        `/team/users/${id}/reset-password`,
        passwordData
      );
      console.log("✅ Mot de passe réinitialisé:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur réinitialisation mot de passe:", error);
      throw this.handleError(error);
    }
  }

  async getStats() {
    try {
      console.log("📊 Récupération statistiques");
      const response = await instance.get("/team/users/stats");
      console.log("✅ Statistiques:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur récupération stats:", error);
      throw this.handleError(error);
    }
  }

  // Méthodes supplémentaires
  async getUserById(id) {
    try {
      console.log("👤 Récupération utilisateur:", id);
      const response = await instance.get(`/team/users/${id}`);
      console.log("✅ Utilisateur récupéré:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur récupération utilisateur:", error);
      throw this.handleError(error);
    }
  }

  async searchUsers(query) {
    try {
      console.log("🔍 Recherche utilisateurs:", query);
      const response = await instance.get("/team/users/search", {
        params: { q: query },
      });
      console.log("✅ Résultats recherche:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur recherche utilisateurs:", error);
      throw this.handleError(error);
    }
  }

  async updateProfile(profileData) {
    try {
      console.log("👤 Mise à jour profil team:", profileData);
      const response = await instance.put("/team/profile", profileData);
      console.log("✅ Profil modifié:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur mise à jour profil:", error);
      throw this.handleError(error);
    }
  }

  async changePassword(passwordData) {
    try {
      console.log("🔑 Changement mot de passe team");
      const response = await instance.post(
        "/team/change-password",
        passwordData
      );
      console.log("✅ Mot de passe changé:", response.data);
      return response.data;
    } catch (error) {
      console.error("❌ Erreur changement mot de passe:", error);
      throw this.handleError(error);
    }
  }

  // ==================== MÉTHODES UTILITAIRES ====================

  getRoleCodeById(roleId) {
    const roleIdNum = parseInt(roleId);
    const roles = {
      1: "Admin",
      2: "Agent",
      3: "Investigateur",
    };
    const result = roles[roleIdNum] || "";
    console.log("🎯 getRoleCodeById:", {
      input: roleId,
      asNumber: roleIdNum,
      output: result,
    });
    return result;
  }

  // Nettoyer les tokens d'authentification
  clearAuthTokens() {
    localStorage.removeItem("team_token");
    sessionStorage.removeItem("team_token");
    localStorage.removeItem("user_type");
    sessionStorage.removeItem("user_type");
    delete instance.defaults.headers.common["Authorization"];
    console.log("✅ Tokens d'authentification nettoyés");
  }

  // Gestion centralisée des erreurs
  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      const errorObj = {
        message: data.message || "Une erreur est survenue",
        status,
        data,
      };
      console.error("❌ Erreur serveur:", errorObj);
      return errorObj;
    } else if (error.request) {
      const errorObj = {
        message: "Erreur de réseau - Impossible de contacter le serveur",
        status: 0,
      };
      console.error("❌ Erreur réseau:", errorObj);
      return errorObj;
    } else {
      const errorObj = {
        message: error.message || "Erreur inconnue",
        status: -1,
      };
      console.error("❌ Erreur configuration:", errorObj);
      return errorObj;
    }
  }

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated() {
    const token =
      localStorage.getItem("team_token") ||
      sessionStorage.getItem("team_token");
    const isAuth = !!token;
    console.log("🔐 Utilisateur authentifié:", isAuth);
    return isAuth;
  }

  // Récupérer le token
  getToken() {
    const token =
      localStorage.getItem("team_token") ||
      sessionStorage.getItem("team_token");
    console.log("🔑 Token récupéré:", !!token);
    return token;
  }

  // Initialiser l'authentification au chargement de l'application
  initializeAuth() {
    const token = this.getToken();
    if (token) {
      instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      console.log("✅ Authentification initialisée avec token");
    } else {
      console.log("ℹ️ Aucun token trouvé pour l'initialisation");
    }
  }
}

export const teamService = new TeamService();
export default TeamService;