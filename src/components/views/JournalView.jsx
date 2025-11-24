import React, { useState, useEffect } from "react";

const JournalView = () => {
  const [currentTab, setCurrentTab] = useState("signalements");
  const [filters, setFilters] = useState({
    anonymat: "",
    regionProvince: "",
    dateStart: "",
    dateEnd: "",
    user: "",
    action: "",
    status: "",
    auditDateStart: "",
    auditDateEnd: "",
  });

  const [auditData, setAuditData] = useState({
    audit_signalements_recus: [],
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
      const token =
        localStorage.getItem("admin_token") ||
        sessionStorage.getItem("admin_token");
      const response = await fetch("http://localhost:8000/api/journal-audit", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setAuditData(result.data);
        }
      }
    } catch (error) {
      console.error("Erreur chargement audit:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const exportAudit = async () => {
    try {
      const token =
        localStorage.getItem("admin_token") ||
        sessionStorage.getItem("admin_token");
      const response = await fetch(
        "http://localhost:8000/api/journal-audit/export",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: currentTab,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert(`Export réussi! ${result.data_count} enregistrements préparés.`);
      } else {
        alert("Erreur lors de l'export");
      }
    } catch (error) {
      console.error("Erreur export:", error);
      alert("Erreur lors de l'export");
    }
  };

  // Données filtrées pour signalements reçus
  const filteredSignalements = auditData.audit_signalements_recus.filter(
    (sig) => {
      const matchAnonymat =
        !filters.anonymat || sig.type_anonymat === filters.anonymat;
      const matchRegion =
        !filters.regionProvince ||
        sig.region_province === filters.regionProvince;

      let matchDate = true;
      if (filters.dateStart || filters.dateEnd) {
        const sigDate = new Date(sig.timestamp).toISOString().split("T")[0];
        if (filters.dateStart)
          matchDate = matchDate && sigDate >= filters.dateStart;
        if (filters.dateEnd)
          matchDate = matchDate && sigDate <= filters.dateEnd;
      }

      return matchAnonymat && matchRegion && matchDate;
    }
  );

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

  const getUniqueValues = (data, key) => {
    return [...new Set(data.map((item) => item[key]))].filter(Boolean);
  };

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

          {/* Onglets alignés avec l'export */}
          <div className="bg-white border border-gray-200 rounded-lg p-1">
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentTab("signalements")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg flex-1 transition-colors text-sm ${
                  currentTab === "signalements"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>📋</span>
                <span className="font-medium">Signalements Reçus</span>
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {auditData.audit_signalements_recus.length}
                </span>
              </button>
              <button
                onClick={() => setCurrentTab("systeme")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg flex-1 transition-colors text-sm ${
                  currentTab === "systeme"
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span>📖</span>
                <span className="font-medium">Audit Système</span>
                <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                  {auditData.audit_log.length}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Filtres selon l'onglet */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
          {currentTab === "signalements" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type anonymat
                </label>
                <select
                  value={filters.anonymat}
                  onChange={(e) =>
                    handleFilterChange("anonymat", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Tous</option>
                  <option value="Anonyme">Anonyme</option>
                  <option value="Non-Anonyme">Non-Anonyme</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Région / Province
                </label>
                <select
                  value={filters.regionProvince}
                  onChange={(e) =>
                    handleFilterChange("regionProvince", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="">Toutes</option>
                  {getUniqueValues(
                    auditData.audit_signalements_recus,
                    "region_province"
                  ).map((region) => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date début
                </label>
                <input
                  type="date"
                  value={filters.dateStart}
                  onChange={(e) =>
                    handleFilterChange("dateStart", e.target.value)
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
                  value={filters.dateEnd}
                  onChange={(e) =>
                    handleFilterChange("dateEnd", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          ) : (
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
          )}
        </div>

        {/* Tableau sans scroll horizontal */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-md font-semibold text-gray-900">
                  {currentTab === "signalements"
                    ? "Signalements Reçus"
                    : "Événements d'audit système"}
                </h3>
                <p className="text-gray-600 text-xs mt-1">
                  {currentTab === "signalements"
                    ? `${filteredSignalements.length} événements`
                    : `${filteredAuditLog.length} événements`}
                </p>
              </div>
            </div>
          </div>

          {/* Tableau adaptatif sans scroll */}
          <div className="w-full">
            <table className="w-full">
              <thead className="bg-gray-50">
                {currentTab === "signalements" ? (
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Référence
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Heure
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type Anonymat
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Adresse IP
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Identité
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Téléphone
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Région / Province
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type Fraude
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                ) : (
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
                )}
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentTab === "signalements"
                  ? filteredSignalements.map((sig) => (
                      <tr key={sig.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600 font-mono">
                          {sig.reference_dossier || "N/A"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {new Date(sig.timestamp).toLocaleString("fr-FR")}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              sig.type_anonymat === "Anonyme"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {sig.type_anonymat}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-mono">
                          {sig.adresse_ip}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {sig.identite}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {sig.telephone}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {sig.email}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {sig.region_province}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {sig.type_fraude}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {sig.statut}
                          </span>
                        </td>
                      </tr>
                    ))
                  : filteredAuditLog.map((log) => (
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
                          <div
                            className="truncate max-w-xs"
                            title={log.details}
                          >
                            {log.details}
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>

          {/* Message si aucun résultat */}
          {(currentTab === "signalements" &&
            filteredSignalements.length === 0) ||
          (currentTab === "systeme" && filteredAuditLog.length === 0) ? (
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
