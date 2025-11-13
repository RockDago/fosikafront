import axios from '../config/axios';

export const adminAPI = {
  // Récupérer le profil admin
  getProfile: async () => {
    try {
      console.log('🔄 API Call: GET /admin/profile');
      const response = await axios.get('/admin/profile');
      console.log('✅ API Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ API Error in getProfile:', error);
      throw error;
    }
  },

  // Mettre à jour les informations du profil
  updateProfile: async (profileData) => {
    console.log('🔄 API Call: PUT /admin/profile', profileData);
    const response = await axios.put('/admin/profile', profileData);
    return response.data;
  },

  // Mettre à jour l'avatar
  updateAvatar: async (avatarFile) => {
    const formData = new FormData();
    formData.append('avatar', avatarFile);
    
    console.log('🔄 API Call: POST /admin/profile/avatar');
    const response = await axios.post('/admin/profile/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Changer le mot de passe
  updatePassword: async (passwordData) => {
    console.log('🔄 API Call: POST /admin/profile/password');
    const response = await axios.post('/admin/profile/password', passwordData);
    return response.data;
  },
};