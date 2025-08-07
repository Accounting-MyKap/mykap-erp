import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../db/connection';
import dataManager from '../data-manager';
import logger from '../utils/logger';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Solo permitir POST
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        // Conectar a la base de datos
        await connectToDatabase();
        
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
}