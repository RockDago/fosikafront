// DashboardInvest.jsx
import React, { useState, useEffect } from "react";
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
      console.log(
        "🔐 Dashboard Investigateur - Token check:",
        token ? "PRESENT" : "ABSENT"
      );
      console.log("📦 Storage state:", {
        investigateur_token:
          localStorage.getItem("investigateur_token") ||
          sessionStorage.getItem("investigateur_token"),
        user_type:
          localStorage.getItem("user_type") ||
          sessionStorage.getItem("user_type"),
      });

      if (token) {
        console.log("✅ Token found, user is authenticated");
        setIsAuthenticated(true);
        return true;
      } else {
        console.log("❌ No token found");
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

    const checkSession = async () => {
      const token = teamUtils.getAuthToken("investigateur");
      if (!token) {
        console.log("🔒 Token manquant pendant la vérification");
        handleSessionExpired();
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:8000/api/investigateur/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
            },
          }
        );

        if (!response.ok) {
          if (response.status === 401) {
            console.log("🔒 Session expirée (401)");
            handleSessionExpired();
          }
        }
      } catch (error) {
        console.error("❌ Erreur vérification session:", error);
      }
    };

    const interval = setInterval(checkSession, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const fetchInvestData = async () => {
    const token = teamUtils.getAuthToken("investigateur");
    if (!token) {
      console.error("❌ Dashboard Investigateur: No token available for fetch");
      handleSessionExpired();
      return;
    }

    try {
      setIsLoading(true);
      console.log("🔄 Dashboard Investigateur: Fetching investigateur data...");

      const response = await fetch(
        "http://localhost:8000/api/investigateur/profile",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log(
          "✅ Dashboard Investigateur: Investigateur data received:",
          result
        );

        if (result.success) {
          setInvestData(result.data);
          setData(result.data);
        } else {
          console.error("❌ API returned error:", result.message);
        }
      } else if (response.status === 401) {
        console.log("🔒 Session expirée lors du fetch");
        handleSessionExpired();
      } else {
        console.error("❌ HTTP Error:", response.status);
      }
    } catch (error) {
      console.error("❌ Dashboard Investigateur: Network error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionExpired = () => {
    console.log("🚨 Session expirée - Déconnexion...");

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
    console.log("🔄 Avatar updated in ProfileTeam");
    setAvatarUpdated((prev) => prev + 1);
    setHeaderAvatarUpdate((prev) => prev + 1);
  };

  const handleHeaderAvatarUpdate = () => {
    console.log("🔄 Avatar updated in Header");
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
    console.log("📍 Navigation vers le profil");
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
