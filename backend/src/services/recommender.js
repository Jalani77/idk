import { db } from '../db.js';
import { estimateTimeSavedHours, estimateEfficiencyImprovement, estimateROI, toolFitScore } from './impact.js';
import { nanoid } from 'nanoid';

export function getOrCreateRecommendations(orgId) {
  const profile = db.prepare('SELECT * FROM profiles WHERE org_id = ?').get(orgId);
  const existing = db.prepare('SELECT * FROM recommendations WHERE org_id = ? ORDER BY score DESC').all(orgId);
  if (existing && existing.length) return existing.map(enrichRecommendation);

  const tools = db.prepare('SELECT * FROM tools').all();
  const recs = tools.map((tool) => {
    const score = toolFitScore(profile, tool);
    const forecast_roi = estimateROI(profile, tool);
    const time_saved_hours = estimateTimeSavedHours(profile, tool);
    const efficiency_improvement = estimateEfficiencyImprovement(profile, tool);
    return {
      id: `rec_${nanoid(10)}`,
      org_id: orgId,
      tool_id: tool.id,
      score,
      forecast_roi,
      time_saved_hours,
      efficiency_improvement
    };
  })
  .sort((a, b) => b.score - a.score)
  .slice(0, 10);

  const insert = db.prepare(`INSERT INTO recommendations (id, org_id, tool_id, score, forecast_roi, time_saved_hours, efficiency_improvement) VALUES (@id, @org_id, @tool_id, @score, @forecast_roi, @time_saved_hours, @efficiency_improvement)`);
  const tx = db.transaction(() => {
    for (const r of recs) insert.run(r);
  });
  tx();

  return recs.map(enrichRecommendation);
}

export function refreshRecommendations(orgId) {
  db.prepare('DELETE FROM recommendations WHERE org_id = ?').run(orgId);
  return getOrCreateRecommendations(orgId);
}

function enrichRecommendation(r) {
  const tool = db.prepare('SELECT * FROM tools WHERE id = ?').get(r.tool_id);
  return { ...r, tool };
}
