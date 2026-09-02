import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { createExpressApp } from './server/app';
import { config } from './server/config';

async function startServer() {
  const app = createExpressApp();
  const PORT = config.port || 3000;

  // Mount Vite development middleware in non-production, or serve static assets in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Sqbe HRMS v1] Server actively running on http://0.0.0.0:${PORT}`);
    console.log(`[Sqbe HRMS v1] Real API endpoints available at http://0.0.0.0:${PORT}/api/v1`);
  });
}

startServer();
