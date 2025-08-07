import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../db/connection';
import dataManager from '../data-manager';
import logger from '../utils/logger';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Solo permitir GET por ahora
    if (req.method !== 'GET') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        // Conectar a la base de datos
        await connectToDatabase();
        
        const lenders = await dataManager.getAllLenders();
        res.json(lenders);
    } catch (error: any) {
        logger.error('Lenders API error', { error: error.message });
        res.status(500).json({ success: false, message: 'Error fetching lenders' });
    }
}