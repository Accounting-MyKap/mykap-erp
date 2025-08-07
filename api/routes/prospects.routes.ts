import { Router, Request, Response } from 'express';
import dataManager from '../data-manager';

const router = Router();

// Note: The 'isAuthenticated' middleware will be applied in the main server file
// before these routes are mounted, so we don't need to add it here again.

// --- Prospects Module ---
router.get('/', async (req: Request, res: Response) => {
    try {
        const prospects = await dataManager.getAllProspects();
        res.json(prospects);
    } catch (error) {
        console.error('Error fetching prospects:', error);
        res.status(500).json({ success: false, message: 'Error fetching prospects' });
    }
});

// --- Users API ---
router.get('/users', async (req: Request, res: Response) => {
    try {
        const users = await dataManager.getAllUsers();
        const userList = users.map(u => ({
            _id: u._id,
            firstName: u.firstName,
            lastName: u.lastName,
            email: u.email
        }));
        res.json(userList);
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching users.' });
    }
});

router.post('/', async (req: Request, res: Response) => {
    try {
        // Validación básica de campos requeridos
        const { name, type, loanType, assignedTo } = req.body;
        if (!name || !type || !loanType || !assignedTo) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: name, type, loanType, assignedTo' 
            });
        }
        
        const newProspect = await dataManager.addProspect(req.body);
        res.status(201).json(newProspect);
    } catch (error) {
        console.error('Error creating prospect:', error);
        res.status(400).json({ 
            success: false, 
            message: error instanceof Error ? error.message : 'Failed to create prospect' 
        });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    try {
        // Validar formato de ObjectId
        if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ success: false, message: 'Invalid prospect ID format' });
        }
        
        const prospect = await dataManager.getProspectById(req.params.id);
        if (!prospect) return res.status(404).json({ success: false, message: 'Prospect not found' });
        res.json(prospect);
    } catch (error) {
        console.error('Error fetching prospect:', error);
        res.status(500).json({ success: false, message: 'Error fetching prospect' });
    }
});

router.put('/:id', async (req: Request, res: Response) => {
    try {
        const updatedProspect = await dataManager.updateProspect(req.params.id, req.body);
        res.json(updatedProspect);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update prospect' });
    }
});

router.put('/:id/status', async (req: Request, res: Response) => {
    try {
        const { status } = req.body;
        const updatedProspect = await dataManager.updateProspectStatus(req.params.id, status);
        res.json(updatedProspect);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update prospect status' });
    }
});

router.put('/:id/documents', async (req: Request, res: Response) => {
    try {
        const { stage, documentIndex } = req.body;
        const updatedProspect = await dataManager.updateDocumentStatus(req.params.id, stage, documentIndex);
        res.json(updatedProspect);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update document status' });
    }
});

// Rutas para rechazar prospecto
router.put('/:id/reject', async (req: Request, res: Response) => {
    try {
        const { stage } = req.body;
        const updatedProspect = await dataManager.rejectProspect(req.params.id, stage);
        res.json(updatedProspect);
    } catch (error) {
        res.status(400).json({ message: 'Failed to reject prospect' });
    }
});

// Ruta para reabrir prospecto
router.put('/:id/reopen', async (req: Request, res: Response) => {
    try {
        const updatedProspect = await dataManager.reopenProspect(req.params.id);
        res.json(updatedProspect);
    } catch (error) {
        res.status(400).json({ message: 'Failed to reopen prospect' });
    }
});

// Ruta para agregar documento
router.post('/:id/documents', async (req: Request, res: Response) => {
    try {
        const { stage, name } = req.body;
        const updatedProspect = await dataManager.addDocument(req.params.id, stage, name);
        res.json(updatedProspect);
    } catch (error) {
        res.status(400).json({ message: 'Failed to add document' });
    }
});

// Ruta para actualizar estado de documento
router.put('/:id/documents/:stage/:docIdx/status', async (req: Request, res: Response) => {
    try {
        const { id, stage, docIdx } = req.params;
        const updatedProspect = await dataManager.updateDocumentStatus(id, stage, parseInt(docIdx));
        res.json(updatedProspect);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update document status' });
    }
});

// Ruta para aprobar documento
router.put('/:id/documents/:stage/:docIdx/approve', async (req: Request, res: Response) => {
    try {
        const { id, stage, docIdx } = req.params;
        const updatedProspect = await dataManager.approveDocument(id, stage, parseInt(docIdx));
        res.json(updatedProspect);
    } catch (error) {
        res.status(400).json({ message: 'Failed to approve document' });
    }
});

// Ruta para rechazar documento
router.put('/:id/documents/:stage/:docIdx/reject', async (req: Request, res: Response) => {
    try {
        const { id, stage, docIdx } = req.params;
        const updatedProspect = await dataManager.rejectDocument(id, stage, parseInt(docIdx));
        res.json(updatedProspect);
    } catch (error) {
        res.status(400).json({ message: 'Failed to reject document' });
    }
});

// Ruta para actualizar checkbox de closing
router.put('/:id/documents/:stage/:docIdx/closing', async (req: Request, res: Response) => {
    try {
        const { id, stage, docIdx } = req.params;
        const { field } = req.body;
        const updatedProspect = await dataManager.updateClosingCheckbox(id, stage, parseInt(docIdx), field);
        res.json(updatedProspect);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update closing checkbox' });
    }
});

export default router;
