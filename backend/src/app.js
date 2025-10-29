import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import { config } from './config.js';
import { cookies, orgAuth } from './middleware/auth.js';
import { apiRateLimiter } from './middleware/rateLimit.js';
import { requestLogger } from './utils/logger.js';
import { initSchema, seedData } from './db.js';

import profileRouter from './routes/profile.js';
import toolsRouter from './routes/tools.js';
import recommendRouter from './routes/recommend.js';
import leadsRouter from './routes/leads.js';
import conversationRouter from './routes/conversation.js';

export function buildApp() {
  const app = express();

  // Ensure DB and seed are ready before handling requests
  initSchema();
  seedData();

  app.use(helmet());
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(cookies);
  app.use(requestLogger);
  app.use(apiRateLimiter);
  app.use(cors({ origin: config.corsOrigin, credentials: true }));
  app.use(orgAuth);

  app.get('/api/health', (req, res) => res.json({ ok: true, env: config.nodeEnv }));
  app.use('/api/profile', profileRouter);
  app.use('/api/tools', toolsRouter);
  app.use('/api/recommendations', recommendRouter);
  app.use('/api/leads', leadsRouter);
  app.use('/api/conversation', conversationRouter);

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
