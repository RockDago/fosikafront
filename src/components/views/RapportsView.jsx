// resources/js/components/RapportsView.jsx
import React, { useState, useEffect } from "react";

const reportTypes = [
  {
    id: "hebdo",
    icon: "📅",
    title: "Rapport Hebdomadaire",
    subtitle: "Synthèse des activités de la semaine",
  },
  {
    id: "mensuel",
    icon: "🗓️",
    title: "Rapport Mensuel",
    subtitle: "Bilan complet des activités mensuelles",
  },
  {
    id: "categorie",
    icon: "📊",
    title: "Rapport par Catégorie",
    subtitle: "Analyse détaillée par signalement",
  },
  {
    id: "final",
    icon: "🏁",
    title: "Rapport Final d'Opération",
    subtitle: "Synthèse globale de l'opération",
  },
];

// Fonction utilitaire pour les appels API avec fetch
const apiRequest = async (url, options = {}) => {
  const token =
    localStorage.getItem("admin_token") ||
    sessionStorage.getItem("admin_token");

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  // Ajouter le body pour les requêtes POST
  if (options.body && typeof options.body === "object") {
    config.body = JSON.stringify(options.body);
  }

  try {
    console.log(`🌐 API Call: ${config.method || "GET"} ${url}`);
    const response = await fetch(`http://localhost:8000/api${url}`, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`✅ API Success: ${url}`, data);
    return data;
  } catch (error) {
    console.error(`❌ API Failed: ${url}`, error);
    throw error;
  }
};

export default function RapportsView() {
  const [lastReport, setLastReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState({});
  const [sending, setSending] = useState({});
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchLastReport();
  }, []);

  const fetchLastReport = async () => {
    try {
      setLoading(true);
      const data = await apiRequest("/reports/last-generated");

      if (data.success && data.data) {
        setLastReport(data.data);
      } else {
        setLastReport(null);
      }
    } catch (error) {
      console.error("Erreur récupération dernier rapport:", error);
      showMessage("error", "Erreur lors du chargement du dernier rapport");
      setLastReport(null);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType) => {
    try {
      setGenerating((prev) => ({ ...prev, [reportType]: true }));
      setMessage({ type: "", text: "" });

      console.log(`🔄 Génération du rapport: ${reportType}`);

      const data = await apiRequest("/reports/generate", {
        method: "POST",
        body: { type: reportType },
      });

      if (data.success) {
        showMessage("success", "Rapport généré avec succès!");
        await fetchLastReport();
      } else {
        showMessage("error", data.message || "Erreur lors de la génération");
      }
    } catch (error) {
      console.error("❌ Erreur génération rapport:", error);
      showMessage("error", "Erreur lors de la génération du rapport");
    } finally {
      setGenerating((prev) => ({ ...prev, [reportType]: false }));
    }
  };

  const sendReportToInstitution = async (reportId, institution) => {
    try {
      setSending((prev) => ({ ...prev, [institution]: true }));
      setMessage({ type: "", text: "" });

      const data = await apiRequest(`/reports/${reportId}/send`, {
        method: "POST",
        body: { institution },
      });

      if (data.success) {
        showMessage("success", data.message);
        await fetchLastReport();
      } else {
        showMessage("error", data.message || "Erreur lors de l'envoi");
      }
    } catch (error) {
      console.error("❌ Erreur envoi rapport:", error);
      showMessage("error", "Erreur lors de l'envoi du rapport");
    } finally {
      setSending((prev) => ({ ...prev, [institution]: false }));
    }
  };

  const downloadReport = async (reportId) => {
    try {
      setMessage({ type: "", text: "" });

      const data = await apiRequest(`/reports/${reportId}/download`);

      if (data.success) {
        showMessage("success", "Rapport prêt pour téléchargement");
        console.log("📊 Données du rapport:", data.data);
      }
    } catch (error) {
      console.error("❌ Erreur téléchargement:", error);
      showMessage("error", "Erreur lors du téléchargement");
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const getDisplayData = () => {
    if (lastReport) {
      return {
        title: lastReport.title,
        summary: lastReport.summary || [],
        results: lastReport.results || [],
        challenges: lastReport.challenges || [],
        recommendations: lastReport.recommendations || [],
        is_sent_to_drse: lastReport.is_sent_to_drse,
        is_sent_to_cac: lastReport.is_sent_to_cac,
        is_sent_to_bianco: lastReport.is_sent_to_bianco,
        id: lastReport.id,
      };
    }

    return {
      title: "Aucun rapport généré",
      summary: [
        "Générez un rapport pour voir les statistiques",
        "Les données seront calculées automatiquement",
        "Rapports disponibles: Hebdomadaire, Mensuel, Par Catégorie, Final",
      ],
      results: [
        "Taux de résolution: --%",
        "Délai moyen de traitement: --h",
        "Satisfaction citoyens: --%",
      ],
      challenges: [
        "En attente de données pour analyse",
        "Générez un rapport pour identifier les défis",
      ],
      recommendations: [
        "Commencez par générer un rapport hebdomadaire",
        "Analysez les tendances sur différentes périodes",
        "Utilisez les rapports pour améliorer vos processus",
      ],
      is_sent_to_drse: false,
      is_sent_to_cac: false,
      is_sent_to_bianco: false,
      id: null,
    };
  };

  const displayData = getDisplayData();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Message de notification */}
      {message.text && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Rapports d'Analyse
        </h1>
        <p className="text-gray-600 text-sm">
          Génération et gestion des rapports d'activité
        </p>
      </div>

      {/* Types de rapports disponibles */}
      <div className="mb-8">
        <h2 className="text-base font-semibold text-gray-900 mb-3">
          Types de rapports disponibles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reportTypes.map((type) => (
            <div
              key={type.id}
              className="bg-white rounded-xl shadow-sm border p-5 flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="text-3xl">{type.icon}</div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900">
                    {type.title}
                  </div>
                  <div className="text-xs text-gray-500">{type.subtitle}</div>
                </div>
              </div>
              <button
                onClick={() => generateReport(type.id)}
                disabled={generating[type.id]}
                className={`w-full py-2.5 rounded-lg font-semibold transition-colors flex items-center justify-center ${
                  generating[type.id]
                    ? "bg-gray-400 cursor-not-allowed text-white"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {generating[type.id] ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
                    Génération...
                  </>
                ) : (
                  "Générer"
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dernier rapport généré */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-base font-semibold text-gray-900">
            {lastReport ? "Dernier rapport généré" : "Aperçu des rapports"}
          </h2>
          {loading && (
            <span className="text-sm text-gray-500 flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600"
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
              Chargement...
            </span>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3
            className={`font-semibold mb-4 ${
              lastReport ? "text-gray-900" : "text-gray-500"
            }`}
          >
            {displayData.title}
          </h3>

          {/* Résumé des activités */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2 text-sm">
              Résumé des activités
            </h4>
            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
              {displayData.summary.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Résultats clés */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2 text-sm">
              Résultats clés
            </h4>
            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
              {displayData.results.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Défis rencontrés */}
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-2 text-sm">
              Défis rencontrés
            </h4>
            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
              {displayData.challenges.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Recommandations */}
          <div className="mb-5">
            <h4 className="font-medium text-gray-900 mb-2 text-sm">
              Recommandations
            </h4>
            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
              {displayData.recommendations.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          </div>

          {/* Boutons Action - seulement si un rapport existe */}
          {lastReport && (
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                onClick={() => downloadReport(displayData.id)}
                className="bg-teal-600 text-white px-5 py-2 rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium"
              >
                Télécharger PDF
              </button>

              <button
                onClick={() => sendReportToInstitution(displayData.id, "drse")}
                disabled={sending.drse || displayData.is_sent_to_drse}
                className={`px-5 py-2 rounded-lg transition-colors text-sm font-medium ${
                  displayData.is_sent_to_drse
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : sending.drse
                    ? "bg-blue-400 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {sending.drse
                  ? "Envoi..."
                  : displayData.is_sent_to_drse
                  ? "Envoyé à DRSE"
                  : "Envoyer à DRSE"}
              </button>

              <button
                onClick={() => sendReportToInstitution(displayData.id, "cac")}
                disabled={sending.cac || displayData.is_sent_to_cac}
                className={`px-5 py-2 rounded-lg transition-colors text-sm font-medium ${
                  displayData.is_sent_to_cac
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : sending.cac
                    ? "bg-blue-400 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {sending.cac
                  ? "Envoi..."
                  : displayData.is_sent_to_cac
                  ? "Envoyé à CAC"
                  : "Envoyer à CAC"}
              </button>

              <button
                onClick={() =>
                  sendReportToInstitution(displayData.id, "bianco")
                }
                disabled={sending.bianco || displayData.is_sent_to_bianco}
                className={`px-5 py-2 rounded-lg transition-colors text-sm font-medium ${
                  displayData.is_sent_to_bianco
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : sending.bianco
                    ? "bg-blue-400 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {sending.bianco
                  ? "Envoi..."
                  : displayData.is_sent_to_bianco
                  ? "Envoyé à BIANCO"
                  : "Envoyer à BIANCO"}
              </button>
            </div>
          )}

          {!lastReport && !loading && (
            <div className="text-center py-4 text-gray-500 text-sm">
              <p>Générez votre premier rapport pour commencer l'analyse</p>
              <p className="mt-1">
                Les rapports incluent des statistiques, tendances et
                recommandations
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
