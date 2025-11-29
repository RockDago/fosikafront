// DashboardInvest.jsx
import React, { useState, useEffect } from "react";
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
  const [headerAvatarUpdate, setHeaderAvatarUpdate] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier l'authentification au chargement
  useEffect(() => {
    const checkAuth = () => {
      const token = teamUtils.getAuthToken("investigateur");

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

  // Charger les données de l'investigateur si authentifié
  useEffect(() => {
    if (isAuthenticated) {
      fetchInvestData();
    }
  }, [isAuthenticated, avatarUpdated]);

  // Vérifier périodiquement la validité de la session
  useEffect(() => {
    if (!isAuthenticated) return;

    let interval;
    let timeoutId;

    const checkSession = async () => {
      try {
        const response = await API.get("/investigateur/profile");
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

  const fetchInvestData = async () => {
    const token = teamUtils.getAuthToken("investigateur");
    if (!token) {
      handleSessionExpired();
      return;
    }

    try {
      setIsLoading(true);

      const response = await API.get("/investigateur/profile");

      if (response.data.success) {
        setInvestData(response.data.data);
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
    teamUtils.logout("investigateur");
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

  const handleAvatarUpdate = () => {
    setAvatarUpdated((prev) => prev + 1);
    setHeaderAvatarUpdate((prev) => prev + 1);
  };

  const handleHeaderAvatarUpdate = () => {
    setHeaderAvatarUpdate((prev) => prev + 1);
    fetchInvestData();
  };

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
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

  const handleNavigateToProfile = () => {
    setCurrentView("profil");
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
        onDeconnexion={onDeconnexion}
        userData={investData}
        onAvatarUpdate={headerAvatarUpdate}
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
