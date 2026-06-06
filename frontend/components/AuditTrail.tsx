'use client';

import React from 'react';
import { Applicant, AuditStep } from '@/lib/types';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

function StepIcon({ status }: { status: AuditStep['status'] }) {
  switch (status) {
    case 'SUCCESS':  return <CheckCircle  className="h-3.5 w-3.5 text-[#38BDF8] shrink-0" />;
    case 'FAILED':   return <XCircle      className="h-3.5 w-3.5 text-rose-400 shrink-0" />;
    case 'CRITICAL': return <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0 animate-pulse" />;
    case 'PENDING':  return <Clock        className="h-3.5 w-3.5 text-amber-400 shrink-0" />;
    default:         return <Clock        className="h-3.5 w-3.5 text-slate-500 shrink-0" />;
  }
}

function statusBadge(status: AuditStep['status']) {
  const map: Record<string, string> = {
    SUCCESS:  'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20',
    FAILED:   'bg-rose-500/10 text-rose-400 border-rose-500/20',
    CRITICAL: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    PENDING:  'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };
  return map[status] || 'bg-slate-800 text-slate-400 border-slate-700';
}

export default function AuditTrail({ applicant }: { applicant: Applicant | null }) {
  if (!applicant) {
    return (
      <div className="h-32 flex items-center justify-center border border-dashed border-[#1F2937] rounded-xl">
        <p className="text-xs text-slate-600 font-mono">Select an applicant to view audit trail</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[9px] font-mono uppercase tracking-widest text-slate-500">
          Immutable Audit Log · {applicant.applicant_id}
        </p>
        <span className="text-[8px] font-mono text-slate-600 bg-slate-900/60 px-1.5 py-0.5 rounded border border-[#1F2937]">
          {applicant.audit_trail.length} events
        </span>
      </div>

      <div className="space-y-1.5">
        {applicant.audit_trail.map((step, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 p-2.5 rounded-lg border border-[#1F2937] bg-[#0B1117]/60 hover:border-[#38BDF8]/20 transition-colors"
          >
            <StepIcon status={step.status} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="text-[10px] font-bold text-slate-200 font-mono truncate">{step.step}</span>
                <span className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded border shrink-0 ${statusBadge(step.status)}`}>
                  {step.status}
                </span>
              </div>
              <p className="text-[9px] text-slate-500 font-mono leading-relaxed">{step.msg}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
