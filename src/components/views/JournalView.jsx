import React, { useState, useEffect } from "react";
import API from "../../config/axios";

const JournalView = () => {
  const [filters, setFilters] = useState({
    user: "",
    action: "",
    status: "",
    auditDateStart: "",
    auditDateEnd: "",
  });

  const [auditData, setAuditData] = useState({
    audit_log: [],
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAuditData();

    // Rafraîchissement automatique toutes les 30 secondes
    const interval = setInterval(fetchAuditData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchAuditData = async () => {
    try {
      const response = await API.get("/journal-audit");
      if (response.data.success) {
        setAuditData(response.data.data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données d'audit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const exportAudit = async () => {
    try {
      const response = await API.post("/journal-audit/export", {
        type: "systeme",
      });

      if (response.data.success) {
        alert(
          `Export réussi! ${response.data.data_count} enregistrements préparés.`
        );
      } else {
        alert("Erreur lors de l'export");
      }
    } catch (error) {
      console.error("Erreur lors de l'export:", error);
      alert("Erreur lors de l'export");
    }
  };

  // Données filtrées pour audit système
  const filteredAuditLog = auditData.audit_log.filter((log) => {
    const matchUser =
      !filters.user ||
      log.utilisateur.toLowerCase().includes(filters.user.toLowerCase());
    const matchAction = !filters.action || log.action === filters.action;
    const matchStatus = !filters.status || log.statut.includes(filters.status);

    let matchDate = true;
    if (filters.auditDateStart || filters.auditDateEnd) {
      const logDate = new Date(log.timestamp).toISOString().split("T")[0];
      if (filters.auditDateStart)
        matchDate = matchDate && logDate >= filters.auditDateStart;
      if (filters.auditDateEnd)
        matchDate = matchDate && logDate <= filters.auditDateEnd;
    }

    return matchUser && matchAction && matchStatus && matchDate;
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête aligné avec les onglets */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                Journal d'Audit
              </h1>
              <p className="text-gray-600 text-sm">
                Historique complet des accès et modifications
              </p>
            </div>
            <button
              onClick={exportAudit}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              Exporter CSV
            </button>
          </div>

          {/* Onglet unique pour Audit Système */}
          <div className="bg-white border border-gray-200 rounded-lg p-1">
            <div className="flex gap-1">
              <button className="flex items-center gap-2 px-4 py-2 rounded-lg flex-1 transition-colors text-sm bg-blue-600 text-white">
                <span>📖</span>
                <span className="font-medium">Audit Système</span>
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {auditData.audit_log.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Filtres pour audit système */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Utilisateur
              </label>
              <input
                type="text"
                value={filters.user}
                onChange={(e) => handleFilterChange("user", e.target.value)}
                placeholder="Email utilisateur..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Action
              </label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange("action", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statut
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Tous les statuts</option>
                <option value="Succès">Succès</option>
                <option value="Refusé">Refusé</option>
                <option value="Échec">Échec</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date début
              </label>
              <input
                type="date"
                value={filters.auditDateStart}
                onChange={(e) =>
                  handleFilterChange("auditDateStart", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date fin
              </label>
              <input
                type="date"
                value={filters.auditDateEnd}
                onChange={(e) =>
                  handleFilterChange("auditDateEnd", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Tableau sans scroll horizontal */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-semibold text-gray-900">
                  Événements d'audit système
                </h3>
                <p className="text-gray-600 text-xs mt-1">
                  {filteredAuditLog.length} événements
                </p>
              </div>
            </div>
          </div>

          {/* Tableau adaptatif sans scroll */}
          <div className="w-full">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Heure
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Entité
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Détails
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAuditLog.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {new Date(log.timestamp).toLocaleString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                      {log.utilisateur}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {log.action}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {log.entite}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          log.statut.includes("Succès")
                            ? "bg-green-100 text-green-800"
                            : log.statut.includes("Échec")
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {log.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {log.ip}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <div className="truncate max-w-xs" title={log.details}>
                        {log.details}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Message si aucun résultat */}
          {filteredAuditLog.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <div className="text-4xl mb-3">📊</div>
              <h3 className="text-md font-semibold mb-1">
                Aucun événement trouvé
              </h3>
              <p className="text-sm">
                Aucun événement ne correspond à vos critères de recherche.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default JournalView;
