import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import type { AppError } from '../types/index';

/**
 * Global error handler middleware.
 * Must be registered LAST in the Express middleware chain.
 */
export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = err.statusCode ?? 500;
  const message = err.message ?? 'Internal Server Error';

  logger.error(`[${statusCode}] ${message}`, { stack: err.stack });

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};
