import { Router, Request, Response } from 'express';
import dataManager from '../data-manager';
import logger from '../utils/logger';

const router = Router();

// =================================================================
// --- AUTHENTICATION API ROUTES (PUBLIC) ---
// =================================================================

router.post('/register', async (req: Request, res: Response) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        
        logger.info('User registration attempt', { email });
        
        // Validar campos requeridos
        if (!firstName || !lastName || !email || !password) {
            logger.warn('Registration failed: missing required fields', { email });
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required' 
            });
        }
        
        const newUser = await dataManager.registerUser(firstName, lastName, email, password);
        logger.info('User registered successfully', { email, userId: newUser._id });
        res.status(201).json({ success: true, message: 'User registered successfully', userId: newUser._id });
    } catch (error: any) {
        if (error.code === 11000) {
            logger.warn('Registration failed: email already in use', { email: req.body.email });
            res.status(400).json({ success: false, message: 'Email already in use' });
        } else {
            logger.error('Registration error', { error: error.message, email: req.body.email });
            res.status(400).json({ success: false, message: 'Email may already be in use.' });
        }
    }
});

router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        
        logger.info('Login attempt', { email });
        
        // Validar campos requeridos
        if (!email || !password) {
            logger.warn('Login failed: missing credentials', { email });
            return res.status(400).json({ 
                success: false, 
                message: 'Email and password are required' 
            });
        }
        
        const user = await dataManager.loginUser(email, password);
        if (user) {
            req.session.user = {
                id: user._id.toString(),
                firstName: user.firstName,
                email: user.email,
                role: user.role
            };
            const userResponse = { _id: user._id, firstName: user.firstName, email: user.email, role: user.role };
            logger.info('Login successful', { email, userId: user._id });
            res.json({ success: true, user: userResponse });
        } else {
            logger.warn('Login failed: invalid credentials', { email });
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error: any) {
        logger.error('Login error', { error: error.message, email: req.body.email });
        res.status(500).json({ success: false, message: 'An error occurred during login.' });
    }
});

router.post('/logout', (req: Request, res: Response) => {
    const userId = req.session.user?.id;
    logger.info('Logout attempt', { userId });
    
    req.session.destroy((err: any) => {
        if (err) {
            logger.error('Logout error', { error: err.message, userId });
            return res.status(500).json({ success: false, message: 'Failed to log out.' });
        }
        res.clearCookie('connect.sid');
        logger.info('Logout successful', { userId });
        res.json({ success: true, message: 'Logged out successfully' });
    });
});

router.get('/users/current', async (req: Request, res: Response) => {
    // Note: The 'isAuthenticated' middleware will be applied in the main server file
    // before this route is mounted, so we don't need to add it here again.
    if (req.session.user) {
        const user = await dataManager.getUserById(req.session.user.id);
        res.json(user);
    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

export default router;
