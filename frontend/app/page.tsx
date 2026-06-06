'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  AlertTriangle, Users, RefreshCw, PlusCircle,
  LayoutGrid, Activity, FileText,
  Database, CheckCheck, XCircle,
  Fingerprint,
} from 'lucide-react';
import { Applicant, DashboardStats, FilterState } from '@/lib/types';
import { fetchApplicants, fetchStats, createApplicant } from '@/lib/api';
import dynamic from 'next/dynamic';
import StatsRow from '@/components/StatsRow';
import AuditTrail from '@/components/AuditTrail';
import IntelligenceSidebar from '@/components/IntelligenceSidebar';

// Dynamic import for React Flow (SSR disabled — it's browser-only)
const KYCPipelineFlow = dynamic(() => import('@/components/KYCPipelineFlow'), { ssr: false });

// ── Status Badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Approved:         'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20',
    Rejected:         'bg-rose-500/10 text-rose-400 border-rose-500/20',
    'Pending Review': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    Verified:         'bg-[#38BDF8]/10 text-[#38BDF8] border-[#38BDF8]/20',
    Failed:           'bg-rose-500/10 text-rose-400 border-rose-500/20',
    Pending:          'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'Critical Match': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    'Potential Match':'bg-amber-500/10 text-amber-400 border-amber-500/20',
    'No Match':       'bg-slate-700/30 text-slate-400 border-slate-700/30',
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono border tracking-wide ${map[status] || 'bg-slate-800 text-slate-400 border-slate-700'}`}>
      {status}
    </span>
  );
}

// ── Nav Item ──────────────────────────────────────────────────────────────────
function NavItem({ icon: Icon, label, active, badge, onClick }: {
  icon: React.ElementType; label: string; active?: boolean; badge?: number; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-mono transition-all duration-200 cursor-pointer group ${
        active
          ? 'bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20 cyan-glow-sm'
          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon className={`h-3.5 w-3.5 ${active ? 'text-[#38BDF8]' : 'text-slate-500 group-hover:text-slate-300'}`} />
        {label}
      </div>
      {badge !== undefined && badge > 0 && (
        <span className="bg-rose-500/20 text-rose-400 text-[8px] px-1.5 py-0.5 rounded-full font-bold border border-rose-500/20">
          {badge}
        </span>
      )}
    </button>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [applicants, setApplicants]           = useState<Applicant[]>([]);
  const [stats, setStats]                     = useState<DashboardStats | null>(null);
  const [selectedApplicant, setSelected]      = useState<Applicant | null>(null);
  const [loading, setLoading]                 = useState(true);
  const [activeTab, setActiveTab]             = useState<'overview' | 'applicants' | 'workflow' | 'audit'>('overview');

  // Filters
  const [filters, setFilters] = useState<FilterState>({ status: '', dataSource: '', dateRange: '', search: '' });
  const onFilterChange = useCallback((key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  // Onboarding simulator
  const [simName, setSimName]         = useState('');
  const [simCountry, setSimCountry]   = useState('United Kingdom');
  const [simStep, setSimStep]         = useState<string | null>(null);
  const [simResult, setSimResult]     = useState<boolean | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [s, a] = await Promise.all([fetchStats(filters), fetchApplicants(filters)]);
      setStats(s);
      setApplicants(a);
      if (a.length > 0) {
        setSelected(prev => {
          if (!prev) return a[0];
          const still = a.some(x => x.applicant_id === prev.applicant_id);
          return still ? prev : a[0];
        });
      } else {
        setSelected(null);
      }
    } catch (err) {
      console.error('[Dashboard] Fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simName.trim()) return;
    setSimResult(null);

    const STEPS = [
      'Establishing OpenBanking UK API handshake...',
      'OCR extracting MRZ fields from document...',
      'Matching against OFAC SDN watchlist...',
      'Evaluating governance decision rules...',
      'Committing to immutable audit log...',
    ];
    for (const step of STEPS) {
      setSimStep(step);
      await new Promise(r => setTimeout(r, 480));
    }

    try {
      const result = await createApplicant(simName, simCountry);
      await fetchData();
      setSelected(result);
      setSimResult(result.overall_status === 'Approved');
    } catch {
      setSimResult(false);
    } finally {
      setSimStep(null);
      setSimName('');
      setTimeout(() => setSimResult(null), 5000);
    }
  };

  const ofacAlertCount = applicants.filter(a => a.sanctions_match === 'Critical Match').length;

  const navItems = [
    { name: 'Overview',    icon: LayoutGrid, tab: 'overview'    as const },
    { name: 'Applicants',  icon: Users,      tab: 'applicants'  as const },
    { name: 'Workflow',    icon: Activity,   tab: 'workflow'    as const },
    { name: 'Audit Trail', icon: FileText,   tab: 'audit'       as const },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#030712', fontFamily: 'var(--font-inter, Inter, system-ui)' }}>

      {/* ── TOP HEADER ──────────────────────────────────────────────────── */}
      <header
        className="h-14 border-b flex items-center justify-between px-5 sticky top-0 z-50"
        style={{ background: 'rgba(3,7,18,0.92)', borderColor: '#1F2937', backdropFilter: 'blur(16px)' }}
      >
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div
            className="h-8 w-8 rounded-lg flex items-center justify-center font-black text-sm"
            style={{ background: 'linear-gradient(135deg,#38BDF8,#818CF8)', color: '#030712' }}
          >
            R
          </div>
          <div>
            <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-slate-400 font-mono block leading-none">
              REAL RAILS INTELLIGENCE LIBRARY
            </span>
            <span className="text-[8px] text-slate-600 font-mono tracking-widest">
              GOVERNANCE &amp; TRUST RAIL · POC 56
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'rgba(56,189,248,0.07)', border: '1px solid rgba(56,189,248,0.2)' }}>
            <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ background: '#38BDF8' }} />
            <span className="text-[9px] font-mono font-bold" style={{ color: '#38BDF8' }}>LIVE INGEST</span>
          </div>

          {ofacAlertCount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full" style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.25)' }}>
              <AlertTriangle className="h-3 w-3 text-rose-400" />
              <span className="text-[9px] font-mono font-bold text-rose-400">{ofacAlertCount} OFAC ALERTS</span>
            </div>
          )}

          <div style={{ width: 1, height: 20, background: '#1F2937' }} />

          <button
            onClick={fetchData}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
            style={{ border: '1px solid transparent' }}
            onMouseOver={e => (e.currentTarget.style.borderColor = '#1F2937')}
            onMouseOut={e => (e.currentTarget.style.borderColor = 'transparent')}
            title="Refresh pipeline"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-[#38BDF8]' : ''}`} />
          </button>
        </div>
      </header>

      {/* ── MAIN LAYOUT (70% Main + 30% Sidebar) ─────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── LEFT NAV ───────────────────────────────────────────────────── */}
        <nav
          className="w-52 shrink-0 border-r flex flex-col py-4 px-3 sticky top-14 overflow-y-auto"
          style={{ background: 'rgba(11,17,23,0.6)', borderColor: '#1F2937', height: 'calc(100vh - 3.5rem)' }}
        >
          <p className="text-[8px] font-mono uppercase tracking-widest text-slate-600 px-2 mb-2">Navigation</p>
          <div className="space-y-1">
            {navItems.map(item => (
              <NavItem
                key={item.name}
                icon={item.icon}
                label={item.name}
                active={activeTab === item.tab}
                badge={item.name === 'Audit Trail' ? ofacAlertCount : undefined}
                onClick={() => setActiveTab(item.tab)}
              />
            ))}
          </div>

          <div className="mt-auto pt-4" style={{ borderTop: '1px solid #1F2937' }}>
            <p className="text-[8px] font-mono uppercase tracking-widest text-slate-600 px-2 mb-2">Data Sources</p>
            <div className="space-y-1.5 px-2">
              {[
                { label: 'OpenBanking UK',   color: '#38BDF8' },
                { label: 'OFAC SDN List',     color: '#F43F5E' },
                { label: 'Synthetic DB',      color: '#F59E0B' },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2 text-[9px] font-mono text-slate-400">
                  <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: s.color }} />
                  {s.label}
                </div>
              ))}
            </div>
            <div className="mt-3 px-2 py-2.5 rounded-xl mx-0" style={{ background: '#030712', border: '1px solid #1F2937' }}>
              <p className="text-[8px] font-mono uppercase tracking-widest text-slate-600 mb-1">Stack</p>
              <div className="text-[8px] font-mono text-slate-500 space-y-0.5">
                <div>Next.js 14 + TypeScript</div>
                <div>FastAPI + Python</div>
                <div>React Flow + Recharts</div>
                <div>Pandas ETL Pipeline</div>
              </div>
            </div>
          </div>
        </nav>

        {/* ── MAIN 70% STAGE ────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6" style={{ minWidth: 0 }}>

          {/* Page heading */}
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="h-px w-8" style={{ background: 'linear-gradient(to right, #38BDF8, transparent)' }} />
              <span className="text-[9px] font-mono uppercase tracking-[0.25em]" style={{ color: '#38BDF8' }}>Governance &amp; Trust Rail</span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-100">Digital Identity &amp; KYC Flow</h1>
            <p className="text-xs text-slate-500 mt-1 font-mono max-w-2xl">
              Real-time ingestion monitor linking OpenBanking UK profiles to OFAC SDN sanctions watchlist · FCA &amp; FinCEN compliant · Synthetic KYC records
            </p>
          </div>

          {/* Stats row */}
          <StatsRow stats={stats} loading={loading} />

          {/* ── TAB CONTENT ─────────────────────────────────────────────── */}

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Pipeline + Simulator row */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

                {/* Pipeline Visualizer */}
                <div className="xl:col-span-2 rounded-2xl p-5" style={{ background: '#0B1117', border: '1px solid #1F2937' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2" style={{ color: '#38BDF8' }}>
                      <span className="h-1.5 w-1.5 rounded-full animate-ping" style={{ background: '#38BDF8' }} />
                      KYC Verification Pipeline
                    </h3>
                    {selectedApplicant && (
                      <span className="text-[9px] font-mono text-slate-500">
                        Active: <span className="text-slate-300">{selectedApplicant.full_name}</span>
                      </span>
                    )}
                  </div>
                  <KYCPipelineFlow applicant={selectedApplicant} />
                </div>

                {/* Onboarding Simulator */}
                <div className="rounded-2xl p-5 flex flex-col gap-3" style={{ background: '#0B1117', border: '1px solid #1F2937' }}>
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2 text-slate-300">
                    <PlusCircle className="h-3.5 w-3.5" style={{ color: '#38BDF8' }} />
                    Onboarding Simulator
                  </h3>

                  <form onSubmit={handleSimulate} className="flex flex-col gap-2.5 flex-1">
                    <div>
                      <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-1 font-mono">
                        Full Legal Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dmitry Ivanov"
                        value={simName}
                        onChange={e => setSimName(e.target.value)}
                        disabled={simStep !== null}
                        className="w-full text-slate-200 text-[10px] rounded-xl px-3 py-2 font-mono transition-all placeholder:text-slate-700 disabled:opacity-50 focus:outline-none"
                        style={{ background: '#030712', border: '1px solid #1F2937' }}
                        onFocus={e => (e.currentTarget.style.borderColor = '#38BDF8')}
                        onBlur={e => (e.currentTarget.style.borderColor = '#1F2937')}
                      />
                    </div>
                    <div>
                      <label className="block text-[8px] font-bold uppercase tracking-widest text-slate-500 mb-1 font-mono">
                        Jurisdiction
                      </label>
                      <select
                        value={simCountry}
                        onChange={e => setSimCountry(e.target.value)}
                        disabled={simStep !== null}
                        className="w-full text-slate-300 text-[10px] rounded-xl px-3 py-2 font-mono cursor-pointer disabled:opacity-50 transition-all focus:outline-none appearance-none"
                        style={{ background: '#030712', border: '1px solid #1F2937' }}
                      >
                        <option value="United Kingdom">🇬🇧 United Kingdom (Clean)</option>
                        <option value="Germany">🇩🇪 Germany (Clean)</option>
                        <option value="Singapore">🇸🇬 Singapore (Clean)</option>
                        <option value="United States">🇺🇸 United States</option>
                        <option value="Venezuela">🇻🇪 Venezuela ⚠️ High-Risk</option>
                        <option value="Russia">🇷🇺 Russia 🔴 OFAC</option>
                        <option value="Iran">🇮🇷 Iran 🔴 OFAC</option>
                        <option value="North Korea">🇰🇵 North Korea 🔴 OFAC</option>
                        <option value="Syria">🇸🇾 Syria 🔴 OFAC</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={simStep !== null || !simName.trim()}
                      className="mt-auto w-full py-2.5 font-bold text-[10px] font-mono rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                      style={{
                        background: simStep ? 'transparent' : 'rgba(56,189,248,0.12)',
                        border: '1px solid rgba(56,189,248,0.3)',
                        color: '#38BDF8',
                      }}
                    >
                      {simStep ? (
                        <>
                          <span className="h-3.5 w-3.5 border-2 border-slate-600 border-t-[#38BDF8] rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <PlusCircle className="h-3.5 w-3.5" />
                          Onboard Applicant
                        </>
                      )}
                    </button>
                  </form>

                  {/* Simulator status */}
                  <div
                    className="p-3 rounded-xl min-h-[48px] flex items-center transition-all duration-300 text-[9px] font-mono"
                    style={{
                      background: simStep ? 'rgba(245,158,11,0.05)' : simResult === true ? 'rgba(56,189,248,0.05)' : simResult === false ? 'rgba(244,63,94,0.05)' : 'rgba(11,17,23,0.5)',
                      border: `1px solid ${simStep ? 'rgba(245,158,11,0.2)' : simResult === true ? 'rgba(56,189,248,0.2)' : simResult === false ? 'rgba(244,63,94,0.2)' : '#1F2937'}`,
                    }}
                  >
                    {simStep ? (
                      <div className="flex items-center gap-2 text-amber-400">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
                        </span>
                        {simStep}
                      </div>
                    ) : simResult === true ? (
                      <div className="flex items-center gap-2" style={{ color: '#38BDF8' }}>
                        <CheckCheck className="h-3.5 w-3.5" />
                        Applicant approved &amp; added to pipeline
                      </div>
                    ) : simResult === false ? (
                      <div className="flex items-center gap-2 text-rose-400">
                        <XCircle className="h-3.5 w-3.5" />
                        Rejected — sanctions match or doc failure
                      </div>
                    ) : (
                      <p className="text-slate-600">* Sanctioned jurisdictions trigger automatic fail-closed rejection</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Applicant table + Identity Context */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

                {/* Live Applicant Stream */}
                <div className="xl:col-span-2 rounded-2xl overflow-hidden" style={{ background: '#0B1117', border: '1px solid #1F2937' }}>
                  <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid #1F2937' }}>
                    <h3 className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2 text-slate-300">
                      <Database className="h-3.5 w-3.5" style={{ color: '#38BDF8' }} />
                      Live Applicant Stream
                    </h3>
                    <span className="text-[8px] font-mono text-slate-600 px-2 py-0.5 rounded-full" style={{ background: '#030712', border: '1px solid #1F2937' }}>
                      {applicants.length} records
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-mono text-[10px]">
                      <thead className="text-slate-500" style={{ background: 'rgba(3,7,18,0.6)', borderBottom: '1px solid #1F2937' }}>
                        <tr>
                          {['ID / Source', 'Name', 'Doc', 'Sanctions', 'Risk', 'Outcome', 'Failure Reason'].map(h => (
                            <th key={h} className="p-3 text-[8px] uppercase tracking-widest font-bold whitespace-nowrap">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {applicants.slice(0, 15).map(app => (
                          <tr
                            key={app.applicant_id}
                            onClick={() => setSelected(app)}
                            className="kyc-row cursor-pointer transition-all"
                            style={{
                              borderLeft: selectedApplicant?.applicant_id === app.applicant_id ? '2px solid #38BDF8' : '2px solid transparent',
                              background: selectedApplicant?.applicant_id === app.applicant_id ? 'rgba(56,189,248,0.04)' : undefined,
                              borderBottom: '1px solid rgba(31,41,55,0.4)',
                            }}
                          >
                            <td className="p-3">
                              <div className="space-y-0.5">
                                <div className="font-semibold" style={{ color: '#38BDF8' }}>{app.applicant_id}</div>
                                <span className="text-[7px] font-bold px-1 py-0.5 rounded"
                                  style={app.data_source === 'OpenBanking UK'
                                    ? { background: 'rgba(56,189,248,0.1)', color: '#38BDF8', border: '0.5px solid rgba(56,189,248,0.2)' }
                                    : { background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '0.5px solid rgba(245,158,11,0.2)' }}>
                                  {app.data_source === 'OpenBanking UK' ? 'OB-UK' : 'SYNTH'}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 text-slate-300 font-sans">{app.full_name}</td>
                            <td className="p-3"><StatusBadge status={app.document_status} /></td>
                            <td className="p-3"><StatusBadge status={app.sanctions_match} /></td>
                            <td className="p-3">
                              <span className="font-bold" style={{
                                color: app.risk_score > 0.5 ? '#F43F5E' : app.risk_score > 0.3 ? '#F59E0B' : '#38BDF8'
                              }}>
                                {(app.risk_score * 100).toFixed(0)}%
                              </span>
                            </td>
                            <td className="p-3"><StatusBadge status={app.overall_status} /></td>
                            <td className="p-3 text-[9px] text-rose-400 max-w-[140px] truncate">
                              {app.reason_if_failed !== 'None' ? app.reason_if_failed : <span className="text-slate-600">—</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Identity Context */}
                <div className="rounded-2xl p-4 space-y-3" style={{ background: '#0B1117', border: '1px solid #1F2937' }}>
                  <h3 className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-2 text-slate-300">
                    <Fingerprint className="h-3.5 w-3.5" style={{ color: '#818CF8' }} />
                    Identity Context
                  </h3>

                  {selectedApplicant ? (
                    <div className="space-y-3">
                      {/* Risk gauge */}
                      <div className="p-3 rounded-xl" style={{ background: '#030712', border: '1px solid #1F2937' }}>
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-[8px] font-mono uppercase tracking-widest text-slate-500">Risk Vector Score</span>
                          <span className="text-base font-black font-mono" style={{
                            color: selectedApplicant.risk_score > 0.5 ? '#F43F5E' : selectedApplicant.risk_score > 0.3 ? '#F59E0B' : '#38BDF8'
                          }}>
                            {(selectedApplicant.risk_score * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1F2937' }}>
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${selectedApplicant.risk_score * 100}%`,
                              background: selectedApplicant.risk_score > 0.5 ? '#F43F5E' : selectedApplicant.risk_score > 0.3 ? '#F59E0B' : '#38BDF8',
                            }}
                          />
                        </div>
                      </div>

                      {/* Failure reason */}
                      <div className="p-3 rounded-xl" style={{
                        background: selectedApplicant.overall_status === 'Rejected' ? 'rgba(244,63,94,0.04)' : '#030712',
                        border: `1px solid ${selectedApplicant.overall_status === 'Rejected' ? 'rgba(244,63,94,0.2)' : '#1F2937'}`,
                      }}>
                        <p className="text-[8px] text-slate-500 uppercase tracking-widest font-mono mb-1">Failure Reason</p>
                        <p className={`text-[10px] font-mono ${selectedApplicant.overall_status === 'Rejected' ? 'text-rose-400' : 'text-slate-500'}`}>
                          {selectedApplicant.reason_if_failed !== 'None' ? selectedApplicant.reason_if_failed : '✔ No failure parameters triggered'}
                        </p>
                      </div>

                      {/* Field rows */}
                      <div className="text-[9px]">
                        {[
                          { k: 'Applicant ID',   v: selectedApplicant.applicant_id },
                          { k: 'Full Name',       v: selectedApplicant.full_name },
                          { k: 'Jurisdiction',    v: selectedApplicant.country },
                          { k: 'Document',        v: selectedApplicant.document_type },
                          { k: 'OB Consent',      v: selectedApplicant.openbanking_uk_consent },
                          { k: 'Data Source',     v: selectedApplicant.data_source },
                          { k: 'Sanctions',       v: selectedApplicant.sanctions_match },
                          { k: 'OFAC Match',      v: selectedApplicant.sanctions_result?.ofac_sanctions_match ? 'YES' : 'NO' },
                          { k: 'Confidence',      v: selectedApplicant.sanctions_result ? `${(selectedApplicant.sanctions_result.match_confidence * 100).toFixed(0)}%` : 'N/A' },
                          { k: 'Watchlist ID',    v: selectedApplicant.sanctions_result?.watchlist_entity_id || 'None' },
                          { k: 'Timestamp',       v: new Date(selectedApplicant.timestamp).toLocaleString() },
                        ].map(({ k, v }) => (
                          <div key={k} className="flex justify-between py-1.5 font-mono" style={{ borderBottom: '1px solid rgba(31,41,55,0.5)' }}>
                            <span className="text-slate-500">{k}</span>
                            <span className="text-slate-300 text-right max-w-[55%] truncate font-medium">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-48 flex flex-col items-center justify-center rounded-xl text-center" style={{ border: '1px dashed #1F2937' }}>
                      <Users className="h-8 w-8 text-slate-700 mb-2" />
                      <p className="text-[9px] text-slate-600 font-mono">Select an applicant row to view identity context</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* APPLICANTS TAB */}
          {activeTab === 'applicants' && (
            <div className="rounded-2xl overflow-hidden" style={{ background: '#0B1117', border: '1px solid #1F2937' }}>
              <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid #1F2937' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-300">
                  All KYC Applicants ({applicants.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[10px]">
                  <thead className="text-slate-500" style={{ background: 'rgba(3,7,18,0.6)', borderBottom: '1px solid #1F2937' }}>
                    <tr>
                      {['ID / Source','Name','Country','Document','Sanctions','Risk','Status','Failure Reason','Date'].map(h => (
                        <th key={h} className="p-3 text-[8px] uppercase tracking-widest font-bold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {applicants.map(app => (
                      <tr
                        key={app.applicant_id}
                        onClick={() => setSelected(app)}
                        className="cursor-pointer transition-all"
                        style={{
                          borderBottom: '1px solid rgba(31,41,55,0.4)',
                          borderLeft: selectedApplicant?.applicant_id === app.applicant_id ? '2px solid #38BDF8' : '2px solid transparent',
                          background: selectedApplicant?.applicant_id === app.applicant_id ? 'rgba(56,189,248,0.04)' : undefined,
                        }}
                      >
                        <td className="p-3">
                          <div className="space-y-0.5">
                            <div style={{ color: '#38BDF8' }} className="font-semibold">{app.applicant_id}</div>
                            <span className="text-[7px] font-bold px-1 py-0.5 rounded"
                              style={app.data_source === 'OpenBanking UK'
                                ? { background: 'rgba(56,189,248,0.1)', color: '#38BDF8', border: '0.5px solid rgba(56,189,248,0.2)' }
                                : { background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '0.5px solid rgba(245,158,11,0.2)' }}>
                              {app.data_source === 'OpenBanking UK' ? 'OB-UK' : 'SYNTH'}
                            </span>
                          </div>
                        </td>
                        <td className="p-3 text-slate-300 font-sans">{app.full_name}</td>
                        <td className="p-3 text-slate-400">{app.country}</td>
                        <td className="p-3"><StatusBadge status={app.document_status} /></td>
                        <td className="p-3"><StatusBadge status={app.sanctions_match} /></td>
                        <td className="p-3 font-bold" style={{ color: app.risk_score > 0.5 ? '#F43F5E' : app.risk_score > 0.3 ? '#F59E0B' : '#38BDF8' }}>
                          {(app.risk_score * 100).toFixed(0)}%
                        </td>
                        <td className="p-3"><StatusBadge status={app.overall_status} /></td>
                        <td className="p-3 text-[9px] text-rose-400 max-w-[180px] truncate">
                          {app.reason_if_failed !== 'None' ? app.reason_if_failed : <span className="text-slate-600">—</span>}
                        </td>
                        <td className="p-3 text-slate-600 whitespace-nowrap">{new Date(app.timestamp).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* WORKFLOW TAB */}
          {activeTab === 'workflow' && (
            <div className="space-y-5">
              <div className="rounded-2xl p-5" style={{ background: '#0B1117', border: '1px solid #1F2937' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono mb-4 flex items-center gap-2" style={{ color: '#38BDF8' }}>
                  <Activity className="h-3.5 w-3.5" />
                  KYC Pipeline Topology · {selectedApplicant?.applicant_id ?? 'No applicant selected'}
                </h3>
                {selectedApplicant ? (
                  <KYCPipelineFlow applicant={selectedApplicant} />
                ) : (
                  <div className="h-48 flex flex-col items-center justify-center rounded-xl text-center" style={{ border: '1px dashed #1F2937' }}>
                    <Activity className="h-8 w-8 text-slate-700 mb-2" />
                    <p className="text-xs text-slate-600 font-mono">Select an applicant from the Applicants tab</p>
                  </div>
                )}
              </div>

              {selectedApplicant && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="rounded-2xl p-5" style={{ background: '#0B1117', border: '1px solid #1F2937' }}>
                    <h3 className="text-xs font-bold uppercase tracking-wider font-mono mb-3 text-slate-300">Sanctions Detail</h3>
                    <div className="font-mono text-xs">
                      {[
                        { k: 'OFAC SDN Match',    v: selectedApplicant.sanctions_result?.ofac_sanctions_match ? '🔴 CONFIRMED' : '✅ CLEAR' },
                        { k: 'Match Confidence',  v: `${(selectedApplicant.sanctions_result?.match_confidence * 100 || 0).toFixed(1)}%` },
                        { k: 'Threshold',         v: `${((selectedApplicant.sanctions_result?.threshold_configured || 0) * 100).toFixed(0)}%` },
                        { k: 'Watchlist Entity',  v: selectedApplicant.sanctions_result?.watchlist_entity_id || 'None' },
                        { k: 'Sanctions Status',  v: selectedApplicant.sanctions_match },
                      ].map(({ k, v }) => (
                        <div key={k} className="flex justify-between py-2.5" style={{ borderBottom: '1px solid rgba(31,41,55,0.5)' }}>
                          <span className="text-slate-500 text-[10px]">{k}</span>
                          <span className="text-slate-200 text-[10px] font-medium">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl p-5" style={{ background: '#0B1117', border: '1px solid #1F2937' }}>
                    <h3 className="text-xs font-bold uppercase tracking-wider font-mono mb-3 text-slate-300">Risk Profile</h3>
                    <div className="space-y-0 divide-y font-mono text-xs">
                      {[
                        { k: 'Risk Score',        v: `${(selectedApplicant.risk_score * 100).toFixed(0)}%` },
                        { k: 'Classification',    v: selectedApplicant.risk_score > 0.5 ? 'HIGH RISK' : selectedApplicant.risk_score > 0.3 ? 'MEDIUM' : 'LOW RISK' },
                        { k: 'Document Status',   v: selectedApplicant.document_status },
                        { k: 'Biometric Status',  v: selectedApplicant.biometric_status },
                        { k: 'Final Decision',    v: selectedApplicant.overall_status },
                      ].map(({ k, v }) => (
                        <div key={k} className="flex justify-between py-2.5" style={{ borderBottom: '1px solid rgba(31,41,55,0.5)' }}>
                          <span className="text-slate-500 text-[10px]">{k}</span>
                          <span className="text-slate-200 text-[10px] font-medium">{v}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* AUDIT TRAIL TAB */}
          {activeTab === 'audit' && (
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
              <div className="xl:col-span-2 rounded-2xl p-5" style={{ background: '#0B1117', border: '1px solid #1F2937' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono mb-4 flex items-center gap-2" style={{ color: '#38BDF8' }}>
                  <FileText className="h-3.5 w-3.5" />
                  Immutable Audit Log
                </h3>
                <AuditTrail applicant={selectedApplicant} />
              </div>

              {/* Applicant picker */}
              <div className="rounded-2xl p-5" style={{ background: '#0B1117', border: '1px solid #1F2937' }}>
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono mb-3 text-slate-300">Select Applicant</h3>
                <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                  {applicants.slice(0, 20).map(app => (
                    <button
                      key={app.applicant_id}
                      onClick={() => setSelected(app)}
                      className="w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer"
                      style={{
                        background: selectedApplicant?.applicant_id === app.applicant_id ? 'rgba(56,189,248,0.08)' : 'rgba(3,7,18,0.5)',
                        border: `1px solid ${selectedApplicant?.applicant_id === app.applicant_id ? 'rgba(56,189,248,0.3)' : '#1F2937'}`,
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-mono" style={{ color: '#38BDF8' }}>{app.applicant_id}</span>
                        <StatusBadge status={app.overall_status} />
                      </div>
                      <p className="text-[10px] text-slate-300 font-sans mt-0.5">{app.full_name}</p>
                      <p className="text-[8px] text-slate-600 font-mono mt-0.5">{app.country}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        {/* ── INTELLIGENCE SIDEBAR (30%) ─────────────────────────────────── */}
        <IntelligenceSidebar
          stats={stats}
          filters={filters}
          onFilterChange={onFilterChange}
          selectedApplicant={selectedApplicant}
        />
      </div>
    </div>
  );
}
