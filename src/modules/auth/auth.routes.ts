import { Router } from 'express';
import { register, login, logout, getMe } from './auth.controller.js';
import { validateRequest } from '../../middleware/validation.middleware.js';
import { registerSchema, loginSchema } from './auth.validation.js';
import { authenticateJWT } from '../../middleware/jwt.middleware.js';
import { authLimiter } from '../../middleware/rateLimit.middleware.js';

const router = Router();

router.post('/register', authLimiter, validateRequest(registerSchema), register);
router.post('/login', authLimiter, validateRequest(loginSchema), login);
router.post('/logout', authenticateJWT, logout);
router.get('/me', authenticateJWT, getMe);

export default router;
