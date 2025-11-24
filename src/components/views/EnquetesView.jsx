import React, { useState, useEffect, useMemo } from "react";
import {
  Eye,
  Trash2,
  X,
  Download,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  Plus,
  Edit,
  UserCheck,
  Filter,
  Archive,
  ChevronDown,
  ChevronUp,
  FileText,
  ArrowUpDown,
  AlertTriangle,
  Search,
} from "lucide-react";

const EnquetesView = () => {
  const [currentTab, setCurrentTab] = useState("tous");
  const [filters, setFilters] = useState({
    search: "",
    province: "",
    region: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [enquetes, setEnquetes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEnquete, setSelectedEnquete] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEnqueteForAction, setSelectedEnqueteForAction] =
    useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });

  // États pour les modals
  const [assignData, setAssignData] = useState({
    assignTo: "",
    reason: "",
  });

  const [statusData, setStatusData] = useState({
    status: "",
    notes: "",
  });

  const [reportData, setReportData] = useState({
    type: "quotidien",
    dateDebut: new Date().toISOString().split("T")[0],
    dateFin: new Date().toISOString().split("T")[0],
  });

  // Données d'exemple
  const categories = [
    "Fraude financière",
    "Faux diplômes",
    "Recrutement irrégulier",
    "Harcèlement",
    "Corruption",
    "Divers",
  ];

  const statuts = ["Assigné", "En cours", "Complété", "Transmis"];

  const demandeurs = ["Service Client", "DRH", "Direction Générale", "Autre"];

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

  // Charger les données d'exemple
  useEffect(() => {
    const mockData = [
      {
        id: 1,
        reference: "ENQ-20240115-ABC123",
        date: "2024-01-15",
        nom_prenom: "Dupont Jean",
        categorie: "Fraude financière",
        demandeur: "DAAQ",
        statut: "Assigné",
        province: "Antananarivo",
        region: "Analamanga",
      },
      {
        id: 2,
        reference: "ENQ-20240116-DEF456",
        date: "2024-01-16",
        nom_prenom: "Martin Sophie",
        categorie: "Faux diplômes",
        demandeur: "DEGS",
        statut: "En cours",
        province: "Fianarantsoa",
        region: "Haute Matsiatra",
      },
      {
        id: 3,
        reference: "ENQ-20240117-GHI789",
        date: "2024-01-17",
        nom_prenom: "Leroy Pierre",
        categorie: "Recrutement irrégulier",
        demandeur: "DAAQ",
        statut: "Complété",
        province: "Toamasina",
        region: "Atsinanana",
      },
      {
        id: 4,
        reference: "ENQ-20240118-JKL012",
        date: "2024-01-18",
        nom_prenom: "Rakoto Jean",
        categorie: "Corruption",
        demandeur: "DEGS",
        statut: "Transmis",
        province: "Antsiranana",
        region: "Diana",
      },
    ];

    setEnquetes(mockData);
    setIsLoading(false);
  }, []);

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

  // Fonction de tri
  const sortEnquetes = (enquetesToSort) => {
    if (!sortConfig.key) return enquetesToSort;

    return [...enquetesToSort].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === "date") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortConfig.key === "reference") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  // Toutes les enquêtes triées
  const allEnquetes = useMemo(() => {
    return sortEnquetes([...enquetes]);
  }, [enquetes, sortConfig]);

  // Filtrer les enquêtes
  const filteredEnquetes = useMemo(() => {
    let baseEnquetes = allEnquetes;

    // Filtre par onglet
    if (currentTab !== "tous") {
      baseEnquetes = baseEnquetes.filter(
        (enquete) => enquete.statut.toLowerCase() === currentTab.toLowerCase()
      );
    }

    // Filtre par recherche et localisation
    return baseEnquetes.filter((enquete) => {
      const matchSearch =
        !filters.search ||
        enquete.reference
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        enquete.nom_prenom
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        enquete.categorie.toLowerCase().includes(filters.search.toLowerCase());

      const matchProvince =
        !filters.province || enquete.province === filters.province;
      const matchRegion = !filters.region || enquete.region === filters.region;

      return matchSearch && matchProvince && matchRegion;
    });
  }, [allEnquetes, currentTab, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredEnquetes.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedEnquetes = filteredEnquetes.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Générer les numéros de page
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let startPage = Math.max(2, currentPage - 2);
      let endPage = Math.min(totalPages - 1, currentPage + 2);

      if (currentPage <= 3) {
        endPage = maxVisible;
      }

      if (currentPage >= totalPages - 2) {
        startPage = totalPages - maxVisible + 1;
      }

      if (startPage > 2) {
        pages.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  // Fonction pour gérer le tri
  const handleSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction:
        current.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
    setCurrentPage(1);
  };

  // Fonction pour obtenir l'icône de tri
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return <ArrowUpDown className="w-3 h-3 text-gray-400" />;
    }
    return sortConfig.direction === "asc" ? (
      <ChevronUp className="w-3 h-3 text-blue-600" />
    ) : (
      <ChevronDown className="w-3 h-3 text-blue-600" />
    );
  };

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
      province: "",
      region: "",
    });
    setCurrentPage(1);
  };

  // Fonctions de gestion des actions
  const handleViewEnquete = (enquete) => {
    setSelectedEnquete(enquete);
  };

  const handleAssignEnquete = (enquete) => {
    setSelectedEnqueteForAction(enquete);
    setAssignData({
      assignTo: "",
      reason: "",
    });
    setShowAssignModal(true);
  };

  const handleStatusUpdate = (enquete) => {
    setSelectedEnqueteForAction(enquete);
    setStatusData({
      status: enquete.statut || "",
      notes: "",
    });
    setShowStatusModal(true);
  };

  const handleDeleteEnquete = (enquete) => {
    setSelectedEnqueteForAction(enquete);
    setShowDeleteModal(true);
  };

  // Fonction pour confirmer la suppression
  const confirmDeleteEnquete = () => {
    if (selectedEnqueteForAction) {
      console.log("Supprimer l'enquête:", selectedEnqueteForAction);
      // TODO: appel API delete
      setShowDeleteModal(false);
      setSelectedEnqueteForAction(null);
    }
  };

  // Soumission des formulaires
  const handleAssignSubmit = (e) => {
    e.preventDefault();
    console.log("Assigner:", selectedEnqueteForAction.id, assignData);
    // TODO: Appel API pour assigner
    setShowAssignModal(false);
  };

  const handleStatusSubmit = (e) => {
    e.preventDefault();
    console.log(
      "Mettre à jour statut:",
      selectedEnqueteForAction.id,
      statusData
    );
    // TODO: Appel API pour mettre à jour le statut
    setShowStatusModal(false);
  };

  const generateReport = (e) => {
    e.preventDefault();
    console.log("Générer rapport:", reportData);
    // TODO: Implémenter la génération du rapport
    setShowReportModal(false);
  };

  // Export CSV
  const exportEnquetes = () => {
    const csvContent = [
      [
        "RÉFÉRENCE",
        "DATE",
        "Nom/Prénom",
        "Catégorie",
        "Demandeur",
        "Statut",
        "Province",
        "Région",
      ],
      ...filteredEnquetes.map((enquete) => [
        enquete.reference,
        enquete.date,
        enquete.nom_prenom,
        enquete.categorie,
        enquete.demandeur,
        enquete.statut,
        enquete.province,
        enquete.region,
      ]),
    ]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `enquetes_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Statistiques par onglet
  const getTabStats = () => {
    return {
      tous: allEnquetes.length,
      assigné: allEnquetes.filter((e) => e.statut === "Assigné").length,
      "en cours": allEnquetes.filter((e) => e.statut === "En cours").length,
      complété: allEnquetes.filter((e) => e.statut === "Complété").length,
      transmis: allEnquetes.filter((e) => e.statut === "Transmis").length,
    };
  };

  const tabStats = getTabStats();

  // Si une enquête est sélectionnée, afficher la page de détail
  if (selectedEnquete) {
    return (
      <div className="p-4 bg-white min-h-screen">
        {/* Header de la page de détail */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Détail de l'Enquête - {selectedEnquete.reference}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {selectedEnquete.date} • {selectedEnquete.categorie}
            </p>
          </div>
          <button
            onClick={() => setSelectedEnquete(null)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour à la liste
          </button>
        </div>

        {/* Contenu détaillé de l'enquête */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Informations principales */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-md font-semibold text-gray-900 mb-3">
                Informations Générales
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Référence:</span>
                  <span className="font-medium">
                    {selectedEnquete.reference}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">{selectedEnquete.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Catégorie:</span>
                  <span className="font-medium">
                    {selectedEnquete.categorie}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Demandeur:</span>
                  <span className="font-medium">
                    {selectedEnquete.demandeur}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Province:</span>
                  <span className="font-medium">
                    {selectedEnquete.province}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Région:</span>
                  <span className="font-medium">{selectedEnquete.region}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Statut:</span>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedEnquete.statut === "Assigné"
                        ? "bg-blue-100 text-blue-800"
                        : selectedEnquete.statut === "En cours"
                        ? "bg-yellow-100 text-yellow-800"
                        : selectedEnquete.statut === "Complété"
                        ? "bg-green-100 text-green-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {selectedEnquete.statut}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-md font-semibold text-gray-900 mb-3">
                Actions
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAssignEnquete(selectedEnquete)}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <UserCheck className="w-4 h-4" />
                  Assigner
                </button>
                <button
                  onClick={() => handleStatusUpdate(selectedEnquete)}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Statut
                </button>
                <button
                  onClick={() => handleDeleteEnquete(selectedEnquete)}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors col-span-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </div>
          </div>

          {/* Documents et historique */}
          <div className="space-y-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-md font-semibold text-gray-900 mb-3">
                Documents Associés
              </h3>
              <div className="text-center py-6 text-gray-500 text-sm">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p>Aucun document associé pour le moment</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Page principale avec la liste des enquêtes
  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Signalements à enquêter
          </h1>
          <p className="text-gray-600 text-sm">
            Gérez et suivez vos dossiers d'enquête
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportEnquetes}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exporter CSV
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-4 h-4" />
            Générer Rapport
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 mb-3">
        <button
          className={
            currentTab === "tous"
              ? "px-3 py-1 text-xs rounded-lg bg-blue-600 text-white"
              : "px-3 py-1 text-xs rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          }
          onClick={() => {
            setCurrentTab("tous");
            setCurrentPage(1);
          }}
        >
          Tous ({tabStats.tous})
        </button>

        <button
          className={
            currentTab === "assigné"
              ? "px-3 py-1 text-xs rounded-lg bg-blue-600 text-white"
              : "px-3 py-1 text-xs rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          }
          onClick={() => {
            setCurrentTab("assigné");
            setCurrentPage(1);
          }}
        >
          Assigné ({tabStats.assigné})
        </button>

        <button
          className={
            currentTab === "en cours"
              ? "px-3 py-1 text-xs rounded-lg bg-blue-600 text-white"
              : "px-3 py-1 text-xs rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          }
          onClick={() => {
            setCurrentTab("en cours");
            setCurrentPage(1);
          }}
        >
          En cours ({tabStats["en cours"]})
        </button>

        <button
          className={
            currentTab === "complété"
              ? "px-3 py-1 text-xs rounded-lg bg-blue-600 text-white"
              : "px-3 py-1 text-xs rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          }
          onClick={() => {
            setCurrentTab("complété");
            setCurrentPage(1);
          }}
        >
          Complété ({tabStats.complété})
        </button>

        <button
          className={
            currentTab === "transmis"
              ? "px-3 py-1 text-xs rounded-lg bg-blue-600 text-white"
              : "px-3 py-1 text-xs rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          }
          onClick={() => {
            setCurrentTab("transmis");
            setCurrentPage(1);
          }}
        >
          Transmis ({tabStats.transmis})
        </button>
      </div>

      {/* Filtres */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
        <div className="md:col-span-2">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-3 w-3" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              placeholder="Rechercher par référence ou type..."
              className="w-full pl-7 pr-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <select
            value={filters.province}
            onChange={(e) => handleFilterChange("province", e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Toutes les provinces</option>
            {availableProvinces.map((province) => (
              <option key={province} value={province}>
                {province}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filters.region}
            onChange={(e) => handleFilterChange("region", e.target.value)}
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Toutes les régions</option>
            {availableRegions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bouton reset filtres + info compte */}
      <div className="flex items-center justify-between mb-2 text-xs">
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 px-2 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X className="w-3 h-3" />
          Réinitialiser les filtres
        </button>
        <div className="text-gray-500 text-xs">
          {filteredEnquetes.length} enquêtes trouvées
        </div>
      </div>

      {/* Tableau des enquêtes */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Chargement en cours...
            </div>
          ) : filteredEnquetes.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Aucune enquête trouvée avec les filtres actuels
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort("reference")}
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                    >
                      <span>RÉFÉRENCE</span>
                      {getSortIcon("reference")}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <button
                      onClick={() => handleSort("date")}
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                    >
                      <span>DATE</span>
                      {getSortIcon("date")}
                    </button>
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nom / Prénom
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Demandeur
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedEnquetes.map((enquete) => (
                  <tr
                    key={enquete.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 py-2 whitespace-nowrap font-medium text-blue-600 text-xs">
                      {enquete.reference}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-900 text-xs">
                      {enquete.date}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-900 text-xs">
                      {enquete.nom_prenom}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-900 text-xs">
                      {enquete.categorie}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-gray-900 text-xs">
                      {enquete.demandeur}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          enquete.statut === "Assigné"
                            ? "bg-blue-100 text-blue-800"
                            : enquete.statut === "En cours"
                            ? "bg-yellow-100 text-yellow-800"
                            : enquete.statut === "Complété"
                            ? "bg-green-100 text-green-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {enquete.statut}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewEnquete(enquete)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleAssignEnquete(enquete)}
                          className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                          title="Assigner"
                        >
                          <UserCheck className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(enquete)}
                          className="p-1 text-amber-600 hover:bg-amber-100 rounded transition-colors"
                          title="Mettre à jour statut"
                        >
                          <Filter className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteEnquete(enquete)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredEnquetes.length > 0 && (
          <div className="flex items-center justify-between px-3 py-2 border-t bg-gray-50">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-gray-700">Éléments par page :</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border border-gray-300 rounded text-xs"
              >
                <option value={10}>10</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-gray-500">
                {indexOfFirstItem + 1}-
                {Math.min(indexOfLastItem, filteredEnquetes.length)} sur{" "}
                {filteredEnquetes.length}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-100"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>

              {getPageNumbers().map((page, idx) =>
                page === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-1 text-xs text-gray-500"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2 py-1 text-xs border rounded ${
                      currentPage === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white border-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages || totalPages === 0}
                className="p-1 border border-gray-300 rounded disabled:opacity-50 hover:bg-gray-100"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Assigner */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Assigner l'enquête</h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigner à *
                </label>
                <select
                  value={assignData.assignTo}
                  onChange={(e) =>
                    setAssignData((prev) => ({
                      ...prev,
                      assignTo: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Sélectionner un destinataire</option>
                  <option value="investigateur1">Investigateur 1</option>
                  <option value="investigateur2">Investigateur 2</option>
                  <option value="comite">Comité d'enquête</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raison de l'assignation
                </label>
                <textarea
                  value={assignData.reason}
                  onChange={(e) =>
                    setAssignData((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Raison optionnelle..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Assigner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Statut */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Mettre à jour le statut</h2>
              <button
                onClick={() => setShowStatusModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStatusSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau statut *
                </label>
                <select
                  value={statusData.status}
                  onChange={(e) =>
                    setStatusData((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Sélectionner un statut</option>
                  {statuts.map((statut) => (
                    <option key={statut} value={statut}>
                      {statut}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={statusData.notes}
                  onChange={(e) =>
                    setStatusData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Notes supplémentaires..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700"
                >
                  Mettre à jour
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Suppression Moderne */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 transform transition-all">
            {/* Header avec icône d'alerte */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4 rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">
                    Confirmer la suppression
                  </h2>
                  <p className="text-red-100 text-sm">Action irréversible</p>
                </div>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800 text-sm">
                    Enquête à supprimer
                  </h3>
                  <p className="text-red-600 text-xs">
                    {selectedEnqueteForAction?.reference} -{" "}
                    {selectedEnqueteForAction?.nom_prenom}
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-amber-800 text-sm mb-1">
                      Attention
                    </h4>
                    <p className="text-amber-700 text-xs leading-relaxed">
                      Cette action est définitive et ne peut pas être annulée.
                      Toutes les données associées à cette enquête seront
                      définitivement supprimées du système.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                <CheckCircle className="w-4 h-4 text-gray-400" />
                <span>
                  Veuillez confirmer votre intention de supprimer cette enquête
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Annuler
              </button>
              <button
                onClick={confirmDeleteEnquete}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Générer Rapport */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Générer un Rapport</h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={generateReport} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type de rapport *
                </label>
                <select
                  value={reportData.type}
                  onChange={(e) =>
                    setReportData((prev) => ({ ...prev, type: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  required
                >
                  <option value="quotidien">Quotidien</option>
                  <option value="hebdomadaire">Hebdomadaire</option>
                  <option value="mensuel">Mensuel</option>
                  <option value="personnalise">Personnalisé</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date début *
                  </label>
                  <input
                    type="date"
                    value={reportData.dateDebut}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        dateDebut: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date fin *
                  </label>
                  <input
                    type="date"
                    value={reportData.dateFin}
                    onChange={(e) =>
                      setReportData((prev) => ({
                        ...prev,
                        dateFin: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Générer Rapport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnquetesView;
