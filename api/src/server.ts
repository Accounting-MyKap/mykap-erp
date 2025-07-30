// =================================================================
// --- IMPORTS AND INITIAL SETUP ---
// =================================================================

console.log("--- STARTING TYPESCRIPT API SERVER ---");

import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import mongoose from 'mongoose';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import cors from 'cors';
import dataManager from './data-manager';

const app = express();
const port = 3000;

// =================================================================
// --- DATABASE CONNECTION ---
// =================================================================

mongoose.connect(process.env.DATABASE_URL!)
  .then(() => console.log("✅ Connection to MongoDB Atlas successful."))
  .catch((error) => console.error("❌ Error connecting to MongoDB:", error));

// =================================================================
// --- MIDDLEWARE CONFIGURATION ---
// =================================================================

app.use(cors({
    origin: 'http://localhost:5173', // Permite peticiones desde el frontend de React
    credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'a-very-strong-secret-to-sign-the-cookie',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL! })
}));

const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.session.userId) { return next(); }
    res.status(401).json({ message: 'Unauthorized' });
};


// =================================================================
// --- AUTHENTICATION API ROUTES (PUBLIC) ---
// =================================================================

app.post('/api/register', async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        const newUser = await dataManager.registerUser(firstName, lastName, email, password);
        res.status(201).json({ success: true, message: 'User registered successfully', userId: newUser._id });
    } catch (error) {
        res.status(400).json({ success: false, message: 'Email may already be in use.' });
    }
});

app.post('/api/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await dataManager.loginUser(email, password);
        if (user) {
            req.session.userId = user._id.toString();
            const userResponse = { id: user._id, firstName: user.firstName, email: user.email, role: user.role };
            res.json({ success: true, user: userResponse });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'An error occurred during login.' });
    }
});

app.post('/api/logout', (req: Request, res: Response) => {
    req.session.destroy((err: any) => {
        if (err) return res.status(500).json({ success: false, message: 'Failed to log out.' });
        res.clearCookie('connect.sid');
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

app.get('/api/users/current', isAuthenticated, async (req: Request, res: Response) => {
    const user = await dataManager.getUserById(req.session.userId!);
    res.json(user);
});


// =================================================================
// --- CORE APPLICATION API ROUTES (PROTECTED) ---
// =================================================================

// --- Prospects Module ---
app.get('/api/prospects', isAuthenticated, async (req: Request, res: Response) => {
    const prospects = await dataManager.getAllProspects();
    res.json(prospects);
});

app.post('/api/prospects', isAuthenticated, async (req: Request, res: Response) => {
    const newProspect = await dataManager.addProspect(req.body);
    res.status(201).json(newProspect);
});

app.get('/api/prospects/:id', isAuthenticated, async (req: Request, res: Response) => {
    const prospect = await dataManager.getProspectById(req.params.id);
    if (!prospect) return res.status(404).json({ message: 'Prospect not found' });
    res.json(prospect);
});

// --- Lenders Module ---
app.get('/api/lenders', isAuthenticated, async (req: Request, res: Response) => {
    const lenders = await dataManager.getAllLenders();
    res.json(lenders);
});

// --- Credits Module ---
app.get('/api/credits', isAuthenticated, async (req: Request, res: Response) => {
    const credits = await dataManager.getAllCredits();
    res.json(credits);
});


// =================================================================
// --- SERVER INITIALIZATION ---
// =================================================================

app.listen(port, () => {
    console.log(`API Server (TypeScript) listening on http://localhost:${port}`);
});