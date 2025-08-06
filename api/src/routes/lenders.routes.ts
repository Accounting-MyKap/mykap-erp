import { Router, Request, Response } from 'express';
import dataManager from '../data-manager';

const router = Router();

// --- Lenders Module ---
router.get('/', async (req: Request, res: Response) => {
    const lenders = await dataManager.getAllLenders();
    res.json(lenders);
});

export default router;
