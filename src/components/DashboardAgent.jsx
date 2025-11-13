import React, { useState, useEffect } from "react";
import { teamService } from "../services/teamService";

const DashboardAgent = ({ onDeconnexion }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const response = await teamService.getCurrentUser();
        if (response.success) {
          setCurrentUser(response.data);
        }
      } catch (error) {
        console.error("Erreur chargement utilisateur:", error);
      } finally {
        setLoading(false);
      }
    };

    loadCurrentUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">FOSIKA</h1>
              <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                Tableau de Bord Agent
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {currentUser?.nom_complet}
              </span>
              <button
                onClick={onDeconnexion}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-200"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Bienvenue, Agent {currentUser?.nom_complet}
              </h2>
              
              {/* Informations utilisateur */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900">Informations Personnelles</h3>
                  <div className="mt-2 space-y-2 text-sm text-gray-700">
                    <p><strong>Email:</strong> {currentUser?.email}</p>
                    <p><strong>Téléphone:</strong> {currentUser?.telephone}</p>
                    <p><strong>Département:</strong> {currentUser?.departement}</p>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900">Statistiques</h3>
                  <div className="mt-2 space-y-2 text-sm text-gray-700">
                    <p><strong>Dossiers traités:</strong> 0</p>
                    <p><strong>Dossiers en cours:</strong> 0</p>
                    <p><strong>Signalements reçus:</strong> 0</p>
                  </div>
                </div>
              </div>

              {/* Fonctionnalités Agent */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition duration-200">
                  <div className="text-3xl mb-2">📋</div>
                  <h3 className="font-semibold text-gray-800">Gestion des Dossiers</h3>
                  <p className="text-sm text-gray-600 mt-2">Traiter et classer les signalements</p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition duration-200">
                  <div className="text-3xl mb-2">📊</div>
                  <h3 className="font-semibold text-gray-800">Rapports</h3>
                  <p className="text-sm text-gray-600 mt-2">Créer et consulter les rapports</p>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4 text-center hover:shadow-md transition duration-200">
                  <div className="text-3xl mb-2">🔍</div>
                  <h3 className="font-semibold text-gray-800">Suivi</h3>
                  <p className="text-sm text-gray-600 mt-2">Suivre l'avancement des dossiers</p>
                </div>
              </div>

              {/* Responsabilités */}
              {currentUser?.responsabilites && (
                <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-800 mb-2">Responsabilités</h3>
                  <p className="text-sm text-yellow-700">{currentUser.responsabilites}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardAgent;