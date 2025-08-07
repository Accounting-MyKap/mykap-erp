import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../db/connection';
import dataManager from '../data-manager';
import logger from '../utils/logger';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Solo permitir GET
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        // Conectar a la base de datos
        await connectToDatabase();
        
        const users = await dataManager.getAllUsers();
        const userList = users.map(u => ({
            _id: u._id,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email
        }));
        res.json(userList);
    } catch (error: any) {
        logger.error('Users API error', { error: error.message });
        res.status(500).json({ success: false, message: 'Error fetching users.' });
    }
}