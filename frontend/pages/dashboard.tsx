import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getDashboard } from '../lib/api';
import RecommendationTable from '../components/RecommendationTable';
const ImpactChart = dynamic(() => import('../components/ImpactChart'), { ssr: false });

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard().then((res) => setData(res)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!data) return <div>Could not load dashboard.</div>;

  return (
    <div>
      <h1>Recommendations & Impact</h1>
      <div className="grid">
        <section>
          <h3>Projected ROI and Time Saved</h3>
          <ImpactChart totals={data.totals} />
          <div className="muted">Estimates based on your profile; adjust as you adopt tools.</div>
        </section>
        <aside>
          <div className="card">
            <h3>Profile</h3>
            {data.profile ? (
              <>
                <p><b>Industry:</b> {data.profile.industry}</p>
                <p><b>Size:</b> {data.profile.size}</p>
                <p><b>Revenue:</b> {data.profile.revenue ? `$${data.profile.revenue.toLocaleString()}` : '—'}</p>
              </>
            ) : (
              <p>Complete your profile to refine recommendations.</p>
            )}
            <a className="btn" href="/marketplace">Browse Marketplace</a>
          </div>
        </aside>
      </div>

      <RecommendationTable recommendations={data.recommendations} />
    </div>
  );
}
