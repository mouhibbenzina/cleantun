import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/stats', (_req, res) => {
  const byStatus = db.prepare('SELECT status, COUNT(*) AS count FROM reports GROUP BY status').all();
  const byCity = db
    .prepare("SELECT COALESCE(city, 'Autre') AS city, COUNT(*) AS count FROM reports GROUP BY city ORDER BY count DESC LIMIT 10")
    .all();
  const byType = db.prepare('SELECT type, COUNT(*) AS count FROM reports GROUP BY type ORDER BY count DESC').all();
  const totals = db.prepare('SELECT COUNT(*) AS reports FROM reports').get();
  const users = db.prepare('SELECT COUNT(*) AS users, COALESCE(SUM(points), 0) AS points FROM users').get();
  res.json({ reports: totals.reports, users: users.users, points: users.points, byStatus, byCity, byType });
});

router.get('/leaderboard', (_req, res) => {
  const rows = db
    .prepare('SELECT id, name, city, points FROM users ORDER BY points DESC, id ASC LIMIT 10')
    .all();
  res.json(rows);
});

export default router;
