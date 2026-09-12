import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const BackendErrorBanner: React.FC = () => {
  const { backendError, refreshAllData, isLoadingData } = useApp();
  const [dismissed, setDismissed] = useState(false);

  if (!backendError || dismissed) return null;

  return (
    <div
      className="w-full px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b animate-fade-in relative z-20"
      style={{
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderColor: 'rgba(239, 68, 68, 0.3)',
        color: '#F87171',
      }}
    >
      <div className="flex items-start sm:items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            color: '#EF4444',
          }}
        >
          <span className="material-symbols-outlined text-[18px]">cloud_off</span>
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-white tracking-tight font-sans">
              Backend Service Offline
            </span>
            <span
              className="text-[10px] font-mono px-2 py-0.5 rounded"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: '#FECACA',
              }}
            >
              {backendError}
            </span>
          </div>
          <p className="text-[11px] text-[#D1D5DB] mt-0.5 leading-snug">
            Operating in sovereign local cache mode. Start the FastAPI server on port 8000 (<code className="font-mono text-[10px] bg-black/40 px-1 py-0.5 rounded">python -m uvicorn app.main:app --port 8000</code>) for live vector search and sync.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <button
          type="button"
          onClick={() => refreshAllData()}
          disabled={isLoadingData}
          className="h-8 px-3 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm disabled:opacity-50"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#FFFFFF',
          }}
          title="Retry backend connection"
        >
          <span className={`material-symbols-outlined text-[15px] ${isLoadingData ? 'animate-spin' : ''}`}>
            sync
          </span>
          <span>{isLoadingData ? 'Connecting...' : 'Retry Connection'}</span>
        </button>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
          title="Dismiss warning"
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </div>
    </div>
  );
};
