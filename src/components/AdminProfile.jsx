import React, { useState, useEffect } from 'react';
import { adminAPI } from '../api/admin';

const authUtils = {
  getToken: () => {
    return localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token');
  },
  isAuthenticated: () => {
    return !!(localStorage.getItem('admin_token') || sessionStorage.getItem('admin_token'));
  },
  logout: () => {
    localStorage.removeItem('admin_token');
    sessionStorage.removeItem('admin_token');
    window.location.href = '/admin/login';
  }
};

const AdminProfile = ({ onReturnToDashboard, onAvatarUpdate }) => {
  const [adminData, setAdminData] = useState({
    name: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    avatar: null,
    current_password: '',
    new_password: '',
    new_password_confirmation: ''
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('informations');
  const [avatarPreview, setAvatarPreview] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log('🔍 Starting profile fetch...');
    fetchAdminProfile();
  }, []);

  const fetchAdminProfile = async () => {
    if (!authUtils.isAuthenticated()) {
      console.error('❌ No authentication token found');
      setErrors({ submit: 'Session expirée. Veuillez vous reconnecter.' });
      return;
    }

    try {
      setIsLoading(true);
      console.log('🔄 Fetching admin profile...');
      
      const response = await adminAPI.getProfile();
      console.log('✅ API Response:', response);
      
      if (response.success) {
        const { data } = response;
        console.log('📊 Profile data received:', data);
        
        setAdminData(prev => ({
          ...prev,
          name: data.name || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: data.email || '',
          phone: data.phone || ''
        }));
        
        if (data.avatar) {
          console.log('🖼️ Avatar URL from API:', data.avatar);
          // Utiliser directement l'URL de l'API
          setAvatarPreview(data.avatar);
        } else {
          console.log('📝 No avatar found, using initials');
          setAvatarPreview('');
        }
        
        setErrors({});
      } else {
        console.warn('⚠️ Response without success:', response);
        setErrors({ submit: response.message || 'Erreur lors du chargement du profil' });
      }
    } catch (error) {
      console.error('❌ Error loading profile:', error);
      
      let errorMessage = 'Erreur lors du chargement du profil';
      
      if (error.response?.status === 401) {
        errorMessage = 'Session expirée. Veuillez vous reconnecter.';
        authUtils.logout();
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAdminData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          avatar: 'Format de fichier non supporté. Utilisez JPEG, PNG, GIF ou WebP.'
        }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          avatar: 'La taille du fichier ne doit pas dépasser 5MB.'
        }));
        return;
      }

      try {
        setIsLoading(true);
        
        // Afficher un aperçu immédiat
        const reader = new FileReader();
        reader.onload = (e) => {
          setAvatarPreview(e.target.result);
        };
        reader.readAsDataURL(file);

        console.log('🔄 Uploading avatar...');
        const response = await adminAPI.updateAvatar(file);
        console.log('✅ Avatar upload response:', response);
        
        if (response.success) {
          // Utiliser l'URL retournée par l'API
          console.log('🖼️ New avatar URL:', response.avatar_url);
          setAvatarPreview(response.avatar_url);
          setSuccessMessage('Avatar mis à jour avec succès');
          setTimeout(() => setSuccessMessage(''), 3000);
          setErrors({});
          
          // Notifier le parent que l'avatar a été mis à jour
          if (onAvatarUpdate) {
            onAvatarUpdate();
          }
          
          // Recharger les données du profil
          setTimeout(() => {
            fetchAdminProfile();
          }, 1000);
        }
      } catch (error) {
        console.error('❌ Error updating avatar:', error);
        if (error.response?.data?.errors) {
          setErrors(error.response.data.errors);
        } else {
          setErrors({ avatar: 'Erreur lors du téléchargement de l\'avatar' });
        }
        // Revenir à l'ancien avatar en cas d'erreur
        fetchAdminProfile();
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSaveInformations = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const profileData = {
        name: adminData.name,
        first_name: adminData.first_name,
        last_name: adminData.last_name,
        email: adminData.email,
        phone: adminData.phone
      };

      console.log('🔄 Updating profile with data:', profileData);
      const response = await adminAPI.updateProfile(profileData);
      
      if (response.success) {
        setSuccessMessage('Informations mises à jour avec succès');
        setTimeout(() => setSuccessMessage(''), 3000);
        setErrors({});
        
        // Recharger les données
        fetchAdminProfile();
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ submit: 'Erreur lors de la mise à jour des informations' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const passwordData = {
        current_password: adminData.current_password,
        new_password: adminData.new_password,
        new_password_confirmation: adminData.new_password_confirmation
      };

      console.log('🔄 Changing password...');
      const response = await adminAPI.updatePassword(passwordData);
      
      if (response.success) {
        setSuccessMessage('Mot de passe changé avec succès');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Réinitialiser les champs de mot de passe
        setAdminData(prev => ({
          ...prev,
          current_password: '',
          new_password: '',
          new_password_confirmation: ''
        }));
        setErrors({});
      }
    } catch (error) {
      console.error('Erreur lors du changement de mot de passe:', error);
      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      } else {
        setErrors({ submit: 'Erreur lors du changement de mot de passe' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour obtenir les initiales de l'admin
  const getInitials = () => {
    if (adminData.first_name && adminData.last_name) {
      return `${adminData.first_name[0]}${adminData.last_name[0]}`.toUpperCase();
    }
    return adminData.name ? adminData.name.substring(0, 2).toUpperCase() : 'A';
  };

  if (isLoading && !adminData.name) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Bouton de retour */}
      <div className="mb-6">
        <button
          onClick={onReturnToDashboard}
          className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour au tableau de bord
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {/* En-tête du profil */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold border-4 border-white shadow-lg overflow-hidden">
                  {avatarPreview ? (
                    <img 
                      src={avatarPreview} 
                      alt="Avatar" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="flex items-center justify-center w-full h-full">
                      {getInitials()}
                    </span>
                  )}
                </div>
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer shadow-lg hover:bg-blue-600 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                    disabled={isLoading}
                  />
                </label>
              </div>
              <div className="text-white">
                <h1 className="text-2xl font-bold">
                  {adminData.first_name && adminData.last_name 
                    ? `${adminData.first_name} ${adminData.last_name}`
                    : adminData.name
                  }
                </h1>
                <p className="text-blue-100">{adminData.email}</p>
                <p className="text-blue-100 text-sm mt-1">Administrateur</p>
              </div>
            </div>
          </div>

          {errors.avatar && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-3 text-sm">
              {Array.isArray(errors.avatar) ? errors.avatar[0] : errors.avatar}
            </div>
          )}

          {/* Navigation par onglets */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('informations')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'informations'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Informations personnelles
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`px-6 py-4 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'password'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Mot de passe
              </button>
            </nav>
          </div>

          {/* Messages de succès/erreur */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-6 py-3 text-sm">
              {successMessage}
            </div>
          )}

          {errors.submit && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-3 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Contenu des onglets */}
          <div className="p-6">
            {/* Onglet Informations personnelles */}
            {activeTab === 'informations' && (
              <form onSubmit={handleSaveInformations} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom d'affichage *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={adminData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">
                        {Array.isArray(errors.name) ? errors.name[0] : errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={adminData.first_name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.first_name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    />
                    {errors.first_name && (
                      <p className="mt-1 text-sm text-red-600">
                        {Array.isArray(errors.first_name) ? errors.first_name[0] : errors.first_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={adminData.last_name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.last_name ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    />
                    {errors.last_name && (
                      <p className="mt-1 text-sm text-red-600">
                        {Array.isArray(errors.last_name) ? errors.last_name[0] : errors.last_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={adminData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">
                        {Array.isArray(errors.email) ? errors.email[0] : errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={adminData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      disabled={isLoading}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600">
                        {Array.isArray(errors.phone) ? errors.phone[0] : errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </button>
                </div>
              </form>
            )}

            {/* Onglet Mot de passe */}
            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mot de passe actuel *
                  </label>
                  <input
                    type="password"
                    name="current_password"
                    value={adminData.current_password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.current_password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                  />
                  {errors.current_password && (
                    <p className="mt-1 text-sm text-red-600">
                      {Array.isArray(errors.current_password) ? errors.current_password[0] : errors.current_password}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nouveau mot de passe *
                  </label>
                  <input
                    type="password"
                    name="new_password"
                    value={adminData.new_password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.new_password ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                  />
                  {errors.new_password && (
                    <p className="mt-1 text-sm text-red-600">
                      {Array.isArray(errors.new_password) ? errors.new_password[0] : errors.new_password}
                    </p>
                  )}
                  <p className="mt-1 text-xs text-gray-500">
                    Le mot de passe doit contenir au moins 8 caractères.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmer le nouveau mot de passe *
                  </label>
                  <input
                    type="password"
                    name="new_password_confirmation"
                    value={adminData.new_password_confirmation}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.new_password_confirmation ? 'border-red-300' : 'border-gray-300'
                    }`}
                    disabled={isLoading}
                  />
                  {errors.new_password_confirmation && (
                    <p className="mt-1 text-sm text-red-600">
                      {Array.isArray(errors.new_password_confirmation) ? errors.new_password_confirmation[0] : errors.new_password_confirmation}
                    </p>
                  )}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Changement...' : 'Changer le mot de passe'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;