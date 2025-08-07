/**
 * Configuración de Rate Limiting
 * Ajusta los límites según el entorno de ejecución
 */

interface RateLimitConfig {
  general: {
    windowMs: number;
    max: number;
  };
  auth: {
    windowMs: number;
    max: number;
  };
}

const isDevelopment = process.env.NODE_ENV !== 'production';

export const rateLimitConfig: RateLimitConfig = {
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: isDevelopment ? 1000 : 100, // Más permisivo en desarrollo
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: isDevelopment ? 50 : 5, // Más permisivo en desarrollo
  },
};

export const rateLimitMessages = {
  general: {
    success: false,
    message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.',
  },
  auth: {
    success: false,
    message: 'Demasiados intentos de autenticación, intenta de nuevo más tarde.',
  },
};