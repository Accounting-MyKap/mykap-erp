import mongoose from 'mongoose';
import logger from '../utils/logger';

// Variable global para mantener la conexión en el entorno serverless
let isConnected = false;
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 2000; // 2 segundos

// Configurar eventos de conexión de MongoDB
function setupConnectionEvents() {
    mongoose.connection.on('connected', () => {
        logger.info('✅ MongoDB connected successfully');
        isConnected = true;
        connectionAttempts = 0;
    });

    mongoose.connection.on('error', (err) => {
        logger.error('❌ MongoDB connection error:', err);
        isConnected = false;
    });

    mongoose.connection.on('disconnected', () => {
        logger.warn('⚠️ MongoDB disconnected');
        isConnected = false;
        
        // Intentar reconectar automáticamente
        if (connectionAttempts < MAX_RETRY_ATTEMPTS) {
            connectionAttempts++;
            logger.info(`🔄 Attempting to reconnect (${connectionAttempts}/${MAX_RETRY_ATTEMPTS})...`);
            setTimeout(() => {
                connectToDatabase().catch(err => {
                    logger.error('❌ Reconnection failed:', err);
                });
            }, RETRY_DELAY);
        } else {
            logger.error('❌ Max reconnection attempts reached. Manual intervention required.');
        }
    });

    mongoose.connection.on('reconnected', () => {
        logger.info('✅ MongoDB reconnected successfully');
        isConnected = true;
        connectionAttempts = 0;
    });
}

export async function connectToDatabase() {
    if (isConnected && mongoose.connection.readyState === 1) {
        logger.info('Using existing database connection');
        return;
    }

    try {
        const DATABASE_URL = process.env.DATABASE_URL;
        
        if (!DATABASE_URL) {
            throw new Error('DATABASE_URL environment variable is not defined');
        }

        // Configurar eventos solo una vez
        if (mongoose.connection.readyState === 0) {
            setupConnectionEvents();
        }

        // Configuración optimizada para Vercel Functions y estabilidad
        await mongoose.connect(DATABASE_URL, {
            bufferCommands: false, // Disable mongoose buffering
            bufferMaxEntries: 0,   // Disable mongoose buffering
            maxPoolSize: 10,       // Increased pool size for better connection management
            serverSelectionTimeoutMS: 10000, // Increased timeout
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
            heartbeatFrequencyMS: 10000, // Send a ping every 10 seconds
            maxIdleTimeMS: 30000,  // Close connections after 30 seconds of inactivity
            retryWrites: true,     // Retry failed writes
            retryReads: true,      // Retry failed reads
        });

        isConnected = true;
        logger.info('✅ Connected to MongoDB Atlas successfully');
    } catch (error) {
        logger.error('❌ Error connecting to MongoDB:', error);
        isConnected = false;
        throw error;
    }
}

// Función para desconectar (útil para testing)
export async function disconnectFromDatabase() {
    if (!isConnected) {
        return;
    }

    try {
        await mongoose.disconnect();
        isConnected = false;
        logger.info('Disconnected from MongoDB');
    } catch (error) {
        logger.error('Error disconnecting from MongoDB:', error);
        throw error;
    }
}

export { isConnected };