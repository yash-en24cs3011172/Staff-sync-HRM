import 'dotenv/config';
import path from 'path';
import express from 'express';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { dbRepo } from './server/db/repository.ts';
import { apiRouter } from './server/routes/api.ts';
import { responseTimerMiddleware } from './server/middleware/security.ts';

async function startServer() {
  await dbRepo.init();

  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  app.use(responseTimerMiddleware);

  // Mount REST API routes
  app.use('/api', apiRouter);

  // Vite middleware in development, static dist serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HRM System Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start HRM System server:', err);
  process.exit(1);
});
