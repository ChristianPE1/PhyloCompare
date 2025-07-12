import axios from 'axios';

// Configurar base URL para desarrollo
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Crear instancia de axios con configuración base
const api = axios.create({
   baseURL: API_BASE_URL,
   timeout: 30000, // 30 segundos
   headers: {
      'Content-Type': 'application/json',
   },
});

// Interceptor para manejo de errores
api.interceptors.response.use(
   (response) => response,
   (error) => {
      console.error('API Error:', error);

      if (error.code === 'ECONNREFUSED') {
         throw new Error('No se puede conectar al servidor. Verifica que el backend esté ejecutándose.');
      }

      if (error.response?.status === 404) {
         throw new Error('Endpoint no encontrado.');
      }

      if (error.response?.status >= 500) {
         throw new Error('Error interno del servidor.');
      }

      throw error;
   }
);

// Servicios de API
export const phylogenyAPI = {
   // Verificar salud del API
   checkHealth: async () => {
      try {
         const response = await api.get('/api/health');
         return response.data;
      } catch {
         throw new Error('El servidor no está respondiendo');
      }
   },

   // Subir archivo FASTA
   uploadFasta: async (file) => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/api/upload_fasta', formData, {
         headers: {
            'Content-Type': 'multipart/form-data',
         },
      });

      return response.data;
   },

   // Realizar alineamiento múltiple
   alignSequences: async (sessionId) => {
      const response = await api.post(`/api/align/${sessionId}`);
      return response.data;
   },

   // Construir árbol filogenético
   buildTree: async (sessionId, method) => {
      const response = await api.post(`/api/build_tree/${sessionId}/${method}`);
      return response.data;
   },

   // Comparar árboles
   compareTrees: async (sessionId, method1, method2) => {
      const response = await api.post(`/api/compare_trees/${sessionId}`, {
         method1,
         method2
      });
      return response.data;
   },

   // Obtener árbol específico
   getTree: async (sessionId, method) => {
      const response = await api.get(`/api/get_tree/${sessionId}/${method}`);
      return response.data;
   },

   // Obtener información de sesión
   getSessionInfo: async (sessionId) => {
      const response = await api.get(`/api/session/${sessionId}`);
      return response.data;
   },

   // Listar todas las sesiones
   listSessions: async () => {
      const response = await api.get('/api/sessions');
      return response.data;
   }
};

export default api;
