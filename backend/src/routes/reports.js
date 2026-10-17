import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { db } from '../db.js';
import { auth } from '../middleware/auth.js';
import upload, { uploadsDir } from '../middleware/upload.js';

const router = Router();

const TYPES = ['dump', 'overflow', 'burning', 'recycling', 'water', 'other'];
const STATUSES = ['reported', 'in_progress', 'resolved', 'rejected'];

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

router.get('/', (req, res) => {
  const { status, type, city, lat, lng, radius } = req.query;
  const where = [];
  const params = [];

  if (status) {
    if (!STATUSES.includes(status)) return res.status(400).json({ error: 'Statut invalide' });
    where.push('r.status = ?');
    params.push(status);
  }
  if (type) {
    if (!TYPES.includes(type)) return res.status(400).json({ error: 'Type invalide' });
    where.push('r.type = ?');
    params.push(type);
  }
  if (city) {
    where.push('r.city = ?');
    params.push(city);
  }

  let sql =
    'SELECT r.*, u.name AS author_name FROM reports r ' +
    'LEFT JOIN users u ON u.id = r.user_id' +
    (where.length ? ' WHERE ' + where.join(' AND ') : '') +
    ' ORDER BY r.created_at DESC';
  const rows = db.prepare(sql).all(...params);

  const latitude = Number(lat);
  const longitude = Number(lng);
  if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
    const radiusKm = Number(radius) > 0 ? Number(radius) : 5;
    return res.json(
      rows
        .map((r) => ({ ...r, distance_km: Number(haversineKm(latitude, longitude, r.lat, r.lng).toFixed(2)) }))
        .filter((r) => r.distance_km <= radiusKm)
        .sort((a, b) => a.distance_km - b.distance_km),
    );
  }
  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db
    .prepare('SELECT r.*, u.name AS author_name FROM reports r LEFT JOIN users u ON u.id = r.user_id WHERE r.id = ?')
    .get(Number(req.params.id));
  if (!row) return res.status(404).json({ error: 'Signalement introuvable' });
  res.json(row);
});

router.post('/', auth, upload.single('photo'), (req, res) => {
  const { type, description, lat, lng, address, city } = req.body || {};
  if (!TYPES.includes(type)) {
    return res.status(400).json({ error: `type invalide : ${TYPES.join(', ')}` });
  }
  const latitude = Number(lat);
  const longitude = Number(lng);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
    return res.status(400).json({ error: 'lat invalide' });
  }
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return res.status(400).json({ error: 'lng invalide' });
  }

  const info = db
    .prepare(
      `INSERT INTO reports (user_id, type, description, lat, lng, address, city, photo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      req.user.id,
      type,
      description ?? null,
      latitude,
      longitude,
      address ?? null,
      city ?? null,
      req.file ? req.file.filename : null,
    );
  db.prepare('UPDATE users SET points = points + 10 WHERE id = ?').run(req.user.id);

  const created = db.prepare('SELECT * FROM reports WHERE id = ?').get(Number(info.lastInsertRowid));
  res.status(201).json(created);
});

router.patch('/:id', auth, (req, res) => {
  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(Number(req.params.id));
  if (!report) return res.status(404).json({ error: 'Signalement introuvable' });

  const isOwner = report.user_id === req.user.id;
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Action non autorisée' });

  const { status, description } = req.body || {};
  if (status === undefined && description === undefined) {
    return res.status(400).json({ error: 'Rien à mettre à jour' });
  }
  if (status !== undefined && !STATUSES.includes(status)) {
    return res.status(400).json({ error: 'Statut invalide' });
  }

  if (status !== undefined) {
    db.prepare("UPDATE reports SET status = ?, updated_at = datetime('now') WHERE id = ?").run(status, report.id);
    if (status === 'resolved' && report.status !== 'resolved' && report.user_id) {
      db.prepare('UPDATE users SET points = points + 20 WHERE id = ?').run(report.user_id);
    }
  }
  if (description !== undefined) {
    db.prepare("UPDATE reports SET description = ?, updated_at = datetime('now') WHERE id = ?").run(
      String(description),
      report.id,
    );
  }
  res.json(db.prepare('SELECT * FROM reports WHERE id = ?').get(report.id));
});

router.delete('/:id', auth, (req, res) => {
  const report = db.prepare('SELECT * FROM reports WHERE id = ?').get(Number(req.params.id));
  if (!report) return res.status(404).json({ error: 'Signalement introuvable' });

  const isOwner = report.user_id === req.user.id;
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Action non autorisée' });

  db.prepare('DELETE FROM reports WHERE id = ?').run(report.id);
  if (report.photo) {
    const file = path.join(uploadsDir, path.basename(report.photo));
    fs.rm(file, { force: true }, () => {});
  }
  res.status(204).end();
});

export default router;
