import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getTool, sendLead } from '../../lib/api';

export default function ToolDetail() {
  const router = useRouter();
  const { id } = router.query as { id?: string };
  const [data, setData] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getTool(id).then(setData);
  }, [id]);

  if (!id || !data) return <div>Loading...</div>;

  const { tool, vendor } = data;

  return (
    <div>
      <h1>{tool.name}</h1>
      <p className="muted">{tool.category} • ${tool.price_per_month}/mo • {tool.cost_tier} tier</p>
      <p>{tool.description}</p>
      <a className="btn" href={tool.website} target="_blank" rel="noreferrer">Visit Website</a>

      <h3>Ask a question or request a trial</h3>
      {sent ? (
        <div className="card">Thanks! Lead ID: {sent}. The vendor will reach out via YiriAI.</div>
      ) : (
        <div className="card">
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Your question or needs (we’ll mask personal info)" />
          <button onClick={async () => {
            const res = await sendLead({ tool_id: String(id), message });
            setSent(res.lead_id);
          }}>Send</button>
        </div>
      )}
      {vendor && <p className="muted">Vendor: {vendor.name}</p>}
    </div>
  );
}
