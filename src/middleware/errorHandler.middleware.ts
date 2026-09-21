import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/appError.js';

export const globalErrorHandler: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = err instanceof AppError ? err.statusCode : 500;
  let message = err.message || 'Internal Server Error';

  // Handle Prisma Known Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      statusCode = 400;
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      message = `A record with this ${target} already exists.`;
    } else if (err.code === 'P2025') {
      statusCode = 404;
      message = 'Requested record was not found.';
    }
  }

  // Handle Prisma Initialization / Connection Errors
  if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = 503;
    message =
      'Database connection failed. Please ensure PostgreSQL database is running (e.g. via `docker-compose up -d` or Neon PostgreSQL connection URL in .env).';
  }

  if (process.env.NODE_ENV === 'development') {
    console.error('💥 Error:', err);
  }

  res.status(statusCode).json({
    status: statusCode >= 400 && statusCode < 500 ? 'fail' : 'error',
    message,
    ...(process.env.NODE_ENV === 'development' && { errorDetails: err.message, stack: err.stack }),
  });
};
