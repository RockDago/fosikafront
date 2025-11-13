import React, { useState, useEffect } from "react";

const Header = ({
  notifications = [],
  onNavigateToNotifications,
  onDeconnexion,
  onNavigateToProfile,
  adminData, // Recevoir les données admin en prop
  onAvatarUpdate, // Nouvelle prop pour forcer le rafraîchissement
}) => {
  const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [localAdminData, setLocalAdminData] = useState(null);
  const [avatarVersion, setAvatarVersion] = useState(0); // Pour forcer le rechargement

  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const unreadCount = safeNotifications.filter((n) => n.status === "active").length;

  // Charger les données de l'admin pour l'avatar
  useEffect(() => {
    console.log('🔄 Header: Fetching admin data...');
    fetchAdminData();
  }, [adminData, avatarVersion]); // Se déclenche quand adminData ou avatarVersion change

  // Écouter les mises à jour d'avatar depuis le parent
  useEffect(() => {
    if (onAvatarUpdate) {
      console.log('🔄 Header: Avatar update detected, refreshing...');
      fetchAdminData();
    }
  }, [onAvatarUpdate]);

  const fetchAdminData = async () => {
    try {
      const token = localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
      if (!token) {
        console.log('❌ Header: No token found');
        return;
      }

      console.log('🔄 Header: Fetching fresh admin data...');
      const response = await fetch('http://localhost:8000/api/admin/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        cache: 'no-cache' // Empêcher le cache
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Header: Admin data received:', data);
        if (data.success) {
          setLocalAdminData(data.data);
        }
      } else {
        console.error('❌ Header: Failed to fetch admin data:', response.status);
      }
    } catch (error) {
      console.error('❌ Header: Error loading admin data:', error);
    }
  };

  // Fonction pour obtenir les initiales
  const getInitials = () => {
    const data = localAdminData || adminData;
    if (!data) return 'A';
    
    if (data.first_name && data.last_name) {
      return `${data.first_name[0]}${data.last_name[0]}`.toUpperCase();
    }
    return data.name ? data.name.substring(0, 2).toUpperCase() : 'A';
  };

  // Fonction pour obtenir l'URL de l'avatar avec cache busting
  const getAvatarUrl = () => {
    const data = localAdminData || adminData;
    if (!data?.avatar) return null;
    
    // Ajouter un timestamp pour éviter le cache
    const separator = data.avatar.includes('?') ? '&' : '?';
    return `${data.avatar}${separator}t=${Date.now()}`;
  };

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

  const handleNotificationsClick = () => {
    setNotificationDropdownOpen(false);
    if (onNavigateToNotifications) {
      onNavigateToNotifications();
    }
  };

  const handleAvatarError = (e) => {
    console.error('❌ Header: Avatar image failed to load');
    // On ne fait rien, les initiales s'afficheront
  };

  const avatarUrl = getAvatarUrl();
  const displayData = localAdminData || adminData;

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-20 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-50">
        <div className="flex items-center">
          <div className="text-2xl font-bold text-blue-600 font-serif">
            FOSIKA
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationDropdownOpen(!notificationDropdownOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors relative"
            >
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-5 5v-5M8.5 14.5A2.5 2.5 0 0011 12V6a4 4 0 00-8 0v6a2.5 2.5 0 002.5 2.5z"
                />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {notificationDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                <div className="p-4 border-b border-gray-200 font-semibold">
                  Notifications
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {safeNotifications.slice(0, 4).map((notification) => (
                    <div
                      key={notification.id}
                      className="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                      onClick={handleNotificationsClick}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            notification.priority === "high"
                              ? "bg-red-100 text-red-600"
                              : notification.priority === "medium"
                              ? "bg-orange-100 text-orange-600"
                              : "bg-blue-100 text-blue-600"
                          }`}
                        >
                          {notification.type === "Doublon détecté" && "🔍"}
                          {notification.type === "Signalement urgent" && "⚠️"}
                          {notification.type === "Activité suspecte" && "🛡️"}
                          {notification.type === "Faux documents" && "📄"}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="font-medium text-sm">
                              {notification.titre}
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                notification.priority === "high"
                                  ? "bg-red-100 text-red-600"
                                  : notification.priority === "medium"
                                  ? "bg-orange-100 text-orange-600"
                                  : "bg-blue-100 text-blue-600"
                              }`}
                            >
                              {notification.priority === "high"
                                ? "Haute"
                                : notification.priority === "medium"
                                ? "Moyenne"
                                : "Basse"}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message
                              ? notification.message.substring(0, 60) + "..."
                              : "Aucun message"}
                          </p>
                          <div className="text-xs text-gray-500 mt-2">
                            {notification.timestamp || "Date inconnue"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {safeNotifications.length === 0 && (
                    <div className="p-4 text-center text-gray-500">
                      Aucune notification
                    </div>
                  )}
                </div>
                <div className="p-3 text-center border-t border-gray-200">
                  <button
                    onClick={handleNotificationsClick}
                    className="text-blue-600 text-sm font-medium hover:text-blue-700"
                  >
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden relative">
                {avatarUrl ? (
                  <img 
                    src={avatarUrl} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                    onError={handleAvatarError}
                    key={avatarVersion} // Forcer le rechargement quand avatarVersion change
                  />
                ) : (
                  <span className="flex items-center justify-center w-full h-full">
                    {getInitials()}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {displayData?.name || 'Admin'}
              </span>
              <svg
                className="w-4 h-4 text-gray-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {userDropdownOpen && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50">
                <button
                  onClick={handleProfileClick}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Profil
                </button>
                <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
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