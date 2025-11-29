import React, { useState, useEffect, useCallback } from "react";
import API from "../config/axios";
import HeaderTeam from "./HeaderTeam";
import SidebarAgent from "./SidebarAgent";
import DashboardView from "./views/DashboardView";
import ReportsView from "./views/ReportsView";
import ActivitesView from "./views/ActivitesView";
import ProfileTeam from "./ProfileTeam";
import NotificationsView from "./views/NotificationsView";
import { teamUtils } from "../api/teamAPI";

const DashboardAgent = ({ onDeconnexion }) => {
  const [data, setData] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [agentData, setAgentData] = useState(null);
  const [avatarUpdated, setAvatarUpdated] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [notificationParams, setNotificationParams] = useState(null);

  // Gestion de la session expirée
  const handleSessionExpired = useCallback(() => {
    teamUtils.logout("agent");
    setIsAuthenticated(false);
    
    setTimeout(() => {
      alert("Votre session a expiré. Vous allez être redirigé.");
    }, 100);

    if (onDeconnexion) {
      onDeconnexion();
    }
  }, [onDeconnexion]);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = () => {
      const token = teamUtils.getAuthToken("agent");
      const userType = teamUtils.getUserType();

      if (token && userType === "agent") {
        setIsAuthenticated(true);
        return true;
      } else {
        setIsAuthenticated(false);
        setIsLoading(false);
        return false;
      }
    };

    checkAuth();
  }, []);

  // Charger les données de l'agent
  const fetchAgentData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const token = teamUtils.getAuthToken("agent");
      if (!token) {
        handleSessionExpired();
        return;
      }

      const response = await API.get("/agent/profile");
      
      if (response.data.success) {
        setAgentData(response.data.data);
        setData(response.data.data);
      } else {
        throw new Error("Réponse invalide du serveur");
      }
    } catch (error) {
      if (error.response?.status === 401) {
        handleSessionExpired();
      } else if (error.message?.includes("INSUFFICIENT_RESOURCES") || error.code === 'ERR_NETWORK') {
        setError("Problème de connexion. Vérifiez votre réseau.");
      } else {
        setError("Erreur lors du chargement des données.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleSessionExpired]);

  // Charger les données si authentifié
  useEffect(() => {
    if (isAuthenticated) {
      fetchAgentData();
    }
  }, [isAuthenticated, avatarUpdated, fetchAgentData]);

  // Vérification périodique de session
  useEffect(() => {
    if (!isAuthenticated || !agentData) return;

    const checkSession = async () => {
      try {
        await API.get("/agent/profile");
      } catch (error) {
        if (error.response?.status === 401) {
          handleSessionExpired();
        }
      }
    };

    const interval = setInterval(checkSession, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, agentData, handleSessionExpired]);

  // Écouter les événements de déconnexion
  useEffect(() => {
    const handleTokenExpired = () => {
      handleSessionExpired();
    };

    window.addEventListener("tokenExpired", handleTokenExpired);
    
    return () => {
      window.removeEventListener("tokenExpired", handleTokenExpired);
    };
  }, [handleSessionExpired]);

  const handleAvatarUpdate = () => {
    setAvatarUpdated(prev => prev + 1);
  };

  const handleHeaderAvatarUpdate = () => {
    fetchAgentData();
  };

  const handleNavigateToProfile = () => {
    setCurrentView("profil");
  };

  const handleNavigateToNotifications = (params) => {
    setNotificationParams(params);
    setCurrentView("notifications");
  };

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (error && !agentData) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg mb-2">Erreur</div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={fetchAgentData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      );
    }

    const displayData = data || {};

    switch (currentView) {
      case "dashboard":
        return <DashboardView data={displayData} />;
      case "signalements":
        return <ReportsView data={displayData} />;
      case "rapports":
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Rapports</h2>
            <p className="text-gray-600">
              Module rapports en cours de développement...
            </p>
          </div>
        );
      case "notifications":
        return (
          <NotificationsView data={displayData} params={notificationParams} />
        );
      case "activites":
        return <ActivitesView data={displayData} />;
      case "profil":
        return (
          <ProfileTeam
            onReturnToDashboard={() => setCurrentView("dashboard")}
            onAvatarUpdate={handleAvatarUpdate}
            userRole="agent"
            userData={agentData}
          />
        );
      default:
        return <DashboardView data={displayData} />;
    }
  };

  // Si non authentifié, afficher un message d'erreur
  if (!isAuthenticated && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Erreur d'authentification
            </h2>
            <p className="text-gray-600 mb-4">
              Impossible d'accéder au tableau de bord.
            </p>
            <button
              onClick={() => (window.location.href = "/login")}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Se connecter à nouveau
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderTeam
        onNavigateToProfile={handleNavigateToProfile}
        onDeconnexion={onDeconnexion}
        userData={agentData}
        onAvatarUpdate={handleHeaderAvatarUpdate}
        userRole="agent"
        onNavigateToNotifications={handleNavigateToNotifications}
      />

      <div className="flex pt-20">
        <SidebarAgent
          currentView={currentView}
          onViewChange={setCurrentView}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? "ml-16" : "ml-64"
          }`}
        >
          <div className="p-6">{renderView()}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardAgent;