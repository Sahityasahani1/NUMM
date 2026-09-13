import React, { useEffect, useRef, useState } from 'react';
import { useApp, ScreenType } from '../../context/AppContext';

const SCREEN_OPTIONS: { id: ScreenType; label: string; icon: string }[] = [
  { id: 'home', label: 'Problem & Architecture', icon: 'account_tree' },
  { id: 'dashboard', label: 'Executive Dashboard', icon: 'dashboard' },
  { id: 'datahub', label: 'CPSE Data Hub', icon: 'database' },
  { id: 'harmonization', label: 'Harmonization Workbench', icon: 'rebase_edit' },
  { id: 'master', label: 'National Material Master', icon: 'inventory_2' },
  { id: 'review', label: 'Review Queue', icon: 'fact_check' },
  { id: 'rationalization', label: 'Rationalization & Merge', icon: 'call_merge' },
  { id: 'analytics', label: 'Analytics & Savings', icon: 'monitoring' },
  { id: 'governance', label: 'Audit Trail', icon: 'gavel' },
  { id: 'settings', label: 'Settings', icon: 'settings' },
  { id: 'support', label: 'Help & Documentation', icon: 'help_outline' },
  { id: 'landing', label: 'Public Showcase & Benchmark', icon: 'public' },
];

const CNMC_QUICK = ['CNMC-00018427', 'CNMC-00018428', 'CNMC-104928', 'CNMC-883210', 'CNMC-339011'];

export const SearchSpotlight: React.FC = () => {
  const { searchOpen, setSearchOpen, setActiveScreen, navigateToMaterial, setGlobalSearch } = useApp();
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setQuery('');
      setCursor(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      // Slash shortcut when not focused on an input or textarea
      if (
        e.key === '/' &&
        !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName) &&
        !(e.target as HTMLElement)?.isContentEditable
      ) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setSearchOpen]);

  if (!searchOpen) return null;

  const screenMatches = SCREEN_OPTIONS.filter(s =>
    !query || s.label.toLowerCase().includes(query.toLowerCase())
  );
  const cnmcMatches = CNMC_QUICK.filter(c =>
    !query || c.toLowerCase().includes(query.toLowerCase())
  );

  const allResults = [
    ...cnmcMatches.map(c => ({ type: 'cnmc' as const, id: c, label: c, icon: 'pin' })),
    ...screenMatches.map(s => ({ type: 'screen' as const, id: s.id, label: s.label, icon: s.icon })),
  ];

  const go = (item: typeof allResults[0]) => {
    if (item.type === 'cnmc') {
      navigateToMaterial(item.id);
    } else {
      setActiveScreen(item.id as ScreenType);
    }
    setGlobalSearch(item.label);
    setSearchOpen(false);
    setQuery('');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') setCursor(c => Math.min(c + 1, allResults.length - 1));
    if (e.key === 'ArrowUp') setCursor(c => Math.max(c - 1, 0));
    if (e.key === 'Enter' && allResults[cursor]) go(allResults[cursor]);
    if (e.key === 'Escape') setSearchOpen(false);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-24"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={() => setSearchOpen(false)}
    >
      <div
        className="w-full max-w-lg rounded-xl shadow-elevated animate-fade-in overflow-hidden"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <span className="material-symbols-outlined text-[20px]" style={{ color: 'var(--text-muted)' }}>search</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setCursor(0); }}
            onKeyDown={handleKey}
            placeholder="Search screens, CNMC codes, or materials..."
            className="flex-1 text-sm bg-transparent border-none outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          <kbd
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: 'var(--bg-hover)', color: 'var(--text-muted)', border: '1px solid var(--border)', fontFamily: 'monospace' }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-72 overflow-y-auto py-1">
          {allResults.length === 0 && (
            <p className="px-4 py-6 text-sm text-center" style={{ color: 'var(--text-muted)' }}>
              No results for "{query}"
            </p>
          )}
          {cnmcMatches.length > 0 && (
            <p className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              CNMC Codes
            </p>
          )}
          {allResults.map((item, idx) => (
            <button
              key={item.id + item.type}
              onClick={() => go(item)}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors"
              style={{
                background: cursor === idx ? 'var(--blue-dim)' : 'transparent',
                color: cursor === idx ? 'var(--blue)' : 'var(--text-secondary)',
              }}
              onMouseEnter={() => setCursor(idx)}
            >
              <span className="material-symbols-outlined text-[16px] shrink-0" style={{ color: cursor === idx ? 'var(--blue)' : 'var(--text-muted)' }}>
                {item.icon}
              </span>
              <span className={cursor === idx ? 'font-medium' : ''}>{item.label}</span>
              {item.type === 'cnmc' && (
                <span className="ml-auto text-[11px] font-mono" style={{ color: 'var(--text-muted)' }}>material</span>
              )}
            </button>
          ))}
        </div>

        {/* Footer hint */}
        <div
          className="flex items-center justify-between px-4 py-2 text-[11px]"
          style={{ borderTop: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>ESC Close</span>
        </div>
      </div>
    </div>
  );
};
