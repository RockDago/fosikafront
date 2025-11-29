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
  Users,
} from "lucide-react";
import API from "../../config/axios";

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
  const [selectedEnqueteForAction, setSelectedEnqueteForAction] = useState(null);
  const [sortConfig, setSortConfig] = useState({
    key: "date",
    direction: "desc",
  });
  const [expandedSections, setExpandedSections] = useState({
    general: true,
    auteur: true,
    description: true,
    pieces: true,
  });

  // États pour les modals
  const [assignData, setAssignData] = useState({
    assignTo: "",
    reason: "",
  });

  const [statusData, setStatusData] = useState({
    status: "",
  });

  const [reportData, setReportData] = useState({
    type: "quotidien",
    dateDebut: new Date().toISOString().split("T")[0],
    dateFin: new Date().toISOString().split("T")[0],
  });

  // Charger les données réelles depuis l'API
  useEffect(() => {
    fetchAssignedReports();
  }, []);

  const fetchAssignedReports = async () => {
    setIsLoading(true);
    try {
      console.log("🔄 Chargement des dossiers assignés...");

      // Essayer d'abord l'endpoint assigné
      try {
        const response = await API.get("/reports/assigned");
        console.log("✅ Dossiers assignés chargés:", response.data);

        if (response.data.success) {
          processApiResponse(response.data);
          return;
        }
      } catch (assignError) {
        console.log(
          "❌ Endpoint /assigned non disponible, tentative avec /reports"
        );
      }

      // Récupérer tous les rapports
      try {
        const response = await API.get("/reports");
        console.log("✅ Tous les rapports chargés:", response.data);

        if (response.data.success) {
          const allReports = response.data.data || [];
          
          // Pour le moment, on prend tous les rapports comme assignés
          const assignedReports = allReports;

          processApiResponse({
            success: true,
            data: assignedReports,
            stats: {
              dossiersAssignes: assignedReports.length,
              soumisBianco: assignedReports.filter((r) => r.status === "finalise").length,
              enquetesCompletees: assignedReports.filter((r) => r.status === "classifier").length,
              totalDossiers: assignedReports.length,
            }
          });
          return;
        }
      } catch (reportsError) {
        console.error("❌ Erreur avec l'endpoint /reports:", reportsError);
      }

      // Si les deux endpoints échouent
      throw new Error("Impossible de charger les données depuis l'API");
    } catch (error) {
      console.error("❌ Erreur finale:", error);
      setEnquetes([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour traiter la réponse API
  const processApiResponse = (apiData) => {
    if (apiData.success) {
      const reports = apiData.data || [];
      
      // Formater les données pour correspondre à la structure attendue
      const formattedEnquetes = reports.map((report) => ({
        id: report.id,
        reference: report.reference || `REF-${report.id}`,
        date: new Date(report.created_at || report.date).toLocaleDateString("fr-FR"),
        nom_prenom: report.name || report.demandeur || "Anonyme",
        categorie: getCategoryName(report.category),
        demandeur: getAssignedUserRole(report.assigned_to), // Afficher le rôle de la personne qui a assigné
        statut: getStatusLabel(report.status),
        province: report.province || "Non spécifié",
        region: report.region || "Non spécifié",
        rawData: report, // Conserver les données brutes pour référence
        email: report.email || "N/A",
        telephone: report.phone || "N/A",
        explication: report.description || "Aucune description",
        files: report.files || [],
        type_signalement: report.is_anonymous ? "Anonyme" : "Non-Anonyme",
        assigned_to: report.assigned_to || "Non assigné"
      }));

      setEnquetes(formattedEnquetes);
    }
  };

  // Fonction pour obtenir le nom de la catégorie
  const getCategoryName = (category) => {
    const names = {
      "faux-diplomes": "Faux Diplômes",
      "offre-formation-irreguliere": "Offre de formation irrégulière (non habilité)",
      "Offre de formation irrégulière ( non habilité)": "Offre de formation irrégulière (non habilité)",
      "recrutements-irreguliers": "Recrutements Irréguliers",
      harcelement: "Harcèlement",
      corruption: "Corruption",
      divers: "Divers",
    };
    return names[category] || category;
  };

  // Fonction pour obtenir le rôle de l'utilisateur assigné
  const getAssignedUserRole = (assignedTo) => {
    if (!assignedTo) return "Non assigné";
    
    const roles = {
      1: "Administrateur",
      2: "Investigateur",
      3: "Agent",
      4: "Superviseur"
    };
    
    return roles[assignedTo] || `Utilisateur ${assignedTo}`;
  };

  // Fonction pour obtenir le label du statut
  const getStatusLabel = (status) => {
    const labels = {
      en_cours: "En cours",
      finalise: "Soumis BIANCO",
      classifier: "Complété",
      doublon: "Doublon",
      refuse: "Refusé",
      traitement_classification: "Traitement et Classification",
      investigation: "Investigation",
      transmis_autorite: "Transmis aux autorités compétentes",
    };
    return labels[status] || status;
  };

  // Fonction pour obtenir l'affichage de l'assignation
  const getDisplayAssignedTo = (assignedTo) => {
    const assignMap = {
      investigateur: "Investigateur",
      cac_daj: "DAAQ / CAC / DAJ",
      autorite_competente: "Autorité compétente",
    };
    return assignMap[assignedTo] || assignedTo || "Non assigné";
  };

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
        aValue = new Date(a.rawData?.created_at || aValue);
        bValue = new Date(b.rawData?.created_at || bValue);
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
    setSelectedEnquete(selectedEnquete?.id === enquete.id ? null : enquete);
    setExpandedSections({
      general: true,
      auteur: true,
      description: true,
      pieces: true,
    });
  };

  const handleStatusUpdate = (enquete) => {
    setSelectedEnqueteForAction(enquete);
    setStatusData({
      status: enquete.rawData?.status || "",
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
        "Statut",
        "Province",
        "Région",
      ],
      ...filteredEnquetes.map((enquete) => [
        enquete.reference,
        enquete.date,
        enquete.nom_prenom,
        enquete.categorie,
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
      `dossiers_assignes_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Fonctions pour les fichiers
  const handleDownloadFile = async (fileName) => {
    try {
      const encodedFileName = encodeURIComponent(fileName);
      const response = await API.get(`/files/${encodedFileName}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Erreur lors du téléchargement du fichier");
    }
  };

  const handleViewFile = (fileName) => {
    const encodedFileName = encodeURIComponent(fileName);
    const fileUrl = `${API.defaults.baseURL}/files/${encodedFileName}`;
    window.open(fileUrl, "_blank");
  };

  // Toggle sections
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Statistiques par onglet
  const getTabStats = () => {
    return {
      tous: allEnquetes.length,
      "en cours": allEnquetes.filter((e) => e.statut === "En cours").length,
      "soumis bianco": allEnquetes.filter((e) => e.statut === "Soumis BIANCO").length,
      complété: allEnquetes.filter((e) => e.statut === "Complété").length,
    };
  };

  const tabStats = getTabStats();

  // Si une enquête est sélectionnée, afficher la page de détail avec toggle
  if (selectedEnquete) {
    return (
      <>
        <div className="p-4 bg-white min-h-screen">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Détail du Dossier - {selectedEnquete.reference}
              </h1>
              <p className="text-xs text-gray-600 mt-1">
                {selectedEnquete.date} • {selectedEnquete.categorie}
              </p>
            </div>
            <button
              onClick={() => setSelectedEnquete(null)}
              className="flex items-center gap-2 px-3 py-2 text-xs border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
              Retour à la liste
            </button>
          </div>

          <div className="space-y-3">
            {/* Informations Générales avec toggle */}
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
                      <p className="font-medium text-sm">
                        {selectedEnquete.reference}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Date:</span>
                      <p className="font-medium text-sm">{selectedEnquete.date}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">
                        Catégorie:
                      </span>
                      <p className="font-medium text-sm">
                        {selectedEnquete.categorie}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">
                        Province:
                      </span>
                      <p className="font-medium text-sm">
                        {selectedEnquete.province}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Région:</span>
                      <p className="font-medium text-sm">{selectedEnquete.region}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">Statut:</span>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedEnquete.statut === "En cours"
                            ? "bg-yellow-100 text-yellow-800"
                            : selectedEnquete.statut === "Soumis BIANCO"
                            ? "bg-blue-100 text-blue-800"
                            : selectedEnquete.statut === "Complété"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {selectedEnquete.statut}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600 block mb-1">
                        Assigné à:
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          selectedEnquete.assigned_to === "investigateur"
                            ? "bg-indigo-100 text-indigo-800"
                            : selectedEnquete.assigned_to === "cac_daj"
                            ? "bg-blue-100 text-blue-800"
                            : selectedEnquete.assigned_to === "autorite_competente"
                            ? "bg-cyan-100 text-cyan-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getDisplayAssignedTo(selectedEnquete.assigned_to)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Informations de l'Auteur avec toggle */}
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
                  {selectedEnquete.type_signalement === "Anonyme" ? (
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
                          {selectedEnquete.nom_prenom}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">Email:</span>
                        <p className="font-medium text-sm">
                          {selectedEnquete.email}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-600 block mb-1">
                          Téléphone:
                        </span>
                        <p className="font-medium text-sm">
                          {selectedEnquete.telephone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description du Signalement avec toggle */}
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
                    {selectedEnquete.explication}
                  </div>
                </div>
              )}
            </div>

            {/* Pièces Jointes avec toggle */}
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
                  {selectedEnquete.files && selectedEnquete.files.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {selectedEnquete.files.map((file, idx) => {
                        const fileName = typeof file === "string" ? file : file.name || "";
                        const ext = fileName.split(".").pop()?.toLowerCase();
                        const isImage = ["jpg", "jpeg", "png", "gif", "webp"].includes(ext);
                        const isPdf = ext === "pdf";

                        return (
                          <div
                            key={idx}
                            className="bg-gray-50 rounded-lg border overflow-hidden"
                          >
                            <div className="aspect-video bg-white flex items-center justify-center">
                              {isImage ? (
                                <img
                                  src={`${API.defaults.baseURL}/files/${encodeURIComponent(fileName)}`}
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

          <div className="flex justify-end items-center mt-6 pt-4 border-t">
            <div className="flex gap-2">
              <button
                onClick={() => handleStatusUpdate(selectedEnquete)}
                className="flex items-center gap-1 px-3 py-1 text-xs bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                <Filter className="w-3 h-3" />
                Statut
              </button>
              <button
                onClick={() => handleDeleteEnquete(selectedEnquete)}
                className="flex items-center gap-1 px-3 py-1 text-xs border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Supprimer
              </button>
            </div>
          </div>
        </div>

        {/* Modal Statut mis à jour */}
        {showStatusModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
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
                    Nouveau statut <span className="text-red-600">*</span>
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
                    <option value="investigation">Investigation</option>
                    <option value="transmis_autorite">
                      Transmis aux autorités compétentes
                    </option>
                    <option value="refuse">Refusé</option>
                    <option value="classifier">Classifié</option>
                    <option value="en_cours">En cours</option>
                    <option value="finalise">Finalisé</option>
                  </select>
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
                    Mettre à jour le statut
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Suppression */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 transform transition-all">
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

              <div className="p-6">
                <div className="flex items-center gap-4 mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-800 text-sm">
                      Dossier à supprimer
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
                        Toutes les données associées à ce dossier seront
                        définitivement supprimées du système.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-gray-400" />
                  <span>
                    Veuillez confirmer votre intention de supprimer ce dossier
                  </span>
                </div>
              </div>

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
      </>
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
            Générer rapport
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
            currentTab === "soumis bianco"
              ? "px-3 py-1 text-xs rounded-lg bg-blue-600 text-white"
              : "px-3 py-1 text-xs rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
          }
          onClick={() => {
            setCurrentTab("soumis bianco");
            setCurrentPage(1);
          }}
        >
          Soumis BIANCO ({tabStats["soumis bianco"]})
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
              placeholder="Rechercher par référence, nom ou catégorie..."
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
          {filteredEnquetes.length} dossiers trouvés
        </div>
      </div>

      {/* Tableau des enquêtes */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
              Chargement des dossiers assignés...
            </div>
          ) : filteredEnquetes.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">
              Aucun dossier assigné trouvé avec les filtres actuels
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
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          enquete.statut === "En cours"
                            ? "bg-yellow-100 text-yellow-800"
                            : enquete.statut === "Soumis BIANCO"
                            ? "bg-blue-100 text-blue-800"
                            : enquete.statut === "Complété"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
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

      {/* Modal Statut mis à jour */}
      {showStatusModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
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
                  Nouveau statut <span className="text-red-600">*</span>
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
                  <option value="investigation">Investigation</option>
                  <option value="transmis_autorite">
                    Transmis aux autorités compétentes
                  </option>
                  <option value="refuse">Refusé</option>
                  <option value="classifier">Classifié</option>
                  <option value="en_cours">En cours</option>
                  <option value="finalise">Finalisé</option>
                </select>
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
                  Mettre à jour le statut
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

            <div className="p-6">
              <div className="flex items-center gap-4 mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-red-800 text-sm">
                    Dossier à supprimer
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
                      Toutes les données associées à ce dossier seront
                      définitivement supprimées du système.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                <CheckCircle className="w-4 h-4 text-gray-400" />
                <span>
                  Veuillez confirmer votre intention de supprimer ce dossier
                </span>
              </div>
            </div>

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

      {/* Modal Générer rapport */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-lg w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Générer un rapport</h2>
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
                  Générer rapport
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