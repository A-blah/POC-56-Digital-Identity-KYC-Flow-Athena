/**
 * Real Rails KYC — Data Adapter
 * Guardrail: If FastAPI is unreachable, falls back to /mock_data.json
 */
import { Applicant, DashboardStats, FilterState } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

function buildQuery(filters: Partial<FilterState>): string {
  const params: string[] = [];
  if (filters.status)     params.push(`status=${encodeURIComponent(filters.status)}`);
  if (filters.dataSource) params.push(`data_source=${encodeURIComponent(filters.dataSource)}`);
  if (filters.dateRange)  params.push(`date_range=${encodeURIComponent(filters.dateRange)}`);
  if (filters.search)     params.push(`search=${encodeURIComponent(filters.search)}`);
  return params.length ? `?${params.join('&')}` : '';
}

async function safeFetch<T>(url: string, fallbackUrl: string): Promise<T> {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json() as T;
  } catch {
    console.warn(`[RealRails] API unreachable — loading mock fallback from ${fallbackUrl}`);
    const res = await fetch(fallbackUrl, { cache: 'no-store' });
    return await res.json() as T;
  }
}

export async function fetchApplicants(filters: Partial<FilterState> = {}): Promise<Applicant[]> {
  const qs = buildQuery(filters);
  return safeFetch<Applicant[]>(
    `${API_BASE}/api/kyc/applicants${qs}`,
    '/mock_data.json'
  );
}

export async function fetchStats(filters: Partial<FilterState> = {}): Promise<DashboardStats> {
  const qs = buildQuery(filters);
  const fallback: DashboardStats = {
    total_processed: 50, passed: 28, failed: 14, pending_review: 8,
    ofac_alerts: 6, pass_rate_percentage: 56.0, avg_risk_score: 0.38,
  };
  try {
    const res = await fetch(`${API_BASE}/api/kyc/stats${qs}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json() as DashboardStats;
  } catch {
    console.warn('[RealRails] Stats endpoint unreachable — using fallback stats');
    return fallback;
  }
}

export async function createApplicant(full_name: string, country: string): Promise<Applicant> {
  const res = await fetch(`${API_BASE}/api/kyc/applicants`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name, country }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json() as Applicant;
}

export function getExportUrl(filters: Partial<FilterState> = {}): string {
  const qs = buildQuery(filters);
  return `${API_BASE}/api/kyc/applicants/export${qs}`;
}
