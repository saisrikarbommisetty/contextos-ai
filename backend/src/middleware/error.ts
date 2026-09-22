import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('[ContextOS Error]:', err?.message || err);

  const statusCode = err.statusCode || err.status || 500;
  const isProd = process.env.NODE_ENV === 'production';

  res.status(statusCode).json({
    success: false,
    error: err.friendlyMessage || err.message || 'An unexpected error occurred while processing your request.',
    details: isProd ? undefined : err.stack,
  });
};
