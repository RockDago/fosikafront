import instance from "../config/axios";

class TeamService {
  // ==================== AUTHENTIFICATION ====================
  async login(credentials) {
    try {
      console.log('TeamService: Tentative de connexion...');
      const response = await instance.post("/team/login", credentials);

      if (response.data.success && response.data.data?.token) {
        const token = response.data.data.token;
        const userData = response.data.data.user;
        const userRole = userData?.role?.toLowerCase() || "agent";

        console.log(`TeamService: Connexion réussie pour ${userRole}`);

        // Nettoyer d'abord les anciens tokens
        this.clearAuthTokens();

        // Stockage cohérent avec les autres services
        const storage = credentials.remember ? localStorage : sessionStorage;
        
        // Clés spécifiques au rôle
        storage.setItem(`${userRole}_token`, token);
        storage.setItem(`${userRole}_user`, JSON.stringify(userData));
        
        // Clés génériques pour compatibilité
        storage.setItem("team_token", token);
        storage.setItem("team_user", JSON.stringify(userData));
        storage.setItem("user_type", userRole);

        instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        console.log('TeamService: Données d\'auth stockées avec succès');
        return response.data;
      } else {
        console.error('TeamService: Réponse de connexion invalide', response.data);
        throw new Error("Réponse de connexion invalide");
      }
    } catch (error) {
      console.error('TeamService: Erreur de connexion', error);
      throw this.handleError(error);
    }
  }

  async logout() {
    try {
      console.log('TeamService: Déconnexion en cours...');
      const response = await instance.post("/team/logout");
      this.clearAuthTokens();
      console.log('TeamService: Déconnexion réussie');
      return response.data;
    } catch (error) {
      console.error('TeamService: Erreur lors de la déconnexion', error);
      this.clearAuthTokens();
      throw this.handleError(error);
    }
  }

  async getCurrentUser() {
    try {
      const userType = this.getUserType();
      if (!userType) {
        throw new Error("Aucun type d'utilisateur détecté");
      }
      
      const response = await instance.get(`/${userType}/user`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async checkAuth() {
    try {
      const userType = this.getUserType();
      if (!userType) {
        return { success: false, message: "Non authentifié" };
      }
      
      const response = await instance.get(`/${userType}/check-auth`);
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
      { id: 4, name: "DAJ" },
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
      const userType = this.getUserType();
      if (!userType) {
        throw new Error("Impossible de déterminer le type d'utilisateur");
      }
      
      const response = await instance.put(`/${userType}/profile`, profileData);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async changePassword(passwordData) {
    try {
      const userType = this.getUserType();
      if (!userType) {
        throw new Error("Impossible de déterminer le type d'utilisateur");
      }
      
      const response = await instance.post(
        `/${userType}/change-password`,
        passwordData
      );
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getProfile() {
    try {
      const userType = this.getUserType();
      if (!userType) {
        throw new Error("Impossible de déterminer le type d'utilisateur");
      }
      
      const response = await instance.get(`/${userType}/profile`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // ==================== MÉTHODES UTILITAIRES AMÉLIORÉES ====================
  clearAuthTokens() {
    console.log('TeamService: Nettoyage des tokens...');
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
    console.log('TeamService: Tokens nettoyés');
  }

  getAuthToken() {
    const userType = this.getUserType();
    if (userType) {
      // Priorité aux clés spécifiques au rôle
      const token = 
        localStorage.getItem(`${userType}_token`) ||
        sessionStorage.getItem(`${userType}_token`) ||
        localStorage.getItem("team_token") ||
        sessionStorage.getItem("team_token");
      
      console.log(`TeamService: Token récupéré pour ${userType}:`, token ? 'présent' : 'manquant');
      return token;
    }
    
    // Fallback
    const token = localStorage.getItem("team_token") || sessionStorage.getItem("team_token");
    console.log('TeamService: Token générique:', token ? 'présent' : 'manquant');
    return token;
  }

  getAuthUser() {
    const userType = this.getUserType();
    if (userType) {
      const userData =
        localStorage.getItem(`${userType}_user`) ||
        sessionStorage.getItem(`${userType}_user`) ||
        localStorage.getItem("team_user") ||
        sessionStorage.getItem("team_user");

      const user = userData ? JSON.parse(userData) : null;
      console.log(`TeamService: Utilisateur récupéré pour ${userType}:`, user ? 'présent' : 'manquant');
      return user;
    }
    
    const userData = localStorage.getItem("team_user") || sessionStorage.getItem("team_user");
    const user = userData ? JSON.parse(userData) : null;
    console.log('TeamService: Utilisateur générique:', user ? 'présent' : 'manquant');
    return user;
  }

  getUserType() {
    const userType = 
      localStorage.getItem("user_type") ||
      sessionStorage.getItem("user_type") ||
      // Fallback basé sur les tokens existants
      (localStorage.getItem("agent_token") || sessionStorage.getItem("agent_token") ? "agent" : null) ||
      (localStorage.getItem("investigateur_token") || sessionStorage.getItem("investigateur_token") ? "investigateur" : null) ||
      (localStorage.getItem("admin_token") || sessionStorage.getItem("admin_token") ? "admin" : null);

    console.log('TeamService: Type d\'utilisateur détecté:', userType);
    return userType;
  }

  handleError(error) {
    console.error('TeamService: Gestion d\'erreur', error);
    
    if (error.response) {
      const { status, data } = error.response;
      const url = error.config?.url || "";
      let message = data.message || "Une erreur est survenue";

      if (status === 401) {
        message = url.includes("/login")
          ? data.message || "Email ou mot de passe incorrect"
          : "Session expirée. Veuillez vous reconnecter.";
        
        // Déconnexion automatique pour les erreurs 401 (sauf login)
        if (!url.includes("/login")) {
          console.log('TeamService: Déconnexion automatique suite à 401');
          this.clearAuthTokens();
        }
      } else if (status === 403) {
        message = data.message || "Accès refusé";
      } else if (status === 422) {
        message = data.message || "Données invalides";
      } else if (status === 500) {
        message = "Erreur interne du serveur. Veuillez réessayer.";
      }

      return { 
        message, 
        status, 
        data,
        isNetworkError: false
      };
    } else if (error.request) {
      return {
        message: "Erreur de réseau - Impossible de contacter le serveur",
        status: 0,
        isNetworkError: true
      };
    } else {
      return { 
        message: error.message || "Erreur inconnue", 
        status: -1,
        isNetworkError: false
      };
    }
  }

  isAuthenticated() {
    const token = this.getAuthToken();
    const user = this.getAuthUser();
    const isAuth = !!(token && user);
    console.log('TeamService: Authentifié:', isAuth);
    return isAuth;
  }

  initializeAuth() {
    console.log('TeamService: Initialisation de l\'auth...');
    const token = this.getAuthToken();
    const userType = this.getUserType();
    
    if (token && userType) {
      instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      console.log(`TeamService: Auth initialisée pour ${userType}`);
      return { token, userType, user: this.getAuthUser() };
    }
    
    console.log('TeamService: Aucune auth à initialiser');
    return null;
  }

  // Nouvelle méthode pour rafraîchir le token
  async refreshToken() {
    try {
      const userType = this.getUserType();
      if (!userType) {
        throw new Error("Impossible de rafraîchir le token: type d'utilisateur inconnu");
      }

      const response = await instance.post(`/${userType}/refresh-token`);
      
      if (response.data.success && response.data.data?.token) {
        const token = response.data.data.token;
        const userData = response.data.data.user;
        const currentUser = this.getAuthUser();
        const rememberMe = !!localStorage.getItem(`${userType}_token`) || !!localStorage.getItem("team_token");
        
        // Mettre à jour le stockage
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem(`${userType}_token`, token);
        storage.setItem("team_token", token);
        if (userData) {
          storage.setItem(`${userType}_user`, JSON.stringify(userData));
          storage.setItem("team_user", JSON.stringify(userData));
        }
        
        instance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        
        console.log('TeamService: Token rafraîchi avec succès');
      }
      
      return response.data;
    } catch (error) {
      console.error('TeamService: Erreur lors du rafraîchissement du token', error);
      throw this.handleError(error);
    }
  }
}

export const teamService = new TeamService();
export default TeamService;