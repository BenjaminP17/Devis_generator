import type { Request, Response, NextFunction } from 'express';

/**
 * Catches all unmatched routes and forwards a 404 error.
 */
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction,
): void => {
  const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  (error as NodeJS.ErrnoException & { statusCode: number }).statusCode = 404;
  next(error);
};
