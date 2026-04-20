import { Pool } from 'pg';
import { logger } from '../utils/logger';

/**
 * PostgreSQL connection pool.
 * Connection parameters are injected via environment variables
 * set by Docker Compose.
 */
export const pool = new Pool({
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Keep idle connections for performance
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 2_000,
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle PostgreSQL client', err);
  process.exit(-1);
});

/**
 * Verify database connectivity on startup.
 */
export const connectDatabase = async (): Promise<void> => {
  const client = await pool.connect();
  try {
    await client.query('SELECT NOW()');
    logger.info('✅ PostgreSQL connected successfully');
  } finally {
    client.release();
  }
};
