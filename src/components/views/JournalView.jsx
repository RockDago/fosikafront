import React, { useState, useMemo } from 'react';

const JournalView = ({ data }) => {
  const [currentTab, setCurrentTab] = useState('signalements');
  const [filters, setFilters] = useState({
    // Filtres pour signalements reçus
    anonymat: '',
    regionProvince: '',
    dateStart: '',
    dateEnd: '',
    // Filtres pour audit système
    user: '',
    action: '',
    status: '',
    auditDateStart: '',
    auditDateEnd: ''
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      anonymat: '',
      regionProvince: '',
      dateStart: '',
      dateEnd: '',
      user: '',
      action: '',
      status: '',
      auditDateStart: '',
      auditDateEnd: ''
    });
  };

  const exportAudit = () => {
    alert('Export du journal d\'audit en cours...');
  };

  // Données filtrées pour signalements reçus
  const filteredSignalements = useMemo(() => {
    const signalements = data.audit_signalements_recus || [];
    return signalements.filter(sig => {
      const matchAnonymat = !filters.anonymat || sig.type_anonymat === filters.anonymat;
      const matchRegion = !filters.regionProvince || sig.region_province === filters.regionProvince;
      
      let matchDate = true;
      if (filters.dateStart || filters.dateEnd) {
        const sigDate = new Date(sig.timestamp).toISOString().split('T')[0];
        if (filters.dateStart) matchDate = matchDate && sigDate >= filters.dateStart;
        if (filters.dateEnd) matchDate = matchDate && sigDate <= filters.dateEnd;
      }
      
      return matchAnonymat && matchRegion && matchDate;
    });
  }, [data.audit_signalements_recus, filters]);

  // Données filtrées pour audit système
  const filteredAuditLog = useMemo(() => {
    const auditLog = data.audit_log || [];
    return auditLog.filter(log => {
      const matchUser = !filters.user || log.utilisateur.toLowerCase().includes(filters.user.toLowerCase());
      const matchAction = !filters.action || log.action === filters.action;
      const matchStatus = !filters.status || log.statut.includes(filters.status);
      
      let matchDate = true;
      if (filters.auditDateStart || filters.auditDateEnd) {
        const logDate = new Date(log.timestamp).toISOString().split('T')[0];
        if (filters.auditDateStart) matchDate = matchDate && logDate >= filters.auditDateStart;
        if (filters.auditDateEnd) matchDate = matchDate && logDate <= filters.auditDateEnd;
      }
      
      return matchUser && matchAction && matchStatus && matchDate;
    });
  }, [data.audit_log, filters]);

  const getUniqueValues = (data, key) => {
    return [...new Set(data.map(item => item[key]))];
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Journal d'Audit</h1>
        <p className="text-gray-600">Historique complet des accès et modifications</p>
      </div>

      {/* Onglets */}
      <div className="bg-white border border-gray-200 rounded-lg p-2">
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentTab('signalements')}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg flex-1 transition-colors ${
              currentTab === 'signalements'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>📋</span>
            <span className="font-medium">Signalements Reçus</span>
          </button>
          <button
            onClick={() => setCurrentTab('systeme')}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg flex-1 transition-colors ${
              currentTab === 'systeme'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span>📖</span>
            <span className="font-medium">Audit Système</span>
          </button>
        </div>
      </div>

      {/* Filtres selon l'onglet */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        {currentTab === 'signalements' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type anonymat</label>
              <select
                value={filters.anonymat}
                onChange={(e) => handleFilterChange('anonymat', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Tous</option>
                <option value="Anonyme">Anonyme</option>
                <option value="Non-Anonyme">Non-Anonyme</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Région / Province</label>
              <select
                value={filters.regionProvince}
                onChange={(e) => handleFilterChange('regionProvince', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes</option>
                {getUniqueValues(data.audit_signalements_recus || [], 'region_province').map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date début</label>
              <input
                type="date"
                value={filters.dateStart}
                onChange={(e) => handleFilterChange('dateStart', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date fin</label>
              <input
                type="date"
                value={filters.dateEnd}
                onChange={(e) => handleFilterChange('dateEnd', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Utilisateur</label>
              <input
                type="text"
                value={filters.user}
                onChange={(e) => handleFilterChange('user', e.target.value)}
                placeholder="Email utilisateur..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange('action', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Toutes les actions</option>
                <option value="Consultation">Consultation</option>
                <option value="Modification">Modification</option>
                <option value="Export">Export</option>
                <option value="Connexion">Connexion</option>
                <option value="Création">Création</option>
                <option value="Suppression">Suppression</option>
                <option value="Tentative d'accès">Tentative d'accès</option>
                <option value="Signature">Signature</option>
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
                <option value="Succès">Succès</option>
                <option value="Refusé">Refusé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date début</label>
              <input
                type="date"
                value={filters.auditDateStart}
                onChange={(e) => handleFilterChange('auditDateStart', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date fin</label>
              <input
                type="date"
                value={filters.auditDateEnd}
                onChange={(e) => handleFilterChange('auditDateEnd', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-4">
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
            onClick={exportAudit}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Tableau selon l'onglet */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {currentTab === 'signalements' ? 'Signalements Reçus' : 'Événements d\'audit système'}
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                {currentTab === 'signalements' 
                  ? `${filteredSignalements.length} événements` 
                  : `${filteredAuditLog.length} événements`
                }
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              {currentTab === 'signalements' ? (
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Heure</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type Anonymat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse IP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Géolocalisation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Identité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Région / Province</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type Fraude</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Heure</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IP</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Détails</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentTab === 'signalements' ? (
                filteredSignalements.map(sig => (
                  <tr key={sig.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{sig.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(sig.timestamp).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        sig.type_anonymat === 'Anonyme' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {sig.type_anonymat}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sig.adresse_ip}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sig.geolocalisation}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sig.identite}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sig.telephone}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sig.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sig.region_province}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sig.type_fraude}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {sig.statut}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                filteredAuditLog.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{log.utilisateur}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.action}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.entite}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        log.statut.includes('Succès') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {log.statut.includes('Succès') ? 'Succès' : 'Refusé'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.ip}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                      <div className="truncate" title={log.details}>
                        {log.details}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Message si aucun résultat */}
        {(currentTab === 'signalements' && filteredSignalements.length === 0) ||
         (currentTab === 'systeme' && filteredAuditLog.length === 0) ? (
          <div className="p-12 text-center text-gray-500">
            <div className="text-6xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Aucun événement trouvé</h3>
            <p>Aucun événement ne correspond à vos critères de recherche.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default JournalView;