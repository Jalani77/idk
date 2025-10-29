import { db, initSchema, seedData } from './db.js';

initSchema();
seedData();

const samples = [
  {
    org_id: 'org_sample_services',
    industry: 'professional services',
    size: '3-10',
    revenue: 450000,
    team_structure: ['sales', 'marketing', 'ops'],
    tools: ['gmail', 'calendly', 'notion'],
    workflows: ['proposal creation', 'client onboarding', 'invoicing'],
    goals: ['lead generation', 'reduce admin time', 'better reporting']
  },
  {
    org_id: 'org_sample_ecom',
    industry: 'ecommerce',
    size: '11-50',
    revenue: 1800000,
    team_structure: ['marketing', 'support', 'ops'],
    tools: ['shopify', 'klaviyo', 'intercom'],
    workflows: ['abandoned cart outreach', 'ticket triage', 'inventory alerts'],
    goals: ['increase conversion', 'automate support', 'improve retention']
  },
  {
    org_id: 'org_sample_saas',
    industry: 'saas',
    size: '51-200',
    revenue: 12000000,
    team_structure: ['sales', 'success', 'engineering', 'support'],
    tools: ['hubspot', 'slack', 'airtable'],
    workflows: ['lead scoring', 'churn prevention', 'weekly reporting'],
    goals: ['accelerate pipeline', 'reduce churn', 'scale onboarding']
  },
  {
    org_id: 'org_sample_agency',
    industry: 'marketing agency',
    size: '1-2',
    revenue: 120000,
    team_structure: ['owner', 'contractors'],
    tools: ['notion', 'zapier', 'google workspace'],
    workflows: ['content production', 'client updates', 'time tracking'],
    goals: ['streamline production', 'win more clients']
  },
  {
    org_id: 'org_sample_nonprofit',
    industry: 'nonprofit',
    size: '3-10',
    revenue: 350000,
    team_structure: ['fundraising', 'programs', 'ops'],
    tools: ['mailchimp', 'airtable', 'notion'],
    workflows: ['donor outreach', 'grant reporting', 'event signups'],
    goals: ['increase donations', 'reduce overhead', 'improve comms']
  }
];

const upsertOrg = db.prepare('INSERT OR IGNORE INTO organizations (id) VALUES (?)');
const upsertProfile = db.prepare(`
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

const tx = db.transaction(() => {
  for (const s of samples) {
    upsertOrg.run(s.org_id);
    upsertProfile.run(
      s.org_id,
      s.industry,
      s.size,
      s.revenue,
      JSON.stringify(s.team_structure),
      JSON.stringify(s.tools),
      JSON.stringify(s.workflows),
      JSON.stringify(s.goals)
    );
  }
});

try {
  tx();
  console.log('Seeded sample profiles:', samples.map((s) => s.org_id).join(', '));
  process.exit(0);
} catch (e) {
  console.error('Failed seeding profiles', e);
  process.exit(1);
}
