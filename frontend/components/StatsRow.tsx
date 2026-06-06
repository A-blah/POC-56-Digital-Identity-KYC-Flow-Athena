'use client';

import React from 'react';
import { DashboardStats } from '@/lib/types';
import { Users, CheckCircle, ShieldAlert, Clock, TrendingUp, TrendingDown } from 'lucide-react';

// Tiny sparkline (inline SVG, no external lib needed)
function Sparkline({ points, color, height = 36 }: { points: number[]; color: string; height?: number }) {
  if (points.length < 2) return null;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const norm = points.map(p => height - ((p - min) / range) * (height - 4) - 2);
  const w = 100;
  const step = w / (points.length - 1);
  const pathD = norm.map((y, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${y}`).join(' ');
  const areaD = `${pathD} L ${(points.length - 1) * step} ${height} L 0 ${height} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.15" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#sg-${color.replace('#', '')})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  points?: number[];
  color: string;
  icon: React.ElementType;
}

function StatCard({ label, value, sub, trend, points, color, icon: Icon }: StatCardProps) {
  return (
    <div className="relative bg-[#0B1117] border border-[#1F2937] rounded-2xl p-5 overflow-hidden group hover:border-[#38BDF8]/20 transition-all duration-300 hover:shadow-[0_0_20px_rgba(56,189,248,0.05)]">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-900/20 group-hover:opacity-60 transition-opacity" />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-slate-500">{label}</span>
          <div className="p-1.5 rounded-lg bg-slate-900/60 border border-[#1F2937]">
            <Icon style={{ color }} className="h-3.5 w-3.5" />
          </div>
        </div>
        <div className="text-2xl font-black font-mono text-slate-100 tracking-tight">{value}</div>
        {sub && (
          <div className="flex items-center gap-1 mt-1">
            {trend === 'up'   && <TrendingUp   className="h-3 w-3 text-[#38BDF8]" />}
            {trend === 'down' && <TrendingDown  className="h-3 w-3 text-rose-400" />}
            <span className={`text-[10px] font-mono ${trend === 'up' ? 'text-[#38BDF8]' : trend === 'down' ? 'text-rose-400' : 'text-slate-500'}`}>
              {sub}
            </span>
          </div>
        )}
        {points && (
          <div className="mt-3">
            <Sparkline points={points} color={color} height={36} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function StatsRow({ stats, loading }: { stats: DashboardStats | null; loading: boolean }) {
  if (loading || !stats) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-[140px] rounded-2xl bg-[#0B1117] border border-[#1F2937] animate-pulse" />
        ))}
      </div>
    );
  }

  const cards: StatCardProps[] = [
    {
      label: 'Total Processed',
      value: stats.total_processed,
      sub: `↑ ${stats.passed} approved`,
      trend: 'up',
      color: '#38BDF8',
      icon: Users,
      points: [22, 28, 25, 35, 30, 40, 38, 45, stats.total_processed % 55 + 18],
    },
    {
      label: 'Pass Rate',
      value: `${stats.pass_rate_percentage}%`,
      sub: `${stats.passed} of ${stats.total_processed} verified`,
      trend: stats.pass_rate_percentage >= 55 ? 'up' : 'down',
      color: '#818CF8',
      icon: CheckCircle,
      points: [50, 55, 52, 58, 62, 60, 65, 63, stats.pass_rate_percentage],
    },
    {
      label: 'OFAC Alerts',
      value: stats.ofac_alerts,
      sub: `${stats.failed} total rejected`,
      trend: 'down',
      color: '#F43F5E',
      icon: ShieldAlert,
      points: [8, 5, 7, 12, 9, 11, 8, 10, stats.ofac_alerts],
    },
    {
      label: 'Pending Review',
      value: stats.pending_review,
      sub: 'Manual compliance queue',
      trend: 'neutral',
      color: '#F59E0B',
      icon: Clock,
      points: [3, 5, 4, 6, 5, 7, 4, 6, stats.pending_review],
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => <StatCard key={card.label} {...card} />)}
    </div>
  );
}
