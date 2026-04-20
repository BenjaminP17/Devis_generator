import { Router } from 'express';

/**
 * Root API router — v1
 * Register feature routers here as development progresses.
 */
export const apiRouter = Router();

// Example:
// import { quoteRouter } from './quotes.routes';
// apiRouter.use('/quotes', quoteRouter);

apiRouter.get('/', (_req, res) => {
  res.json({
    message: 'Devis Generator API v1',
    documentation: '/api/v1/docs',
  });
});
