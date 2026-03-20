import { Router } from 'express';
import db from '../db.js';
import { auth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', (req, res) => {
  const { tenant_id } = req.query;
  if (tenant_id) {
    res.json(db.prepare('SELECT * FROM areas WHERE tenant_id = ? AND active = 1 ORDER BY name').all(tenant_id));
  } else {
    res.json(db.prepare('SELECT * FROM areas WHERE active = 1 ORDER BY name').all());
  }
});

router.post('/', auth, requireRole('admin', 'superadmin'), (req, res) => {
  const { tenant_id, name, postcode_prefix, region } = req.body;
  const tid = tenant_id || req.user.tenant_id;
  const result = db.prepare('INSERT INTO areas (tenant_id, name, postcode_prefix, region) VALUES (?, ?, ?, ?)').run(tid, name, postcode_prefix, region);
  res.status(201).json(db.prepare('SELECT * FROM areas WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/:id', auth, requireRole('admin', 'superadmin'), (req, res) => {
  const { name, postcode_prefix, region, active } = req.body;
  db.prepare('UPDATE areas SET name = COALESCE(?, name), postcode_prefix = COALESCE(?, postcode_prefix), region = COALESCE(?, region), active = COALESCE(?, active) WHERE id = ?')
    .run(name, postcode_prefix, region, active, req.params.id);
  res.json(db.prepare('SELECT * FROM areas WHERE id = ?').get(req.params.id));
});

router.delete('/:id', auth, requireRole('admin', 'superadmin'), (req, res) => {
  db.prepare('UPDATE areas SET active = 0 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
