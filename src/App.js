import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FormulaireSignalement from "./components/SignalementForm";
import SuiviDossier from "./components/SuiviDossier"; // Importez le composant SuiviDossier
import Login from "./components/login";

function App() {
  return (
    <Router>
      <Routes>
        {/* Page d'accueil publique */}
        <Route path="/" element={<FormulaireSignalement />} />

        {/* Page de suivi des dossiers */}
        <Route path="/suivi" element={<SuiviDossier />} />

        {/* Page de connexion admin */}
        <Route path="/admin/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;