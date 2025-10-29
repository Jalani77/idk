import request from 'supertest';

// Use in-memory DB for tests
process.env.DB_PATH = ':memory:';
process.env.CORS_ORIGIN = 'http://localhost:3000';

import { buildApp } from './app.js';
import { db } from './db.js';

const app = buildApp();
const agent = request.agent(app);

function record(result, step, ok, info = '') {
  result.push({ step, ok, info });
}

async function run() {
  const results = [];

  try {
    // Health
    const h = await agent.get('/api/health');
    record(results, 'health', h.status === 200 && h.body.ok === true, JSON.stringify(h.body));

    // Conversational onboarding to collect profile
    const messages = [
      'Our industry is ecommerce retail',
      'We are 12 people',
      'Revenue is 45000',
      'Team: sales, marketing, support',
      'Tools: hubspot, gmail, slack',
      'Workflows to improve: ticket routing; campaign content',
      'Goals: lead generation; automate support; better reporting'
    ];

    for (const m of messages) {
      const r = await agent.post('/api/conversation/message').send({ message: m });
      if (r.status !== 200) throw new Error('conversation step failed');
    }

    // Verify profile stored
    const p = await agent.get('/api/profile');
    const profileOk = p.status === 200 && p.body?.profile?.industry && p.body?.profile?.size && p.body?.profile?.goals?.length > 0;
    record(results, 'profile', profileOk, JSON.stringify(p.body?.profile || {}));

    // Recommendations
    const rec = await agent.get('/api/recommendations');
    const hasRecs = rec.status === 200 && Array.isArray(rec.body.recommendations) && rec.body.recommendations.length > 0;
    record(results, 'recommendations', hasRecs, `count=${rec.body?.recommendations?.length}`);

    // Dashboard
    const dash = await agent.get('/api/recommendations/dashboard');
    const dashOk = dash.status === 200 && dash.body?.totals && typeof dash.body.totals.totalROI === 'number' && Array.isArray(dash.body?.recommendations) && dash.body.recommendations[0]?.integration_steps?.length >= 1;
    record(results, 'dashboard', dashOk, JSON.stringify(dash.body?.totals || {}));

    // Marketplace browse
    const tools = await agent.get('/api/tools').query({ q: 'AI' });
    const toolsOk = tools.status === 200 && Array.isArray(tools.body?.tools) && tools.body.tools.length > 0;
    record(results, 'marketplace_list', toolsOk, `count=${tools.body?.tools?.length}`);

    // Tool detail and lead
    const toolId = tools.body.tools[0]?.id;
    const td = await agent.get(`/api/tools/${toolId}`);
    record(results, 'tool_detail', td.status === 200 && td.body?.tool?.id === toolId, td.body?.tool?.name || '');

    const leadMessage = 'Contact me at user@example.com or +1 555-123-4567 about pricing.';
    const leadRes = await agent.post('/api/leads').send({ tool_id: toolId, message: leadMessage });
    const leadOk = leadRes.status === 200 && !!leadRes.body?.lead_id;
    record(results, 'lead_submit', leadOk, JSON.stringify(leadRes.body));

    const latestLead = db.prepare('SELECT * FROM leads ORDER BY created_at DESC LIMIT 1').get();
    const maskedOk = latestLead && /\*\*\*/.test(latestLead.message) && !/user@example\.com/.test(latestLead.message);
    record(results, 'pii_masking', !!maskedOk, latestLead?.message || '');

    // Cookie signed check (presence of signed cookie pattern)
    const setCookies = h.headers['set-cookie'] || p.headers['set-cookie'] || [];
    const signedCookieSeen = setCookies.some((c) => /org_id=s%3A/.test(c));
    record(results, 'signed_cookie', signedCookieSeen, String(setCookies[0] || ''));

    // Final summary
    const summary = {
      passed: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      details: results
    };
    console.log(JSON.stringify(summary, null, 2));
    process.exit(0);
  } catch (err) {
    record(results, 'error', false, String(err?.stack || err));
    console.log(JSON.stringify({ passed: 0, failed: results.length, details: results }, null, 2));
    process.exit(1);
  }
}

run();
