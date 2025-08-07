import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import logger from '../utils/logger';

// Middleware para verificar la salud de la conexión a la base de datos
export const healthCheck = (req: Request, res: Response, next: NextFunction) => {
    const connectionState = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    if (connectionState !== 1) { // 1 = connected
        logger.warn(`⚠️ Database health check failed. State: ${states[connectionState]}`);
        return res.status(503).json({
            success: false,
            message: 'Database connection unavailable',
            state: states[connectionState]
        });
    }
    
    next();
};

// Endpoint específico para verificar la salud del sistema
export const healthCheckEndpoint = async (req: Request, res: Response) => {
    try {
        const connectionState = mongoose.connection.readyState;
        const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
        
        // Intentar una operación simple en la base de datos
        await mongoose.connection.db.admin().ping();
        
        res.json({
            success: true,
            message: 'System is healthy',
            database: {
                state: states[connectionState],
                connected: connectionState === 1
            },
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        logger.error('❌ Health check failed:', error);
        res.status(503).json({
            success: false,
            message: 'Health check failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: new Date().toISOString()
        });
    }
};

// Middleware para reconectar automáticamente si es necesario
export const ensureConnection = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const connectionState = mongoose.connection.readyState;
        
        if (connectionState === 0) { // disconnected
            logger.info('🔄 Attempting to reconnect to database...');
            await mongoose.connect(process.env.DATABASE_URL!, {
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 10000,
                socketTimeoutMS: 45000,
                heartbeatFrequencyMS: 10000,
                maxIdleTimeMS: 30000,
                retryWrites: true,
                retryReads: true,
            });
            logger.info('✅ Reconnected to database successfully');
        }
        
        next();
    } catch (error) {
        logger.error('❌ Failed to ensure database connection:', error);
        res.status(503).json({
            success: false,
            message: 'Database connection failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};