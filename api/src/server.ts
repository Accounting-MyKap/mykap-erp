
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

logger.info("--- STARTING TYPESCRIPT API SERVER ---");

const app = express();
const port = 3000;

// =================================================================
// --- DATABASE CONNECTION ---
// =================================================================

mongoose.connect(process.env.DATABASE_URL!)
  .then(() => logger.info("✅ Connection to MongoDB Atlas successful."))
  .catch((error) => logger.error("❌ Error connecting to MongoDB:", error));

// =================================================================
// --- MIDDLEWARE CONFIGURATION ---
// =================================================================

// Configurar rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 100, // máximo 100 requests por ventana de tiempo
    message: {
        success: false,
        message: 'Demasiadas solicitudes desde esta IP, intenta de nuevo más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate limiting más estricto para rutas de autenticación
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 5, // máximo 5 intentos de login por ventana
    message: {
        success: false,
        message: 'Demasiados intentos de autenticación, intenta de nuevo más tarde.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

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

app.use(session({
    secret: process.env.SESSION_SECRET || 'a-very-strong-secret-to-sign-the-cookie',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL! })
}));

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.session.userId) { return next(); }
    res.status(401).json({ message: 'Unauthorized' });
};


// =================================================================
// --- API ROUTES ---
// =================================================================

// Public routes (no authentication required) with rate limiting específico
app.use('/api/auth', authLimiter, require('./routes/auth.routes').default);

// Protected routes (authentication required)
app.use('/api/prospects', isAuthenticated, require('./routes/prospects.routes').default);
app.use('/api/lenders', isAuthenticated, require('./routes/lenders.routes').default);
app.use('/api/credits', isAuthenticated, require('./routes/credits.routes').default);


// =================================================================
// --- SERVER INITIALIZATION ---
// =================================================================

app.listen(port, () => {
    logger.info(`API Server (TypeScript) listening on http://localhost:${port}`);
});
