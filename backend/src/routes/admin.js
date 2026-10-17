import { Router } from 'express';
import { db } from '../db.js';
import { auth, requireAdmin } from '../middleware/admin.js';

const router = Router();

router.use(auth, requireAdmin);

router.get('/reports', (_req, res) => {
  const rows = db
    .prepare(
      `SELECT r.*, u.name AS author_name, u.email AS author_email
       FROM reports r LEFT JOIN users u ON u.id = r.user_id
       ORDER BY r.created_at DESC`,
    )
    .all();
  res.json(rows);
});

router.get('/users', (_req, res) => {
  const rows = db
    .prepare(
      `SELECT u.id, u.name, u.email, u.city, u.role, u.points, u.created_at,
              COUNT(r.id) AS report_count
       FROM users u LEFT JOIN reports r ON r.user_id = u.id
       GROUP BY u.id
       ORDER BY u.created_at ASC`,
    )
    .all();
  res.json(rows);
});

export default router;
