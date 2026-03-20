import { Router } from 'express';
import db from '../db.js';

const router = Router();

// Get tenant by slug (public page)
router.get('/school/:slug', (req, res) => {
  const tenant = db.prepare('SELECT * FROM tenants WHERE slug = ? AND active = 1').get(req.params.slug);
  if (!tenant) return res.status(404).json({ error: 'School not found' });
  
  tenant.instructors = db.prepare(`
    SELECT i.*, u.name, u.avatar FROM instructors i JOIN users u ON i.user_id = u.id 
    WHERE i.tenant_id = ? AND i.active = 1 ORDER BY u.name
  `).all(tenant.id);
  
  for (const inst of tenant.instructors) {
    inst.areas = db.prepare('SELECT a.name FROM areas a JOIN instructor_areas ia ON a.id = ia.area_id WHERE ia.instructor_id = ?').all(inst.id);
    inst.review_count = db.prepare('SELECT COUNT(*) as c FROM reviews WHERE instructor_id = ? AND approved = 1').get(inst.id).c;
    inst.avg_rating = db.prepare('SELECT AVG(rating) as r FROM reviews WHERE instructor_id = ? AND approved = 1').get(inst.id).r;
  }
  
  tenant.packages = db.prepare('SELECT * FROM packages WHERE tenant_id = ? AND active = 1 ORDER BY price').all(tenant.id);
  tenant.areas = db.prepare('SELECT * FROM areas WHERE tenant_id = ? AND active = 1 ORDER BY name').all(tenant.id);
  tenant.reviews = db.prepare('SELECT r.*, u.name as instructor_name FROM reviews r LEFT JOIN instructors i ON r.instructor_id = i.id LEFT JOIN users u ON i.user_id = u.id WHERE r.tenant_id = ? AND r.approved = 1 ORDER BY r.created_at DESC LIMIT 20').all(tenant.id);
  
  const stats = db.prepare('SELECT COUNT(*) as total, AVG(rating) as avg_rating FROM reviews WHERE tenant_id = ? AND approved = 1').get(tenant.id);
  tenant.review_stats = stats;
  
  res.json(tenant);
});

// List all active schools
router.get('/schools', (req, res) => {
  const { area, transmission } = req.query;
  let schools = db.prepare('SELECT id, name, slug, logo, tagline, pass_rate, total_passes, primary_color, city, postcode FROM tenants WHERE active = 1 ORDER BY name').all();
  
  for (const s of schools) {
    const stats = db.prepare('SELECT COUNT(*) as c, AVG(rating) as r FROM reviews WHERE tenant_id = ? AND approved = 1').get(s.id);
    s.review_count = stats.c;
    s.avg_rating = stats.r;
    s.instructor_count = db.prepare('SELECT COUNT(*) as c FROM instructors WHERE tenant_id = ? AND active = 1').get(s.id).c;
    s.areas = db.prepare('SELECT name FROM areas WHERE tenant_id = ? AND active = 1').all(s.id).map(a => a.name);
  }
  
  if (area) {
    schools = schools.filter(s => s.areas.some(a => a.toLowerCase().includes(area.toLowerCase())));
  }
  
  res.json(schools);
});

// Search instructors across all schools
router.get('/search/instructors', (req, res) => {
  const { area, transmission, name } = req.query;
  let q = `SELECT i.*, u.name, u.avatar, t.name as school_name, t.slug as school_slug
    FROM instructors i JOIN users u ON i.user_id = u.id JOIN tenants t ON i.tenant_id = t.id
    WHERE i.active = 1 AND t.active = 1`;
  const params = [];
  if (transmission) { q += ' AND i.transmission_types LIKE ?'; params.push(`%${transmission}%`); }
  if (name) { q += ' AND u.name LIKE ?'; params.push(`%${name}%`); }
  q += ' ORDER BY i.pass_rate DESC NULLS LAST';
  const results = db.prepare(q).all(...params);
  
  if (area) {
    const filtered = results.filter(inst => {
      const areas = db.prepare('SELECT a.name FROM areas a JOIN instructor_areas ia ON a.id = ia.area_id WHERE ia.instructor_id = ?').all(inst.id);
      return areas.some(a => a.name.toLowerCase().includes(area.toLowerCase()));
    });
    return res.json(filtered);
  }
  res.json(results);
});

export default router;
