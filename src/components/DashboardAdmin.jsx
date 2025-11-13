import React, { useState, useEffect } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import DashboardView from "./views/DashboardView";
import ReportsView from "./views/ReportsView";
import IndicateursView from "./views/IndicateursView";
import NotificationsView from "./views/NotificationsView";
import JournalView from "./views/JournalView";
import AdminProfile from "./AdminProfile";
import { useAppData } from "../hooks/useAppData";
import axios, { clearAuthData } from "../config/axios";

// Import des nouvelles vues
import AnalyseView from "./views/AnalyseView";
import RapportsView from "./views/RapportsView";
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
  const {
    data,
    currentView,
    setCurrentView,
    sidebarCollapsed,
    setSidebarCollapsed,
  } = useAppData();

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
        console.log("✅ Session valide vérifiée");
      } catch (error) {
        if (error.response?.status === 401) {
          console.log("🔒 Session expirée, déconnexion automatique...");
          handleSessionExpired();
        }
      }
    };

    // Vérifier la session toutes les 30 secondes
    const interval = setInterval(checkSession, 30000);
    setSessionCheckInterval(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [onDeconnexion]);

  // Écouter les événements de déconnexion depuis d'autres onglets
  useEffect(() => {
    const handleSessionInvalidated = () => {
      console.log("🔒 Déconnexion forcée depuis un autre onglet");
      handleSessionExpired();
    };

    const handleStorageChange = (e) => {
      if (e.key === "admin_token" && !e.newValue) {
        console.log("🔒 Token supprimé depuis un autre onglet");
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
  }, [onDeconnexion]);

  const handleSessionExpired = () => {
    // Nettoyer l'intervalle de vérification
    if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval);
    }

    // Afficher un message à l'utilisateur
    alert(
      "Votre session a expiré ou vous vous êtes connecté depuis un autre appareil. Vous allez être redirigé vers la page de connexion."
    );

    // Nettoyer le stockage
    clearAuthData();

    // Appeler la fonction de déconnexion
    onDeconnexion();
  };

  // Charger les données de l'admin
  useEffect(() => {
    fetchAdminData();
  }, [avatarUpdated]);

  const fetchAdminData = async () => {
    try {
      const token =
        localStorage.getItem("admin_token") ||
        sessionStorage.getItem("admin_token");
      if (!token) return;

      console.log("🔄 Dashboard: Fetching admin data...");
      const response = await fetch("http://localhost:8000/api/admin/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: "no-cache",
      });

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Dashboard: Admin data received:", data);
        if (data.success) {
          setAdminData(data.data);
        }
      } else if (response.status === 401) {
        // Session invalide
        handleSessionExpired();
      }
    } catch (error) {
      console.error("❌ Dashboard: Error loading admin data:", error);
      if (error.response?.status === 401) {
        handleSessionExpired();
      }
    }
  };

  const handleAvatarUpdate = () => {
    console.log("🔄 Dashboard: Avatar updated, refreshing data...");
    setAvatarUpdated((prev) => prev + 1);
    setHeaderAvatarUpdate((prev) => prev + 1);
  };

  const handleHeaderAvatarUpdate = () => {
    console.log("🔄 Dashboard: Header requested avatar refresh");
    setHeaderAvatarUpdate((prev) => prev + 1);
    fetchAdminData();
  };

  const handleHideToggle = () => {
    setSidebarHidden(!sidebarHidden);
  };

  // Navigation vers l'analyse par catégorie
  const handleNavigateToAnalyse = (category) => {
    setSelectedCategory(category);
    setCurrentView("analyse");
  };

  // Navigation vers les détails d'un signalement
  const handleNavigateToSignalementDetails = (signalement) => {
    setSelectedSignalement(signalement);
    setCurrentView("reports");
  };

  // Données par défaut pour toutes les vues
  const getDefaultData = () => {
    if (
      data &&
      data.signalements_anonymes &&
      data.signalements_anonymes.length > 0
    ) {
      return {
        ...data,
        // S'assurer que les données pour JournalView existent
        audit_signalements_recus:
          data.audit_signalements_recus || getDefaultAuditSignalements(),
        audit_log: data.audit_log || getDefaultAuditLog(),
      };
    }

    // Retourne des données complètes incluant les données pour JournalView
    return {
      signalements_anonymes: [
        {
          id: "SIG-ANON-001",
          date: "2024-01-15",
          nom_prenom: "Anonyme",
          categorie: "Corruption",
          region: "Analamanga",
          province: "Antananarivo",
          raison: "Détournement de fonds",
          type_signalement: "Anonyme",
          explication:
            "Signalement concernant des détournements de fonds publics dans un projet d'infrastructure",
        },
        {
          id: "SIG-ANON-002",
          date: "2024-01-14",
          nom_prenom: "Anonyme",
          categorie: "Fraude",
          region: "Vakinankaratra",
          province: "Antananarivo",
          raison: "Fraude",
          type_signalement: "Anonyme",
          explication: "Fraude aux marchés publics dans la région",
        },
      ],
      signalements_non_anonymes: [
        {
          id: "SIG-NON-001",
          date: "2024-01-15",
          nom_prenom: "Jean Rakoto",
          telephone: "+261 32 12 345 67",
          email: "jean.rakoto@email.mg",
          region: "Analamanga",
          province: "Antananarivo",
          raison: "Faux diplômes",
          type_signalement: "Non-Anonyme",
          explication: "Un collègue a utilisé un faux diplôme pour être promu",
        },
      ],
      notifications: [
        {
          id: 1,
          titre: "Nouveau signalement",
          message: "Un nouveau signalement anonyme a été reçu",
          date: "2024-01-15T10:30:00Z",
          lu: false,
        },
      ],
      // DONNÉES SPÉCIFIQUES POUR JOURNALVIEW - CORRECTION ICI
      audit_signalements_recus: getDefaultAuditSignalements(),
      audit_log: getDefaultAuditLog(),
      categories: [
        {
          id: 1,
          nom: "Diplômes & Éducation",
          type: "blue",
          total: 156,
          resolus: 89,
          enCours: 67,
          taux: 57,
        },
        {
          id: 2,
          nom: "Expérience Professionnelle",
          type: "orange",
          total: 234,
          resolus: 145,
          enCours: 89,
          taux: 62,
        },
      ],
      rapports: [
        {
          id: 1,
          titre: "Rapport Mensuel - Novembre 2024",
          categorie: "Diplômes",
          priorite: "haute",
          statut: "termine",
          date: "2024-11-30",
          auteur: "Admin",
          desc: "Analyse des signalements de novembre 2024",
        },
      ],
      equipe: [
        {
          id: 1,
          nom: "Marie Dubois",
          email: "marie.dubois@fosika.mg",
          role: "Analyste Senior",
          statut: "actif",
          specialites: ["Diplômes", "Expérience"],
          expertise: "senior",
          derniereActivite: "2024-11-10 14:30",
          casResolus: 156,
        },
      ],
    };
  };

  // Fonctions pour générer les données d'audit par défaut
  const getDefaultAuditSignalements = () => [
    {
      id: "SIG-AUDIT-001",
      timestamp: "2024-01-15T10:30:00Z",
      type_anonymat: "Anonyme",
      adresse_ip: "192.168.1.100",
      geolocalisation: "Antananarivo, Madagascar",
      identite: "Non renseigné",
      telephone: "",
      email: "",
      region_province: "Analamanga",
      type_fraude: "Corruption",
      statut: "Nouveau",
    },
    {
      id: "SIG-AUDIT-002",
      timestamp: "2024-01-15T11:15:00Z",
      type_anonymat: "Non-Anonyme",
      adresse_ip: "192.168.1.101",
      geolocalisation: "Antsirabe, Madagascar",
      identite: "Marie Randria",
      telephone: "+261 32 12 345 67",
      email: "marie.randria@email.mg",
      region_province: "Vakinankaratra",
      type_fraude: "Fraude aux marchés",
      statut: "En traitement",
    },
    {
      id: "SIG-AUDIT-003",
      timestamp: "2024-01-14T14:20:00Z",
      type_anonymat: "Anonyme",
      adresse_ip: "192.168.1.102",
      geolocalisation: "Toamasina, Madagascar",
      identite: "Non renseigné",
      telephone: "",
      email: "",
      region_province: "Atsinanana",
      type_fraude: "Népotisme",
      statut: "Traité",
    },
  ];

  const getDefaultAuditLog = () => [
    {
      id: "AUDIT-001",
      timestamp: "2024-01-15T09:00:00Z",
      utilisateur: "admin@fosika.mg",
      action: "Connexion",
      entite: "Système",
      statut: "Connexion réussie",
      ip: "192.168.1.50",
      details: "Connexion au tableau de bord administrateur",
    },
    {
      id: "AUDIT-002",
      timestamp: "2024-01-15T09:15:00Z",
      utilisateur: "admin@fosika.mg",
      action: "Consultation",
      entite: "Signalements",
      statut: "Succès",
      ip: "192.168.1.50",
      details: "Consultation de la liste des signalements",
    },
    {
      id: "AUDIT-003",
      timestamp: "2024-01-15T10:00:00Z",
      utilisateur: "analyste@fosika.mg",
      action: "Modification",
      entite: "Signalement SIG-001",
      statut: "Succès",
      ip: "192.168.1.51",
      details: "Mise à jour du statut du signalement",
    },
    {
      id: "AUDIT-004",
      timestamp: "2024-01-15T10:30:00Z",
      utilisateur: "utilisateur@externe.mg",
      action: "Tentative d'accès",
      entite: "Dashboard Admin",
      statut: "Accès refusé - permissions insuffisantes",
      ip: "192.168.1.100",
      details: "Tentative d'accès non autorisée au panel admin",
    },
    {
      id: "AUDIT-005",
      timestamp: "2024-01-15T11:00:00Z",
      utilisateur: "admin@fosika.mg",
      action: "Export",
      entite: "Rapports",
      statut: "Export CSV réussi",
      ip: "192.168.1.50",
      details: "Export des données de signalements au format CSV",
    },
  ];

  const renderView = () => {
    const displayData = getDefaultData();

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
      case "audit": // CORRECTION : Utiliser "audit" au lieu de "journal"
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
      case "rapports":
        return <RapportsView data={displayData} />;
      case "equipe":
        return <EquipeView data={displayData} />;
      case "utilisateurs":
      case "parametres":
      case "journal": // Garder pour compatibilité
        return <PlaceholderView viewName={currentView} />;
      default:
        return (
          <DashboardView
            data={displayData}
            onNavigateToReports={() => setCurrentView("reports")}
            onNavigateToIndicateurs={() => setCurrentView("indicateurs")}
            onNavigateToAnalyse={handleNavigateToAnalyse}
            onNavigateToSignalementDetails={handleNavigateToSignalementDetails}
          />
        );
    }
  };

  const handleNavigateToProfile = () => {
    setCurrentView("profil");
  };

  const handleNavigateToNotifications = () => {
    setCurrentView("notifications");
  };

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
          <div className="p-6">
            {/* Bannière de sécurité */}
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                  <span className="text-green-800 font-medium text-sm">
                    Session sécurisée - Protection contre les connexions
                    multiples activée
                  </span>
                </div>
                <div className="text-green-600 text-xs">
                  Vérification automatique toutes les 30 secondes
                </div>
              </div>
            </div>

            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardAdmin;
