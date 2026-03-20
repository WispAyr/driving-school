import { Router } from 'express';
import db from '../db.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, (req, res) => {
  const tid = req.query.tenant_id || req.user.tenant_id;
  let q = 'SELECT b.*, u.name as student_name FROM bookings b LEFT JOIN users u ON b.student_id = u.id';
  const params = [];
  if (tid) { q += ' WHERE b.tenant_id = ?'; params.push(tid); }
  if (req.query.status) { q += (params.length ? ' AND' : ' WHERE') + ' b.status = ?'; params.push(req.query.status); }
  q += ' ORDER BY b.created_at DESC';
  if (req.query.limit) { q += ' LIMIT ?'; params.push(parseInt(req.query.limit)); }
  res.json(db.prepare(q).all(...params));
});

router.post('/', (req, res) => {
  try {
    const { tenant_id, name, email, phone, preferred_date, preferred_time, transmission, pickup_postcode, notes, package_id, booking_type, instructor_id } = req.body;
    if (!tenant_id || !name || !email) return res.status(400).json({ error: 'Tenant, name, and email are required' });
    const result = db.prepare(`
      INSERT INTO bookings (tenant_id, name, email, phone, preferred_date, preferred_time, transmission, pickup_postcode, notes, package_id, booking_type, instructor_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(tenant_id, name, email, phone, preferred_date, preferred_time, transmission || 'manual', pickup_postcode, notes, package_id, booking_type || 'enquiry', instructor_id);
    res.status(201).json({ id: result.lastInsertRowid, message: 'Booking submitted successfully' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', auth, (req, res) => {
  const fields = ['status', 'instructor_id', 'lesson_date', 'lesson_time', 'duration_minutes', 'price', 'notes'];
  const updates = [], values = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); }
  }
  if (!updates.length) return res.json({ success: true });
  values.push(req.params.id);
  db.prepare(`UPDATE bookings SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ?`).run(...values);
  res.json({ success: true });
});

router.delete('/:id', auth, requireRole('admin', 'superadmin'), (req, res) => {
  db.prepare('DELETE FROM bookings WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
