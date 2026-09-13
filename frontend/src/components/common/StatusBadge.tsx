import React from 'react';
import { HarmonizationStatus } from '../../types/material';

interface Props {
  status: HarmonizationStatus | 'Active' | 'Under Review' | 'Deprecated' | 'Approved' | 'Retired' | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<Props> = ({ status, size = 'sm' }) => {
  const sz = size === 'sm' ? 'text-xs px-2.5 py-0.5' : 'text-xs px-3 py-1';
  switch (status) {
    case 'Harmonized':
    case 'Active':
    case 'Approved':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 rounded-md font-semibold ${sz}`}
          style={{ background: 'var(--success-dim)', color: 'var(--success)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }} />
          {status}
        </span>
      );
    case 'Pending Review':
    case 'Under Review':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 rounded-md font-semibold ${sz}`}
          style={{ background: 'var(--warn-dim)', color: 'var(--warning)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--warning)' }} />
          {status}
        </span>
      );
    case 'Archived':
    case 'Deprecated':
    case 'Retired':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 rounded-md font-semibold ${sz}`}
          style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--text-muted)' }} />
          {status}
        </span>
      );
    case 'Flagged':
      return (
        <span 
          className={`inline-flex items-center gap-1.5 rounded-md font-semibold ${sz}`}
          style={{ background: 'var(--error-dim)', color: 'var(--error)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--error)' }} />
          Flagged
        </span>
      );
    default:
      return (
        <span 
          className={`inline-flex items-center gap-1.5 rounded-md font-semibold ${sz}`}
          style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
        >
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--border)' }} />
          {status}
        </span>
      );
  }
};
