import { Router } from 'express';
import {
  getSpaces,
  getSpace,
  getSpaceAvailability,
  getSpaceSlots,
  createSpace,
  getAdminSpaces,
  getAdminSpaceDetail,
  updateSpace,
  deleteSpace,
} from './spaces.controller.js';
import { authenticateJWT } from '../../middleware/jwt.middleware.js';
import { requireAdmin } from '../../middleware/rbac.middleware.js';
import { validateRequest } from '../../middleware/validation.middleware.js';
import {
  getSpacesQuerySchema,
  spaceIdParamSchema,
  createSpaceSchema,
  updateSpaceSchema,
} from './spaces.validation.js';

const router = Router();

// ─── Public / Visitor Routes ─────────────────────────────────
router.get('/', validateRequest(getSpacesQuerySchema), getSpaces);
router.get('/:id', validateRequest(spaceIdParamSchema), getSpace);
router.get('/:id/availability', validateRequest(spaceIdParamSchema), getSpaceAvailability);
router.get('/:id/slots', validateRequest(spaceIdParamSchema), getSpaceSlots);

// ─── Admin Routes ─────────────────────────────────────────────
const adminRouter = Router();
adminRouter.use(authenticateJWT, requireAdmin);

adminRouter.get('/spaces', validateRequest(getSpacesQuerySchema), getAdminSpaces);
adminRouter.post('/spaces', validateRequest(createSpaceSchema), createSpace);
adminRouter.get('/spaces/:id', validateRequest(spaceIdParamSchema), getAdminSpaceDetail);
adminRouter.patch('/spaces/:id', validateRequest(updateSpaceSchema), updateSpace);
adminRouter.delete('/spaces/:id', validateRequest(spaceIdParamSchema), deleteSpace);

export { adminRouter };
export default router;
