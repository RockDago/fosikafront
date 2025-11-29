import React, { useState, useEffect, useCallback } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import DashboardView from "./views/DashboardView";
import ReportsView from "./views/ReportsView";
import IndicateursView from "./views/IndicateursView";
import NotificationsView from "./views/NotificationsView";
import JournalView from "./views/JournalView";
import AdminProfile from "./AdminProfile";
import API, { clearAuthData } from "../config/axios";

// Import des nouvelles vues
import AnalyseView from "./views/AnalyseView";
import EquipeView from "./views/EquipeView";

const DashboardAdmin = ({ onDeconnexion }) => {
  const [data, setData] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [avatarUpdated, setAvatarUpdated] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSignalement, setSelectedSignalement] = useState(null);

  // Gestion de la session expirée
  const handleSessionExpired = useCallback(() => {
    console.log("🔐 Session admin expirée");
    clearAuthData();
    if (onDeconnexion) {
      onDeconnexion();
    }
  }, [onDeconnexion]);

  // Charger les données de l'admin
  const fetchAdminData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      console.log("🔄 Chargement des données admin...");

      const response = await API.get("/admin/profile");

      if (response.data.success) {
        setAdminData(response.data.data);
        setData(response.data.data);
        console.log("✅ Données admin chargées avec succès");
      } else {
        throw new Error("Réponse invalide du serveur");
      }
    } catch (error) {
      console.error("❌ Erreur chargement données admin:", error);

      if (error.response?.status === 401) {
        setError("Session expirée. Redirection...");
        handleSessionExpired();
      } else if (
        error.message?.includes("INSUFFICIENT_RESOURCES") ||
        error.code === "ERR_NETWORK"
      ) {
        setError("Problème de connexion. Vérifiez votre réseau.");
      } else {
        setError("Erreur lors du chargement des données.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleSessionExpired]);

  // Vérifier périodiquement la validité de la session
  useEffect(() => {
    if (!adminData) return;

    const checkSession = async () => {
      try {
        await API.get("/admin/check");
      } catch (error) {
        if (error.response?.status === 401) {
          handleSessionExpired();
        }
      }
    };

    const interval = setInterval(checkSession, 30000); // Toutes les 30 secondes
    return () => clearInterval(interval);
  }, [adminData, handleSessionExpired]);

  // Écouter les événements de déconnexion
  useEffect(() => {
    const handleTokenExpired = () => {
      handleSessionExpired();
    };

    const handleStorageChange = (e) => {
      if (e.key === "admin_token" && !e.newValue) {
        handleSessionExpired();
      }
    };

    window.addEventListener("tokenExpired", handleTokenExpired);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("tokenExpired", handleTokenExpired);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [handleSessionExpired]);

  // Chargement initial
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAdminData();
    }, 500);

    return () => clearTimeout(timer);
  }, [fetchAdminData]);

  const handleAvatarUpdate = () => {
    setAvatarUpdated((prev) => prev + 1);
  };

  const handleNavigateToAnalyse = (category) => {
    setSelectedCategory(category);
    setCurrentView("analyse");
  };

  const handleNavigateToSignalementDetails = (signalement) => {
    setSelectedSignalement(signalement);
    setCurrentView("reports");
  };

  const handleNavigateToProfile = () => setCurrentView("profil");
  const handleNavigateToNotifications = () => setCurrentView("notifications");

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (error && !adminData) {
      return (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg mb-2">Erreur</div>
          <p className="text-gray-700 mb-4">{error}</p>
          <button
            onClick={fetchAdminData}
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
        return (
          <DashboardView
            data={displayData}
            onNavigateToReports={() => setCurrentView("reports")}
            onNavigateToIndicateurs={() => setCurrentView("indicateurs")}
            onNavigateToAnalyse={handleNavigateToAnalyse}
            onNavigateToSignalementDetails={handleNavigateToSignalementDetails}
          />
        );
      case "reports":
        return (
          <ReportsView
            data={displayData}
            selectedSignalement={selectedSignalement}
          />
        );
      case "indicateurs":
        return <IndicateursView data={displayData} />;
      case "notifications":
        return <NotificationsView data={displayData} />;
      case "audit":
        return <JournalView data={displayData} />;
      case "profil":
        return (
          <AdminProfile
            onReturnToDashboard={() => setCurrentView("dashboard")}
            onAvatarUpdate={handleAvatarUpdate}
          />
        );
      case "analyse":
        return (
          <AnalyseView data={displayData} selectedCategory={selectedCategory} />
        );
      case "equipe":
        return <EquipeView data={displayData} />;
      default:
        return <DashboardView data={displayData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onNavigateToNotifications={handleNavigateToNotifications}
        onNavigateToProfile={handleNavigateToProfile}
        onDeconnexion={onDeconnexion}
        adminData={adminData}
        onAvatarUpdate={handleAvatarUpdate}
      />

      <div className="flex pt-20">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? "ml-20" : "ml-64"
          }`}
        >
          <div className="p-6">{renderView()}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardAdmin;
