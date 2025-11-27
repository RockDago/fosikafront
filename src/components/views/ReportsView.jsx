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
  Clock,
  Plus,
  Edit,
  UserCheck,
  Filter,
  Users,
  Archive,
  Send,
  ChevronDown,
  ChevronUp,
  FileText,
  ArrowUpDown,
  AlertTriangle,
} from "lucide-react";

const ReportsView = () => {
  const [currentTab, setCurrentTab] = useState("tous");
  const [filters, setFilters] = useState({
    search: "",
    region: "",
    province: "",
    statut: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [activeCategory, setActiveCategory] = useState("tous");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showClassifyModal, setShowClassifyModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false); // Nouveau modal de suppression
  const [selectedReportForAction, setSelectedReportForAction] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    auteur: true,
    description: true,
    pieces: true,
  });
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc", // 'asc' pour ancien -> récent, 'desc' pour récent -> ancien
  });

  // États pour les modals
  const [newReport, setNewReport] = useState({
    category: "",
    description: "",
    files: [],
  });
  const [assignData, setAssignData] = useState({
    assignTo: "cac_dagi",
    reason: "",
  });
  const [statusData, setStatusData] = useState({
    status: "",
    notes: "",
  });
  const [classifyData, setClassifyData] = useState({
    reason: "",
  });
  const [editData, setEditData] = useState({});
  const [reportData, setReportData] = useState({
    type: "quotidien",
    dateDebut: new Date().toISOString().split("T")[0],
    dateFin: new Date().toISOString().split("T")[0],
    categories: [],
  });

  // Catégories pour l'analyse
  const categories = [
    {
      id: "faux-diplomes",
      emoji: "📜",
      name: "Faux Diplômes",
    },
    {
      id: "offre-formation-irreguliere",
      emoji: "🎓",
      name: "Offre de formation irrégulière (non habilité)",
    },
    {
      id: "recrutements-irreguliers",
      emoji: "💼",
      name: "Recrutements Irréguliers",
    },
    {
      id: "harcelement",
      emoji: "⚠️",
      name: "Harcèlement",
    },
    {
      id: "corruption",
      emoji: "🔴",
      name: "Corruption",
    },
    {
      id: "divers",
      emoji: "🏷️",
      name: "Divers",
    },
  ];

  // Options pour l'assignation
  const assignToOptions = [{ value: "cac_dagi", label: "CAC / DAGI" }];

  // Options pour le statut
  const statusOptions = [
    { value: "cac_dagi", label: "CAC / DAGI" },
    { value: "transmis_autorite", label: "Transmet à l'autorité compétente" },
  ];

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

  // Générer une référence unique
  const generateReference = () => {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, "");
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `REF-${dateStr}-${randomStr}`;
  };

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

  // Mapping des catégories API vers les catégories affichées
  const categoryMapping = {
    "faux-diplomes": "📜 Faux Diplômes",
    "offre-formation-irreguliere":
      "🎓 Offre de formation irrégulière (non habilité)",
    "recrutements-irreguliers": "💼 Recrutements Irréguliers",
    harcelement: "⚠️ Harcèlement",
    corruption: "🔴 Corruption",
    divers: "🏷️ Divers",
  };

  // Récupérer les données depuis l'API
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(
          "http://localhost:8000/api/reports?per_page=1000",
          {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.json();
        let reportsData = [];

        if (result.success && result.data && result.data.reports) {
          reportsData = result.data.reports;
        } else if (result.success && Array.isArray(result.data)) {
          reportsData = result.data;
        } else if (Array.isArray(result)) {
          reportsData = result;
        } else {
          console.warn("⚠️ Structure de données non reconnue:", result);
          reportsData = [];
        }

        if (reportsData && reportsData.length > 0) {
          const mappedReports = reportsData.map((report) => {
            // Parser files
            let filesArray = [];
            try {
              if (report.files) {
                if (typeof report.files === "string") {
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
              nom_prenom:
                report.is_anonymous || report.type === "anonyme"
                  ? "Anonyme"
                  : report.name || "Non spécifié",
              telephone: report.phone || "N/A",
              email: report.email || "N/A",
              categorie: report.category,
              categorieLabel:
                categoryMapping[report.category] || report.category,
              region: report.region || "Non spécifié",
              province: getProvinceFromRegion(report.region),
              raison: report.title || "Non spécifié",
              type_signalement:
                report.is_anonymous || report.type === "anonyme"
                  ? "Anonyme"
                  : "Non-Anonyme",
              explication: report.description || "Aucune description",
              files: filesArray,
              status: report.status || "daaq_drse",
              assigned_to: report.assigned_to || "Non assigné",
              city: report.city,
            };
          });

          setReports(mappedReports);
        } else {
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
  }, [madagascarRegions]);

  // Calcul des statistiques par catégorie
  const calculateCategoryStats = (categoryId) => {
    if (categoryId === "tous") {
      const total = reports.length;
      const encours = reports.filter(
        (report) => report.status === "daaq_drse"
      ).length;
      const resolus = reports.filter(
        (report) => report.status === "finalise"
      ).length;
      return { total, encours, resolus };
    }

    const categoryReports = reports.filter(
      (report) => report.categorie === categoryId
    );
    const total = categoryReports.length;
    const encours = categoryReports.filter(
      (report) => report.status === "daaq_drse"
    ).length;
    const resolus = categoryReports.filter(
      (report) => report.status === "finalise"
    ).length;

    return { total, encours, resolus };
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

  // Fonction pour obtenir le statut affichable
  const getDisplayStatus = (status) => {
    const statusMap = {
      daaq_drse: "DAAQ / DRSE",
      cac_dagi: "CAC / DAGI",
      transmis_autorite: "Transmis à autorité",
      classifier: "Classifié",
      finalise: "Finalisé",
      doublon: "Doublon",
      refuse: "Refusé",
    };
    return statusMap[status] || status;
  };

  // Fonction pour obtenir l'assignation affichable
  const getDisplayAssignedTo = (assignedTo) => {
    const assignMap = {
      cac_dagi: "CAC / DAGI",
      autorite_competente: "Autorité compétente",
    };
    return assignMap[assignedTo] || assignedTo || "Non assigné";
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

  // Fonction de tri
  const sortReports = (reportsToSort) => {
    if (!sortConfig.key) return reportsToSort;

    return [...reportsToSort].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Gestion des dates
      if (sortConfig.key === "date") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Gestion des références
      if (sortConfig.key === "id") {
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

  // Combiner tous les signalements (triés par date desc par défaut)
  const allReports = useMemo(() => {
    return sortReports([...reports]);
  }, [reports, sortConfig]);

  // Filtrer les rapports selon l'onglet et les filtres
  const filteredReports = useMemo(() => {
    let baseReports = [];

    switch (currentTab) {
      case "anonyme":
        baseReports = reports.filter((r) => r.type_signalement === "Anonyme");
        break;

      case "non-anonyme":
        baseReports = reports.filter(
          (r) => r.type_signalement === "Non-Anonyme"
        );
        break;

      case "classifier":
        baseReports = reports.filter((r) => r.status === "classifier");
        break;

      case "assignes":
        baseReports = reports.filter(
          (r) => r.assigned_to && r.assigned_to !== "Non assigné"
        );
        break;

      default:
        baseReports = allReports;
    }

    // Filtrage supplémentaire par catégorie active
    if (activeCategory !== "tous") {
      baseReports = baseReports.filter(
        (report) => report.categorie === activeCategory
      );
    }

    return baseReports.filter((report) => {
      const matchSearch =
        !filters.search ||
        report.id.toLowerCase().includes(filters.search.toLowerCase()) ||
        report.nom_prenom
          .toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        (report.categorieLabel &&
          report.categorieLabel
            .toLowerCase()
            .includes(filters.search.toLowerCase()));

      const matchRegion = !filters.region || report.region === filters.region;

      const matchProvince =
        !filters.province || report.province === filters.province;

      const matchStatut = !filters.statut || report.status === filters.statut;

      return matchSearch && matchRegion && matchProvince && matchStatut;
    });
  }, [allReports, reports, currentTab, filters, activeCategory]);

  // Pagination
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const paginatedReports = filteredReports.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // Générer les numéros de page (max 5 visibles + 1er + dernier)
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
      region: "",
      province: "",
      statut: "",
    });
    setCurrentPage(1);
  };

  const exportReports = () => {
    const csvContent = [
      ["Référence", "Date", "Nom/Prénom", "Catégorie", "Statut", "Assigné à"],
      ...filteredReports.map((report) => [
        report.id,
        new Date(report.date).toLocaleDateString("fr-FR"),
        report.nom_prenom,
        report.categorieLabel || "N/A",
        getDisplayStatus(report.status),
        getDisplayAssignedTo(report.assigned_to),
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
      `signalements_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fonctions de gestion des actions
  const handleViewReport = (report) => {
    setSelectedReport(selectedReport?.id === report.id ? null : report);
    setExpandedSections({
      general: true,
      auteur: true,
      description: true,
      pieces: true,
    });
  };

  const handleAssignReport = (report) => {
    setSelectedReportForAction(report);
    setAssignData({
      assignTo: report.assigned_to || "cac_dagi",
      reason: "",
    });
    setShowAssignModal(true);
  };

  const handleStatusUpdate = (report) => {
    setSelectedReportForAction(report);
    setStatusData({
      status: report.status || "",
      notes: "",
    });
    setShowStatusModal(true);
  };

  const handleEditReport = (report) => {
    setSelectedReportForAction(report);
    setEditData({
      category: report.categorie,
      description: report.explication,
    });
    setShowEditModal(true);
  };

  const handleClassifyReport = (report) => {
    setSelectedReportForAction(report);
    setClassifyData({
      reason: "",
    });
    setShowClassifyModal(true);
  };

  // Nouvelle fonction pour ouvrir le modal de suppression
  const handleDeleteReport = (report) => {
    setSelectedReportForAction(report);
    setShowDeleteModal(true);
  };

  // Fonction pour confirmer la suppression
  const confirmDeleteReport = () => {
    if (selectedReportForAction) {
      console.log("Supprimer le signalement:", selectedReportForAction);
      // TODO: appel API delete
      // Après suppression réussie :
      setShowDeleteModal(false);
      setSelectedReportForAction(null);
    }
  };

  // Toggle des sections
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Téléchargement fichier
  const handleDownloadFile = (fileName) => {
    const encodedFileName = encodeURIComponent(fileName);
    const link = document.createElement("a");
    link.href = `http://localhost:8000/uploads/${encodedFileName}`;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Visualisation fichier
  const handleViewFile = (fileName) => {
    const encodedFileName = encodeURIComponent(fileName);
    window.open(`http://localhost:8000/uploads/${encodedFileName}`, "_blank");
  };

  // Gestion des fichiers pour nouveau signalement
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewReport((prev) => ({
      ...prev,
      files: [...prev.files, ...files],
    }));
  };

  const removeFile = (index) => {
    setNewReport((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
  };

  // Soumission des formulaires
  const handleCreateReport = (e) => {
    e.preventDefault();
    console.log("Nouveau signalement:", newReport);
    // TODO: Appel API pour créer le signalement
    setShowCreateModal(false);
    setNewReport({ category: "", description: "", files: [] });
  };

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    console.log("Assigner:", selectedReportForAction.id, assignData);
    // TODO: Appel API pour assigner
    setShowAssignModal(false);
  };

  const handleStatusSubmit = (e) => {
    e.preventDefault();
    console.log(
      "Mettre à jour statut:",
      selectedReportForAction.id,
      statusData
    );
    // TODO: Appel API pour mettre à jour le statut
    setShowStatusModal(false);
  };

  const handleClassifySubmit = (e) => {
    e.preventDefault();
    console.log("Classifier:", selectedReportForAction.id, classifyData);
    // TODO: Appel API pour classifier
    setShowClassifyModal(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    console.log("Modifier:", selectedReportForAction.id, editData);
    // TODO: Appel API pour modifier
    setShowEditModal(false);
  };

  const generateReport = (e) => {
    e.preventDefault();
    console.log("Générer rapport:", reportData);
    // TODO: Implémenter la génération du rapport
    setShowReportModal(false);
  };

  // Statistiques par onglet (inclut classifier et assignés)
  const getTabStats = () => {
    return {
      tous: allReports.length,
      anonyme: reports.filter((r) => r.type_signalement === "Anonyme").length,
      "non-anonyme": reports.filter((r) => r.type_signalement === "Non-Anonyme")
        .length,
      classifier: reports.filter((r) => r.status === "classifier").length,
      assignes: reports.filter(
        (r) => r.assigned_to && r.assigned_to !== "Non assigné"
      ).length,
    };
  };

  const tabStats = getTabStats();

  // Données pour la catégorie active
  const cat = categories.find((c) => c.id === activeCategory);
  const categoryStats = calculateCategoryStats(activeCategory);

  // Si un signalement est sélectionné, afficher uniquement la page de détail
  if (selectedReport) {
    return (
      <>
        <div className="p-4 bg-white min-h-screen">
          {/* Header de la page de détail */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Détail du Signalement - {selectedReport.id}
              </h1>
              <p className="text-xs text-gray-600 mt-1">
                {formatDate(selectedReport.date)} •{" "}
                {selectedReport.categorieLabel}
              </p>
            </div>
            <button
              onClick={() => setSelectedReport(null)}
              className="flex items-center gap-2 px-3 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
              Retour à la liste
            </button>
          </div>

          {/* Sections toggleables optimisées */}
          <div className="space-y-3">
            {/* Section Informations Générales */}
            <div className="bg-white rounded-lg border border-gray-200">
              <button
                onClick={() => toggleSection("general")}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    Informations Générales
                  </h4>
                </div>
                {expandedSections.general ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              {expandedSections.general && (
                <div className="px-3 pb-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <span className="text-gray-600 block mb-1">
                        Référence:
                      </span>
                      <p className="font-medium text-sm">{selectedReport.id}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Date:</span>
                      <p className="font-medium text-sm">
                        {formatDate(selectedReport.date)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">
                        Catégorie:
                      </span>
                      <p className="font-medium text-sm">
                        {selectedReport.categorieLabel}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">
                        Province:
                      </span>
                      <p className="font-medium text-sm">
                        {selectedReport.province}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Région:</span>
                      <p className="font-medium text-sm">
                        {selectedReport.region}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Ville:</span>
                      <p className="font-medium text-sm">
                        {selectedReport.city || "Non spécifié"}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Statut:</span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          selectedReport.status === "daaq_drse"
                            ? "bg-blue-100 text-blue-800"
                            : selectedReport.status === "cac_dagi"
                            ? "bg-indigo-100 text-indigo-800"
                            : selectedReport.status === "transmis_autorite"
                            ? "bg-cyan-100 text-cyan-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getDisplayStatus(selectedReport.status)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">
                        Assigné à:
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          selectedReport.assigned_to === "cac_dagi"
                            ? "bg-indigo-100 text-indigo-800"
                            : selectedReport.assigned_to ===
                              "autorite_competente"
                            ? "bg-cyan-100 text-cyan-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getDisplayAssignedTo(selectedReport.assigned_to)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Type:</span>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {selectedReport.type_signalement}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section Auteur */}
            <div className="bg-white rounded-lg border border-gray-200">
              <button
                onClick={() => toggleSection("auteur")}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    Informations de l'Auteur
                  </h4>
                </div>
                {expandedSections.auteur ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              {expandedSections.auteur && (
                <div className="px-3 pb-3">
                  {selectedReport.type_signalement === "Anonyme" ? (
                    <div className="text-center py-3">
                      <Users className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs text-gray-600">
                        Signalement anonyme
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <div>
                        <span className="text-gray-600 block mb-1">
                          Nom / Prénom:
                        </span>
                        <p className="font-medium text-sm">
                          {selectedReport.nom_prenom}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">Email:</span>
                        <p className="font-medium text-sm">
                          {selectedReport.email}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">
                          Téléphone:
                        </span>
                        <p className="font-medium text-sm">
                          {selectedReport.telephone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Section Description */}
            <div className="bg-white rounded-lg border border-gray-200">
              <button
                onClick={() => toggleSection("description")}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    Description du Signalement
                  </h4>
                </div>
                {expandedSections.description ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              {expandedSections.description && (
                <div className="px-3 pb-3">
                  <div className="bg-gray-50 rounded-md p-3 text-xs leading-relaxed">
                    {selectedReport.explication}
                  </div>
                </div>
              )}
            </div>

            {/* Section Pièces Jointes */}
            <div className="bg-white rounded-lg border border-gray-200">
              <button
                onClick={() => toggleSection("pieces")}
                className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    Pièces Jointes
                  </h4>
                </div>
                {expandedSections.pieces ? (
                  <ChevronUp className="w-4 h-4 text-gray-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                )}
              </button>
              {expandedSections.pieces && (
                <div className="px-3 pb-3">
                  {selectedReport.files && selectedReport.files.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedReport.files.map((file, idx) => {
                        const fileName =
                          typeof file === "string" ? file : file.name || "";
                        const encoded = encodeURIComponent(fileName);
                        const url = `http://localhost:8000/uploads/${encoded}`;
                        const ext = fileName.split(".").pop()?.toLowerCase();
                        const isImage = [
                          "jpg",
                          "jpeg",
                          "png",
                          "gif",
                          "webp",
                        ].includes(ext);
                        const isPdf = ext === "pdf";

                        return (
                          <div
                            key={idx}
                            className="bg-gray-50 rounded-lg border overflow-hidden"
                          >
                            <div className="aspect-video bg-white flex items-center justify-center">
                              {isImage ? (
                                <img
                                  src={url}
                                  alt={fileName}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120'%3E%3Crect width='100%25' height='100%25' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' fill='%239ca3af' font-size='12'%3EImpossible de charger l'image%3C/text%3E%3C/svg%3E";
                                  }}
                                />
                              ) : isPdf ? (
                                <div className="text-center p-2">
                                  <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-1">
                                    <span className="text-red-600 font-bold text-xs">
                                      PDF
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600">
                                    Document PDF
                                  </p>
                                </div>
                              ) : (
                                <div className="text-center p-2">
                                  <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-1">
                                    <span className="text-gray-600 font-bold text-xs">
                                      {ext?.toUpperCase()}
                                    </span>
                                  </div>
                                  <p className="text-xs text-gray-600">
                                    Fichier {ext}
                                  </p>
                                </div>
                              )}
                            </div>
                            <div className="p-2">
                              <p
                                className="text-xs font-medium truncate mb-1"
                                title={fileName}
                              >
                                {fileName}
                              </p>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleViewFile(fileName)}
                                  className="flex-1 bg-blue-50 text-blue-600 py-1 px-1 rounded text-xs hover:bg-blue-100 transition-colors"
                                >
                                  Voir
                                </button>
                                <button
                                  onClick={() => handleDownloadFile(fileName)}
                                  className="flex-1 bg-gray-100 text-gray-700 py-1 px-1 rounded text-xs hover:bg-gray-200 transition-colors"
                                >
                                  Télécharger
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Download className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-xs text-gray-600">
                        Aucun fichier joint
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Actions footer optimisées - SUPPRIMÉ le bouton "Traiter le dossier" */}
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <div className="flex gap-2">
              <button
                onClick={() => handleEditReport(selectedReport)}
                className="flex items-center gap-1 px-3 py-1 text-xs border border-indigo-300 text-indigo-700 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <Edit className="w-3 h-3" />
                Modifier
              </button>
              <button
                onClick={() => handleDeleteReport(selectedReport)}
                className="flex items-center gap-1 px-3 py-1 text-xs border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Supprimer
              </button>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleAssignReport(selectedReport)}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <UserCheck className="w-3 h-3" />
                Assigner
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedReport)}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <Filter className="w-3 h-3" />
                Statut
              </button>
              <button
                onClick={() => handleClassifyReport(selectedReport)}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Archive className="w-3 h-3" />
                Classifier
              </button>
            </div>
          </div>
        </div>

        {/* Modals avec z-index élevé pour s'afficher devant le toggle view */}
        {showAssignModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">
                  Assigner le signalement
                </h2>
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
                    {assignToOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
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

        {showStatusModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">
                  Mettre à jour le statut
                </h2>
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
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
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

        {showClassifyModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg w-full max-w-md mx-4">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Classifier le dossier</h2>
                <button
                  onClick={() => setShowClassifyModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleClassifySubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Raison de la classification *
                  </label>
                  <textarea
                    value={classifyData.reason}
                    onChange={(e) =>
                      setClassifyData((prev) => ({
                        ...prev,
                        reason: e.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Expliquez la raison de la classification du dossier..."
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowClassifyModal(false)}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
                  >
                    Classifier
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showEditModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">
                  Modifier le signalement
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Catégorie *
                  </label>
                  <select
                    value={editData.category}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Sélectionner une catégorie</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.emoji} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    value={editData.description}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Modifier
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Suppression Moderne */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
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
                      Signalement à supprimer
                    </h3>
                    <p className="text-red-600 text-xs">
                      {selectedReportForAction?.id} -{" "}
                      {selectedReportForAction?.nom_prenom}
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
                        Toutes les données associées à ce signalement seront
                        définitivement supprimées du système.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  <span>
                    Veuillez confirmer votre intention de supprimer ce
                    signalement
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
                  onClick={confirmDeleteReport}
                  className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer définitivement
                </button>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  // Page principale avec la liste des signalements
  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-base font-semibold">
            {currentTab === "classifier"
              ? "Dossiers classifiés"
              : currentTab === "assignes"
              ? "Dossiers assignés"
              : "Liste complète des signalements"}
          </h1>
          <p className="text-xs text-gray-500">
            {currentTab === "classifier"
              ? "Signalements ayant déjà été classifiés."
              : currentTab === "assignes"
              ? "Signalements assignés à une entité de traitement."
              : "Gestion et suivi des dossiers avec filtres avancés."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1 px-3 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            <Plus className="w-3 h-3" />
            Nouveau signalement
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            className="flex items-center gap-1 px-3 py-1 text-xs border rounded-md hover:bg-gray-50"
          >
            <FileText className="w-3 h-3" />
            Générer Rapport
          </button>

          <button
            onClick={exportReports}
            className="flex items-center gap-1 px-3 py-1 text-xs border rounded-md hover:bg-gray-50"
          >
            <Download className="w-3 h-3" />
            Exporter CSV
          </button>
        </div>
      </div>

      {/* Section Analyse Détaillée par Catégories */}
      <div className="mb-6 bg-white rounded-lg border p-4">
        {/* Header Analyse */}
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 mb-1">
            Analyse Détaillée par Catégories
          </h2>
          <p className="text-sm text-gray-600">
            Visualisation et analyse approfondie des signalements par catégorie
          </p>
        </div>

        {/* Catégorie Tabs - Maintenant utilisées comme filtres - EN UNE SEULE LIGNE */}
        <div className="flex flex-nowrap gap-2 mb-4 overflow-x-auto pb-2">
          <button
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all whitespace-nowrap flex-shrink-0 ${
              activeCategory === "tous"
                ? "bg-blue-50 border-blue-200 text-blue-700 font-semibold"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
            onClick={() => setActiveCategory("tous")}
          >
            <span className="text-sm">📊 Toutes</span>
          </button>
          {categories.map((catg) => {
            const stats = calculateCategoryStats(catg.id);
            return (
              <button
                key={catg.id}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all whitespace-nowrap flex-shrink-0 ${
                  activeCategory === catg.id
                    ? "bg-blue-50 border-blue-200 text-blue-700 font-semibold"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
                onClick={() => setActiveCategory(catg.id)}
              >
                <span className="text-sm">
                  {catg.emoji} {catg.name}
                </span>
                <span className="bg-gray-100 rounded-full px-2 py-1 text-xs font-medium">
                  {stats.total}
                </span>
              </button>
            );
          })}
        </div>

        {/* Synthèse */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            {activeCategory === "tous"
              ? "Synthèse - Toutes catégories"
              : `Synthèse - ${cat?.name}`}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-gray-900">
                {activeCategory === "tous"
                  ? allReports.length
                  : categoryStats.total}
              </div>
              <div className="text-gray-500 text-sm mt-1">
                Signalements totaux
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-amber-600">
                {activeCategory === "tous"
                  ? reports.filter((r) => r.status === "daaq_drse").length
                  : categoryStats.encours}
              </div>
              <div className="text-gray-500 text-sm mt-1">En cours</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border text-center">
              <div className="text-2xl font-bold text-green-600">
                {activeCategory === "tous"
                  ? reports.filter((r) => r.status === "finalise").length
                  : categoryStats.resolus}
              </div>
              <div className="text-gray-500 text-sm mt-1">Résolus</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-3">
        <button
          className={
            currentTab === "tous"
              ? "px-3 py-1 text-xs rounded-full bg-blue-600 text-white"
              : "px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
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
            currentTab === "anonyme"
              ? "px-3 py-1 text-xs rounded-full bg-blue-600 text-white"
              : "px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
          }
          onClick={() => {
            setCurrentTab("anonyme");
            setCurrentPage(1);
          }}
        >
          Anonymes ({tabStats.anonyme})
        </button>

        <button
          className={
            currentTab === "non-anonyme"
              ? "px-3 py-1 text-xs rounded-full bg-blue-600 text-white"
              : "px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
          }
          onClick={() => {
            setCurrentTab("non-anonyme");
            setCurrentPage(1);
          }}
        >
          Non-Anonymes ({tabStats["non-anonyme"]})
        </button>

        <button
          className={
            currentTab === "assignes"
              ? "px-3 py-1 text-xs rounded-full bg-blue-600 text-white"
              : "px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
          }
          onClick={() => {
            setCurrentTab("assignes");
            setCurrentPage(1);
          }}
        >
          Dossiers Assignés ({tabStats.assignes})
        </button>

        <button
          className={
            currentTab === "classifier"
              ? "px-3 py-1 text-xs rounded-full bg-blue-600 text-white"
              : "px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700"
          }
          onClick={() => {
            setCurrentTab("classifier");
            setCurrentPage(1);
          }}
        >
          Dossiers Classifiés ({tabStats.classifier})
        </button>
      </div>

      {/* Filtres - Sans catégorie */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="md:col-span-2">
          <input
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            placeholder="Rechercher par référence, nom..."
            className="w-full px-2 py-1 text-xs border rounded-md"
          />
        </div>

        <div>
          <select
            value={filters.province}
            onChange={(e) => handleFilterChange("province", e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded-md"
          >
            <option value="">Toutes les provinces</option>
            {availableProvinces.map((prov) => (
              <option key={prov} value={prov}>
                {prov}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filters.region}
            onChange={(e) => handleFilterChange("region", e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded-md max-h-32 overflow-y-auto"
          >
            <option value="">Toutes les régions</option>
            {availableRegions.map((reg) => (
              <option key={reg} value={reg}>
                {reg}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={filters.statut}
            onChange={(e) => handleFilterChange("statut", e.target.value)}
            className="w-full px-2 py-1 text-xs border rounded-md"
          >
            <option value="">Tous les statuts</option>
            <option value="daaq_drse">DAAQ / DRSE</option>
            <option value="cac_dagi">CAC / DAGI</option>
            <option value="transmis_autorite">Transmis à autorité</option>
            <option value="classifier">Classifié</option>
            <option value="finalise">Finalisé</option>
          </select>
        </div>
      </div>

      {/* Bouton reset filtres + info compte */}
      <div className="flex items-center justify-between mb-2 text-xs">
        <button
          onClick={resetFilters}
          className="flex items-center gap-1 px-2 py-1 border rounded-md hover:bg-gray-50"
        >
          <X className="w-3 h-3" />
          Réinitialiser les filtres
        </button>
        <div className="text-gray-500">
          {filteredReports.length} signalements trouvés
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="flex items-center gap-2 p-2 mb-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md">
          <AlertCircle className="w-4 h-4" />
          <span>Erreur lors du chargement des données : {error}</span>
        </div>
      )}

      {/* Tableau des signalements avec tri */}
      <div className="border rounded-md overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4 text-center text-xs text-gray-500">
              Chargement en cours...
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-4 text-center text-xs text-gray-500">
              Aucun signalement trouvé avec les filtres actuels
            </div>
          ) : (
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-2 py-2 text-left">
                    <button
                      onClick={() => handleSort("id")}
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                    >
                      <span>Référence</span>
                      {getSortIcon("id")}
                    </button>
                  </th>
                  <th className="px-2 py-2 text-left">
                    <button
                      onClick={() => handleSort("date")}
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                    >
                      <span>Date</span>
                      {getSortIcon("date")}
                    </button>
                  </th>
                  <th className="px-2 py-2 text-left">Nom / Prénom</th>
                  <th className="px-2 py-2 text-left">Catégorie</th>
                  <th className="px-2 py-2 text-left">Statut</th>
                  <th className="px-2 py-2 text-left">Assigné à</th>
                  <th className="px-2 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReports.map((report) => (
                  <tr key={report.id} className="border-t hover:bg-gray-50">
                    <td className="px-2 py-2 font-medium">{report.id}</td>
                    <td className="px-2 py-2">{formatDate(report.date)}</td>
                    <td className="px-2 py-2">{report.nom_prenom}</td>
                    <td className="px-2 py-2">{report.categorieLabel}</td>
                    <td className="px-2 py-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          report.status === "daaq_drse"
                            ? "bg-blue-100 text-blue-800"
                            : report.status === "cac_dagi"
                            ? "bg-indigo-100 text-indigo-800"
                            : report.status === "transmis_autorite"
                            ? "bg-cyan-100 text-cyan-800"
                            : report.status === "classifier"
                            ? "bg-gray-100 text-gray-800"
                            : report.status === "finalise"
                            ? "bg-green-100 text-green-800"
                            : report.status === "doublon"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {getDisplayStatus(report.status)}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          report.assigned_to === "cac_dagi"
                            ? "bg-indigo-100 text-indigo-800"
                            : report.assigned_to === "autorite_competente"
                            ? "bg-cyan-100 text-cyan-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getDisplayAssignedTo(report.assigned_to)}
                      </span>
                    </td>
                    <td className="px-2 py-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleViewReport(report)}
                          className="p-1 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleAssignReport(report)}
                          className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                          title="Assigner"
                        >
                          <UserCheck className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(report)}
                          className="p-1 text-amber-600 hover:bg-amber-100 rounded transition-colors"
                          title="Mettre à jour statut"
                        >
                          <Filter className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleClassifyReport(report)}
                          className="p-1 text-purple-600 hover:bg-purple-100 rounded transition-colors"
                          title="Classifier"
                        >
                          <Archive className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleEditReport(report)}
                          className="p-1 text-indigo-600 hover:bg-indigo-100 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteReport(report)}
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
        {filteredReports.length > 0 && (
          <div className="flex items-center justify-between px-2 py-2 border-t bg-gray-50">
            <div className="flex items-center gap-2 text-xs">
              <span>Éléments par page :</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 border rounded-md text-xs"
              >
                <option value={10}>10</option>
                <option value={30}>30</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-gray-500">
                {indexOfFirstItem + 1}-
                {Math.min(indexOfLastItem, filteredReports.length)} sur{" "}
                {filteredReports.length}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1 border rounded-md disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getPageNumbers().map((page, idx) =>
                page === "..." ? (
                  <span
                    key={`ellipsis-${idx}`}
                    className="px-2 text-xs text-gray-500"
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-2 py-1 text-xs border rounded-md ${
                      currentPage === page
                        ? "bg-blue-600 text-white"
                        : "bg-white"
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
                className="p-1 border rounded-md disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Nouveau Signalement réduit */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            {/* Header moderne */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 bg-white/20 rounded-lg">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      Nouveau Signalement
                    </h2>
                    <p className="text-blue-100 text-xs">
                      Créer un nouveau signalement
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 text-white hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateReport} className="p-4 space-y-4">
              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Référence *
                  </label>
                  <input
                    type="text"
                    value={generateReference()}
                    disabled
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-gray-50 text-gray-600 font-mono"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Générée automatiquement
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    value={new Date().toISOString().split("T")[0]}
                    disabled
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Catégorie *
                </label>
                <select
                  value={newReport.category}
                  onChange={(e) =>
                    setNewReport((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={newReport.description}
                  onChange={(e) =>
                    setNewReport((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Décrivez le signalement en détail..."
                  required
                />
              </div>

              {/* Pièces jointes */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Preuves (Pièces jointes)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <Download className="w-5 h-5 text-gray-400 mb-1" />
                    <p className="text-xs text-gray-600">
                      <span className="text-blue-600 hover:text-blue-500">
                        Cliquez pour télécharger
                      </span>{" "}
                      ou glissez-déposez
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      PNG, JPG, PDF, DOC jusqu'à 10MB
                    </p>
                  </label>
                </div>
                {newReport.files.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <h4 className="text-xs font-medium text-gray-700">
                      Fichiers sélectionnés:
                    </h4>
                    {newReport.files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                            <span className="text-blue-600 text-xs font-medium">
                              {file.name.split(".").pop()?.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-xs font-medium truncate max-w-[120px]">
                            {file.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-800 p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  Ajouter
                </button>
              </div>
            </form>
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
                    setReportData((prev) => ({
                      ...prev,
                      type: e.target.value,
                    }))
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégories (optionnel)
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md p-2">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-2 mb-1 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={reportData.categories.includes(cat.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setReportData((prev) => ({
                              ...prev,
                              categories: [...prev.categories, cat.id],
                            }));
                          } else {
                            setReportData((prev) => ({
                              ...prev,
                              categories: prev.categories.filter(
                                (id) => id !== cat.id
                              ),
                            }));
                          }
                        }}
                        className="rounded"
                      />
                      <span>
                        {cat.emoji} {cat.name}
                      </span>
                    </label>
                  ))}
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

      {/* Les autres modals pour la page principale */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Assigner le signalement</h2>
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
                  {assignToOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
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
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
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

      {showClassifyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Classifier le dossier</h2>
              <button
                onClick={() => setShowClassifyModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleClassifySubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raison de la classification *
                </label>
                <textarea
                  value={classifyData.reason}
                  onChange={(e) =>
                    setClassifyData((prev) => ({
                      ...prev,
                      reason: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Expliquez la raison de la classification du dossier..."
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowClassifyModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Classifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Modifier le signalement</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie *
                </label>
                <select
                  value={editData.category}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      category: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Sélectionner une catégorie</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.emoji} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Modifier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Suppression Moderne pour la page principale */}
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
                    Signalement à supprimer
                  </h3>
                  <p className="text-red-600 text-xs">
                    {selectedReportForAction?.id} -{" "}
                    {selectedReportForAction?.nom_prenom}
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
                      Toutes les données associées à ce signalement seront
                      définitivement supprimées du système.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                <CheckCircle className="w-4 h-4 text-gray-400" />
                <span>
                  Veuillez confirmer votre intention de supprimer ce signalement
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
                onClick={confirmDeleteReport}
                className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-lg hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer définitivement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsView;
