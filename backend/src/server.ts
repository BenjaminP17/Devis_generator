import 'dotenv/config';
import { app } from './app';
import { logger } from './utils/logger';

const PORT = process.env.PORT ?? 3001;

app.listen(PORT, () => {
  logger.info(`🚀 Backend running on http://localhost:${PORT}`);
  logger.info(`📄 Environment: ${process.env.NODE_ENV ?? 'development'}`);
});
