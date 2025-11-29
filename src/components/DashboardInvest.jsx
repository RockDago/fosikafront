import React, { useState, useEffect, useCallback } from "react";
import API from "../config/axios";
import HeaderTeam from "./HeaderTeam";
import SidebarInvest from "./SidebarInvest";
import DashboardInvestView from "./views/DashboardInvestView";
import EnquetesView from "./views/EnquetesView";
import NotificationsView from "./views/NotificationsView";
import ProfileTeam from "./ProfileTeam";
import { teamUtils } from "../api/teamAPI";

const DashboardInvest = ({ onDeconnexion }) => {
  const [data, setData] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [investData, setInvestData] = useState(null);
  const [avatarUpdated, setAvatarUpdated] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Gestion de la session expirée
  const handleSessionExpired = useCallback(() => {
    teamUtils.logout("investigateur");
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
      const token = teamUtils.getAuthToken("investigateur");
      
      // Récupérer le type d'utilisateur depuis le stockage directement
      const userType = localStorage.getItem("user_type") || sessionStorage.getItem("user_type");

      if (token && userType === "investigateur") {
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

  // Charger les données de l'investigateur
  const fetchInvestData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const token = teamUtils.getAuthToken("investigateur");
      if (!token) {
        handleSessionExpired();
        return;
      }

      const response = await API.get("/investigateur/profile");
      
      if (response.data.success) {
        setInvestData(response.data.data);
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
      const timer = setTimeout(() => {
        fetchInvestData();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, avatarUpdated, fetchInvestData]);

  // Vérification périodique de session
  useEffect(() => {
    if (!isAuthenticated || !investData) return;

    const checkSession = async () => {
      try {
        await API.get("/investigateur/profile");
      } catch (error) {
        if (error.response?.status === 401) {
          handleSessionExpired();
        }
      }
    };

    const interval = setInterval(checkSession, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, investData, handleSessionExpired]);

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
    fetchInvestData();
  };

  const handleNavigateToProfile = () => {
    setCurrentView("profil");
  };

  const handleNavigateToNotifications = () => {
    setCurrentView("notifications");
  };

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      );
    }

    if (error && !investData) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg mb-2">Erreur</div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={fetchInvestData}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      );
    }

    const displayData = data || {};

    switch (currentView) {
      case "dashboard":
        return <DashboardInvestView data={displayData} />;
      case "enquetes":
        return <EnquetesView />;
      case "notifications":
        return <NotificationsView />;
      case "profil":
        return (
          <ProfileTeam
            onReturnToDashboard={() => setCurrentView("dashboard")}
            onAvatarUpdate={handleAvatarUpdate}
            userRole="investigateur"
            userData={investData}
          />
        );
      default:
        return <DashboardInvestView data={displayData} />;
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
              className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
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
        onNavigateToNotifications={handleNavigateToNotifications}
        onDeconnexion={onDeconnexion}
        userData={investData}
        onAvatarUpdate={handleHeaderAvatarUpdate}
        userRole="investigateur"
      />

      <div className="flex pt-20">
        <SidebarInvest
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

export default DashboardInvest;