import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.ts';
import workerRoutes from './routes/workerRoutes.ts';
import bookingRoutes from './routes/bookingRoutes.ts';
import reviewRoutes from './routes/reviewRoutes.ts';
import userRoutes from './routes/userRoutes.ts';
import { errorHandler } from './middleware/errorHandler.ts';

export interface CreateApiAppOptions {
  ensureDatabaseReady?: () => Promise<void>;
}

export function createApiApp(options: CreateApiAppOptions = {}) {
  const app = express();

  app.use(
    cors({
      origin: true,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  app.get('/api/health', (_req, res) => {
    res.status(200).json({
      success: true,
      service: 'HomeEase API',
      timestamp: new Date().toISOString(),
    });
  });

  if (options.ensureDatabaseReady) {
    const ensureReady = options.ensureDatabaseReady;
    app.use('/api', async (_req, _res, next) => {
      try {
        await ensureReady();
        next();
      } catch (err) {
        next(err);
      }
    });
  }

  app.use('/api/auth', authRoutes);
  app.use('/api/workers', workerRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/reviews', reviewRoutes);
  app.use('/api/users', userRoutes);

  // 404 handler for unmatched API routes
  app.use('/api', (_req, res) => {
    res.status(404).json({
      success: false,
      message: 'API endpoint not found.',
    });
  });

  app.use(errorHandler);

  return app;
}
