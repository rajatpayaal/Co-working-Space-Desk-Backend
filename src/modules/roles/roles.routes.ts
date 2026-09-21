import { Router } from 'express';
import { getRoles, createRole, getRole, deleteRole } from './roles.controller.js';
import { authenticateJWT } from '../../middleware/jwt.middleware.js';
import { requireAdmin } from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticateJWT, requireAdmin);

router.get('/', getRoles);
router.post('/', createRole);
router.get('/:id', getRole);
router.delete('/:id', deleteRole);

export default router;
