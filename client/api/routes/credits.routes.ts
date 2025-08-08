import { Router, Request, Response } from 'express';
import dataManager from '../data-manager';

const router = Router();

// --- Credits Module ---
router.get('/', async (req: Request, res: Response) => {
    const credits = await dataManager.getAllCredits();
    res.json(credits);
});

export default router;
