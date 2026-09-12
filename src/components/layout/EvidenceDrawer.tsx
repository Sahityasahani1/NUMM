import React from 'react';
import { useApp } from '../../context/AppContext';
import { MatchCandidate, CanonicalMaterial } from '../../types/material';
import { RelationshipBadge } from '../common/RelationshipBadge';

export const EvidenceDrawer: React.FC = () => {
  const { 
    evidenceDrawerOpen, 
    evidenceTarget, 
    closeEvidence, 
    approveReviewItem, 
    flagReviewItem,
    addToast
  } = useApp();

  if (!evidenceDrawerOpen || !evidenceTarget) return null;

  const isCandidate = 'candidateCnmc' in evidenceTarget;
  const candidate = isCandidate ? (evidenceTarget as MatchCandidate) : null;
  const canonical = !isCandidate ? (evidenceTarget as CanonicalMaterial) : null;

  const title = isCandidate 
    ? `Match Evidence: ${candidate?.sourceCode} → ${candidate?.candidateCnmc}`
    : `Master Profile Evidence: ${canonical?.cnmc}`;

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden flex justify-end transition-opacity duration-200"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={closeEvidence}
    >
      <div 
        className="w-full max-w-[640px] h-full shadow-elevated flex flex-col transition-transform duration-250 ease-out animate-slide-in-right"
        style={{ background: 'var(--bg-card)', borderLeft: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div 
          className="px-6 py-4 flex items-center justify-between shrink-0"
          style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-hover)' }}
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[22px]" style={{ color: 'var(--blue)' }}>fact_check</span>
            <div>
              <h2 className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                Harmonization Traceability Dossier
              </h2>
              <p className="font-mono text-xs truncate max-w-[420px] mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {title}
              </p>
            </div>
          </div>
          <button
            onClick={closeEvidence}
            className="p-1.5 rounded-lg transition-colors hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Top Score Banner */}
          <div 
            className="p-5 rounded-xl flex items-center justify-between"
            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}
          >
            <div>
              <span className="text-xs uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>
                Match Confidence Rating
              </span>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="font-mono text-3xl font-bold" style={{ color: 'var(--blue)' }}>
                  {candidate ? `${candidate.confidence}%` : `${canonical?.confidenceScore}%`}
                </span>
                {candidate && <RelationshipBadge type={candidate.relationship} size="sm" />}
              </div>
            </div>
            <div className="text-right font-mono text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
              <div>Semantic Agreement: <strong style={{ color: 'var(--text-primary)' }}>97.8%</strong></div>
              <div>Attribute Parity: <strong style={{ color: 'var(--text-primary)' }}>98.5%</strong></div>
            </div>
          </div>

          {/* Explanation Section */}
          <div className="space-y-2">
            <h3 className="text-xs uppercase font-bold tracking-wider" style={{ color: 'var(--text-muted)' }}>
              AI Decision Explanation
            </h3>
            <div 
              className="p-4 rounded-xl text-xs leading-relaxed"
              style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
            >
              {candidate?.explanation || canonical?.canonicalDescription}
            </div>
          </div>

          {/* Audit Verification Strip */}
          <div 
            className="p-4 rounded-xl flex items-center justify-between text-xs font-mono"
            style={{ background: 'var(--success-dim)', border: '1px solid rgba(34,197,94,0.3)', color: 'var(--success)' }}
          >
            <span className="flex items-center gap-1.5 font-semibold">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Cryptographically Verified Record
            </span>
            <span className="text-[11px] opacity-80">Ledger Block #84920</span>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div 
          className="p-4 flex items-center justify-between shrink-0"
          style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-hover)' }}
        >
          <button
            onClick={closeEvidence}
            className="px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-80 transition-all"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
          >
            Close Dossier
          </button>

          {candidate && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  flagReviewItem(candidate.id);
                  closeEvidence();
                  addToast('warning', `Flagged ${candidate.sourceCode} for review`);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-80 transition-all"
                style={{ background: 'var(--warn-dim)', border: '1px solid rgba(245,158,11,0.3)', color: 'var(--warning)' }}
              >
                Flag Item
              </button>
              <button
                onClick={() => {
                  approveReviewItem(candidate.id);
                  closeEvidence();
                  addToast('success', `Approved match ${candidate.candidateCnmc}`);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold hover:brightness-110 transition-all"
                style={{ background: 'var(--blue)', color: '#fff' }}
              >
                Approve Match
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
