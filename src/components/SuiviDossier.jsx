import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, X, ArrowLeft, CheckCircle, Clock, XCircle, Copy, ChevronLeft as ChevronLeftIcon, ChevronRight, AlertCircle, Download, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SuiviDossier = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchRef, setSearchRef] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedReport, setSelectedReport] = useState(null);
  const [language, setLanguage] = useState('fr');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Récupérer les données depuis l'API
  useEffect(() => {
    const fetchReports = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("🔄 Chargement des données depuis l'API...");
        
        const response = await fetch('http://localhost:8000/api/reports', {
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
        
        // ADAPTATION À LA NOUVELLE STRUCTURE DE VOTRE API
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

        console.log("📊 Données à traiter:", reportsData);

        if (reportsData && reportsData.length > 0) {
          const mappedReports = reportsData.map(report => {
            console.log("📝 Traitement du rapport:", report);

            // Parser le workflow depuis la colonne workflow (qui est un JSON string)
            let workflowData = {
              drse: { 
                date: report.created_at || report.drse_date, 
                status: 'in_progress', 
                agent: 'DRSE Analamanga' 
              },
              cac: { 
                date: report.cac_date || null, 
                status: 'pending', 
                agent: 'CAC - Cellule Anti-Corruption' 
              },
              bianco: { 
                date: report.bianco_date || null, 
                status: 'pending', 
                agent: 'BIANCO' 
              }
            };

            try {
              if (report.workflow && typeof report.workflow === 'string') {
                workflowData = JSON.parse(report.workflow);
              } else if (report.workflow && typeof report.workflow === 'object') {
                workflowData = report.workflow;
              }
            } catch (e) {
              console.warn("❌ Erreur parsing workflow:", e);
              // Garder les valeurs par défaut
            }

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
              console.warn("❌ Erreur parsing files:", e);
            }

            // Construction de l'objet rapport avec les données de votre API
            const mappedReport = {
              id: report.id,
              reference: report.reference,
              date: report.created_at,
              category: report.category,
              status: report.status,
              isAnonymous: report.isAnonymous || report.type === 'anonyme',
              name: report.name || 'Anonyme',
              email: report.email || '',
              phone: report.phone || '',
              description: report.description || report.title || 'Aucune description',
              filesCount: filesArray.length,
              files: filesArray,
              workflow: workflowData,
              region: report.region || 'Non spécifié',
              city: report.city || 'Non spécifié',
              // Champs supplémentaires de votre API
              title: report.title,
              type: report.type
            };

            console.log("✅ Rapport mappé:", mappedReport);
            return mappedReport;
          });

          console.log("🎉 Tous les rapports mappés:", mappedReports);
          setReports(mappedReports);
          setFilteredReports(mappedReports);
        } else {
          console.log("ℹ️ Aucune donnée à afficher");
          setReports([]);
          setFilteredReports([]);
        }
      } catch (error) {
        console.error('💥 Erreur lors de la récupération des données:', error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Traductions
  const translations = {
    fr: {
      title: 'Suivi des Dossiers',
      subtitle: 'Consultez et suivez l\'état d\'avancement de tous les signalements',
      searchRef: 'Rechercher par référence',
      status: 'Statut',
      all: 'Tous',
      perPage: 'Par page',
      back: 'Retour',
      showing: 'Affichage de',
      to: 'à',
      of: 'sur',
      page: 'Page',
      loading: 'Chargement en cours...',
      statuses: {
        en_cours: 'En cours',
        finalise: 'Finalisé',
        doublon: 'Doublon',
        refuse: 'Refusé'
      },
      categories: {
        all: 'Tous les Dossiers',
        'faux-diplomes': 'Faux Diplômes',
        'fraudes-academique': 'Fraudes Académiques',
        'recrutements-irreguliers': 'Recrutements Irréguliers',
        'harcelement': 'Harcèlement',
        'corruption': 'Corruption',
        'divers': 'Divers'
      },
      categoryIcons: {
        all: '📋',
        'faux-diplomes': '📜',
        'fraudes-academique': '🎓',
        'recrutements-irreguliers': '💼',
        'harcelement': '⚠️',
        'corruption': '🔴',
        'divers': '📝'
      },
      table: {
        reference: 'Référence',
        date: 'Date',
        category: 'Catégorie',
        submitter: 'Émetteur',
        status: 'Statut',
        progress: 'Progression'
      },
      workflow: {
        title: 'Suivi du traitement',
        drse: 'Réception DRSE',
        cac: 'Analyse CAC',
        bianco: 'Traitement BIANCO',
        completed: 'Complété',
        in_progress: 'En cours',
        pending: 'En attente',
        rejected: 'Rejeté',
        duplicate: 'Doublon',
        not_required: 'Non requis'
      },
      details: {
        title: 'Détails du Signalement',
        reference: 'Référence',
        date: 'Date de soumission',
        category: 'Catégorie',
        status: 'Statut',
        submitter: 'Informations de l\'émetteur',
        name: 'Nom',
        email: 'Email',
        phone: 'Téléphone',
        description: 'Description',
        files: 'Pièces jointes',
        anonymous: 'Signalement anonyme',
        close: 'Fermer',
        noFiles: 'Aucun fichier joint',
        download: 'Télécharger',
        view: 'Voir',
        noPhone: 'Non renseigné'
      },
      noResults: 'Aucun signalement trouvé',
      error: {
        title: 'Erreur de chargement',
        message: 'Impossible de charger les données',
        retry: 'Réessayer'
      }
    },
    mg: {
      title: 'Fanarahan-maso ny Dossier',
      subtitle: 'Jereo sy araho ny fivoaran\'ny fitarainana rehetra',
      searchRef: 'Tadiavo amin\'ny référence',
      status: 'Toetry',
      all: 'Rehetra',
      perPage: 'Isaky ny pejy',
      back: 'Hiverina',
      showing: 'Mampiseho',
      to: 'hatramin\'ny',
      of: 'amin\'ny',
      page: 'Pejy',
      loading: 'Eo am-paka-baovao...',
      statuses: {
        en_cours: 'Voaray',
        finalise: 'Vita',
        doublon: 'Mitovy',
        refuse: 'Nolavina'
      },
      categories: {
        all: 'Dossier Rehetra',
        'faux-diplomes': 'Diplaoma Sandoka',
        'fraudes-academique': 'Hosoka Ara-pianarana',
        'recrutements-irreguliers': 'Fampidirana Mpiasa',
        'harcelement': 'Fanararaotana',
        'corruption': 'Kolikoly',
        'divers': 'Hafa'
      },
      categoryIcons: {
        all: '📋',
        'faux-diplomes': '📜',
        'fraudes-academique': '🎓',
        'recrutements-irreguliers': '💼',
        'harcelement': '⚠️',
        'corruption': '🔴',
        'divers': '📝'
      },
      table: {
        reference: 'Référence',
        date: 'Daty',
        category: 'Karazana',
        submitter: 'Nandefa',
        status: 'Toetry',
        progress: 'Fivoarana'
      },
      workflow: {
        title: 'Fanarahan-dàlana',
        drse: 'Fandraisana DRSE',
        cac: 'Fanadihadiana CAC',
        bianco: 'Fanodinana BIANCO',
        completed: 'Vita',
        in_progress: 'Eo am-panorana',
        pending: 'Miandry',
        rejected: 'Nolavina',
        duplicate: 'Mitovy',
        not_required: 'Tsy ilaina'
      },
      details: {
        title: 'Antsipiriany',
        reference: 'Référence',
        date: 'Daty nandefa',
        category: 'Karazana',
        status: 'Toetry',
        submitter: 'Momba ny nandefa',
        name: 'Anarana',
        email: 'Email',
        phone: 'Téléphone',
        description: 'Fanazavana',
        files: 'Pièces jointes',
        anonymous: 'Anonyme',
        close: 'Hidio',
        noFiles: 'Tsy misy rakitra',
        download: 'Hampidina',
        view: 'Hijery',
        noPhone: 'Tsy voatanisa'
      },
      noResults: 'Tsy nisy fitarainana hita',
      error: {
        title: 'Hadisoana nandritra ny famakiana',
        message: 'Tsy afaka naka ny angona',
        retry: 'Andramo indray'
      }
    }
  };

  const t = translations[language];

  // Statistiques par catégorie
  const categoryStats = {
    all: reports.length,
    'faux-diplomes': reports.filter(r => r.category === 'faux-diplomes').length,
    'fraudes-academique': reports.filter(r => r.category === 'fraudes-academique').length,
    'recrutements-irreguliers': reports.filter(r => r.category === 'recrutements-irreguliers').length,
    'harcelement': reports.filter(r => r.category === 'harcelement').length,
    'corruption': reports.filter(r => r.category === 'corruption').length,
    'divers': reports.filter(r => r.category === 'divers').length
  };

  // Filtrage
  useEffect(() => {
    let filtered = [...reports];

    if (searchRef) {
      filtered = filtered.filter(r => 
        r.reference.toLowerCase().includes(searchRef.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(r => r.status === selectedStatus);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(r => r.category === selectedCategory);
    }

    if (dateRange.start) {
      filtered = filtered.filter(r => new Date(r.date) >= new Date(dateRange.start));
    }
    if (dateRange.end) {
      filtered = filtered.filter(r => new Date(r.date) <= new Date(dateRange.end + 'T23:59:59'));
    }

    setFilteredReports(filtered);
    setCurrentPage(1);
  }, [searchRef, selectedStatus, selectedCategory, dateRange, reports]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredReports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

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
        pages.push('...');
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'en_cours': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'finalise': return 'bg-green-100 text-green-800 border-green-200';
      case 'doublon': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'refuse': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getWorkflowStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-green-600" size={18} />;
      case 'in_progress': return <Clock className="text-blue-600" size={18} />;
      case 'rejected': return <XCircle className="text-red-600" size={18} />;
      case 'duplicate': return <Copy className="text-yellow-600" size={18} />;
      case 'not_required': return <Clock className="text-gray-400" size={18} />;
      default: return <Clock className="text-gray-400" size={18} />;
    }
  };

  const getWorkflowStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-50 border-green-200';
      case 'in_progress': return 'bg-blue-50 border-blue-200';
      case 'rejected': return 'bg-red-50 border-red-200';
      case 'duplicate': return 'bg-yellow-50 border-yellow-200';
      case 'not_required': return 'bg-gray-50 border-gray-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // Fonction pour télécharger un fichier
  const handleDownloadFile = (fileName) => {
    console.log('Téléchargement du fichier:', fileName);
    // Implémentez la logique de téléchargement ici
  };

  // Fonction pour visualiser un fichier
  const handleViewFile = (fileName) => {
    console.log('Visualisation du fichier:', fileName);
    // Implémentez la logique de visualisation ici
  };

  const categories = ['all', 'faux-diplomes', 'fraudes-academique', 'recrutements-irreguliers', 'harcelement', 'corruption', 'divers'];

  // Fonction pour recharger les données
  const retryFetch = () => {
    window.location.reload();
  };

  // Affichage d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-6">
        <div className="max-w-[1600px] mx-auto">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="text-red-600" size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">{t.error.title}</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={retryFetch}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              {t.error.retry}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-5 md:p-7 mb-5">
          <div className="flex justify-between items-start mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="text-2xl font-bold text-blue-600">FOSIKA</div>
                <div className="text-sm text-gray-600">MESUPRES</div>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-1">{t.title}</h1>
              <p className="text-sm text-gray-600">{t.subtitle}</p>
            </div>
            
            {/* Sélecteur de langue */}
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage('fr')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  language === 'fr' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                FR
              </button>
              <button
                onClick={() => setLanguage('mg')}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  language === 'mg' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'
                }`}
              >
                MG
              </button>
            </div>
          </div>

          {/* Badges de catégories */}
          <div className="mb-5">
            <div className="flex flex-wrap gap-2.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                  }`}
                >
                  <span className="text-lg">{t.categoryIcons[cat]}</span>
                  <span className="font-medium text-sm">{t.categories[cat]}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                    selectedCategory === cat
                      ? 'bg-white text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {categoryStats[cat]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Filtres */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Recherche */}
            <div className="flex-1 min-w-[220px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder={t.searchRef}
                  value={searchRef}
                  onChange={(e) => setSearchRef(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
              </div>
            </div>

            {/* Statut */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="pl-3 pr-9 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer bg-white shadow-sm min-w-[150px]"
              >
                <option value="all">{t.all} - {t.status}</option>
                <option value="en_cours">{t.statuses.en_cours}</option>
                <option value="finalise">{t.statuses.finalise}</option>
                <option value="doublon">{t.statuses.doublon}</option>
                <option value="refuse">{t.statuses.refuse}</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>

            {/* Date début */}
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-sm"
            />

            {/* Date fin */}
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 shadow-sm"
            />

            {/* Items par page */}
            <div className="relative">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="pl-3 pr-9 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer bg-white shadow-sm"
              >
                <option value={10}>10 {t.perPage}</option>
                <option value={30}>30 {t.perPage}</option>
                <option value={50}>50 {t.perPage}</option>
                <option value={100}>100 {t.perPage}</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
            </div>
          </div>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600">
              {t.showing} <span className="font-semibold text-gray-800">{indexOfFirstItem + 1}</span> {t.to} <span className="font-semibold text-gray-800">{Math.min(indexOfLastItem, filteredReports.length)}</span> {t.of} <span className="font-semibold text-gray-800">{filteredReports.length}</span>
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">{t.table.reference}</th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">{t.table.date}</th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">{t.table.category}</th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">{t.table.submitter}</th>
                  <th className="px-5 py-4 text-left text-sm font-semibold text-gray-700 whitespace-nowrap">{t.table.status}</th>
                  <th className="px-5 py-4 text-center text-sm font-semibold text-gray-700 whitespace-nowrap">{t.table.progress}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-10 text-center text-sm text-gray-500">
                      <div className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t.loading}
                      </div>
                    </td>
                  </tr>
                ) : currentItems.length > 0 ? (
                  currentItems.map((report) => (
                    <tr 
                      key={report.reference} 
                      onClick={() => setSelectedReport(report)}
                      className="hover:bg-blue-50 transition-colors cursor-pointer"
                    >
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-mono text-sm font-medium text-blue-600">
                          {report.reference}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {formatDate(report.date)}
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                        <span className="flex items-center gap-2">
                          <span>{t.categoryIcons[report.category]}</span>
                          {t.categories[report.category]}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {report.name}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(report.status)}`}>
                          {t.statuses[report.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          {getWorkflowStatusIcon(report.workflow.drse.status)}
                          <div className="w-5 h-0.5 bg-gray-300"></div>
                          {getWorkflowStatusIcon(report.workflow.cac.status)}
                          <div className="w-5 h-0.5 bg-gray-300"></div>
                          {getWorkflowStatusIcon(report.workflow.bianco.status)}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-5 py-10 text-center text-sm text-gray-500">
                      {t.noResults}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="px-5 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeftIcon size={18} />
                  Précédent
                </button>

                <div className="flex items-center gap-1.5">
                  {getPageNumbers().map((pageNum, index) => (
                    pageNum === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-3 py-2 text-sm text-gray-500">
                        ...
                      </span>
                    ) : (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Suivant
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bouton retour */}
        <div className="mt-5 text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-lg transition-colors shadow-md"
          >
            <ArrowLeft size={20} />
            {t.back}
          </button>
        </div>
      </div>

      {/* Modal Détails - CORRIGÉ */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-5 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">{t.details.title}</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informations principales */}
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{t.details.reference}</label>
                  <p className="font-mono text-lg font-semibold text-blue-600">{selectedReport.reference}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{t.details.date}</label>
                  <p className="text-sm text-gray-800">{formatDate(selectedReport.date)}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{t.details.category}</label>
                  <p className="text-sm text-gray-800 flex items-center gap-2">
                    <span>{t.categoryIcons[selectedReport.category]}</span>
                    {t.categories[selectedReport.category]}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">{t.details.status}</label>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(selectedReport.status)}`}>
                    {t.statuses[selectedReport.status]}
                  </span>
                </div>
              </div>

              {/* Workflow */}
              <div className="border-t border-gray-200 pt-5">
                <h3 className="font-semibold text-gray-800 mb-4 text-base">{t.workflow.title}</h3>
                <div className="space-y-3">
                  <div className={`border rounded-lg p-4 ${getWorkflowStatusColor(selectedReport.workflow.drse.status)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {getWorkflowStatusIcon(selectedReport.workflow.drse.status)}
                        <div>
                          <h4 className="font-semibold text-sm text-gray-800">{t.workflow.drse}</h4>
                          <p className="text-xs text-gray-600">{selectedReport.workflow.drse.agent}</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {t.workflow[selectedReport.workflow.drse.status]}
                      </span>
                    </div>
                    {selectedReport.workflow.drse.date && (
                      <p className="text-xs text-gray-500 mt-2">{formatDate(selectedReport.workflow.drse.date)}</p>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <div className="w-0.5 h-6 bg-gray-300"></div>
                  </div>

                  <div className={`border rounded-lg p-4 ${getWorkflowStatusColor(selectedReport.workflow.cac.status)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {getWorkflowStatusIcon(selectedReport.workflow.cac.status)}
                        <div>
                          <h4 className="font-semibold text-sm text-gray-800">{t.workflow.cac}</h4>
                          <p className="text-xs text-gray-600">{selectedReport.workflow.cac.agent}</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {t.workflow[selectedReport.workflow.cac.status]}
                      </span>
                    </div>
                    {selectedReport.workflow.cac.date && (
                      <p className="text-xs text-gray-500 mt-2">{formatDate(selectedReport.workflow.cac.date)}</p>
                    )}
                  </div>

                  <div className="flex justify-center">
                    <div className="w-0.5 h-6 bg-gray-300"></div>
                  </div>

                  <div className={`border rounded-lg p-4 ${getWorkflowStatusColor(selectedReport.workflow.bianco.status)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        {getWorkflowStatusIcon(selectedReport.workflow.bianco.status)}
                        <div>
                          <h4 className="font-semibold text-sm text-gray-800">{t.workflow.bianco}</h4>
                          <p className="text-xs text-gray-600">{selectedReport.workflow.bianco.agent}</p>
                        </div>
                      </div>
                      <span className="text-xs font-medium text-gray-600">
                        {t.workflow[selectedReport.workflow.bianco.status]}
                      </span>
                    </div>
                    {selectedReport.workflow.bianco.date && (
                      <p className="text-xs text-gray-500 mt-2">{formatDate(selectedReport.workflow.bianco.date)}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Informations de l'émetteur - AFFICHÉ UNIQUEMENT SI NON ANONYME */}
              {!selectedReport.isAnonymous && (
                <div className="border-t border-gray-200 pt-5">
                  <h3 className="font-semibold text-gray-800 mb-3 text-base">{t.details.submitter}</h3>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">{t.details.name}</label>
                      <p className="text-gray-800 bg-gray-50 p-2 rounded border">{selectedReport.name || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">{t.details.email}</label>
                      <p className="text-gray-800 bg-gray-50 p-2 rounded border">{selectedReport.email || 'Non renseigné'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-600 mb-1">{t.details.phone}</label>
                      <p className="text-gray-800 bg-gray-50 p-2 rounded border">
                        {selectedReport.phone || t.details.noPhone}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="border-t border-gray-200 pt-5">
                <h3 className="font-semibold text-gray-800 mb-3 text-base">{t.details.description}</h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedReport.description || 'Aucune description fournie'}
                  </p>
                </div>
              </div>

              {/* Pièces jointes */}
              <div className="border-t border-gray-200 pt-5">
                <h3 className="font-semibold text-gray-800 mb-3 text-base">{t.details.files}</h3>
                {selectedReport.files && selectedReport.files.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600">
                      {selectedReport.files.length} fichier(s) joint(s)
                    </p>
                    <div className="grid gap-2">
                      {selectedReport.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                              <span className="text-blue-600 text-xs font-bold">
                                {file.split('.').pop()?.toUpperCase() || 'FILE'}
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
                              {t.details.view}
                            </button>
                            <button
                              onClick={() => handleDownloadFile(file)}
                              className="flex items-center gap-1 px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                              <Download size={14} />
                              {t.details.download}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-sm text-gray-500">{t.details.noFiles}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-5">
              <button
                onClick={() => setSelectedReport(null)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {t.details.close}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuiviDossier;