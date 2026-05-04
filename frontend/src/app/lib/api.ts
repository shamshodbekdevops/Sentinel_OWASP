export const API_BASE = '/api';

export type AuthUser = {
  id: number;
  name: string;
  email: string;
};

export type ScanSummary = {
  id: number;
  url: string;
  score: number;
  status: string;
  risk_data: Record<string, number>;
  findings: Array<Record<string, unknown>>;
  created_at: string;
};

export type DashboardData = {
  total_scans: number;
  average_score: number;
  total_findings: number;
  completed_scans: number;
  failed_scans: number;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const detail = payload?.detail || 'Request failed.';
    throw new Error(detail);
  }

  return payload as T;
}

export const api = {
  async me() {
    return request<{ user: AuthUser | null }>('/auth/me/');
  },
  async login(email: string, password: string) {
    return request<AuthUser>('/auth/login/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ email, password }).toString(),
    });
  },
  async register(name: string, email: string, password: string) {
    return request<AuthUser>('/auth/register/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ name, email, password }).toString(),
    });
  },
  async logout() {
    return request<{ detail: string }>('/auth/logout/', { method: 'POST' });
  },
  async startScan(url: string) {
    return request<{ id: number; status: string }>('/scan/start/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ url }).toString(),
    });
  },
  async scanStatus(scanId: number) {
    return request<{ id: number; url: string; score: number; risk_data: Record<string, number>; findings: Array<Record<string, unknown>>; status: string }>(`/scan/status/${scanId}/`);
  },
  async dashboardData() {
    return request<DashboardData>('/dashboard/data/');
  },
  async scanHistory() {
    return request<{ results: ScanSummary[] }>('/scans/');
  },
};
