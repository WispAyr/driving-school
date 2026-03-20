import { Router } from 'express';
import db from '../db.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, (req, res) => {
  const tid = req.user.tenant_id;
  if (!tid && req.user.role !== 'superadmin') return res.json({});
  
  const where = tid ? 'WHERE tenant_id = ?' : '';
  const params = tid ? [tid] : [];
  
  res.json({
    instructors: db.prepare(`SELECT COUNT(*) as c FROM instructors ${tid ? 'WHERE tenant_id = ? AND active = 1' : 'WHERE active = 1'}`).get(...params).c,
    students: db.prepare(`SELECT COUNT(*) as c FROM users ${tid ? 'WHERE tenant_id = ? AND role = "student"' : 'WHERE role = "student"'}`).get(...params).c,
    bookings_total: db.prepare(`SELECT COUNT(*) as c FROM bookings ${where}`).get(...params).c,
    bookings_pending: db.prepare(`SELECT COUNT(*) as c FROM bookings ${tid ? 'WHERE tenant_id = ? AND status = "pending"' : 'WHERE status = "pending"'}`).get(...params).c,
    reviews_total: db.prepare(`SELECT COUNT(*) as c FROM reviews ${where}`).get(...params).c,
    reviews_pending: db.prepare(`SELECT COUNT(*) as c FROM reviews ${tid ? 'WHERE tenant_id = ? AND approved = 0' : 'WHERE approved = 0'}`).get(...params).c,
    recent_bookings: db.prepare(`SELECT * FROM bookings ${where} ORDER BY created_at DESC LIMIT 5`).all(...params),
    avg_rating: db.prepare(`SELECT AVG(rating) as r FROM reviews ${tid ? 'WHERE tenant_id = ? AND approved = 1' : 'WHERE approved = 1'}`).get(...params).r,
  });
});

export default router;
