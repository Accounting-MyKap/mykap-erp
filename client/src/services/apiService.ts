// La URL base de nuestra API que corre en el puerto 3000
const API_BASE_URL = 'http://localhost:3000/api';

// Función para registrar un nuevo usuario
export const registerUser = async (userData: any) => {
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
};

export const loginUser = async (credentials: any) => {
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
};