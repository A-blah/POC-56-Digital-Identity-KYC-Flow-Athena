'use client';

import React, { useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  NodeProps,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Applicant } from '@/lib/types';
import {
  Lock, FileSearch, Fingerprint, ShieldAlert, GitMerge, CheckSquare
} from 'lucide-react';

// ── Step icon map ─────────────────────────────────────────────────────────────
const STEP_ICONS: Record<string, React.ElementType> = {
  'Onboarding Flow':    Lock,
  'Document Check':     FileSearch,
  'Biometric Match':    Fingerprint,
  'Sanctions Screening': ShieldAlert,
  'Decision Logic':     GitMerge,
  'Final Outcome':      CheckSquare,
};

// ── Status → color mapping (Real Rails DNA palette) ───────────────────────────
function statusColors(status: string) {
  switch (status) {
    case 'SUCCESS': return {
      border: '#38BDF8', bg: 'rgba(56,189,248,0.07)', text: '#38BDF8',
      glow: '0 0 12px rgba(56,189,248,0.25)',
    };
    case 'CRITICAL':
    case 'FAILED': return {
      border: '#F43F5E', bg: 'rgba(244,63,94,0.07)', text: '#F43F5E',
      glow: '0 0 14px rgba(244,63,94,0.3)',
    };
    case 'PENDING': return {
      border: '#F59E0B', bg: 'rgba(245,158,11,0.07)', text: '#F59E0B',
      glow: '0 0 10px rgba(245,158,11,0.2)',
    };
    default: return {
      border: '#1F2937', bg: '#0B1117', text: '#6B7280', glow: 'none',
    };
  }
}

// ── Custom KYC Step Node ──────────────────────────────────────────────────────
function KYCNode({ data }: NodeProps) {
  const c = statusColors(data.status);
  const Icon = STEP_ICONS[data.label] || CheckSquare;
  return (
    <div
      style={{
        border: `1px solid ${c.border}`,
        background: c.bg,
        boxShadow: c.glow,
        borderRadius: 12,
        padding: '10px 14px',
        minWidth: 140,
        fontFamily: 'Inter, monospace',
        position: 'relative',
      }}
    >
      <Handle type="target" position={Position.Left} style={{ background: c.border, border: 'none', width: 6, height: 6 }} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <div style={{
          background: 'rgba(0,0,0,0.3)', borderRadius: 6, padding: 4,
          display: 'flex', alignItems: 'center',
        }}>
          <Icon size={12} color={c.text} />
        </div>
        <span style={{ fontSize: 9, color: '#6B7280', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          {data.step}
        </span>
      </div>
      <p style={{ fontSize: 11, fontWeight: 700, color: '#F1F5F9', margin: 0, lineHeight: 1.3 }}>
        {data.label}
      </p>
      <p style={{ fontSize: 9, color: '#64748B', margin: '2px 0 0', fontFamily: 'monospace' }}>
        {data.desc}
      </p>
      <div style={{
        marginTop: 6,
        display: 'inline-block',
        fontSize: 8,
        fontWeight: 800,
        fontFamily: 'monospace',
        letterSpacing: '0.1em',
        padding: '2px 6px',
        borderRadius: 4,
        background: 'rgba(0,0,0,0.35)',
        color: c.text,
        border: `0.5px solid ${c.border}`,
      }}>
        {data.status}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: c.border, border: 'none', width: 6, height: 6 }} />
    </div>
  );
}

const nodeTypes = { kycNode: KYCNode };

// ── Main Component ────────────────────────────────────────────────────────────
export default function KYCPipelineFlow({ applicant }: { applicant: Applicant | null }) {
  const buildGraph = useCallback(() => {
    if (!applicant) return { nodes: [], edges: [] };

    const stepDefs = [
      { label: 'Onboarding Flow',     desc: 'OB Consent Handshake', getStatus: () => 'SUCCESS' },
      { label: 'Document Check',      desc: 'MRZ OCR Extraction',   getStatus: () => applicant.document_status === 'Verified' ? 'SUCCESS' : 'FAILED' },
      { label: 'Biometric Match',     desc: 'Liveness Verification', getStatus: () => applicant.biometric_status === 'Verified' ? 'SUCCESS' : 'FAILED' },
      { label: 'Sanctions Screening', desc: 'OFAC SDN Watchlist',   getStatus: () => applicant.sanctions_match === 'Critical Match' ? 'CRITICAL' : applicant.sanctions_match === 'Potential Match' ? 'PENDING' : 'SUCCESS' },
      { label: 'Decision Logic',      desc: 'Rule Evaluation',      getStatus: () => applicant.overall_status === 'Approved' ? 'SUCCESS' : applicant.overall_status === 'Rejected' ? 'FAILED' : 'PENDING' },
      { label: 'Final Outcome',       desc: applicant.overall_status, getStatus: () => applicant.overall_status === 'Approved' ? 'SUCCESS' : applicant.overall_status === 'Rejected' ? 'FAILED' : 'PENDING' },
    ];

    const nodes: Node[] = stepDefs.map((s, i) => ({
      id: `node-${i}`,
      type: 'kycNode',
      position: { x: i * 190, y: 40 },
      data: { label: s.label, desc: s.desc, status: s.getStatus(), step: `Step 0${i + 1}` },
      draggable: false,
    }));

    const edges: Edge[] = stepDefs.slice(0, -1).map((_, i) => {
      const srcStatus = (nodes[i].data as { status: string }).status;
      const color = srcStatus === 'SUCCESS' ? '#38BDF8' : srcStatus === 'FAILED' || srcStatus === 'CRITICAL' ? '#F43F5E' : '#F59E0B';
      return {
        id: `e${i}-${i + 1}`,
        source: `node-${i}`,
        target: `node-${i + 1}`,
        style: { stroke: color, strokeWidth: 1.5, opacity: 0.7 },
        animated: srcStatus === 'SUCCESS',
      };
    });

    return { nodes, edges };
  }, [applicant]);

  const { nodes, edges } = buildGraph();

  if (!applicant) {
    return (
      <div className="h-48 flex flex-col items-center justify-center border border-dashed border-[#1F2937] rounded-xl text-center">
        <ShieldAlert className="h-8 w-8 mb-2 text-[#1F2937]" />
        <p className="text-xs text-slate-600 font-mono">Select an applicant row to trace their KYC pipeline execution</p>
      </div>
    );
  }

  return (
    <div style={{ height: 180, background: 'transparent', borderRadius: 12, overflow: 'hidden' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} color="#1F2937" gap={18} size={1} />
      </ReactFlow>
    </div>
  );
}
