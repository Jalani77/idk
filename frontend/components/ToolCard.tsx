import Link from 'next/link';

export default function ToolCard({ tool }: { tool: any }) {
  return (
    <div className="card">
      <h3>{tool.name}</h3>
      <p className="muted">{tool.category} • ${tool.price_per_month}/mo • {tool.cost_tier} tier</p>
      <p>{tool.description}</p>
      <div className="row">
        <Link className="btn" href={`/tool/${tool.id}`}>View</Link>
        <a className="btn-outline" href={tool.website} target="_blank" rel="noreferrer">Website</a>
      </div>
    </div>
  );
}
