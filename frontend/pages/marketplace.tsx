import { useEffect, useMemo, useState } from 'react';
import { listTools } from '../lib/api';
import ToolCard from '../components/ToolCard';

export default function Marketplace() {
  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [tier, setTier] = useState('');
  const [tools, setTools] = useState<any[]>([]);

  useEffect(() => {
    listTools({ q, category, cost_tier: tier }).then((res) => setTools(res.tools));
  }, [q, category, tier]);

  const categories = useMemo(() => ['marketing', 'sales', 'support', 'operations', 'knowledge', 'security'], []);

  return (
    <div>
      <h1>AI Marketplace</h1>
      <div className="filters">
        <input placeholder="Search tools" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={tier} onChange={(e) => setTier(e.target.value)}>
          <option value="">All tiers</option>
          <option value="low">Low</option>
          <option value="mid">Mid</option>
          <option value="high">High</option>
        </select>
      </div>
      <div className="grid3">
        {tools.map((t) => (
          <ToolCard key={t.id} tool={t} />
        ))}
      </div>
    </div>
  );
}
