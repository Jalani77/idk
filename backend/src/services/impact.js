// Simple impact forecasting utilities for SMB context

export function estimateTimeSavedHours(profile, tool) {
  const sizeFactor = normalizeSize(profile?.size);
  const categoryFactor = {
    marketing: 8,
    sales: 6,
    support: 10,
    operations: 12,
    knowledge: 5,
    security: 3
  }[tool.category] || 4;
  return Math.round(sizeFactor * categoryFactor);
}

export function estimateEfficiencyImprovement(profile, tool) {
  const base = 0.05; // 5%
  const tierAdd = tool.cost_tier === 'mid' ? 0.03 : tool.cost_tier === 'high' ? 0.05 : 0.02;
  const fitAdd = toolFitScore(profile, tool) * 0.1; // up to +10%
  return Math.min(0.35, base + tierAdd + fitAdd);
}

export function estimateROI(profile, tool) {
  const revenue = profile?.revenue && profile.revenue > 0 ? profile.revenue : inferRevenueFromSize(profile?.size);
  const eff = estimateEfficiencyImprovement(profile, tool);
  const timeValuation = revenue * 0.1; // 10% of revenue approximated as labor cost bucket
  const timeSaved = estimateTimeSavedHours(profile, tool);
  const savedValue = timeValuation * eff + (timeSaved * 30); // $30/hour estimate
  const monthlyCost = tool.price_per_month || 25;
  return Math.max(0, Math.round(savedValue - monthlyCost));
}

export function toolFitScore(profile, tool) {
  let score = 0;
  if (!profile) return 0.3; // shallow default
  const industry = (profile.industry || '').toLowerCase();
  const targets = safeParseJSON(tool.target_industries) || [];
  if (targets.includes('all') || targets.find((i) => industry.includes(i))) score += 0.5;
  const goals = safeParseJSON(profile.goals) || [];
  const features = safeParseJSON(tool.features) || [];
  if (goals.length && features.length) {
    const overlap = goals.filter((g) => features.join(' ').toLowerCase().includes(String(g).toLowerCase())).length;
    score += Math.min(0.4, overlap * 0.15);
  }
  // Budget friendliness for SMB
  score += tool.cost_tier === 'low' ? 0.1 : 0.05;
  return Math.min(1, score);
}

function normalizeSize(size) {
  switch ((size || '').toLowerCase()) {
    case 'solo':
    case '1-2':
    case 'micro':
      return 1;
    case '3-10':
    case 'small':
      return 2;
    case '11-50':
    case 'medium':
      return 3;
    case '51-200':
      return 4;
    default:
      return 2;
  }
}

function inferRevenueFromSize(size) {
  switch ((size || '').toLowerCase()) {
    case 'solo':
    case '1-2':
      return 80000;
    case '3-10':
      return 450000;
    case '11-50':
      return 2500000;
    case '51-200':
      return 10000000;
    default:
      return 500000;
  }
}

function safeParseJSON(val) {
  try {
    return typeof val === 'string' ? JSON.parse(val) : val;
  } catch {
    return null;
  }
}
