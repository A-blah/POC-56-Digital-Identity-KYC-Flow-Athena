export interface SanctionsResult {
  ofac_sanctions_match: boolean;
  threshold_configured: number;
  match_confidence: number;
  watchlist_entity_id: string | null;
}

export interface AuditStep {
  step: string;
  status: 'SUCCESS' | 'FAILED' | 'CRITICAL' | 'PENDING';
  msg: string;
}

export interface Applicant {
  applicant_id: string;
  timestamp: string;
  full_name: string;
  country: string;
  document_type: string;
  data_source: string;
  openbanking_uk_consent: string;
  document_status: 'Verified' | 'Failed' | 'Pending';
  biometric_status: 'Verified' | 'Failed' | 'Pending';
  sanctions_match: 'No Match' | 'Potential Match' | 'Critical Match';
  overall_status: 'Approved' | 'Rejected' | 'Pending Review';
  reason_if_failed: string;
  risk_score: number;
  audit_trail: AuditStep[];
  sanctions_result: SanctionsResult;
}

export interface DashboardStats {
  total_processed: number;
  passed: number;
  failed: number;
  pending_review: number;
  ofac_alerts: number;
  pass_rate_percentage: number;
  avg_risk_score: number;
}

export interface FilterState {
  status: string;
  dataSource: string;
  dateRange: string;
  search: string;
}
