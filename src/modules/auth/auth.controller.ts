import { Response } from 'express';
import { AuthService } from './auth.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../middleware/jwt.middleware.js';

export const register = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await AuthService.register(req.body);
  return sendResponse(res, 201, 'User registered successfully', result);
});

export const login = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await AuthService.login(req.body);
  return sendResponse(res, 200, 'Login successful', result);
});

export const logout = asyncHandler(async (_req: AuthenticatedRequest, res: Response) => {
  res.clearCookie('accessToken');
  return sendResponse(res, 200, 'Logged out successfully');
});

export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const profile = await AuthService.getProfile(req.user!.id);
  return sendResponse(res, 200, 'User profile fetched successfully', profile);
});
