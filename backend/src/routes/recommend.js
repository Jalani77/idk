import express from 'express';
import { getOrCreateRecommendations, refreshRecommendations } from '../services/recommender.js';
import { db } from '../db.js';
import { generateIntegrationSteps } from '../services/integration.js';

const router = express.Router();

router.get('/', (req, res) => {
  const recs = getOrCreateRecommendations(req.orgId);
  res.json({ recommendations: recs });
});

router.post('/refresh', (req, res) => {
  const recs = refreshRecommendations(req.orgId);
  res.json({ recommendations: recs });
});

router.get('/dashboard', (req, res) => {
  const orgId = req.orgId;
  const profile = db.prepare('SELECT * FROM profiles WHERE org_id = ?').get(orgId);
  const recs = getOrCreateRecommendations(orgId);

  const enriched = recs.map((r) => ({
    ...r,
    integration_steps: generateIntegrationSteps(r.tool, profile ? normalizeProfile(profile) : null)
  }));

  const totalROI = recs.reduce((sum, r) => sum + (r.forecast_roi || 0), 0);
  const totalTimeSaved = recs.reduce((sum, r) => sum + (r.time_saved_hours || 0), 0);

  res.json({
    profile: profile ? normalizeProfile(profile) : null,
    totals: { totalROI, totalTimeSaved, numRecommendations: recs.length },
    recommendations: enriched
  });
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
