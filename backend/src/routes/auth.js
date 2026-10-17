import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db.js';
import { auth, JWT_SECRET } from '../middleware/auth.js';

const router = Router();

function publicUser(row) {
  const { password_hash, ...user } = row;
  return user;
}

function sign(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

router.post('/register', async (req, res) => {
  const { name, email, password, city } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email et password sont requis' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ error: 'Mot de passe : 6 caractères minimum' });
  }
  const normalizedEmail = String(email).toLowerCase();
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
  if (exists) return res.status(409).json({ error: 'Email déjà utilisé' });

  const hash = await bcrypt.hash(String(password), 10);
  const info = db
    .prepare('INSERT INTO users (name, email, password_hash, city) VALUES (?, ?, ?, ?)')
    .run(String(name).trim(), normalizedEmail, hash, city ?? null);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(Number(info.lastInsertRowid));
  res.status(201).json({ token: sign(user), user: publicUser(user) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email et password sont requis' });
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).toLowerCase());
  const ok = user && (await bcrypt.compare(String(password), user.password_hash));
  if (!ok) return res.status(401).json({ error: 'Identifiants incorrects' });
  res.json({ token: sign(user), user: publicUser(user) });
});

router.get('/me', auth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
  res.json({ user: publicUser(user) });
});

export default router;
