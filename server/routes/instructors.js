import { Router } from 'express';
import db from '../db.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, (req, res) => {
  const tenantId = req.query.tenant_id || req.user.tenant_id;
  if (!tenantId && req.user.role !== 'superadmin') return res.json([]);
  const where = tenantId ? 'WHERE i.tenant_id = ?' : '';
  const params = tenantId ? [tenantId] : [];
  const instructors = db.prepare(`
    SELECT i.*, u.name, u.email, u.phone, u.avatar
    FROM instructors i JOIN users u ON i.user_id = u.id ${where} ORDER BY u.name
  `).all(...params);
  
  for (const inst of instructors) {
    inst.areas = db.prepare(`
      SELECT a.* FROM areas a JOIN instructor_areas ia ON a.id = ia.area_id WHERE ia.instructor_id = ?
    `).all(inst.id);
  }
  res.json(instructors);
});

router.get('/:id', (req, res) => {
  const inst = db.prepare(`
    SELECT i.*, u.name, u.email, u.phone, u.avatar
    FROM instructors i JOIN users u ON i.user_id = u.id WHERE i.id = ?
  `).get(req.params.id);
  if (!inst) return res.status(404).json({ error: 'Instructor not found' });
  inst.areas = db.prepare('SELECT a.* FROM areas a JOIN instructor_areas ia ON a.id = ia.area_id WHERE ia.instructor_id = ?').all(inst.id);
  inst.reviews = db.prepare('SELECT * FROM reviews WHERE instructor_id = ? AND approved = 1 ORDER BY created_at DESC LIMIT 10').all(inst.id);
  res.json(inst);
});

router.post('/', auth, requireRole('superadmin', 'admin'), async (req, res) => {
  try {
    const { email, password, name, phone, tenant_id, bio, qualifications, experience_years, pass_rate, transmission_types, car_make, car_model, hourly_rate, badge_number, adi_grade, languages, specialities, area_ids } = req.body;
    const tid = tenant_id || req.user.tenant_id;
    if (!tid) return res.status(400).json({ error: 'Tenant ID required' });

    const bcrypt = await import('bcryptjs');
    const hash = bcrypt.default.hashSync(password || 'changeme123', 10);
    const userResult = db.prepare('INSERT INTO users (email, password, name, phone, role, tenant_id) VALUES (?, ?, ?, ?, ?, ?)').run(email, hash, name, phone, 'instructor', tid);

    const result = db.prepare(`
      INSERT INTO instructors (user_id, tenant_id, bio, qualifications, experience_years, pass_rate, transmission_types, car_make, car_model, hourly_rate, badge_number, adi_grade, languages, specialities)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userResult.lastInsertRowid, tid, bio, qualifications, experience_years || 0, pass_rate, transmission_types || 'manual', car_make, car_model, hourly_rate, badge_number, adi_grade, languages || 'English', specialities);

    if (area_ids?.length) {
      const stmt = db.prepare('INSERT OR IGNORE INTO instructor_areas (instructor_id, area_id) VALUES (?, ?)');
      for (const aid of area_ids) stmt.run(result.lastInsertRowid, aid);
    }

    res.status(201).json({ id: result.lastInsertRowid });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', auth, requireRole('superadmin', 'admin', 'instructor'), (req, res) => {
  const fields = ['bio', 'qualifications', 'experience_years', 'pass_rate', 'total_passes', 'transmission_types', 'car_make', 'car_model', 'car_year', 'hourly_rate', 'badge_number', 'adi_grade', 'languages', 'specialities', 'active'];
  const updates = [], values = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) { updates.push(`${f} = ?`); values.push(req.body[f]); }
  }
  if (updates.length) {
    values.push(req.params.id);
    db.prepare(`UPDATE instructors SET ${updates.join(', ')} WHERE id = ?`).run(...values);
  }
  if (req.body.area_ids) {
    db.prepare('DELETE FROM instructor_areas WHERE instructor_id = ?').run(req.params.id);
    const stmt = db.prepare('INSERT INTO instructor_areas (instructor_id, area_id) VALUES (?, ?)');
    for (const aid of req.body.area_ids) stmt.run(req.params.id, aid);
  }
  if (req.body.name || req.body.phone) {
    const inst = db.prepare('SELECT user_id FROM instructors WHERE id = ?').get(req.params.id);
    if (inst) {
      if (req.body.name) db.prepare('UPDATE users SET name = ? WHERE id = ?').run(req.body.name, inst.user_id);
      if (req.body.phone) db.prepare('UPDATE users SET phone = ? WHERE id = ?').run(req.body.phone, inst.user_id);
    }
  }
  res.json({ success: true });
});

export default router;
