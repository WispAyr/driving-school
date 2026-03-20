import { Router } from 'express';
import db from '../db.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  const { tenant_id, instructor_id, approved } = req.query;
  let q = 'SELECT r.*, i.id as inst_id, u.name as instructor_name FROM reviews r LEFT JOIN instructors i ON r.instructor_id = i.id LEFT JOIN users u ON i.user_id = u.id WHERE 1=1';
  const params = [];
  if (tenant_id) { q += ' AND r.tenant_id = ?'; params.push(tenant_id); }
  if (instructor_id) { q += ' AND r.instructor_id = ?'; params.push(instructor_id); }
  if (approved !== undefined) { q += ' AND r.approved = ?'; params.push(parseInt(approved)); }
  q += ' ORDER BY r.created_at DESC';
  res.json(db.prepare(q).all(...params));
});

router.post('/', (req, res) => {
  const { tenant_id, instructor_id, student_name, rating, title, content, passed, test_center } = req.body;
  if (!tenant_id || !student_name || !rating || !content) return res.status(400).json({ error: 'Missing required fields' });
  const result = db.prepare('INSERT INTO reviews (tenant_id, instructor_id, student_name, rating, title, content, passed, test_center) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
    .run(tenant_id, instructor_id, student_name, rating, title, content, passed ? 1 : 0, test_center);
  res.status(201).json({ id: result.lastInsertRowid, message: 'Review submitted for approval' });
});

router.put('/:id/approve', auth, requireRole('admin', 'superadmin'), (req, res) => {
  db.prepare('UPDATE reviews SET approved = 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

router.delete('/:id', auth, requireRole('admin', 'superadmin'), (req, res) => {
  db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
