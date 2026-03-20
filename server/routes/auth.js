import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../db.js';
import { generateToken, auth } from '../middleware/auth.js';

const router = Router();

router.post('/register', (req, res) => {
  try {
    const { email, password, name, phone, role, tenant_id } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(
      'INSERT INTO users (email, password, name, phone, role, tenant_id) VALUES (?, ?, ?, ?, ?, ?)'
    ).run(email, hash, name, phone || null, role || 'student', tenant_id || null);

    const user = db.prepare('SELECT id, email, name, role, tenant_id FROM users WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json({ user, token: generateToken(user) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    if (!user.active) return res.status(403).json({ error: 'Account disabled' });
    const { password: _, ...safe } = user;
    res.json({ user: safe, token: generateToken(user) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, email, name, role, tenant_id, phone, avatar, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.put('/me', auth, (req, res) => {
  const { name, phone, avatar } = req.body;
  db.prepare('UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), avatar = COALESCE(?, avatar), updated_at = datetime("now") WHERE id = ?')
    .run(name, phone, avatar, req.user.id);
  const user = db.prepare('SELECT id, email, name, role, tenant_id, phone, avatar FROM users WHERE id = ?').get(req.user.id);
  res.json(user);
});

export default router;
