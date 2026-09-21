import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/appError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role?: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticateJWT = asyncHandler(
  async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return next(new AppError('Unauthorized: Access token missing', 401));
    }

    try {
      const secret = process.env.JWT_SECRET || 'fallback_jwt_secret';
      const decoded = jwt.verify(token, secret) as AuthenticatedUser;

      req.user = decoded;
      next();
    } catch {
      return next(new AppError('Unauthorized: Invalid or expired access token', 401));
    }
  }
);
