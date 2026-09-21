import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './jwt.middleware.js';
import { AppError } from '../utils/appError.js';

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Unauthorized: User unauthenticated', 401));
    }

    if (roles.length && req.user.role && !roles.includes(req.user.role)) {
      return next(
        new AppError('Forbidden: You do not have permission to perform this action', 403)
      );
    }

    next();
  };
};

export const requireAdmin = authorizeRoles('ADMIN');
export const requireMember = authorizeRoles('MEMBER', 'ADMIN');
