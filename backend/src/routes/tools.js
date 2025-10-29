import express from 'express';
import { db } from '../db.js';

const router = express.Router();

router.get('/', (req, res) => {
  const { q, category, cost_tier } = req.query;
  let sql = 'SELECT * FROM tools WHERE 1=1';
  const params = [];
  if (q) {
    sql += ' AND (name LIKE ? OR description LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (cost_tier) {
    sql += ' AND cost_tier = ?';
    params.push(cost_tier);
  }
  sql += ' ORDER BY price_per_month ASC';
  const tools = db.prepare(sql).all(...params);
  res.json({ tools });
});

router.get('/:id', (req, res) => {
  const tool = db.prepare('SELECT * FROM tools WHERE id = ?').get(req.params.id);
  if (!tool) return res.status(404).json({ error: 'Not found' });
  const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(tool.vendor_id);
  res.json({ tool, vendor });
});

export default router;
