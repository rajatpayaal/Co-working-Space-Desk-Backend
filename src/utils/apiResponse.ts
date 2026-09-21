import { Response } from 'express';

export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
): Response => {
  return res.status(statusCode).json({
    status: statusCode >= 400 ? 'error' : 'success',
    message,
    ...(data !== undefined && { data }),
  });
};
