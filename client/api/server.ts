
// =================================================================
// --- IMPORTS AND INITIAL SETUP ---
// =================================================================

import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger';
import apiRoutes from './routes'; // <-- Import our new main router
import { healthCheck, healthCheckEndpoint, ensureConnection } from './middleware/healthCheck';
import { rateLimitConfig, rateLimitMessages } from './config/rateLimitConfig';
import { rateLimitLogger, rateLimitStats } from './middleware/rateLimitLogger';

logger.info("--- STARTING TYPESCRIPT API SERVER ---");

const app = express();
const port = 3000;

// =================================================================
// --- DATABASE CONNECTION ---
// =================================================================

// Configurar eventos de conexión de MongoDB
mongoose.connection.on('connected', () => {
  logger.info("✅ Connection to MongoDB Atlas successful.");
});

mongoose.connection.on('error', (err) => {
  logger.error("❌ MongoDB connection error:", err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn("⚠️ MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on('reconnected', () => {
  logger.info("✅ MongoDB reconnected successfully");
});

// Configuración de conexión con opciones mejoradas
mongoose.connect(process.env.DATABASE_URL!, {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  heartbeatFrequencyMS: 10000,
  maxIdleTimeMS: 30000,
  retryWrites: true,
  retryReads: true,
})
.then(() => logger.info("✅ Initial connection to MongoDB Atlas successful."))
.catch((error) => {
  logger.error("❌ Error connecting to MongoDB:", error);
  process.exit(1);
});

// Monitoreo periódico de la conexión
setInterval(() => {
  const state = mongoose.connection.readyState;
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  logger.debug(`📊 MongoDB connection state: ${states[state]}`);
}, 30000); // Cada 30 segundos

// =================================================================
// --- MIDDLEWARE CONFIGURATION ---
// =================================================================

// Configurar rate limiting
const limiter = rateLimit({
    windowMs: rateLimitConfig.general.windowMs,
    max: rateLimitConfig.general.max,
    message: rateLimitMessages.general,
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting más estricto para rutas de autenticación
const authLimiter = rateLimit({
    windowMs: rateLimitConfig.auth.windowMs,
    max: rateLimitConfig.auth.max,
    message: rateLimitMessages.auth,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(rateLimitLogger);
app.use(rateLimitStats);
app.use(limiter);

app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://mykap-1mik18iu5-guillermo-carrasquillas-projects.vercel.app',
        'https://mykap-erp.vercel.app'
    ],
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.session && req.session.user) { 
        return next(); 
    }
    res.status(401).json({ message: 'Unauthorized' });
};

// Configurar sesión y rutas después de que MongoDB esté conectado
mongoose.connection.once('open', () => {
    // Configurar sesión
    app.use(session({
        secret: process.env.SESSION_SECRET || 'a-very-strong-secret-to-sign-the-cookie',
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL! }),
        cookie: {
            secure: false, // Set to true in production with HTTPS
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        }
    }));
    logger.info("✅ Session store configured with MongoDB");
    
    // =================================================================
    // --- API ROUTES ---
    // =================================================================
    
    // Aplicar rate limiting específico para autenticación
    app.use('/api/auth', authLimiter);
    
    // Endpoint de health check (sin autenticación)
    app.get('/api/health', healthCheckEndpoint);
    
    // Middleware para asegurar conexión a la base de datos
    app.use('/api', ensureConnection);
    
    // Aplicar autenticación a rutas protegidas
    app.use('/api/prospects', isAuthenticated);
    app.use('/api/lenders', isAuthenticated);
    app.use('/api/credits', isAuthenticated);
    
    // Montar todas las rutas de la API
    app.use('/api', apiRoutes);
    
    logger.info("✅ API routes configured");
});


// =================================================================
// --- SERVER INITIALIZATION ---
// =================================================================

// Para desarrollo local
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        logger.info(`🚀 Server running on http://localhost:${port}`);
    });
}

// Para Vercel
export default app;
