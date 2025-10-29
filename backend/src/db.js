import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { config } from './config.js';

const dataDir = path.dirname(config.dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const db = new Database(config.dbPath);

db.pragma('journal_mode = WAL');

export function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS organizations (
      id TEXT PRIMARY KEY,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS profiles (
      org_id TEXT PRIMARY KEY,
      industry TEXT,
      size TEXT,
      revenue REAL,
      team_structure TEXT,
      tools TEXT,
      workflows TEXT,
      goals TEXT,
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(org_id) REFERENCES organizations(id)
    );

    CREATE TABLE IF NOT EXISTS vendors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      contact_email TEXT
    );

    CREATE TABLE IF NOT EXISTS tools (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      vendor_id TEXT,
      category TEXT,
      description TEXT,
      price_per_month REAL,
      cost_tier TEXT,
      target_industries TEXT,
      features TEXT,
      website TEXT,
      FOREIGN KEY(vendor_id) REFERENCES vendors(id)
    );

    CREATE TABLE IF NOT EXISTS recommendations (
      id TEXT PRIMARY KEY,
      org_id TEXT,
      tool_id TEXT,
      score REAL,
      forecast_roi REAL,
      time_saved_hours REAL,
      efficiency_improvement REAL,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(org_id) REFERENCES organizations(id),
      FOREIGN KEY(tool_id) REFERENCES tools(id)
    );

    CREATE TABLE IF NOT EXISTS leads (
      id TEXT PRIMARY KEY,
      org_id TEXT,
      vendor_id TEXT,
      tool_id TEXT,
      message TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(org_id) REFERENCES organizations(id),
      FOREIGN KEY(vendor_id) REFERENCES vendors(id),
      FOREIGN KEY(tool_id) REFERENCES tools(id)
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      org_id TEXT,
      messages TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY(org_id) REFERENCES organizations(id)
    );
  `);
}

export function seedData() {
  // Seed vendors
  const vendors = [
    { id: 'v_hubspot', name: 'HubSpot', contact_email: 'partners@hubspot.com' },
    { id: 'v_zapier', name: 'Zapier', contact_email: 'partners@zapier.com' },
    { id: 'v_jasper', name: 'Jasper AI', contact_email: 'partners@jasper.ai' },
    { id: 'v_intercom', name: 'Intercom', contact_email: 'partners@intercom.com' },
    { id: 'v_airtable', name: 'Airtable', contact_email: 'partners@airtable.com' },
    { id: 'v_notion', name: 'Notion', contact_email: 'partners@makenotion.com' },
    { id: 'v_twillio', name: 'Twilio', contact_email: 'partners@twilio.com' },
    { id: 'v_clerk', name: 'Clerk', contact_email: 'partners@clerk.dev' }
  ];

  const insertVendor = db.prepare('INSERT OR IGNORE INTO vendors (id, name, contact_email) VALUES (@id, @name, @contact_email)');
  const insertTool = db.prepare(`
    INSERT OR IGNORE INTO tools (
      id, name, vendor_id, category, description, price_per_month, cost_tier, target_industries, features, website
    ) VALUES (@id, @name, @vendor_id, @category, @description, @price_per_month, @cost_tier, @target_industries, @features, @website)
  `);

  const tools = [
    {
      id: 't_hubspot_ai',
      name: 'HubSpot AI Suite',
      vendor_id: 'v_hubspot',
      category: 'marketing',
      description: 'AI-assisted marketing, CRM insights, and content optimization for SMBs.',
      price_per_month: 99,
      cost_tier: 'mid',
      target_industries: JSON.stringify(['services', 'ecommerce', 'saas']),
      features: JSON.stringify(['email automation', 'lead scoring', 'blog SEO']),
      website: 'https://www.hubspot.com'
    },
    {
      id: 't_jasper',
      name: 'Jasper AI',
      vendor_id: 'v_jasper',
      category: 'marketing',
      description: 'AI copywriting and content generation for ads, blogs, and socials.',
      price_per_month: 49,
      cost_tier: 'low',
      target_industries: JSON.stringify(['ecommerce', 'media', 'services']),
      features: JSON.stringify(['copy generation', 'brand voice', 'campaign templates']),
      website: 'https://www.jasper.ai'
    },
    {
      id: 't_intercom',
      name: 'Intercom Fin AI',
      vendor_id: 'v_intercom',
      category: 'support',
      description: 'AI customer support with assisted agents and automated answers.',
      price_per_month: 65,
      cost_tier: 'mid',
      target_industries: JSON.stringify(['saas', 'ecommerce', 'services']),
      features: JSON.stringify(['chatbot', 'help center', 'agent assist']),
      website: 'https://www.intercom.com'
    },
    {
      id: 't_zapier_ai',
      name: 'Zapier AI',
      vendor_id: 'v_zapier',
      category: 'operations',
      description: 'Automate workflows with AI prompts connecting 5,000+ apps.',
      price_per_month: 29,
      cost_tier: 'low',
      target_industries: JSON.stringify(['all']),
      features: JSON.stringify(['automation', 'ai copilot', 'integrations']),
      website: 'https://www.zapier.com'
    },
    {
      id: 't_notion_qna',
      name: 'Notion Q&A',
      vendor_id: 'v_notion',
      category: 'knowledge',
      description: 'Ask questions across your docs, SOPs, and wikis with AI.',
      price_per_month: 10,
      cost_tier: 'low',
      target_industries: JSON.stringify(['services', 'saas']),
      features: JSON.stringify(['search', 'q&a', 'summaries']),
      website: 'https://www.notion.so'
    },
    {
      id: 't_airtable_ai',
      name: 'Airtable AI',
      vendor_id: 'v_airtable',
      category: 'operations',
      description: 'AI blocks for classification, summarization, and automations in Airtable.',
      price_per_month: 20,
      cost_tier: 'low',
      target_industries: JSON.stringify(['media', 'services', 'saas']),
      features: JSON.stringify(['classification', 'summaries', 'automation']),
      website: 'https://www.airtable.com'
    },
    {
      id: 't_twilio_ai',
      name: 'Twilio AI Assist',
      vendor_id: 'v_twillio',
      category: 'sales',
      description: 'AI-assisted calling and SMS workflows for sales and support.',
      price_per_month: 25,
      cost_tier: 'low',
      target_industries: JSON.stringify(['services', 'saas']),
      features: JSON.stringify(['sms', 'call transcription', 'agent assist']),
      website: 'https://www.twilio.com'
    },
    {
      id: 't_clerk_id',
      name: 'Clerk + AI Guard',
      vendor_id: 'v_clerk',
      category: 'security',
      description: 'Authentication for SMBs with AI-fraud checks and bot detection.',
      price_per_month: 19,
      cost_tier: 'low',
      target_industries: JSON.stringify(['all']),
      features: JSON.stringify(['auth', 'bot detection', 'fraud signals']),
      website: 'https://www.clerk.com'
    }
  ];

  const insertOrg = db.prepare('INSERT OR IGNORE INTO organizations (id) VALUES (?)');

  const tx = db.transaction(() => {
    for (const v of vendors) insertVendor.run(v);
    for (const t of tools) insertTool.run(t);
    // Ensure a demo org exists for immediate demo on first run
    insertOrg.run('org_demo');
  });
  tx();
}
