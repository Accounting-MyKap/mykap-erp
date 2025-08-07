import { Router, Request, Response } from 'express';
import { rateLimitConfig } from '../config/rateLimitConfig';
import logger from '../utils/logger';

const router = Router();

/**
 * GET /api/rate-limit-status
 * Devuelve información sobre la configuración actual de rate limiting
 */
router.get('/rate-limit-status', (req: Request, res: Response) => {
  try {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    
    const status = {
      environment: isDevelopment ? 'development' : 'production',
      general: {
        windowMs: rateLimitConfig.general.windowMs,
        maxRequests: rateLimitConfig.general.max,
        windowMinutes: rateLimitConfig.general.windowMs / (60 * 1000)
      },
      auth: {
        windowMs: rateLimitConfig.auth.windowMs,
        maxRequests: rateLimitConfig.auth.max,
        windowMinutes: rateLimitConfig.auth.windowMs / (60 * 1000)
      },
      clientInfo: {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      }
    };
    
    logger.info(`📊 Rate limit status requested by ${req.ip}`);
    
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    logger.error('Error getting rate limit status:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener el estado del rate limiting'
    });
  }
});

export default router;