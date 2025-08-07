import { VercelRequest, VercelResponse } from '@vercel/node';
import { connectToDatabase } from '../db/connection';
import dataManager from '../data-manager';
import logger from '../utils/logger';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        // Conectar a la base de datos
        await connectToDatabase();
        
        const { method, query } = req;
        const { id, action, stage, docIdx } = query;

        switch (method) {
            case 'GET':
                if (id) {
                    // GET /api/prospects/[id]
                    const prospect = await dataManager.getProspectById(id as string);
                    if (!prospect) {
                        return res.status(404).json({ success: false, message: 'Prospect not found' });
                    }
                    return res.json(prospect);
                } else {
                    // GET /api/prospects
                    const prospects = await dataManager.getAllProspects();
                    return res.json(prospects);
                }

            case 'POST':
                if (id && action === 'documents') {
                    // POST /api/prospects/[id]?action=documents
                    const { stage, name } = req.body;
                    const updatedProspect = await dataManager.addDocument(id as string, stage, name);
                    return res.json(updatedProspect);
                } else {
                    // POST /api/prospects
                    const { name, type, loanType, assignedTo } = req.body;
                    if (!name || !type || !loanType || !assignedTo) {
                        return res.status(400).json({ 
                            success: false, 
                            message: 'Missing required fields: name, type, loanType, assignedTo' 
                        });
                    }
                    const newProspect = await dataManager.addProspect(req.body);
                    return res.status(201).json(newProspect);
                }

            case 'PUT':
                if (!id) {
                    return res.status(400).json({ success: false, message: 'ID is required for updates' });
                }

                if (action === 'status') {
                    // PUT /api/prospects/[id]?action=status
                    const updatedProspect = await dataManager.updateProspectStatus(id as string, req.body.status);
                    return res.json(updatedProspect);
                } else if (action === 'documents' && stage && docIdx) {
                    // PUT /api/prospects/[id]?action=documents&stage=X&docIdx=Y
                    const updatedProspect = await dataManager.updateDocumentStatus(id as string, stage as string, parseInt(docIdx as string));
                    return res.json(updatedProspect);
                } else if (action === 'reject') {
                    // PUT /api/prospects/[id]?action=reject
                    const { stage } = req.body;
                    const updatedProspect = await dataManager.rejectProspect(id as string, stage);
                    return res.json(updatedProspect);
                } else if (action === 'reopen') {
                    // PUT /api/prospects/[id]?action=reopen
                    const updatedProspect = await dataManager.reopenProspect(id as string);
                    return res.json(updatedProspect);
                } else if (action === 'document-status' && stage && docIdx) {
                    // PUT /api/prospects/[id]?action=document-status&stage=X&docIdx=Y
                    const updatedProspect = await dataManager.updateDocumentStatus(
                        id as string, 
                        stage as string, 
                        parseInt(docIdx as string)
                    );
                    return res.json(updatedProspect);
                } else if (action === 'document-approve' && stage && docIdx) {
                    // PUT /api/prospects/[id]?action=document-approve&stage=X&docIdx=Y
                    const updatedProspect = await dataManager.approveDocument(
                        id as string, 
                        stage as string, 
                        parseInt(docIdx as string)
                    );
                    return res.json(updatedProspect);
                } else if (action === 'document-reject' && stage && docIdx) {
                    // PUT /api/prospects/[id]?action=document-reject&stage=X&docIdx=Y
                    const updatedProspect = await dataManager.rejectDocument(
                        id as string, 
                        stage as string, 
                        parseInt(docIdx as string)
                    );
                    return res.json(updatedProspect);
                } else if (action === 'document-closing' && stage && docIdx) {
                    // PUT /api/prospects/[id]?action=document-closing&stage=X&docIdx=Y
                    const { field } = req.body;
                    const updatedProspect = await dataManager.updateClosingCheckbox(
                        id as string, 
                        stage as string, 
                        parseInt(docIdx as string),
                        field
                    );
                    return res.json(updatedProspect);
                } else {
                    // PUT /api/prospects/[id] - update general prospect data
                    const updatedProspect = await dataManager.updateProspect(id as string, req.body);
                    return res.json(updatedProspect);
                }

            default:
                return res.status(405).json({ success: false, message: 'Method not allowed' });
        }
    } catch (error: any) {
        logger.error('Prospects API error', { error: error.message, method: req.method, query: req.query });
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
}