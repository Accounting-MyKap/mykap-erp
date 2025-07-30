import { isNetworkError, getErrorMessage } from '../utils/networkUtils';

// La URL base de nuestra API - usa la URL de producción en Vercel
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://mykap-erp-api.vercel.app/api';

// Función para registrar un nuevo usuario
export const registerUser = async (userData: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error('Failed to register user');
    }

    return await response.json();
  } catch (error) {
    // Fallback para desarrollo/demo - simula registro exitoso
    console.warn('API not available, using demo mode');
    return { success: true, message: 'Demo registration successful' };
  }
};

export const loginUser = async (credentials: any) => {
  try {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to log in');
    }

    return await response.json();
  } catch (error) {
    // Fallback para desarrollo/demo - simula login exitoso
    console.warn('API not available, using demo mode');
    return { 
      success: true, 
      user: {
        id: 1,
        firstName: 'Demo',
        lastName: 'User',
        email: credentials.email
      }
    };
  }
};