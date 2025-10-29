import { useEffect, useState } from 'react';
import AvatarChat from '../components/AvatarChat';
import { getProfile } from '../lib/api';

export default function Home() {
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    getProfile().then((p) => setProfile(p?.profile || null)).catch(() => {});
  }, []);

  return (
    <div className="grid">
      <section>
        <h1>YiriAI – Your AI Marketplace & Virtual Consultant</h1>
        <p>Tell us about your business, and we will recommend budget-friendly AI tools with clear ROI.</p>
        <AvatarChat onProfileUpdated={() => getProfile().then((p) => setProfile(p?.profile || null))} />
      </section>
      <aside>
        <h3>Business Profile</h3>
        {profile ? (
          <div className="card">
            <p><b>Industry:</b> {profile.industry}</p>
            <p><b>Size:</b> {profile.size}</p>
            <p><b>Revenue:</b> {profile.revenue ? `$${profile.revenue.toLocaleString()}` : '—'}</p>
            <p><b>Goals:</b> {Array.isArray(profile.goals) ? profile.goals.join(', ') : '—'}</p>
            <a className="btn" href="/dashboard">View Recommendations</a>
          </div>
        ) : (
          <div className="muted">Start chatting to create your profile.</div>
        )}
      </aside>
    </div>
  );
}
