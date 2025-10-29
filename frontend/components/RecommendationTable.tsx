import Link from 'next/link';

export default function RecommendationTable({ recommendations }: { recommendations: any[] }) {
  return (
    <div className="card">
      <h3>Recommended Tools</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Tool</th>
            <th>Category</th>
            <th>Score</th>
            <th>ROI/mo</th>
            <th>Time Saved</th>
            <th>Steps</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {recommendations.map((r) => (
            <tr key={r.id}>
              <td>{r.tool.name}</td>
              <td>{r.tool.category}</td>
              <td>{(r.score * 100).toFixed(0)}%</td>
              <td>${r.forecast_roi.toLocaleString()}</td>
              <td>{r.time_saved_hours} hrs</td>
              <td>
                <details>
                  <summary>View</summary>
                  <ol>
                    {r.integration_steps?.map((s: any, i: number) => (
                      <li key={i}><b>{s.title}:</b> {s.detail}</li>
                    ))}
                  </ol>
                </details>
              </td>
              <td>
                <Link className="btn" href={`/tool/${r.tool_id}`}>Connect</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
