// DashboardInvestView.jsx
import React, { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

// Palette de couleurs pour les graphiques
const chartColors = [
  { border: "#2B6CB0", background: "rgba(43,108,176,0.08)" },
  { border: "#6B7280", background: "rgba(107,114,128,0.08)" },
  { border: "#16A34A", background: "rgba(22,163,74,0.08)" },
  { border: "#D97706", background: "rgba(217,119,6,0.06)" },
  { border: "#44403C", background: "rgba(68,64,60,0.06)" },
  { border: "#475569", background: "rgba(71,85,105,0.06)" },
];

const pieColors = [
  "#2B6CB0",
  "#6B7280",
  "#16A34A",
  "#D97706",
  "#475569",
  "#94A3B8",
];

const DashboardInvestView = ({ data }) => {
  const chartRef = useRef(null);
  const barChartRef = useRef(null);
  const pieChartRef = useRef(null);
  const chartInstance = useRef(null);
  const barChartInstance = useRef(null);
  const pieChartInstance = useRef(null);
  const [timeFilter, setTimeFilter] = useState("year");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Données simulées pour les statistiques
  const statsData = {
    dossiersAssignes: 6,
    soumisBianco: 2,
    enquetesCompletees: 2,
    totalDossiers: 6,
  };

  // Données pour les diagrammes
  const categoriesData = [
    { id: "faux-diplomes", name: "Faux Diplômes", total: 1, icon: "📜" },
    {
      id: "fraudes-academique",
      name: "Fraudes Académiques",
      total: 3,
      icon: "🎓",
    },
    {
      id: "recrutements-irreguliers",
      name: "Recrutements Irréguliers",
      total: 1,
      icon: "💼",
    },
    { id: "harcelement", name: "Harcèlement", total: 0, icon: "⚠️" },
    { id: "corruption", name: "Corruption", total: 1, icon: "🔴" },
    { id: "divers", name: "Divers", total: 0, icon: "🏷️" },
  ];

  // Données pour les dossiers assignés récemment
  const dossiersRecents = [
    {
      reference: "REF-2024-001",
      categorie: "📜 Faux Diplômes",
      date: "2024-01-15",
      demandeur: "Ministère des Finances",
      statut: "En cours",
    },
    {
      reference: "REF-2024-002",
      categorie: "🎓 Fraudes Académiques",
      date: "2024-01-10",
      demandeur: "Cour des Comptes",
      statut: "Soumis BIANCO",
    },
    {
      reference: "REF-2024-003",
      categorie: "🎓 Fraudes Académiques",
      date: "2024-01-08",
      demandeur: "Administration Territoriale",
      statut: "En cours",
    },
    {
      reference: "REF-2024-004",
      categorie: "💼 Recrutements Irréguliers",
      date: "2024-01-05",
      demandeur: "Banque Centrale",
      statut: "Complété",
    },
    {
      reference: "REF-2024-005",
      categorie: "🔴 Corruption",
      date: "2024-01-03",
      demandeur: "Ministère de la Justice",
      statut: "En attente",
    },
    {
      reference: "REF-2024-006",
      categorie: "🎓 Fraudes Académiques",
      date: "2024-01-02",
      demandeur: "Université Nationale",
      statut: "En cours",
    },
  ];

  // Générer des données temporelles basées sur le filtre
  const generateTimeBasedData = () => {
    let labels = [];
    let datasets = [];

    const now = new Date();
    const monthsShort = [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Juin",
      "Juil",
      "Août",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ];

    const makeDatasets = (labelArray, rangeChecks) => {
      return categoriesData.map((category, index) => {
        // Générer des données aléatoires pour la démonstration
        const data = labelArray.map(
          () => Math.floor(Math.random() * 10) + category.total
        );

        return {
          label: category.name,
          data,
          borderColor: chartColors[index].border,
          backgroundColor: chartColors[index].background,
          tension: 0.4,
          fill: false,
          pointRadius: 4,
          pointHoverRadius: 6,
          borderWidth: 2,
        };
      });
    };

    // Filtre Année (12 derniers mois)
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setMonth(start.getMonth() - 11);
    const months = Array.from({ length: 12 }, (_, i) => {
      const m = new Date(start.getFullYear(), start.getMonth() + i, 1);
      return m;
    });

    labels = months.map(
      (m) => monthsShort[m.getMonth()] + ` ${m.getFullYear()}`
    );

    const rangeChecks = months.map((m) => (d) => {
      return (
        d.getFullYear() === m.getFullYear() && d.getMonth() === m.getMonth()
      );
    });

    datasets = makeDatasets(labels, rangeChecks);

    return { labels, datasets };
  };

  // Données pour le diagramme en barres par mois
  const getReportsByMonthAndCategory = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    start.setMonth(start.getMonth() - 11);
    const months = Array.from(
      { length: 12 },
      (_, i) => new Date(start.getFullYear(), start.getMonth() + i, 1)
    );

    const monthsShort = [
      "Jan",
      "Fév",
      "Mar",
      "Avr",
      "Mai",
      "Juin",
      "Juil",
      "Août",
      "Sep",
      "Oct",
      "Nov",
      "Déc",
    ];

    const labels = months.map(
      (m) => `${monthsShort[m.getMonth()]} ${m.getFullYear()}`
    );

    const datasets = categoriesData.map((category, index) => {
      const data = months.map(
        () => Math.floor(Math.random() * 8) + category.total
      );

      return {
        label: category.name,
        data: data,
        backgroundColor: chartColors[index].background,
        borderColor: chartColors[index].border,
        borderWidth: 1,
      };
    });

    return { labels, datasets };
  };

  // Initialiser les graphiques
  useEffect(() => {
    initializeChart();
    initializeBarChart();
    initializePieChart();
  }, [timeFilter]);

  const initializeChart = () => {
    if (!chartRef.current) return;

    const { labels, datasets } = generateTimeBasedData();

    if (chartInstance.current) chartInstance.current.destroy();

    try {
      const ctx = chartRef.current.getContext("2d");
      chartInstance.current = new Chart(ctx, {
        type: "line",
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: {
              display: true,
              position: "bottom",
              labels: {
                usePointStyle: true,
                padding: 12,
                font: { size: 12 },
                color: "#455160",
              },
            },
            tooltip: {
              backgroundColor: "#fff",
              titleColor: "#383e45",
              bodyColor: "#22282c",
              borderColor: "#ddd",
              borderWidth: 1,
              padding: 12,
              displayColors: true,
              titleFont: { size: 12 },
              bodyFont: { size: 12 },
              callbacks: {
                label: (context) =>
                  `${context.dataset.label}: ${context.parsed.y} signalements`,
              },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { font: { size: 12 } },
              grid: { color: "rgba(120,130,140,0.06)" },
              title: {
                display: true,
                text: "Nombre de signalements",
                font: { size: 13, weight: "500" },
              },
            },
            x: {
              ticks: { font: { size: 12 } },
              grid: { display: false },
              title: {
                display: true,
                text: getTimeFilterTitle(),
                font: { size: 13, weight: "500" },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error("Erreur lors de l'initialisation du graphique:", error);
    }
  };

  const initializeBarChart = () => {
    if (!barChartRef.current) return;

    const { labels, datasets } = getReportsByMonthAndCategory();

    if (barChartInstance.current) barChartInstance.current.destroy();

    try {
      const ctx = barChartRef.current.getContext("2d");
      barChartInstance.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: datasets,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "top",
              labels: { usePointStyle: true, font: { size: 12 }, padding: 10 },
            },
            title: {
              display: true,
              text: `Répartition des signalements par type - 12 derniers mois`,
            },
            tooltip: {
              mode: "index",
              intersect: false,
              titleFont: { size: 12 },
              bodyFont: { size: 12 },
              callbacks: {
                label: (context) => {
                  const val =
                    context.parsed && context.parsed.y != null
                      ? context.parsed.y
                      : context.raw;
                  return `${context.dataset.label}: ${String(
                    val
                  )} signalement(s)`;
                },
                footer: (items) => {
                  const total = items.reduce(
                    (s, it) => s + (it.parsed?.y || it.raw || 0),
                    0
                  );
                  return `Total mois: ${String(total)}`;
                },
              },
            },
          },
          interaction: { mode: "index", intersect: false },
          scales: {
            x: {
              stacked: false,
              title: { display: true, text: "Mois" },
            },
            y: {
              stacked: false,
              beginAtZero: true,
              title: { display: true, text: "Nombre de signalements" },
              ticks: {
                callback: (value) => String(value),
                font: { size: 12 },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error(
        "Erreur lors de l'initialisation du diagramme en barres:",
        error
      );
    }
  };

  const initializePieChart = () => {
    if (!pieChartRef.current) return;

    const categoryData = categoriesData.map((cat) => cat.total);
    const total = categoryData.reduce((sum, value) => sum + value, 0);

    // Only show categories that have data
    const validCategories = categoriesData.filter(
      (cat, index) => categoryData[index] > 0
    );
    const validData = categoryData.filter((value) => value > 0);

    if (pieChartInstance.current) pieChartInstance.current.destroy();

    try {
      const ctx = pieChartRef.current.getContext("2d");
      pieChartInstance.current = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: validCategories.map((cat) => cat.name),
          datasets: [
            {
              data: validData,
              backgroundColor: pieColors.slice(0, validCategories.length),
              borderColor: "#fff",
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
              labels: {
                padding: 10,
                usePointStyle: true,
                font: {
                  size: 11,
                },
              },
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw;
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${context.label}: ${value} (${percentage}%)`;
                },
              },
            },
          },
        },
      });
    } catch (error) {
      console.error(
        "Erreur lors de l'initialisation du diagramme circulaire:",
        error
      );
    }
  };

  const getTimeFilterTitle = () => {
    switch (timeFilter) {
      case "day":
        return "Heures (24h)";
      case "week":
        return "Jours de la semaine";
      case "month":
        return "Semaines du mois";
      case "year":
        return "Mois de l'année";
      default:
        return "Mois 2025";
    }
  };

  const handleTimeFilterSelect = (filter) => {
    setTimeFilter(filter);
    setShowDatePicker(false);
  };

  const DatePicker = () => (
    <div className="absolute top-12 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 min-w-64">
      <div className="space-y-2">
        <button
          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md text-gray-700 font-medium"
          onClick={() => handleTimeFilterSelect("day")}
        >
          Jour
        </button>
        <button
          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md text-gray-700 font-medium"
          onClick={() => handleTimeFilterSelect("week")}
        >
          Semaine
        </button>
        <button
          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md text-gray-700 font-medium"
          onClick={() => handleTimeFilterSelect("month")}
        >
          Mois
        </button>
        <button
          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md text-gray-700 font-medium"
          onClick={() => handleTimeFilterSelect("year")}
        >
          Année
        </button>
      </div>
    </div>
  );

  useEffect(() => {
    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
      if (barChartInstance.current) barChartInstance.current.destroy();
      if (pieChartInstance.current) pieChartInstance.current.destroy();
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Tableau de bord Enquêteur
        </h1>
        <p className="text-gray-600">Vue d'ensemble de vos enquêtes en cours</p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Dossiers assignés
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {statsData.dossiersAssignes}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-xl">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Soumis à la BIANCO
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {statsData.soumisBianco}
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 text-xl">🏛️</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Enquêtes complétées
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {statsData.enquetesCompletees}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border-l-4 border-gray-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total dossiers
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {statsData.totalDossiers}
              </p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-xl">📊</span>
            </div>
          </div>
        </div>
      </div>

      {/* Graphique linéaire avec filtres */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Évolution des Signalements
          </h2>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <button
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 bg-white"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                <svg
                  className="w-5 h-5 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>
                  Période:{" "}
                  {timeFilter === "day"
                    ? "Jour"
                    : timeFilter === "week"
                    ? "Semaine"
                    : timeFilter === "month"
                    ? "Mois"
                    : "Année"}
                </span>
              </button>
              {showDatePicker && <DatePicker />}
            </div>
          </div>
        </div>
        <div className="h-96">
          <canvas ref={chartRef}></canvas>
        </div>
      </div>

      {/* Graphiques supplémentaires */}
      <div className="space-y-6">
        {/* Diagramme en barres agrandi */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Répartition des signalements par type et par mois -{" "}
            {new Date().getFullYear()}
          </h2>
          <div className="h-96">
            <canvas ref={barChartRef}></canvas>
          </div>
        </div>

        {/* Diagramme circulaire en bas */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Répartition par Catégories
          </h2>
          <div className="h-80">
            <canvas ref={pieChartRef}></canvas>
          </div>
        </div>
      </div>

      {/* Liste des dossiers assignés récemment */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Dossiers assignés récemment
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Demandeur
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {dossiersRecents.map((dossier, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {dossier.reference}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {dossier.categorie}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {dossier.date}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {dossier.demandeur}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        dossier.statut === "En cours"
                          ? "bg-blue-100 text-blue-800"
                          : dossier.statut === "Soumis BIANCO"
                          ? "bg-purple-100 text-purple-800"
                          : dossier.statut === "Complété"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {dossier.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardInvestView;
