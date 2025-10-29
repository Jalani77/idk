import express from 'express';
import { z } from 'zod';
import { validate } from '../middleware/validate.js';
import { db } from '../db.js';
import { nanoid } from 'nanoid';
import { maskPII } from '../utils/privacy.js';

const router = express.Router();

const leadSchema = z.object({
  body: z.object({
    tool_id: z.string().min(2),
    message: z.string().min(5)
  })
});

router.post('/', validate(leadSchema), (req, res) => {
  const orgId = req.orgId;
  const { tool_id, message } = req.validated.body;
  const tool = db.prepare('SELECT * FROM tools WHERE id = ?').get(tool_id);
  if (!tool) return res.status(400).json({ error: 'Invalid tool' });
  const vendor = db.prepare('SELECT * FROM vendors WHERE id = ?').get(tool.vendor_id);

  const id = `lead_${nanoid(10)}`;
  db.prepare('INSERT INTO leads (id, org_id, vendor_id, tool_id, message) VALUES (?, ?, ?, ?, ?)')
    .run(id, orgId, vendor?.id || null, tool_id, maskPII(message));

  res.json({ ok: true, lead_id: id, vendor_contact: vendor?.contact_email || null });
});

export default router;
