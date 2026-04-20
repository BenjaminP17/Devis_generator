import { createLogger, format, transports } from 'winston';

const { combine, timestamp, colorize, printf, errors } = format;

const devFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `${String(ts)} [${level}]: ${stack ?? String(message)}`;
});

/**
 * Application-wide structured logger.
 * - Development: colorized, human-readable console output
 * - Production : JSON format (suitable for log aggregation tools)
 */
export const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
  format: combine(errors({ stack: true }), timestamp({ format: 'HH:mm:ss' })),
  transports: [
    new transports.Console({
      format:
        process.env.NODE_ENV === 'production'
          ? format.json()
          : combine(colorize(), devFormat),
    }),
  ],
});
