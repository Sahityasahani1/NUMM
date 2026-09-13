import React from 'react';
import { RelationshipType } from '../../types/material';

interface Props {
  type: RelationshipType;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export const RelationshipBadge: React.FC<Props> = ({ type, showIcon = true, size = 'sm' }) => {
  const sz = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';
  switch (type) {
    case 'IDENTICAL':
      return (
        <span 
          className={`inline-flex items-center gap-1 rounded-md font-semibold font-mono ${sz}`}
          style={{ background: 'var(--success-dim)', color: 'var(--success)' }}
        >
          {showIcon && <span className="material-symbols-outlined text-[13px]">check_circle</span>}
          <span>Identical</span>
        </span>
      );
    case 'DUPLICATE':
      return (
        <span 
          className={`inline-flex items-center gap-1 rounded-md font-semibold font-mono ${sz}`}
          style={{ background: 'var(--indigo-dim)', color: 'var(--indigo)' }}
        >
          {showIcon && <span className="material-symbols-outlined text-[13px]">content_copy</span>}
          <span>Duplicate</span>
        </span>
      );
    case 'NEAR-DUPLICATE':
      return (
        <span 
          className={`inline-flex items-center gap-1 rounded-md font-semibold font-mono ${sz}`}
          style={{ background: 'var(--warn-dim)', color: 'var(--warning)' }}
        >
          {showIcon && <span className="material-symbols-outlined text-[13px]">compare_arrows</span>}
          <span>Near Duplicate</span>
        </span>
      );
    case 'FUNCTIONALLY EQUIVALENT':
      return (
        <span 
          className={`inline-flex items-center gap-1 rounded-md font-semibold font-mono ${sz}`}
          style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}
        >
          {showIcon && <span className="material-symbols-outlined text-[13px]">swap_horiz</span>}
          <span>Func Equiv</span>
        </span>
      );
    default:
      return (
        <span 
          className={`inline-flex items-center gap-1 rounded-md font-semibold font-mono ${sz}`}
          style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)' }}
        >
          {showIcon && <span className="material-symbols-outlined text-[13px]">link</span>}
          <span>{type}</span>
        </span>
      );
  }
};
