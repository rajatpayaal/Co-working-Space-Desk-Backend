import { Router } from 'express';
import {
  getMaintenanceRecords,
  createMaintenanceRecord,
  getMaintenanceDetail,
  deleteMaintenanceRecord,
} from './maintenance.controller.js';
import { authenticateJWT } from '../../middleware/jwt.middleware.js';
import { requireAdmin } from '../../middleware/rbac.middleware.js';

const router = Router();

router.use(authenticateJWT, requireAdmin);

router.get('/', getMaintenanceRecords);
router.post('/', createMaintenanceRecord);
router.get('/:id', getMaintenanceDetail);
router.delete('/:id', deleteMaintenanceRecord);

export default router;
