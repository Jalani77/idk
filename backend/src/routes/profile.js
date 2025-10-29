import express from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const profileSchema = z.object({
  body: z.object({
    industry: z.string().min(2),
    size: z.string().min(1),
    revenue: z.number().min(0).optional(),
    team_structure: z.any().optional(),
    tools: z.any().optional(),
    workflows: z.any().optional(),
    goals: z.any().optional()
  })
});

router.get('/', (req, res) => {
  const orgId = req.orgId;
  const profile = db.prepare('SELECT * FROM profiles WHERE org_id = ?').get(orgId);
  res.json({ org_id: orgId, profile: normalizeProfile(profile) });
});

router.post('/', validate(profileSchema), (req, res) => {
  const orgId = req.orgId;
  const org = db.prepare('INSERT OR IGNORE INTO organizations (id) VALUES (?)');
  org.run(orgId);

  const { industry, size, revenue, team_structure, tools, workflows, goals } = req.validated.body;
  const upsert = db.prepare(`
    INSERT INTO profiles (org_id, industry, size, revenue, team_structure, tools, workflows, goals, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(org_id) DO UPDATE SET
      industry=excluded.industry,
      size=excluded.size,
      revenue=excluded.revenue,
      team_structure=excluded.team_structure,
      tools=excluded.tools,
      workflows=excluded.workflows,
      goals=excluded.goals,
      updated_at=datetime('now')
  `);

  upsert.run(
    orgId,
    industry,
    size,
    revenue ?? null,
    team_structure ? JSON.stringify(team_structure) : null,
    tools ? JSON.stringify(tools) : null,
    workflows ? JSON.stringify(workflows) : null,
    goals ? JSON.stringify(goals) : null
  );

  const profile = db.prepare('SELECT * FROM profiles WHERE org_id = ?').get(orgId);
  res.json({ ok: true, profile: normalizeProfile(profile) });
});

function normalizeProfile(p) {
  if (!p) return null;
  return {
    ...p,
    team_structure: p.team_structure ? JSON.parse(p.team_structure) : null,
    tools: p.tools ? JSON.parse(p.tools) : null,
    workflows: p.workflows ? JSON.parse(p.workflows) : null,
    goals: p.goals ? JSON.parse(p.goals) : null
  };
}

export default router;
