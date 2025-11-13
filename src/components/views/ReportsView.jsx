import React, { useState, useEffect, useMemo } from "react";
import { Eye, Edit2, Trash2, X, Download, AlertCircle } from 'lucide-react';

const ReportsView = () => {
  const [currentTab, setCurrentTab] = useState("tous");
  const [filters, setFilters] = useState({
    search: "",
    region: "",
    province: "",
    type: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 10;
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  // Structure des provinces et régions de Madagascar
  const madagascarRegions = useMemo(
    () => [
      {
        province: "Antananarivo",
        regions: ["Analamanga", "Bongolava", "Itasy", "Vakinankaratra"],
      },
      {
        province: "Antsiranana",
        regions: ["Diana", "Sava"],
      },
      {
        province: "Fianarantsoa",
        regions: [
          "Amoron'i Mania",
          "Atsimo-Atsinanana",
          "Fitovinany",
          "Haute Matsiatra",
          "Ihorombe",
          "Vatovavy",
        ],
      },
      {
        province: "Mahajanga",
        regions: ["Betsiboka", "Boeny", "Melaky", "Sofia"],
      },
      {
        province: "Toamasina",
        regions: ["Alaotra Mangoro", "Analanjirofo", "Atsinanana"],
      },
      {
        province: "Toliara",
        regions: ["Androy", "Anosy", "Atsimo-Andrefana", "Menabe"],
      },
    ],
    []
  );

  // Mapping des catégories API vers les catégories affichées
  const categoryMapping = {
    "faux-diplomes": "Faux Diplômes",
    "fraudes-academique": "Fraudes Académiques",
    "recrutements-irreguliers": "Recrutements Irréguliers",
    "harcelement": "Harcèlement",
    "corruption": "Corruption",
    "divers": "Divers",
  };

  // Liste complète des raisons
  const raisonsList = [
    "Faux diplômes",
    "Fraude",
    "Habilitation",
    "Recrutement",
    "Détournement de fonds",
    "Abus de pouvoir",
    "Enrichissement illicite",
    "Trafic d'influence",
  ];

  // Récupérer les données depuis l'API
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        console.log("🔄 Chargement des données depuis l'API...");
        
        const response = await fetch("http://localhost:8000/api/reports?per_page=1000", {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
        
        console.log("📋 Statut de la réponse:", response.status);
        
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        
        const result = await response.json();
        console.log("📋 Réponse brute de l'API:", result);
        
        // ✅ ADAPTATION À LA STRUCTURE DE L'API (comme SuiviDossier et DashboardView)
        let reportsData = [];
        
        if (result.success && result.data && result.data.reports) {
          // Structure: {success: true, data: {reports: [...], pagination: {...}}}
          reportsData = result.data.reports;
        } else if (result.success && Array.isArray(result.data)) {
          // Structure alternative: {success: true, data: [...]}
          reportsData = result.data;
        } else if (Array.isArray(result)) {
          // Structure: [...] (tableau direct)
          reportsData = result;
        } else {
          console.warn("⚠️ Structure de données non reconnue:", result);
          reportsData = [];
        }
        
        console.log("📊 Données extraites:", reportsData);
        
        if (reportsData && reportsData.length > 0) {
          // Mapper les données de l'API vers le format attendu
          const mappedReports = reportsData.map(report => {
            // Parser les fichiers
            let filesArray = [];
            try {
              if (report.files) {
                if (typeof report.files === 'string') {
                  filesArray = JSON.parse(report.files);
                } else if (Array.isArray(report.files)) {
                  filesArray = report.files;
                }
              }
            } catch (e) {
              console.warn("Erreur parsing files:", e);
            }

            return {
              id: report.reference || `REF-${report.id}`,
              date: report.created_at || report.date,
              nom_prenom: report.is_anonymous || report.type === "anonyme" ? "Anonyme" : report.name || "Non spécifié",
              telephone: report.phone || "N/A",
              email: report.email || "N/A",
              categorie: categoryMapping[report.category] || report.category,
              region: report.region || "Non spécifié",
              province: getProvinceFromRegion(report.region),
              raison: report.title || "Non spécifié",
              type_signalement: report.is_anonymous || report.type === "anonyme" ? "Anonyme" : "Non-Anonyme",
              explication: report.description || "Aucune description",
              files: filesArray,
              // Données supplémentaires pour la modale
              status: report.status,
              city: report.city,
            };
          });
          
          setReports(mappedReports);
        } else {
          console.log("ℹ️ Aucune donnée à afficher");
          setReports([]);
        }
        
      } catch (error) {
        console.error("💥 Erreur lors du chargement des données:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchReports();
  }, []);

  // Fonction pour déterminer la province depuis la région
  const getProvinceFromRegion = (region) => {
    if (!region) return "Non spécifié";
    
    for (const prov of madagascarRegions) {
      if (prov.regions.includes(region)) {
        return prov.province;
      }
    }
    return "Non spécifié";
  };

  // Régions disponibles basées sur la province sélectionnée
  const availableRegions = useMemo(() => {
    if (!filters.province) {
      return madagascarRegions
        .flatMap((prov) => prov.regions)
        .sort((a, b) => a.localeCompare(b));
    }
    const provinceData = madagascarRegions.find(
      (p) => p.province === filters.province
    );
    return provinceData
      ? provinceData.regions.sort((a, b) => a.localeCompare(b))
      : [];
  }, [filters.province, madagascarRegions]);

  // Provinces disponibles triées par ordre alphabétique
  const availableProvinces = useMemo(() => {
    return madagascarRegions
      .map((p) => p.province)
      .sort((a, b) => a.localeCompare(b));
  }, [madagascarRegions]);

  // Combiner tous les signalements
  const allReports = useMemo(() => {
    return [...reports].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [reports]);

  // Filtrer les rapports
  const filteredReports = useMemo(() => {
    let baseReports = [];

    switch (currentTab) {
      case "anonyme":
        baseReports = reports.filter(r => r.type_signalement === "Anonyme");
        break;
      case "non-anonyme":
        baseReports = reports.filter(r => r.type_signalement === "Non-Anonyme");
        break;
      default:
        baseReports = allReports;
    }

    return baseReports.filter((report) => {
      const matchSearch =
        !filters.search ||
        report.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        report.nom_prenom
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        (report.explication &&
          report.explication
            .toLowerCase()
            .includes(filters.search.toLowerCase())) ||
        (report.categorie &&
          report.categorie
            .toLowerCase()
            .includes(filters.search.toLowerCase()));

      const matchRegion = !filters.region || report.region === filters.region;
      const matchProvince =
        !filters.province || report.province === filters.province;
      const matchType = !filters.type || report.raison === filters.type;

      return matchSearch && matchRegion && matchProvince && matchType;
    });
  }, [allReports, reports, currentTab, filters]);

  // Pagination
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * reportsPerPage;
    const end = start + reportsPerPage;
    return filteredReports.slice(start, end);
  }, [filteredReports, currentPage]);

  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };

      if (key === "province" && value) {
        const provinceData = madagascarRegions.find(
          (p) => p.province === value
        );
        if (provinceData && provinceData.regions.length > 0) {
          const sortedRegions = provinceData.regions.sort((a, b) =>
            a.localeCompare(b)
          );
          newFilters.region = sortedRegions[0];
        }
      } else if (key === "province" && !value) {
        newFilters.region = "";
      }

      return newFilters;
    });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      region: "",
      province: "",
      type: "",
    });
    setCurrentPage(1);
  };

  const exportReports = () => {
    const csvContent = [
      [
        "Référence",
        "Date",
        "Nom/Prénom",
        "Catégorie",
        "Région",
        "Province",
        "Raison/Description",
        "Type",
      ],
      ...filteredReports.map((report) => [
        report.id,
        new Date(report.date).toLocaleDateString("fr-FR"),
        report.nom_prenom,
        report.categorie || "N/A",
        report.region,
        report.province,
        report.raison,
        report.type_signalement,
      ]),
    ]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `signalements_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  // Fonctions de gestion des actions
  const handleViewReport = (report) => {
    setSelectedReport(report);
  };

  const handleEditReport = (report) => {
    console.log("Modifier le signalement:", report);
    // TODO: Implémenter la logique de modification
  };

  const handleDeleteReport = (report) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer le signalement ${report.id} ?`
      )
    ) {
      console.log("Supprimer le signalement:", report);
      // TODO: Implémenter la logique de suppression
    }
  };

  // Fonction pour télécharger un fichier
  const handleDownloadFile = (fileName) => {
    console.log("Téléchargement du fichier:", fileName);
    // TODO: Implémenter la logique de téléchargement
  };

  // Fonction pour visualiser un fichier
  const handleViewFile = (fileName) => {
    console.log("Visualisation du fichier:", fileName);
    // TODO: Implémenter la logique de visualisation
  };

  // Statistiques par onglet
  const getTabStats = () => {
    return {
      tous: allReports.length,
      anonyme: reports.filter(r => r.type_signalement === "Anonyme").length,
      "non-anonyme": reports.filter(r => r.type_signalement === "Non-Anonyme").length,
    };
  };

  const tabStats = getTabStats();

  // Affichage d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Ressayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Signalements Reçus
        </h1>
        <p className="text-gray-600 text-sm">
          Liste complète des signalements avec filtres avancés
        </p>
      </div>

      {/* Onglets */}
      <div className="bg-white border border-gray-200 rounded-lg p-1">
        <div className="flex gap-1">
          {[
            { id: "tous", label: "Tous", icon: "📋" },
            { id: "anonyme", label: "Anonymes", icon: "👤" },
            { id: "non-anonyme", label: "Non-Anonymes", icon: "👥" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setCurrentTab(tab.id);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-1 px-3 py-2 rounded flex-1 transition-colors text-sm ${
                currentTab === tab.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span className="text-xs">{tab.icon}</span>
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded text-xs ${
                  currentTab === tab.id
                    ? "bg-white bg-opacity-20"
                    : "bg-gray-100"
                }`}
              >
                {tabStats[tab.id]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white border border-gray-200 rounded-lg p-3">
        <div className="flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-[150px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Recherche
            </label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Référence, nom, catégorie..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Province
            </label>
            <select
              value={filters.province}
              onChange={(e) => handleFilterChange("province", e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Toutes les provinces</option>
              {availableProvinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Région
            </label>
            <select
              value={filters.region}
              onChange={(e) => handleFilterChange("region", e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Toutes les régions</option>
              {availableRegions.map((region) => (
                <option key={region} value={region}>
                  {region}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Raison
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Toutes les raisons</option>
              {raisonsList.map((raison) => (
                <option key={raison} value={raison}>
                  {raison}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <button
              onClick={resetFilters}
              className="bg-gray-100 text-gray-700 px-3 py-1 text-sm rounded hover:bg-gray-200 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      </div>

      {/* Tableau des signalements */}
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {currentTab === "tous" && "Tous les signalements"}
                {currentTab === "anonyme" && "Signalements anonymes"}
                {currentTab === "non-anonyme" && "Signalements non-anonymes"}
              </h3>
              <p className="text-gray-600 text-xs mt-1">
                {filteredReports.length} signalements trouvés
              </p>
            </div>
            <button
              onClick={exportReports}
              className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700 transition-colors font-medium flex items-center gap-1"
            >
              <span>📊</span>
              Exporter CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom / Prénom
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Province / Région
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Raison / Description
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type anonymat
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-500">
                    <div className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-5 w-5 text-blue-600"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Chargement en cours...
                    </div>
                  </td>
                </tr>
              ) : paginatedReports.length > 0 ? (
                paginatedReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-blue-600">
                      {report.id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(report.date)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {report.nom_prenom}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                        {report.categorie}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {report.province} / {report.region}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">
                      {report.raison}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          report.type_signalement === "Anonyme"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {report.type_signalement === "Anonyme"
                          ? "Anonyme"
                          : "Non-Anonyme"}
                      </span>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewReport(report)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Voir détails"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditReport(report)}
                          className="text-gray-600 hover:text-gray-800 transition-colors"
                          title="Modifier"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-sm text-gray-500"
                  >
                    Aucun signalement trouvé avec les filtres actuels
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-700">
                Page {currentPage} sur {totalPages} • {filteredReports.length}{" "}
                signalements
              </p>
              <div className="flex gap-1">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-2 py-1 border border-gray-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Précédent
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-2 py-1 border rounded text-xs ${
                        currentPage === page
                          ? "bg-blue-600 text-white border-blue-600"
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-2 py-1 border border-gray-300 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Suivant
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Détails */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-5 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">
                Détails du Signalement
              </h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {/* Contenu */}
            <div className="p-6 space-y-6">
              {/* Informations principales */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Référence
                  </label>
                  <p className="font-mono text-lg font-semibold text-blue-600">
                    {selectedReport.id}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Date de soumission
                  </label>
                  <p className="text-sm text-gray-800">
                    {formatDate(selectedReport.date)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Catégorie
                  </label>
                  <p className="text-sm text-gray-800">
                    {selectedReport.categorie}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Type
                  </label>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedReport.type_signalement === "Anonyme"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {selectedReport.type_signalement}
                  </span>
                </div>
              </div>

              {/* Localisation */}
              <div className="border-t border-gray-200 pt-5">
                <h3 className="font-semibold text-gray-800 mb-3 text-base">
                  Localisation
                </h3>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Province
                    </label>
                    <p className="text-gray-800 bg-gray-50 p-2 rounded border">
                      {selectedReport.province}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Région
                    </label>
                    <p className="text-gray-800 bg-gray-50 p-2 rounded border">
                      {selectedReport.region}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Ville
                    </label>
                    <p className="text-gray-800 bg-gray-50 p-2 rounded border">
                      {selectedReport.city || "Non spécifié"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informations de l'émetteur */}
              <div className="border-t border-gray-200 pt-5">
                <h3 className="font-semibold text-gray-800 mb-3 text-base">
                  Informations de l'émetteur
                </h3>
                {selectedReport.type_signalement === "Anonyme" ? (
                  <p className="text-sm text-gray-600 italic bg-gray-50 p-3 rounded border">
                    Signalement anonyme
                  </p>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Nom
                      </label>
                      <p className="text-gray-800 bg-gray-50 p-2 rounded border">
                        {selectedReport.nom_prenom}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Email
                      </label>
                      <p className="text-gray-800 bg-gray-50 p-2 rounded border">
                        {selectedReport.email}
                      </p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        Téléphone
                      </label>
                      <p className="text-gray-800 bg-gray-50 p-2 rounded border">
                        {selectedReport.telephone}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Raison / Description */}
              <div className="border-t border-gray-200 pt-5">
                <h3 className="font-semibold text-gray-800 mb-3 text-base">
                  Raison / Titre
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 font-medium">
                    {selectedReport.raison}
                  </p>
                </div>
              </div>

              {/* Description détaillée */}
              <div className="border-t border-gray-200 pt-5">
                <h3 className="font-semibold text-gray-800 mb-3 text-base">
                  Description détaillée
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedReport.explication}
                  </p>
                </div>
              </div>

              {/* Pièces jointes */}
              <div className="border-t border-gray-200 pt-5">
                <h3 className="font-semibold text-gray-800 mb-3 text-base">
                  Pièces jointes
                </h3>
                {selectedReport.files && selectedReport.files.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      {selectedReport.files.length} fichier(s) joint(s)
                    </p>
                    <div className="grid gap-2">
                      {selectedReport.files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                              <span className="text-blue-600 text-xs font-bold">
                                {file.split(".").pop()?.toUpperCase() || "FILE"}
                              </span>
                            </div>
                            <span className="text-sm text-gray-700 font-medium truncate max-w-[200px]">
                              {file}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewFile(file)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              <Eye size={14} />
                              Voir
                            </button>
                            <button
                              onClick={() => handleDownloadFile(file)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                              <Download size={14} />
                              Télécharger
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-500">Aucun fichier joint</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-5">
              <button
                onClick={() => setSelectedReport(null)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsView;
