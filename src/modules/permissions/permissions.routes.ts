import { Router } from 'express';
import {
  getPermissions,
  getRolePermissions,
  updateRolePermissions,
} from './permissions.controller.js';
import { authenticateJWT } from '../../middleware/jwt.middleware.js';
import { requireAdmin } from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticateJWT, requireAdmin);

router.get('/', getPermissions);
router.get('/roles/:roleId', getRolePermissions);
router.put('/roles/:roleId', updateRolePermissions);

export default router;
