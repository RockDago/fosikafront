import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoadingPage from "./components/LoadingPage";
import FormulaireSignalement from "./components/SignalementForm";
import SuiviDossier from "./components/SuiviDossier";
import Login from "./components/login";
import DashboardAdmin from "./components/DashboardAdmin";
import DashboardAgent from "./components/DashboardAgent";
import DashboardInvest from "./components/DashboardInvest";

function App() {
  return (
    <Router>
      <Routes>
        {/* Page de chargement sur la racine / */}
        <Route path="/" element={<LoadingPage />} />

        {/* Page principale de signalement sur /signalement */}
        <Route path="/signalement" element={<FormulaireSignalement />} />

        {/* Page de suivi des dossiers */}
        <Route path="/suivi" element={<SuiviDossier />} />

        {/* Page de connexion admin */}
        <Route path="/admin/login" element={<Login />} />

        {/* Tableau de bord Admin */}
        <Route path="/admin/*" element={<DashboardAdmin />} />

        {/* Tableau de bord Agent */}
        <Route path="/agent/*" element={<DashboardAgent />} />

        {/* Tableau de bord Investigateur */}
        <Route path="/investigateur/*" element={<DashboardInvest />} />

        {/* Route fallback pour les pages non trouvées */}
        <Route
          path="*"
          element={
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  404 - Page non trouvée
                </h1>
                <p className="text-gray-600 mb-8">
                  La page que vous recherchez n'existe pas.
                </p>
                <a
                  href="/"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Retour à l'accueil
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
