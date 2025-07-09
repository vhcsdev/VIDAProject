import axios from 'axios';

// Configuração base da API
const API_BASE_URL = import.meta.env.DEV ? '/api' : 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token automaticamente
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vida_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas de erro
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('vida_token');
      localStorage.removeItem('vida_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Serviços de Autenticação
export const authService = {
  // Login com email e senha
  async login(credentials) {
    const response = await api.post('/token', credentials);
    const { access_token, token_type } = response.data;
    
    localStorage.setItem('vida_token', access_token);
    return response.data;
  },

  // Registro de novo usuário
  async register(userData) {
    const response = await api.post('/users/', userData);
    return response.data;
  },

  // Logout
  logout() {
    localStorage.removeItem('vida_token');
    localStorage.removeItem('vida_user');
  },

  // Verificar se está logado
  isAuthenticated() {
    return !!localStorage.getItem('vida_token');
  },

  // Obter token
  getToken() {
    return localStorage.getItem('vida_token');
  }
};

// Serviços de Usuário
export const userService = {
  // Criar novo usuário
  async createUser(userData) {
    const response = await api.post('/users/', {
      name: userData.full_name || userData.name,
      email: userData.email
    });
    return response.data;
  },

  // Obter usuário por email
  async getUserByEmail(email) {
    const response = await api.get(`/users/${email}`);
    return response.data;
  },

  // Obter perfil do usuário logado (se implementado com autenticação)
  async getProfile() {
    const response = await api.get('/me');
    localStorage.setItem('vida_user', JSON.stringify(response.data));
    return response.data;
  },

  // Atualizar perfil (se implementado)
  async updateProfile(userData) {
    const response = await api.put('/me', userData);
    localStorage.setItem('vida_user', JSON.stringify(response.data));
    return response.data;
  },

  // Obter usuário do localStorage
  getCachedUser() {
    const user = localStorage.getItem('vida_user');
    return user ? JSON.parse(user) : null;
  }
};

// Serviços de Voz
export const voiceService = {
  // Cadastrar perfil de voz
  async createVoiceProfile(email, audioFile) {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('audio_file', audioFile);

    const response = await api.post('/voice/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Verificar voz para autenticação
  async verifyVoice(email, audioFile) {
    const formData = new FormData();
    formData.append('email', email);
    formData.append('audio_file', audioFile);

    const response = await api.post('/voice/verify', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Obter informações do perfil de voz
  async getVoiceProfile(email) {
    const response = await api.get(`/users/${email}/voices`);
    return response.data;
  },

  // Deletar perfil de voz
  async deleteVoiceProfile() {
    const response = await api.delete('/voice/profile');
    return response.data;
  }
};

// Utilitários de Audio
export const audioUtils = {
  // Verificar se o navegador suporta gravação de áudio
  isRecordingSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  },

  // Solicitar permissão de microfone
  async requestMicrophonePermission() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Para o stream
      return true;
    } catch (error) {
      console.error('Erro ao solicitar permissão do microfone:', error);
      return false;
    }
  },

  // Converter blob para file
  blobToFile(blob, filename) {
    return new File([blob], filename, { type: blob.type });
  }
};

export default api;
