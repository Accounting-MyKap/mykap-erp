import { Router } from 'express';
import authRoutes from './auth.routes';
import prospectRoutes from './prospects.routes';
import lenderRoutes from './lenders.routes';
import creditRoutes from './credits.routes';

const router = Router();

// --- API Routes ---
router.use('/auth', authRoutes);
router.use('/prospects', prospectRoutes);
router.use('/lenders', lenderRoutes);
router.use('/credits', creditRoutes);

export default router;
