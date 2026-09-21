import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendResponse } from '../../utils/apiResponse.js';
import { AuthenticatedRequest } from '../../middleware/jwt.middleware.js';

// 01. Register
export const register = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.register(req.body);

  res.cookie('accessToken', result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
  res.cookie('refreshToken', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

  return sendResponse(res, 201, 'User registered successfully', result);
});

// 02. Login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.login(req.body);

  res.cookie('accessToken', result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
  res.cookie('refreshToken', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

  return sendResponse(res, 200, 'Login successful', result);
});

// 03. Get Me Profile
export const getMe = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const profile = await AuthService.getProfile(req.user!.id);
  return sendResponse(res, 200, 'User profile fetched successfully', profile);
});

// 04. Refresh Token
export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  const result = await AuthService.refreshTokens(token);

  res.cookie('accessToken', result.accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
  res.cookie('refreshToken', result.refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

  return sendResponse(res, 200, 'Tokens refreshed successfully', result);
});

// 05. Logout
export const logout = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  if (req.user?.id) {
    await AuthService.logout(req.user.id);
  }

  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');

  return sendResponse(res, 200, 'Logged out successfully');
});

// 06. Change Password
export const changePassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  await AuthService.changePassword(req.user!.id, req.body);
  return sendResponse(res, 200, 'Password changed successfully');
});

// 07. Forgot Password
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const result = await AuthService.forgotPassword(req.body.email);
  return sendResponse(res, 200, result.message, result);
});

// 08. Reset Password
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await AuthService.resetPassword(req.body);
  return sendResponse(res, 200, 'Password has been reset successfully');
});
