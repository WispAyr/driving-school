import { Router } from 'express';
import slugify from 'slugify';
import db from '../db.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', auth, (req, res) => {
  if (req.user.role === 'superadmin') {
    res.json(db.prepare('SELECT * FROM tenants ORDER BY created_at DESC').all());
  } else if (req.user.tenant_id) {
    res.json([db.prepare('SELECT * FROM tenants WHERE id = ?').get(req.user.tenant_id)]);
  } else {
    res.json([]);
  }
});

router.get('/:id', auth, (req, res) => {
  const tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(req.params.id);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  res.json(tenant);
});

router.post('/', auth, requireRole('superadmin'), (req, res) => {
  try {
    const { name, description, phone, email, website, address, city, postcode, tagline, about, primary_color, secondary_color } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const slug = slugify(name, { lower: true, strict: true });
    const result = db.prepare(
      `INSERT INTO tenants (name, slug, description, phone, email, website, address, city, postcode, tagline, about, primary_color, secondary_color)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(name, slug, description, phone, email, website, address, city, postcode, tagline, about, primary_color || '#2563eb', secondary_color || '#1e40af');
    res.status(201).json(db.prepare('SELECT * FROM tenants WHERE id = ?').get(result.lastInsertRowid));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', auth, (req, res) => {
  const tenant = db.prepare('SELECT * FROM tenants WHERE id = ?').get(req.params.id);
  if (!tenant) return res.status(404).json({ error: 'Tenant not found' });
  if (req.user.role !== 'superadmin' && req.user.tenant_id !== tenant.id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  const fields = ['name', 'description', 'phone', 'email', 'website', 'address', 'city', 'postcode', 'tagline', 'about', 'primary_color', 'secondary_color', 'logo', 'pass_rate', 'total_passes', 'transmission_types', 'active', 'plan', 'founded_year'];
  const updates = [];
  const values = [];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      updates.push(`${f} = ?`);
      values.push(req.body[f]);
    }
  }
  if (updates.length === 0) return res.json(tenant);
  values.push(req.params.id);
  db.prepare(`UPDATE tenants SET ${updates.join(', ')}, updated_at = datetime('now') WHERE id = ?`).run(...values);
  res.json(db.prepare('SELECT * FROM tenants WHERE id = ?').get(req.params.id));
});

router.delete('/:id', auth, requireRole('superadmin'), (req, res) => {
  db.prepare('UPDATE tenants SET active = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
