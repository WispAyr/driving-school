import { Router } from 'express';
import db from '../db.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  const { tenant_id, type, transmission } = req.query;
  let q = 'SELECT * FROM packages WHERE active = 1';
  const params = [];
  if (tenant_id) { q += ' AND tenant_id = ?'; params.push(tenant_id); }
  if (type) { q += ' AND package_type = ?'; params.push(type); }
  if (transmission) { q += ' AND transmission = ?'; params.push(transmission); }
  q += ' ORDER BY price ASC';
  res.json(db.prepare(q).all(...params));
});

router.post('/', auth, requireRole('admin', 'superadmin'), (req, res) => {
  const { tenant_id, name, description, lesson_count, duration_hours, price, discount_percent, package_type, transmission, intensive } = req.body;
  const tid = tenant_id || req.user.tenant_id;
  const result = db.prepare('INSERT INTO packages (tenant_id, name, description, lesson_count, duration_hours, price, discount_percent, package_type, transmission, intensive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(tid, name, description, lesson_count, duration_hours, price, discount_percent || 0, package_type || 'standard', transmission || 'manual', intensive ? 1 : 0);
  res.status(201).json(db.prepare('SELECT * FROM packages WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/:id', auth, requireRole('admin', 'superadmin'), (req, res) => {
  const fields = ['name', 'description', 'lesson_count', 'duration_hours', 'price', 'discount_percent', 'package_type', 'transmission', 'intensive', 'active'];
  const updates = [], values = [];
  for (const f of fields) { if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); } }
  if (updates.length) { values.push(req.params.id); db.prepare(`UPDATE packages SET ${updates.join(', ')} WHERE id = ?`).run(...values); }
  res.json(db.prepare('SELECT * FROM packages WHERE id = ?').get(req.params.id));
});

router.delete('/:id', auth, requireRole('admin', 'superadmin'), (req, res) => {
  db.prepare('UPDATE packages SET active = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
