import { Router } from 'express';
import db from '../db.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, (req, res) => {
  const tid = req.query.tenant_id || req.user.tenant_id;
  if (!tid && req.user.role !== 'superadmin') return res.json([]);
  const where = tid ? 'WHERE tenant_id = ? AND role = "student"' : 'WHERE role = "student"';
  res.json(db.prepare(`SELECT id, email, name, phone, tenant_id, created_at FROM users ${where} ORDER BY name`).all(...(tid ? [tid] : [])));
});

router.get('/:id/progress', auth, (req, res) => {
  res.json(db.prepare('SELECT * FROM student_progress WHERE student_id = ? ORDER BY lesson_date DESC').all(req.params.id));
});

router.post('/:id/progress', auth, requireRole('instructor', 'admin', 'superadmin'), (req, res) => {
  const { lesson_date, topic, score, notes } = req.body;
  const student = db.prepare('SELECT tenant_id FROM users WHERE id = ?').get(req.params.id);
  if (!student) return res.status(404).json({ error: 'Student not found' });
  const inst = db.prepare('SELECT id FROM instructors WHERE user_id = ?').get(req.user.id);
  const result = db.prepare('INSERT INTO student_progress (student_id, instructor_id, tenant_id, lesson_date, topic, score, notes) VALUES (?, ?, ?, ?, ?, ?, ?)')
    .run(req.params.id, inst?.id || 0, student.tenant_id, lesson_date, topic, score, notes);
  res.status(201).json({ id: result.lastInsertRowid });
});

export default router;
