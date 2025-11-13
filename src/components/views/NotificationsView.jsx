import React, { useState, useMemo } from 'react';

const NotificationsView = ({ data }) => {
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    priority: '',
    status: ''
  });

  const notifications = data.notifications || [];

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => {
      const matchSearch = !filters.search || 
        notification.titre.toLowerCase().includes(filters.search.toLowerCase()) ||
        notification.message.toLowerCase().includes(filters.search.toLowerCase()) ||
        notification.type.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchType = !filters.type || notification.type === filters.type;
      const matchPriority = !filters.priority || notification.priority === filters.priority;
      const matchStatus = !filters.status || notification.status === filters.status;

      return matchSearch && matchType && matchPriority && matchStatus;
    });
  }, [notifications, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      type: '',
      priority: '',
      status: ''
    });
  };

  const markAllAsRead = () => {
    alert('Toutes les notifications marquées comme lues');
  };

  const markAsRead = (notificationId) => {
    alert(`Notification ${notificationId} marquée comme lue`);
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🔵';
      default: return '⚪';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Doublon détecté': return '🔍';
      case 'Signalement urgent': return '⚠️';
      case 'Activité suspecte': return '🛡️';
      case 'Faux documents': return '📄';
      case 'Conformité': return '✅';
      case 'Système': return '⚙️';
      default: return '💬';
    }
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Toutes les Notifications</h1>
        <p className="text-gray-600">Centre de notifications et alertes système</p>
      </div>

      {/* Filtres */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Rechercher une notification..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les types</option>
              <option value="Doublon détecté">Doublon détecté</option>
              <option value="Signalement urgent">Signalement urgent</option>
              <option value="Activité suspecte">Activité suspecte</option>
              <option value="Faux documents">Faux documents</option>
              <option value="Conformité">Conformité</option>
              <option value="Système">Système</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priorité</label>
            <select
              value={filters.priority}
              onChange={(e) => handleFilterChange('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes les priorités</option>
              <option value="high">Haute</option>
              <option value="medium">Moyenne</option>
              <option value="low">Basse</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous les statuts</option>
              <option value="active">Non lu</option>
              <option value="acknowledged">Lu</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {}} // Les filtres se mettent à jour automatiquement
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Appliquer les filtres
          </button>
          <button
            onClick={resetFilters}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Réinitialiser
          </button>
          <button
            onClick={markAllAsRead}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Tout marquer comme lu
          </button>
        </div>
      </div>

      {/* Liste des notifications */}
      <div className="space-y-4">
        {filteredNotifications.map(notification => (
          <div
            key={notification.id}
            className={`bg-white border rounded-lg p-6 transition-all hover:shadow-md ${
              notification.status === 'active' 
                ? 'border-l-4 border-l-blue-500 bg-blue-50' 
                : 'border-gray-200'
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Icône de notification */}
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-lg ${
                notification.priority === 'high' ? 'bg-red-100 text-red-600' :
                notification.priority === 'medium' ? 'bg-orange-100 text-orange-600' :
                'bg-blue-100 text-blue-600'
              }`}>
                {getTypeIcon(notification.type)}
              </div>

              {/* Contenu */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {notification.titre}
                    </h3>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                        {notification.type}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded ${
                        notification.priority === 'high' ? 'bg-red-100 text-red-700' :
                        notification.priority === 'medium' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {getPriorityIcon(notification.priority)}
                        {notification.priority === 'high' ? 'Haute priorité' :
                         notification.priority === 'medium' ? 'Priorité moyenne' : 'Basse priorité'}
                      </span>
                      {notification.status === 'active' && (
                        <span className="bg-blue-100 text-blue-700 text-xs font-medium px-2 py-1 rounded">
                          Nouveau
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 mb-2">
                      {notification.timestamp}
                    </div>
                    {notification.status === 'active' && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Marquer comme lu
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-gray-700 mb-3">
                  {notification.message}
                </p>

                {notification.details && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-sm text-gray-600">
                      {notification.details.description}
                    </p>
                    {notification.details.region_province && (
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Localisation:</strong> {notification.details.region_province}
                      </p>
                    )}
                    {notification.details.type_fraude && (
                      <p className="text-sm text-gray-600 mt-1">
                        <strong>Type de fraude:</strong> {notification.details.type_fraude}
                      </p>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Voir les détails
                  </button>
                  {notification.linked_reports && notification.linked_reports.length > 0 && (
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                      Accéder aux signalements ({notification.linked_reports.length})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune notification</h3>
            <p className="text-gray-600">
              {notifications.length === 0 
                ? "Vous n'avez aucune notification pour le moment."
                : "Aucune notification ne correspond à vos critères de recherche."
              }
            </p>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques des notifications</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {notifications.filter(n => n.priority === 'high').length}
            </div>
            <div className="text-sm text-gray-600">Haute priorité</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {notifications.filter(n => n.priority === 'medium').length}
            </div>
            <div className="text-sm text-gray-600">Moyenne priorité</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {notifications.filter(n => n.status === 'active').length}
            </div>
            <div className="text-sm text-gray-600">Non lues</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationsView;