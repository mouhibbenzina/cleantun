import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import reportsRoutes from './routes/reports.js';
import statsRoutes from './routes/stats.js';
import adminRoutes from './routes/admin.js';
import { uploadsDir } from './middleware/upload.js';

export const app = express();

const origins = process.env.CORS_ORIGIN?.split(',').map((o) => o.trim()).filter(Boolean);
app.use(cors({ origin: origins?.length ? origins : true }));
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', app: 'CleanTun' }));

app.get('/', (_req, res) =>
  res.json({
    name: 'CleanTun API',
    version: '1.0.0',
    message: 'Signalement citoyen des déchets en Tunisie',
    endpoints: [
      'GET  /api/health',
      'POST /api/auth/register | /api/auth/login',
      'GET  /api/reports?type=&status=&city=&lat=&lng=&radius=',
      'POST /api/reports (Bearer + multipart)',
      'GET  /api/stats | /api/leaderboard',
      'GET  /api/admin/reports | /api/admin/users (admin)',
    ],
    docs: 'https://github.com/mouhibbenzina/cleantun#readme',
  }),
);

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', statsRoutes);

app.use((_req, res) => res.status(404).json({ error: 'Route introuvable' }));

app.use((err, _req, res, _next) => {
  const status = err.name === 'MulterError' || err.message.includes('image') ? 400 : 500;
  res.status(status).json({ error: err.message || 'Erreur serveur' });
});
