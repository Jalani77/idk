import express from 'express';
import { z } from 'zod';
import { db } from '../db.js';
import { nanoid } from 'nanoid';
import { validate } from '../middleware/validate.js';
import { maskPII } from '../utils/privacy.js';

const router = express.Router();

const messageSchema = z.object({
  body: z.object({ message: z.string().min(1) })
});

const QUESTIONS = [
  { key: 'industry', text: 'What industry are you in?' },
  { key: 'size', text: 'What is your team size? (solo, 3-10, 11-50, 51-200)' },
  { key: 'revenue', text: 'Approx monthly revenue in USD? (number)' },
  { key: 'team_structure', text: 'How is your team structured? (sales, marketing, support, ops)' },
  { key: 'tools', text: 'What tools do you currently use? (CRM, email, etc.)' },
  { key: 'workflows', text: 'Briefly describe workflows you want to improve.' },
  { key: 'goals', text: 'Top 3 goals in the next 6 months?' }
];

router.post('/message', validate(messageSchema), (req, res) => {
  const orgId = req.orgId;
  const userMessage = maskPII(req.validated.body.message.trim());

  const convo = db.prepare('SELECT * FROM conversations WHERE org_id = ?').get(orgId);
  let messages = [];
  if (convo) messages = JSON.parse(convo.messages);
  messages.push({ role: 'user', content: userMessage, ts: Date.now() });

  // Determine next question based on profile completeness
  const profile = db.prepare('SELECT * FROM profiles WHERE org_id = ?').get(orgId) || {};
  const toAsk = QUESTIONS.find((q) => !profile[q.key]);

  let reply;
  if (toAsk) {
    // Attempt to parse value from the user's message for the current missing key
    const parsed = tryParseAnswer(toAsk.key, userMessage);
    if (parsed != null) {
      upsertProfileField(orgId, toAsk.key, parsed);
      const nextQ = QUESTIONS.find((q) => !db.prepare('SELECT * FROM profiles WHERE org_id = ?').get(orgId)?.[q.key]);
      reply = nextQ ? nextQ.text : 'Thanks! I have what I need to craft recommendations. Type "show recommendations" to continue.';
    } else {
      reply = toAsk.text;
    }
  } else {
    if (/recommend/i.test(userMessage) || /show/i.test(userMessage)) {
      reply = 'Generating tailored AI tool recommendations for your business... Open your Dashboard to view them.';
    } else {
      reply = 'Ask me about AI tools for marketing, sales, support, operations, or type "show recommendations".';
    }
  }

  messages.push({ role: 'assistant', content: reply, ts: Date.now() });

  if (convo) {
    db.prepare('UPDATE conversations SET messages = ?, updated_at = datetime(\'now\') WHERE id = ?')
      .run(JSON.stringify(messages), convo.id);
  } else {
    db.prepare('INSERT INTO conversations (id, org_id, messages) VALUES (?, ?, ?)')
      .run(`c_${nanoid(8)}`, orgId, JSON.stringify(messages));
  }

  res.json({ reply, done: !QUESTIONS.find((q) => !db.prepare('SELECT * FROM profiles WHERE org_id = ?').get(orgId)?.[q.key]) });
});

function upsertProfileField(orgId, key, value) {
  const org = db.prepare('INSERT OR IGNORE INTO organizations (id) VALUES (?)');
  org.run(orgId);
  const existing = db.prepare('SELECT * FROM profiles WHERE org_id = ?').get(orgId);
  const jsonKeys = new Set(['team_structure', 'tools', 'workflows', 'goals']);
  if (existing) {
    const payload = { ...existing };
    payload[key] = jsonKeys.has(key) ? JSON.stringify(value) : value;
    db.prepare(`UPDATE profiles SET ${key} = ?, updated_at = datetime('now') WHERE org_id = ?`).run(payload[key], orgId);
  } else {
    const obj = { industry: null, size: null, revenue: null, team_structure: null, tools: null, workflows: null, goals: null };
    obj[key] = jsonKeys.has(key) ? JSON.stringify(value) : value;
    db.prepare(`INSERT INTO profiles (org_id, industry, size, revenue, team_structure, tools, workflows, goals) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .run(orgId, obj.industry, obj.size, obj.revenue, obj.team_structure, obj.tools, obj.workflows, obj.goals);
  }
}

function tryParseAnswer(key, text) {
  const lower = text.toLowerCase();
  switch (key) {
    case 'industry':
      return text.length > 1 ? text : null;
    case 'size': {
      if (/solo|1-2|micro/.test(lower)) return '1-2';
      if (/3-10|small/.test(lower)) return '3-10';
      if (/11-50|medium/.test(lower)) return '11-50';
      if (/51-200|large/.test(lower)) return '51-200';
      const num = parseInt(text.replace(/[^0-9]/g, ''), 10);
      if (!Number.isNaN(num)) {
        if (num <= 2) return '1-2';
        if (num <= 10) return '3-10';
        if (num <= 50) return '11-50';
        return '51-200';
      }
      return null;
    }
    case 'revenue': {
      const num = parseFloat(text.replace(/[^0-9.]/g, ''));
      return Number.isFinite(num) ? Math.round(num) : null;
    }
    case 'team_structure': {
      const parts = lower.split(/[;,]/).map((p) => p.trim()).filter(Boolean);
      return parts.length ? parts : null;
    }
    case 'tools': {
      const parts = lower.split(/[;,]/).map((p) => p.trim()).filter(Boolean);
      return parts.length ? parts : null;
    }
    case 'workflows':
    case 'goals': {
      const sentences = text.split(/[.;]/).map((s) => s.trim()).filter(Boolean);
      return sentences.length ? sentences.slice(0, 5) : null;
    }
    default:
      return null;
  }
}

export default router;
