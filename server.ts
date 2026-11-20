import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { connectDB } from './server/config/db.ts';
import { seedDatabase } from './server/seed/seedData.ts';
import { createApiApp } from './server/app.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

let dbInitPromise: Promise<void> | null = null;

function ensureDatabaseReady(): Promise<void> {
  if (!dbInitPromise) {
    dbInitPromise = (async () => {
      await connectDB();
      await seedDatabase({ forceReset: false });
    })().catch((err) => {
      dbInitPromise = null;
      throw err;
    });
  }
  return dbInitPromise;
}

async function startServer() {
  const app = createApiApp({ ensureDatabaseReady });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HomeEase] Full-stack server running at http://localhost:${PORT}`);
    // Warm up MongoDB and seed demo data in the background so Cloud Run startup probes succeed immediately
    ensureDatabaseReady().catch((err) => {
      console.error('[HomeEase] Initial database warm-up failed (will retry on request):', err);
    });
  });
}

startServer().catch((err) => {
  console.error('[HomeEase] Failed to start server:', err);
  process.exit(1);
});
