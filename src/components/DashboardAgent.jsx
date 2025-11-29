import React, { useState, useEffect } from "react";
import API from "../config/axios";
import HeaderTeam from "./HeaderTeam";
import SidebarAgent from "./SidebarAgent";
import DashboardView from "./views/DashboardView"; // Changer DashboardAgentView par DashboardView
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
  const [headerAvatarUpdate, setHeaderAvatarUpdate] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationParams, setNotificationParams] = useState(null);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = () => {
      const token = teamUtils.getAuthToken("agent");

      if (token) {
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

  const fetchAgentData = async () => {
    try {
      setIsLoading(true);
      const response = await API.get("/agent/profile");

      if (response.data.success) {
        setAgentData(response.data.data);
        setData(response.data.data);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        handleSessionExpired();
      } else {
        console.error("Erreur lors du chargement des données:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionExpired = () => {
    // Nettoyer le stockage
    teamUtils.logout("agent");
    setIsAuthenticated(false);

    // Afficher une alerte
    setTimeout(() => {
      alert(
        "Votre session a expiré. Vous allez être redirigé vers la page de connexion."
      );
    }, 100);

    // Appeler la fonction de déconnexion parente
    if (onDeconnexion) {
      onDeconnexion();
    }
  };

  // Charger les données de l'agent si authentifié
  useEffect(() => {
    if (isAuthenticated) {
      fetchAgentData();
    }
  }, [isAuthenticated, avatarUpdated]);

  // Vérifier périodiquement la validité de la session
  useEffect(() => {
    if (!isAuthenticated) return;

    let interval;
    let timeoutId;

    const checkSession = async () => {
      try {
        const response = await API.get("/agent/profile");
        if (!response.data.success) {
          handleSessionExpired();
        }
      } catch (error) {
        if (error.response?.status === 401) {
          handleSessionExpired();
          if (interval) clearInterval(interval);
        } else if (error.response?.status === 429) {
          // Rate limiting - augmenter le délai
          console.warn(
            "⚠️ Rate limit détecté lors de la vérification de session"
          );
          if (interval) clearInterval(interval);
          // Attendre 60 secondes avant de réessayer
          timeoutId = setTimeout(() => {
            interval = setInterval(checkSession, 30000);
          }, 60000);
        }
      }
    };

    interval = setInterval(checkSession, 30000);

    return () => {
      if (interval) clearInterval(interval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isAuthenticated]);

  const handleAvatarUpdate = () => {
    // Trigger fetchAgentData by updating the trigger state
    setAvatarUpdated((prev) => prev + 1);
    setHeaderAvatarUpdate((prev) => prev + 1);
  };

  const handleHeaderAvatarUpdate = () => {
    setHeaderAvatarUpdate((prev) => prev + 1);
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

    const displayData = data || {};

    switch (currentView) {
      case "dashboard":
        return <DashboardView data={displayData} />; // Utiliser DashboardView
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
        return <DashboardView data={displayData} />; // Utiliser DashboardView
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
              Impossible d'accéder au tableau de bord. Le token
              d'authentification est manquant.
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
