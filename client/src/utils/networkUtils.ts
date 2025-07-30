// Utilidades para manejar errores de red y fallbacks
export const isNetworkError = (error: any): boolean => {
  return error.name === 'TypeError' || 
         error.message.includes('fetch') || 
         error.message.includes('network') ||
         error.message.includes('Failed to fetch');
};

export const getErrorMessage = (error: any): string => {
  if (isNetworkError(error)) {
    return 'Network error. Please check your connection.';
  }
  return error.message || 'An unexpected error occurred.';
}; 