import React, { useState, useEffect } from "react";
import {
  Bell,
  ChevronDown,
  X,
  FileText,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import API from "../config/axios";
import LogoFosika from "../assets/images/logo fosika.png";

const Header = ({
  onNavigateToNotifications,
  onDeconnexion,
  onNavigateToProfile,
  onNavigateToSettings,
  adminData,
  onAvatarUpdate,
}) => {
  const [notificationDropdownOpen, setNotificationDropdownOpen] =
    useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [localAdminData, setLocalAdminData] = useState(null);
  const [avatarVersion, setAvatarVersion] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [avatarErrors, setAvatarErrors] = useState({});
  const [isLoadingAdminData, setIsLoadingAdminData] = useState(false);
  const [showAvatar, setShowAvatar] = useState(false); // ✅ NOUVEL ÉTAT

  useEffect(() => {
    fetchAdminData();
  }, [adminData, avatarVersion]);

  useEffect(() => {
    fetchRecentNotifications();
    const interval = setInterval(fetchRecentNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchRecentNotifications = async () => {
    try {
      const token =
        localStorage.getItem("admin_token") ||
        sessionStorage.getItem("admin_token");
      if (!token) return;

      const response = await API.get("/notifications/recent", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        setRecentNotifications(response.data.data || []);
        setUnreadCount(
          response.data.data?.filter((n) => n.status === "active").length || 0
        );
      }
    } catch (error) {
      console.error("Erreur chargement notifications récentes:", error);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      const token =
        localStorage.getItem("admin_token") ||
        sessionStorage.getItem("admin_token");
      const response = await API.post(
        `/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setRecentNotifications((prev) =>
          prev.map((notif) =>
            notif.id === notificationId ? { ...notif, status: "read" } : notif
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error("Erreur marquer comme lu:", error);
    }
  };

  const fetchAdminData = async () => {
    if (isLoadingAdminData) return;

    try {
      setIsLoadingAdminData(true);
      const token =
        localStorage.getItem("admin_token") ||
        sessionStorage.getItem("admin_token");
      if (!token) return;

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await API.get("/admin/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 200) {
        const data = response.data;
        if (data.success) {
          setLocalAdminData(data.data);

          // ✅ VÉRIFIER SI L'AVATAR EXISTE ET EST ACCESSIBLE
          if (data.data?.avatar) {
            const avatarUrl = getAvatarUrl(data.data.avatar);
            testAvatarLoad(avatarUrl);
          } else {
            setShowAvatar(false);
          }
        }
      }
    } catch (error) {
      if (error.response?.status === 429) {
        console.warn("Trop de requêtes - Attendre avant de réessayer");
      } else {
        console.error("Error loading admin data:", error);
      }
    } finally {
      setIsLoadingAdminData(false);
    }
  };

  // ✅ FONCTION POUR TESTER LE CHARGEMENT DE L'AVATAR
  const testAvatarLoad = (avatarUrl) => {
    const img = new Image();
    img.onload = () => {
      setShowAvatar(true);
      setAvatarErrors((prev) => ({ ...prev, "header-avatar": false }));
    };
    img.onerror = () => {
      setShowAvatar(false);
      setAvatarErrors((prev) => ({ ...prev, "header-avatar": true }));
    };
    img.src = avatarUrl;
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "nouveau_signalement":
        return <FileText className="w-4 h-4 text-blue-600" />;
      case "doublon_detecte":
        return <AlertTriangle className="w-4 h-4 text-orange-600" />;
      case "signalement_urgent":
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case "statut_modifie":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Bell className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);

      if (diffMins < 1) return "À l'instant";
      if (diffMins < 60) return `Il y a ${diffMins} min`;
      if (diffHours < 24) return `Il y a ${diffHours} h`;
      return date.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
      });
    } catch (e) {
      return timestamp;
    }
  };

  const getInitials = () => {
    const data = localAdminData || adminData;
    if (!data) return "A";

    if (data.first_name && data.last_name) {
      return `${data.first_name[0]}${data.last_name[0]}`.toUpperCase();
    }
    return data.name ? data.name.substring(0, 2).toUpperCase() : "A";
  };

  const getAvatarUrl = (avatarPath = null) => {
    const data = localAdminData || adminData;
    const avatar = avatarPath || data?.avatar;

    if (!avatar) return null;

    let avatarUrl = avatar;

    if (avatarUrl.includes("storage/avatars/")) {
      const fileName = avatarUrl.split("/").pop();
      avatarUrl = `/api/file/avatar/${fileName}`;
    }

    if (!avatarUrl.startsWith("http")) {
      const baseURL = process.env.REACT_APP_API_URL || "http://localhost:8000";
      avatarUrl = `${baseURL}${
        avatarUrl.startsWith("/") ? "" : "/"
      }${avatarUrl}`;
    }

    const separator = avatarUrl.includes("?") ? "&" : "?";
    return `${avatarUrl}${separator}v=${avatarVersion}&t=${Date.now()}`;
  };

  // ✅ Gestion silencieuse des erreurs
  const handleAvatarError = (e) => {
    setShowAvatar(false);
    setAvatarErrors((prev) => ({ ...prev, "header-avatar": true }));
  };

  useEffect(() => {
    setAvatarErrors({});
  }, [localAdminData, adminData]);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    onDeconnexion();
  };

  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };

  const handleProfileClick = () => {
    setUserDropdownOpen(false);
    if (onNavigateToProfile) {
      onNavigateToProfile();
    }
  };

  const handleSettingsClick = () => {
    setUserDropdownOpen(false);
    if (onNavigateToSettings) {
      onNavigateToSettings();
    }
  };

  const handleViewAllNotifications = () => {
    setNotificationDropdownOpen(false);
    if (onNavigateToNotifications) {
      onNavigateToNotifications({ view: "list" });
    }
  };

  const handleNotificationClick = async (notification) => {
    if (notification.status === "active") {
      await markNotificationAsRead(notification.id);
    }

    setNotificationDropdownOpen(false);
    if (onNavigateToNotifications) {
      onNavigateToNotifications({
        view: "detail",
        notification: notification,
      });
    }
  };

  const avatarUrl = getAvatarUrl();
  const displayData = localAdminData || adminData;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 z-50">
        <div className="flex items-center ml-6">
          <img
            src={LogoFosika}
            alt="FOSIKA Logo"
            className="w-32 h-32 object-contain"
          />
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() =>
                setNotificationDropdownOpen(!notificationDropdownOpen)
              }
              className="p-3 rounded-lg hover:bg-gray-100 transition-colors relative"
            >
              <Bell className="w-6 h-6 text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                <div className="p-4 border-b border-gray-200 font-semibold flex justify-between items-center bg-gray-50 rounded-t-lg">
                  <span className="text-gray-900">Notifications récentes</span>
                  <button
                    onClick={handleViewAllNotifications}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Voir tout
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {recentNotifications.slice(0, 8).map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                        notification.status === "active"
                          ? "bg-blue-50 border-l-2 border-l-blue-500"
                          : ""
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <div className="font-medium text-sm text-gray-900 line-clamp-1">
                              {notification.titre}
                            </div>
                            {notification.status === "active" && (
                              <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>
                              {formatTime(
                                notification.created_at ||
                                  notification.timestamp
                              )}
                            </span>
                            {notification.reference_dossier && (
                              <span className="font-mono text-blue-600 text-xs">
                                {notification.reference_dossier}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {recentNotifications.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                      <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm">Aucune notification récente</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden relative">
                {/* ✅ CORRECTION : Afficher soit l'avatar, soit les initiales, mais pas les deux */}
                {showAvatar && avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    onError={handleAvatarError}
                    key={`avatar-${avatarVersion}`}
                  />
                ) : (
                  <span className="flex items-center justify-center w-full h-full">
                    {getInitials()}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {displayData?.name || "Admin"}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>

            {userDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                <button
                  onClick={handleProfileClick}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Profil
                </button>
                <button
                  onClick={handleSettingsClick}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Paramètres
                </button>
                <div className="border-t border-gray-200"></div>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 transition-colors"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal de confirmation de déconnexion */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmer la déconnexion
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir vous déconnecter ?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={cancelLogout}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
