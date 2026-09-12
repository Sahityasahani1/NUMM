import React from 'react';
import { useApp } from '../../context/AppContext';
import { AnimatedThemeToggle } from '@/components/ui/animated-theme-toggle';

export const TopAppBar: React.FC = () => {
  const {
    globalSearch,
    setSearchOpen,
    openUploadModal,
    reviewQueue,
    setActiveScreen,
  } = useApp();

  return (
    <header
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        color: 'var(--text-primary)',
      }}
      className="app-header flex items-center justify-between px-8 h-16 shrink-0 z-30"
    >
      {/* Search Bar */}
      <div className="flex-1 max-w-xl">
        <div
          onClick={() => setSearchOpen(true)}
          className="relative flex items-center cursor-pointer group"
        >
          <span
            className="material-symbols-outlined absolute left-3.5 text-[18px] pointer-events-none transition-colors"
            style={{ color: 'var(--text-muted)' }}
          >
            search
          </span>
          <input
            readOnly
            value={globalSearch}
            placeholder="Search materials, CNMC codes, CPSEs..."
            style={{
              backgroundColor: 'var(--bg-input)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}
            className="w-full pl-10 pr-10 py-2 text-xs md:text-sm rounded-lg outline-none transition-all cursor-pointer font-sans placeholder-[color:var(--text-muted)]"
          />
          <kbd
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border)',
              color: 'var(--text-muted)',
            }}
            className="absolute right-3 px-1.5 py-0.5 rounded text-[11px] font-mono pointer-events-none"
          >
            /
          </kbd>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3 ml-6">
        {/* Download Project Documentation Button */}
        <a
          href="/NUMM_National_Unified_Material_Master_Documentation.docx"
          download="NUMM_National_Unified_Material_Master_Documentation.docx"
          title="Download Complete Project Documentation (.docx)"
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-pointer group"
        >
          <span className="material-symbols-outlined text-[16px] text-emerald-400 group-hover:translate-y-0.5 transition-transform">
            download
          </span>
          <span className="font-mono text-[11px] font-bold">Download Docs (.docx)</span>
        </a>

        {/* Upload Dataset Button */}
        <button
          onClick={() => openUploadModal('ONGC')}
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border)',
            color: 'var(--text-primary)',
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shadow-sm hover:opacity-80"
        >
          <span
            className="material-symbols-outlined text-[16px]"
            style={{ color: 'var(--text-muted)' }}
          >
            upload
          </span>
          <span>Upload</span>
        </button>

        {/* Notifications */}
        <button
          onClick={() => setActiveScreen('review')}
          style={{ color: 'var(--text-secondary)' }}
          className="relative p-2 rounded-lg transition-colors hover:opacity-80"
          title="Review Queue"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
          {reviewQueue.length > 0 && (
            <span
              className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#10B981]"
              style={{ boxShadow: '0 0 0 2px var(--bg-surface)' }}
            />
          )}
        </button>

        {/* Animated Dark / Light Theme Toggle */}
        <AnimatedThemeToggle className="h-8 w-8 p-0 shrink-0" />

        {/* User Profile Badge */}
        <div
          onClick={() => setActiveScreen('settings')}
          className="flex items-center gap-3 pl-2 py-1 cursor-pointer group select-none"
        >
          <div className="w-8 h-8 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold font-sans shadow-sm shrink-0">
            KS
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span
              className="text-xs font-semibold leading-tight transition-colors"
              style={{ color: 'var(--text-primary)' }}
            >
              Krishna Somani
            </span>
            <span
              className="text-[11px] font-medium leading-tight"
              style={{ color: 'var(--text-secondary)' }}
            >
              CPSE User
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
