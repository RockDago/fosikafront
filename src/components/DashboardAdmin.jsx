import React, { useState, useEffect, useCallback } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import DashboardView from "./views/DashboardView";
import ReportsView from "./views/ReportsView";
import IndicateursView from "./views/IndicateursView";
import NotificationsView from "./views/NotificationsView";
import JournalView from "./views/JournalView";
import AdminProfile from "./AdminProfile";
import axios, { clearAuthData } from "../config/axios"; // ✅ Import d'Axios configuré

// Import des nouvelles vues
import AnalyseView from "./views/AnalyseView";

import EquipeView from "./views/EquipeView";

const PlaceholderView = ({ viewName }) => (
  <div className="space-y-6">
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 capitalize">
        {viewName}
      </h1>
      <p className="text-gray-600">Vue en cours de développement</p>
    </div>
    <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
      <p className="text-gray-500">
        Cette fonctionnalité sera disponible prochainement
      </p>
    </div>
  </div>
);

const DashboardAdmin = ({ onDeconnexion }) => {
  // États pour remplacer useAppData
  const [data, setData] = useState(null);
  const [currentView, setCurrentView] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const [adminData, setAdminData] = useState(null);
  const [avatarUpdated, setAvatarUpdated] = useState(0);
  const [headerAvatarUpdate, setHeaderAvatarUpdate] = useState(0);
  const [sidebarHidden, setSidebarHidden] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSignalement, setSelectedSignalement] = useState(null);
  const [sessionCheckInterval, setSessionCheckInterval] = useState(null);

  // Vérifier périodiquement la validité de la session
  useEffect(() => {
    const checkSession = async () => {
      try {
        await axios.get("/admin/check");
      } catch (error) {
        if (error.response?.status === 401) {
          handleSessionExpired();
        }
      }
    };

    const interval = setInterval(checkSession, 30000);
    setSessionCheckInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [onDeconnexion]);

  // Écouter les événements de déconnexion depuis d'autres onglets
  useEffect(() => {
    const handleSessionInvalidated = () => {
      handleSessionExpired();
    };

    const handleStorageChange = (e) => {
      if (e.key === "admin_token" && !e.newValue) {
        handleSessionExpired();
      }
    };

    window.addEventListener("sessionInvalidated", handleSessionInvalidated);
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(
        "sessionInvalidated",
        handleSessionInvalidated
      );
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleSessionExpired = useCallback(() => {
    if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval);
    }
    alert(
      "Votre session a expiré ou vous vous êtes connecté depuis un autre appareil. Vous allez être redirigé vers la page de connexion."
    );
    clearAuthData(); // Utilise la fonction importée
    onDeconnexion();
  }, [sessionCheckInterval, onDeconnexion]);

  // Charger les données de l'admin
  const fetchAdminData = useCallback(async () => {
    try {
      const token =
        localStorage.getItem("admin_token") ||
        sessionStorage.getItem("admin_token");
      if (!token) return;

      // ✅ UTILISATION D'AXIOS AU LIEU DE FETCH
      const response = await axios.get("/admin/profile");

      if (response.data.success) {
        setAdminData(response.data.data);
        setData(response.data.data); // mettre aussi dans "data"
      }
    } catch (error) {
      if (error.response?.status === 401) {
        handleSessionExpired();
      }
    }
  }, [handleSessionExpired]);

  useEffect(() => {
    fetchAdminData();
  }, [avatarUpdated, fetchAdminData]);

  const handleAvatarUpdate = () => {
    setAvatarUpdated((prev) => prev + 1);
    setHeaderAvatarUpdate((prev) => prev + 1);
  };

  const handleHeaderAvatarUpdate = () => {
    setHeaderAvatarUpdate((prev) => prev + 1);
    fetchAdminData();
  };

  const handleHideToggle = () => {
    setSidebarHidden(!sidebarHidden);
  };

  const handleNavigateToAnalyse = (category) => {
    setSelectedCategory(category);
    setCurrentView("analyse");
  };

  const handleNavigateToSignalementDetails = (signalement) => {
    setSelectedSignalement(signalement);
    setCurrentView("reports");
  };

  const renderView = () => {
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

  const handleNavigateToProfile = () => setCurrentView("profil");
  const handleNavigateToNotifications = () => setCurrentView("notifications");

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        notifications={data?.notifications || []}
        onNavigateToNotifications={handleNavigateToNotifications}
        onNavigateToProfile={handleNavigateToProfile}
        onDeconnexion={onDeconnexion}
        adminData={adminData}
        onAvatarUpdate={headerAvatarUpdate}
      />

      <div className="flex pt-20">
        <Sidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          isHidden={sidebarHidden}
          onHideToggle={handleHideToggle}
        />

        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarHidden ? "ml-0" : sidebarCollapsed ? "ml-20" : "ml-64"
          }`}
        >
          <div className="p-6">{renderView()}</div>
        </main>
      </div>
    </div>
  );
};

export default DashboardAdmin;
