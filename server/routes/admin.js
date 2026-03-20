import { Router } from 'express';
import db from '../db.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = Router();

// Super admin stats
router.get('/stats', auth, requireRole('superadmin'), (req, res) => {
  res.json({
    tenants: db.prepare('SELECT COUNT(*) as c FROM tenants WHERE active = 1').get().c,
    instructors: db.prepare('SELECT COUNT(*) as c FROM instructors WHERE active = 1').get().c,
    students: db.prepare('SELECT COUNT(*) as c FROM users WHERE role = "student"').get().c,
    bookings: db.prepare('SELECT COUNT(*) as c FROM bookings').get().c,
    reviews: db.prepare('SELECT COUNT(*) as c FROM reviews').get().c,
    pending_reviews: db.prepare('SELECT COUNT(*) as c FROM reviews WHERE approved = 0').get().c,
    pending_bookings: db.prepare('SELECT COUNT(*) as c FROM bookings WHERE status = "pending"').get().c,
    recent_bookings: db.prepare('SELECT * FROM bookings ORDER BY created_at DESC LIMIT 10').all(),
    recent_reviews: db.prepare('SELECT * FROM reviews ORDER BY created_at DESC LIMIT 10').all(),
  });
});

// All users management
router.get('/users', auth, requireRole('superadmin', 'admin'), (req, res) => {
  const tid = req.user.role === 'superadmin' ? req.query.tenant_id : req.user.tenant_id;
  let q = 'SELECT id, email, name, role, tenant_id, phone, active, created_at FROM users';
  const params = [];
  if (tid) { q += ' WHERE tenant_id = ?'; params.push(tid); }
  q += ' ORDER BY created_at DESC';
  res.json(db.prepare(q).all(...params));
});

router.put('/users/:id', auth, requireRole('superadmin', 'admin'), (req, res) => {
  const { role, active, tenant_id } = req.body;
  const updates = [], values = [];
  if (role !== undefined) { updates.push('role = ?'); values.push(role); }
  if (active !== undefined) { updates.push('active = ?'); values.push(active); }
  if (tenant_id !== undefined && req.user.role === 'superadmin') { updates.push('tenant_id = ?'); values.push(tenant_id); }
  if (updates.length) { values.push(req.params.id); db.prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`).run(...values); }
  res.json({ success: true });
});

// Theory resources
router.get('/theory', (req, res) => {
  const { tenant_id, category } = req.query;
  let q = 'SELECT * FROM theory_resources WHERE 1=1';
  const params = [];
  if (tenant_id) { q += ' AND (tenant_id = ? OR tenant_id IS NULL)'; params.push(tenant_id); }
  if (category) { q += ' AND category = ?'; params.push(category); }
  q += ' ORDER BY category, title';
  res.json(db.prepare(q).all(...params));
});

router.post('/theory', auth, requireRole('admin', 'superadmin'), (req, res) => {
  const { tenant_id, title, category, content, question, options, correct_answer, explanation, difficulty } = req.body;
  const result = db.prepare('INSERT INTO theory_resources (tenant_id, title, category, content, question, options, correct_answer, explanation, difficulty) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)')
    .run(tenant_id, title, category, content, question, options ? JSON.stringify(options) : null, correct_answer, explanation, difficulty || 'medium');
  res.status(201).json({ id: result.lastInsertRowid });
});

export default router;
