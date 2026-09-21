import { Router } from 'express';
import { getUsers, getUser, activateUser, deactivateUser } from './users.controller.js';
import { authenticateJWT } from '../../middleware/jwt.middleware.js';
import { requireAdmin } from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticateJWT, requireAdmin);

router.get('/', getUsers);
router.get('/:id', getUser);
router.patch('/:id/activate', activateUser);
router.patch('/:id/deactivate', deactivateUser);

export default router;
