const headers: HeadersInit = { 'Content-Type': 'application/json' };

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`, { credentials: 'include', headers });
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

async function post<T>(path: string, body?: any): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) throw new Error('Request failed');
  return res.json();
}

export async function getProfile(): Promise<{ org_id: string; profile: any | null }> {
  return get('/profile');
}

export async function sendMessage(message: string): Promise<{ reply: string; done: boolean }> {
  return post('/conversation/message', { message });
}

export async function listTools(params: { q?: string; category?: string; cost_tier?: string }): Promise<{ tools: any[] }> {
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.category) query.set('category', params.category);
  if (params.cost_tier) query.set('cost_tier', params.cost_tier);
  return get(`/tools?${query.toString()}`);
}

export async function getTool(id: string): Promise<{ tool: any; vendor: any | null }> {
  return get(`/tools/${id}`);
}

export async function getRecommendations(): Promise<{ recommendations: any[] }> {
  return get('/recommendations');
}

export async function refreshRecommendations(): Promise<{ recommendations: any[] }> {
  return post('/recommendations/refresh');
}

export async function getDashboard(): Promise<any> {
  return get('/recommendations/dashboard');
}

export async function sendLead(body: { tool_id: string; message: string }): Promise<{ ok: boolean; lead_id: string; vendor_contact: string | null }> {
  return post('/leads', body);
}
