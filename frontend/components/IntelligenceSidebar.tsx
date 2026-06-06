'use client';

import React from 'react';
import {
  Info, Landmark, Download, Search, Filter,
  ShieldCheck, Globe, Database
} from 'lucide-react';
import { FilterState, DashboardStats, Applicant } from '@/lib/types';
import { getExportUrl } from '@/lib/api';

// ── Section heading ────────────────────────────────────────────────────────────
function SectionHead({ label, icon: Icon }: { label: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <Icon className="h-3.5 w-3.5 text-[#38BDF8]" />
      <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#38BDF8] font-bold">{label}</span>
    </div>
  );
}

// ── KPI Pill ──────────────────────────────────────────────────────────────────
function KpiPill({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#1F2937] last:border-0">
      <span className="text-[10px] font-mono text-slate-500">{label}</span>
      <span className="text-[11px] font-bold font-mono" style={{ color }}>{value}</span>
    </div>
  );
}

interface Props {
  stats: DashboardStats | null;
  filters: FilterState;
  onFilterChange: (key: keyof FilterState, value: string) => void;
  selectedApplicant: Applicant | null;
}

export default function IntelligenceSidebar({ stats, filters, onFilterChange, selectedApplicant }: Props) {
  const exportUrl = getExportUrl(filters);

  return (
    <aside
      className="w-[30%] shrink-0 border-l border-[#1F2937] bg-[#0B1117] flex flex-col overflow-y-auto"
      style={{ minHeight: '100%' }}
    >
      {/* ── HEADER ── */}
      <div className="px-5 pt-5 pb-4 border-b border-[#1F2937]">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-1.5 w-1.5 rounded-full bg-[#38BDF8] animate-pulse" />
          <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#38BDF8]">Intelligence Sidebar</span>
        </div>
        <h2 className="text-sm font-black text-slate-100 leading-tight">Digital Identity<br />& KYC Flow</h2>
        <p className="text-[9px] font-mono text-slate-500 mt-1">POC 56 · Governance & Trust Rail</p>
      </div>

      <div className="flex-1 px-5 py-4 space-y-5">

        {/* ── SECTION A: High-Level Metric ─────────────────────────────────── */}
        <section>
          <SectionHead label="A · Key Metric" icon={ShieldCheck} />
          <div className="bg-[#030712] border border-[#1F2937] rounded-xl p-3.5 space-y-0.5">
            {stats ? (
              <>
                <div className="text-3xl font-black font-mono text-[#38BDF8] tracking-tight">
                  {stats.pass_rate_percentage}%
                </div>
                <p className="text-[9px] font-mono text-slate-500">KYC Pass Rate · Live Pipeline</p>
                <div className="mt-3 space-y-0">
                  <KpiPill label="Total Processed"  value={stats.total_processed}  color="#38BDF8" />
                  <KpiPill label="Approved"          value={stats.passed}           color="#34D399" />
                  <KpiPill label="Rejected"          value={stats.failed}           color="#F43F5E" />
                  <KpiPill label="Pending Review"    value={stats.pending_review}   color="#F59E0B" />
                  <KpiPill label="OFAC Alerts"       value={stats.ofac_alerts}      color="#F43F5E" />
                  <KpiPill label="Avg Risk Score"    value={`${(stats.avg_risk_score * 100).toFixed(0)}%`} color="#818CF8" />
                </div>
              </>
            ) : (
              <div className="h-20 animate-pulse rounded-lg bg-slate-800/40" />
            )}
          </div>

          {/* Selected applicant quick stat */}
          {selectedApplicant && (
            <div className={`mt-2 p-2.5 rounded-xl border text-[9px] font-mono ${
              selectedApplicant.overall_status === 'Approved'
                ? 'bg-[#38BDF8]/5 border-[#38BDF8]/20 text-[#38BDF8]'
                : selectedApplicant.overall_status === 'Rejected'
                ? 'bg-rose-500/5 border-rose-500/20 text-rose-400'
                : 'bg-amber-500/5 border-amber-500/20 text-amber-400'
            }`}>
              Active: {selectedApplicant.full_name} · Risk {(selectedApplicant.risk_score * 100).toFixed(0)}%
            </div>
          )}
        </section>

        {/* ── SECTION B: Why This Matters ──────────────────────────────────── */}
        <section>
          <SectionHead label="B · Why This Matters" icon={Info} />
          <div className="bg-[#030712] border border-[#1F2937] rounded-xl p-3.5 space-y-2">
            <p className="text-[10px] font-mono text-slate-300 leading-relaxed">
              Identity verification is the <span className="text-[#38BDF8] font-bold">gateway to every access rail</span> in the financial system. Without a robust KYC trust layer, payment networks, lending platforms, and custody services cannot onboard users safely.
            </p>
            <p className="text-[10px] font-mono text-slate-400 leading-relaxed">
              This rail connects <span className="text-[#818CF8]">OpenBanking UK's consent infrastructure</span> to <span className="text-rose-400">OFAC's Specially Designated Nationals list</span> — the two pillars of UK/US regulatory compliance — creating a single, auditable verification pathway that determines who can participate in the financial economy.
            </p>
            <div className="mt-2 p-2 rounded-lg bg-[#38BDF8]/5 border border-[#38BDF8]/10">
              <p className="text-[9px] font-mono text-[#38BDF8]">
                ↳ Trust rails directly gate access rails. No identity, no access.
              </p>
            </div>
          </div>
        </section>

        {/* ── SECTION C: Who Controls the Rail ─────────────────────────────── */}
        <section>
          <SectionHead label="C · Who Controls the Rail" icon={Landmark} />
          <div className="bg-[#030712] border border-[#1F2937] rounded-xl p-3.5 space-y-2.5">
            <p className="text-[10px] font-mono text-slate-300 leading-relaxed">
              <span className="text-[#818CF8] font-bold">The FCA (UK)</span> mandates the identity standard; <span className="text-[#818CF8] font-bold">FinCEN (US)</span> enforces the sanctions screening threshold; <span className="text-[#818CF8] font-bold">FATF</span> sets the global risk-jurisdiction framework — creating a tri-regulator power structure where no single institution controls the full rail.
            </p>
            <div className="space-y-1.5">
              {[
                { label: 'FCA · Financial Conduct Authority', desc: 'UK identity standard & OpenBanking mandate', color: '#38BDF8' },
                { label: 'FinCEN · US Treasury',              desc: 'OFAC SDN list & AML enforcement',            color: '#818CF8' },
                { label: 'FATF · Financial Action Task Force', desc: 'Global high-risk jurisdiction blacklist',     color: '#F59E0B' },
              ].map(r => (
                <div key={r.label} className="flex items-start gap-2 py-1.5 border-b border-[#1F2937] last:border-0">
                  <div className="h-1.5 w-1.5 rounded-full mt-1.5 shrink-0" style={{ background: r.color }} />
                  <div>
                    <p className="text-[9px] font-bold font-mono" style={{ color: r.color }}>{r.label}</p>
                    <p className="text-[9px] font-mono text-slate-500">{r.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION D: Filters ───────────────────────────────────────────── */}
        <section>
          <SectionHead label="D · Filters & Controls" icon={Filter} />
          <div className="space-y-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500" />
              <input
                type="text"
                placeholder="Search name, ID, country..."
                value={filters.search}
                onChange={e => onFilterChange('search', e.target.value)}
                className="w-full bg-[#030712] border border-[#1F2937] text-slate-200 text-[10px] rounded-xl pl-7 pr-3 py-2 focus:outline-none focus:border-[#38BDF8]/50 focus:ring-1 focus:ring-[#38BDF8]/20 font-mono placeholder:text-slate-700 transition-all"
              />
            </div>

            {/* Status filter */}
            <select
              value={filters.status}
              onChange={e => onFilterChange('status', e.target.value)}
              className="w-full bg-[#030712] border border-[#1F2937] text-slate-300 text-[10px] rounded-xl px-3 py-2 focus:outline-none focus:border-[#38BDF8]/50 font-mono cursor-pointer transition-all appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="Approved">✅ Approved</option>
              <option value="Rejected">🔴 Rejected</option>
              <option value="Pending Review">🟡 Pending Review</option>
            </select>

            {/* Data Source filter */}
            <select
              value={filters.dataSource}
              onChange={e => onFilterChange('dataSource', e.target.value)}
              className="w-full bg-[#030712] border border-[#1F2937] text-slate-300 text-[10px] rounded-xl px-3 py-2 focus:outline-none focus:border-[#38BDF8]/50 font-mono cursor-pointer transition-all appearance-none"
            >
              <option value="">All Data Sources</option>
              <option value="OpenBanking UK">OpenBanking UK</option>
              <option value="Synthetic DB">Synthetic DB</option>
            </select>

            {/* Date Range filter */}
            <select
              value={filters.dateRange}
              onChange={e => onFilterChange('dateRange', e.target.value)}
              className="w-full bg-[#030712] border border-[#1F2937] text-slate-300 text-[10px] rounded-xl px-3 py-2 focus:outline-none focus:border-[#38BDF8]/50 font-mono cursor-pointer transition-all appearance-none"
            >
              <option value="">All Time</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>

            {/* Data source legend */}
            <div className="flex gap-3 pt-1">
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#38BDF8]" />
                <span className="text-[9px] font-mono text-slate-500">OpenBanking UK</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-[#F59E0B]" />
                <span className="text-[9px] font-mono text-slate-500">Synthetic DB</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION E: Download Sample Data ─────────────────────────────── */}
        <section>
          <SectionHead label="E · Sample Data" icon={Database} />
          <a
            href={exportUrl}
            download="kyc_applicants_export.csv"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#38BDF8]/10 hover:bg-[#38BDF8]/20 border border-[#38BDF8]/30 hover:border-[#38BDF8]/60 text-[#38BDF8] font-bold text-[10px] font-mono rounded-xl transition-all duration-200 hover:shadow-[0_0_12px_rgba(56,189,248,0.2)] group"
          >
            <Download className="h-3.5 w-3.5 group-hover:animate-bounce" />
            Download Sample Data (CSV)
          </a>
          <p className="text-[8px] font-mono text-slate-600 text-center mt-1.5">
            Exports current filtered dataset · {stats?.total_processed ?? '—'} records
          </p>
        </section>

        {/* ── TOOLTIP GLOSSARY ─────────────────────────────────────────────── */}
        <section className="pb-4">
          <div className="bg-[#030712] border border-[#1F2937] rounded-xl p-3.5 space-y-2">
            <p className="text-[9px] font-mono uppercase tracking-widest text-slate-600 mb-2">Glossary</p>
            {[
              { term: 'OFAC SDN', def: 'Specially Designated Nationals — US Treasury sanctions list.' },
              { term: 'MRZ OCR',  def: 'Machine Readable Zone optical character recognition for passport verification.' },
              { term: 'OB Consent', def: 'OpenBanking UK consent token — cryptographic proof of bank account ownership.' },
              { term: 'Fail-Closed', def: 'System defaults to rejection on ambiguous signals — no false negatives permitted.' },
              { term: 'PEP',      def: 'Politically Exposed Person — higher-risk category requiring enhanced due diligence.' },
            ].map(({ term, def }) => (
              <div key={term} className="border-b border-[#1F2937] pb-1.5 last:border-0 last:pb-0">
                <span className="text-[9px] font-bold font-mono text-[#818CF8]">{term}</span>
                <p className="text-[8px] font-mono text-slate-600 mt-0.5 leading-relaxed">{def}</p>
              </div>
            ))}
          </div>
        </section>

      </div>
    </aside>
  );
}
