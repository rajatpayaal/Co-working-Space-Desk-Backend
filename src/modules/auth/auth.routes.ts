import { Router } from 'express';
import {
  register,
  login,
  getMe,
  refresh,
  logout,
  changePassword,
  forgotPassword,
  resetPassword,
} from './auth.controller.js';
import { validateRequest } from '../../middleware/validation.middleware.js';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.validation.js';
import { authenticateJWT } from '../../middleware/jwt.middleware.js';
import { authLimiter } from '../../middleware/rateLimit.middleware.js';

const router = Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register a new member
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name:
 *               - email:
 *               - password:
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error or email already registered
 */
router.post('/register', authLimiter, validateRequest(registerSchema), register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login user (Member or Admin)
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email:
 *               - password:
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful with access & refresh tokens
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: User account deactivated
 */
router.post('/login', authLimiter, validateRequest(loginSchema), login);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh JWT access token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *     responses:
 *       200:
 *         description: Access and refresh tokens renewed
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', validateRequest(refreshTokenSchema), refresh);

/**
 * @openapi
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request password reset link/token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email:
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@example.com
 *     responses:
 *       200:
 *         description: Reset token generated
 */
router.post('/forgot-password', authLimiter, validateRequest(forgotPasswordSchema), forgotPassword);

/**
 * @openapi
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password using reset token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token:
 *               - newPassword:
 *             properties:
 *               token:
 *                 type: string
 *                 example: 7f8a...
 *               newPassword:
 *                 type: string
 *                 example: newsecret123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Token invalid or expired
 */
router.post('/reset-password', authLimiter, validateRequest(resetPasswordSchema), resetPassword);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user profile
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile details fetched
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticateJWT, getMe);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Logout authenticated user
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/logout', authenticateJWT, logout);

/**
 * @openapi
 * /api/auth/change-password:
 *   patch:
 *     summary: Change current user password
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - oldPassword:
 *               - newPassword:
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 example: secret123
 *               newPassword:
 *                 type: string
 *                 example: newsecret123
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Incorrect old password
 *       401:
 *         description: Unauthorized
 */
router.patch('/change-password', authenticateJWT, validateRequest(changePasswordSchema), changePassword);

export default router;
