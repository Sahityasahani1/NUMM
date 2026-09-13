import React from 'react';
import { useApp } from '../../context/AppContext';

export const ImpactModal: React.FC = () => {
  const { impactModal, closeImpactModal } = useApp();

  if (!impactModal.isOpen) return null;

  const isDestructive = impactModal.action === 'MERGE' || impactModal.action === 'RETIRE' || impactModal.action === 'SPLIT';

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 transition-opacity duration-150"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={closeImpactModal}
    >
      <div 
        className="rounded-xl max-w-lg w-full overflow-hidden shadow-elevated transition-all animate-fade-in"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="p-5 flex items-center justify-between"
          style={{ 
            borderBottom: '1px solid var(--border)',
            background: isDestructive ? 'var(--warn-dim)' : 'var(--bg-hover)' 
          }}
        >
          <div className="flex items-center gap-2.5">
            <span 
              className="material-symbols-outlined text-[22px]"
              style={{ color: isDestructive ? 'var(--warning)' : 'var(--blue)' }}
            >
              {isDestructive ? 'warning' : 'info'}
            </span>
            <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
              {impactModal.title}
            </h3>
          </div>
          <button
            onClick={closeImpactModal}
            className="p-1 rounded-lg transition-colors hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            You are about to execute action <strong className="font-mono text-sm font-bold" style={{ color: 'var(--blue)' }}>{impactModal.action}</strong> on source material record:
          </p>

          <div 
            className="p-3.5 rounded-lg font-mono text-xs"
            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
          >
            <div className="font-bold">{impactModal.sourceCode}</div>
            {impactModal.targetCnmc && (
              <div className="mt-1 font-semibold flex items-center gap-1.5" style={{ color: 'var(--blue)' }}>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span> Target Canonical: {impactModal.targetCnmc}
              </div>
            )}
          </div>

          {/* Staged Impact Preview */}
          <div 
            className="p-4 rounded-xl space-y-3"
            style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}
          >
            <h4 className="text-xs uppercase font-bold flex items-center gap-2" style={{ color: 'var(--warning)' }}>
              <span className="material-symbols-outlined text-sm">hub</span>
              Downstream Operational Impact Preview
            </h4>
            <ul className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--success)' }} />
                <span>Impacts <strong className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{impactModal.impactedCount || 4} CPSE ERP systems</strong> (SAP, Oracle, Maximo).</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--success)' }} />
                <span>Automatic forward-alias cross-references created without breaking internal POs.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: 'var(--success)' }} />
                <span>Transaction cryptographically signed &amp; committed to immutable governance trail.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div 
          className="p-4 flex justify-end gap-2.5"
          style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-hover)' }}
        >
          <button
            onClick={closeImpactModal}
            className="px-4 py-2 rounded-lg text-xs font-semibold hover:opacity-80 transition-all"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              impactModal.onConfirm();
              closeImpactModal();
            }}
            className="px-5 py-2 rounded-lg text-xs font-semibold transition-all hover:brightness-110"
            style={{ 
              background: isDestructive ? 'var(--blue)' : 'var(--blue)', 
              color: '#fff' 
            }}
          >
            Confirm &amp; Commit Operation
          </button>
        </div>
      </div>
    </div>
  );
};
