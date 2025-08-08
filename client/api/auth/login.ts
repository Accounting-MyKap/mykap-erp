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
            // En Vercel Functions, las sesiones son más complicadas
            // Por ahora retornamos el usuario sin sesión
            logger.info('Login successful', { email, userId: user._id });
            res.status(200).json({ 
                success: true, 
                message: 'Login successful', 
                user: {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                }
            });
        } else {
            logger.warn('Login failed: invalid credentials', { email });
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error: any) {
        logger.error('Login error', { error: error.message, email: req.body.email });
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}