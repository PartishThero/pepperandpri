import express from 'express';
import cors from 'cors';
import photoRoutes from './routes/photoRoutes.js';
import paletteRoutes from './routes/paletteRoutes.js';
import errorHandler from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: '*' }));
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'pepperandpri-server' });
  });

  app.use('/api/photos', photoRoutes);
  app.use('/api/palettes', paletteRoutes);
  app.use(errorHandler);

  return app;
}

export default createApp;
