import { Router } from 'express';
import { getSpaces, getSpace, createSpace, updateSpace, deleteSpace } from './spaces.controller.js';
import { authenticateJWT } from '../../middleware/jwt.middleware.js';
import { requireAdmin } from '../../middleware/rbac.middleware.js';

const router = Router();

// Visitor / Public Routes
router.get('/', getSpaces);
router.get('/:id', getSpace);

// Admin Routes
router.post('/', authenticateJWT, requireAdmin, createSpace);
router.patch('/:id', authenticateJWT, requireAdmin, updateSpace);
router.delete('/:id', authenticateJWT, requireAdmin, deleteSpace);

export default router;
