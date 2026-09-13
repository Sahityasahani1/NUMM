import React from 'react';

interface Props {
  confidence: number;
  showBar?: boolean;
}

export const ConfidenceBar: React.FC<Props> = ({ confidence, showBar = true }) => {
  const getBarColor = (score: number) => {
    if (score >= 90) return 'var(--success)';
    if (score >= 80) return 'var(--blue)';
    if (score >= 70) return 'var(--warning)';
    return 'var(--error)';
  };

  const color = getBarColor(confidence);

  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-xs font-bold" style={{ color }}>
        {confidence}%
      </span>
      {showBar && (
        <div className="w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-hover)' }}>
          <div 
            className="h-full rounded-full transition-all duration-300" 
            style={{ width: `${Math.min(100, Math.max(0, confidence))}%`, background: color }}
          />
        </div>
      )}
    </div>
  );
};
