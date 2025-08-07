import axios from 'axios';

// Tipo para usuario
export type User = { _id: string; firstName: string; lastName: string; email: string };

// La URL base de nuestra API con fallback inteligente para Vercel Lite
const getApiBaseUrl = () => {
  // Si está definida la variable de entorno, usarla
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Si estamos en producción (Vercel), usar las Vercel Functions
  if (window.location.hostname !== 'localhost') {
    // Usar las Vercel Functions en el mismo dominio
    return '/api';
  }
  
  // En desarrollo local, usar localhost
  return 'http://localhost:3000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Creamos una instancia de axios que usaremos para todas las peticiones.
// Esto nos permite configurar cosas como la URL base y los encabezados en un solo lugar.
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Importante para que las cookies de sesión se envíen con cada petición
});

interface RegisterUserData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface CreateProspectData {
  name: string;
  email: string;
  phone: string;
  loanAmount: string;
  type: 'Individual' | 'Company';
  loanType: 'Purchase' | 'Refinance';
  assignedTo: string;
}

interface UpdateProspectData {
  name?: string;
  type?: 'Individual' | 'Company';
  loanType?: 'Purchase' | 'Refinance';
  assignedTo?: string;
  currentStage?: string;
  status?: 'In Progress' | 'Completed' | 'Rejected';
  closedAt?: string;
}

// Definimos un objeto que contendrá todos nuestros métodos de la API.
export const apiService = {
  // --- Auth --- 
  registerUser: (userData: RegisterUserData) => {
    // axios envuelve la respuesta en un objeto `data`
    return apiClient.post('/auth/register', userData).then(res => res.data);
  },

  loginUser: (credentials: LoginCredentials) => {
    return apiClient.post('/auth/login', credentials).then(res => res.data);
  },

  logoutUser: () => {
    return apiClient.post('/auth/logout').then(res => res.data);
  },

  getCurrentUser: () => {
    return apiClient.get('/auth/users/current').then(res => res.data);
  },

  // --- Prospects ---

  // --- Users ---
  getAllUsers: (): Promise<User[]> => {
    return apiClient.get('/prospects/users').then(res => res.data);
  },
  getProspects: () => {
    return apiClient.get('/prospects').then(res => res.data);
  },

  createProspect: (prospectData: CreateProspectData) => {
    return apiClient.post('/prospects', prospectData).then(res => res.data);
  },

  updateProspect: (prospectId: string, updateData: UpdateProspectData) => {
    return apiClient.put(`/prospects/${prospectId}`, updateData).then(res => res.data);
  },

  rejectProspect: (prospectId: string, stage: string) => {
    return apiClient.put(`/prospects/${prospectId}/reject`, { stage }).then(res => res.data);
  },

  reopenProspect: (prospectId: string) => {
    return apiClient.put(`/prospects/${prospectId}/reopen`).then(res => res.data);
  },

  addDocument: (prospectId: string, stage: string, name: string) => {
    return apiClient.post(`/prospects/${prospectId}/documents`, { stage, name }).then(res => res.data);
  },

  updateDocumentStatus: (prospectId: string, stage: string, docIdx: number) => {
    return apiClient.put(`/prospects/${prospectId}/documents/${stage}/${docIdx}/status`).then(res => res.data);
  },

  updateClosingCheckbox: (prospectId: string, stage: string, docIdx: number, field: string) => {
    return apiClient.put(`/prospects/${prospectId}/documents/${stage}/${docIdx}/closing`, { field }).then(res => res.data);
  },

  approveDocument: (prospectId: string, stage: string, docIdx: number) => {
    return apiClient.put(`/prospects/${prospectId}/documents/${stage}/${docIdx}/approve`).then(res => res.data);
  },

  rejectDocument: (prospectId: string, stage: string, docIdx: number) => {
    return apiClient.put(`/prospects/${prospectId}/documents/${stage}/${docIdx}/reject`).then(res => res.data);
  },
};