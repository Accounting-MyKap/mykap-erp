import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

/**
 * Middleware para registrar información sobre rate limiting
 */
export const rateLimitLogger = (req: Request, res: Response, next: NextFunction) => {
  const originalSend = res.send;
  
  res.send = function(data: any) {
    // Si la respuesta contiene un mensaje de rate limiting
    if (res.statusCode === 429) {
      logger.warn(`🚫 Rate limit exceeded for IP: ${req.ip} on route: ${req.path}`, {
        ip: req.ip,
        route: req.path,
        method: req.method,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

/**
 * Middleware para mostrar estadísticas de rate limiting
 */
export const rateLimitStats = (req: Request, res: Response, next: NextFunction) => {
  // Agregar headers informativos sobre el rate limiting
  res.on('finish', () => {
    const remaining = res.get('X-RateLimit-Remaining');
    const limit = res.get('X-RateLimit-Limit');
    const reset = res.get('X-RateLimit-Reset');
    
    if (remaining && limit) {
      logger.debug(`📊 Rate limit stats for ${req.ip}: ${remaining}/${limit} remaining, resets at ${reset}`);
    }
  });
  
  next();
};