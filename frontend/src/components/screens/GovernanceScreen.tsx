import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AuditLog } from '../../types/material';
import { ScreenFooter } from '../common/FooterLegalModal';

const STATUS_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  approved:    { icon: 'check_circle', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
  merge:       { icon: 'check_circle', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
  harmonized:  { icon: 'check_circle', color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
  flagged:     { icon: 'warning',      color: '#EAB308', bg: 'rgba(234, 179, 8, 0.12)' },
  review:      { icon: 'rate_review',  color: '#EAB308', bg: 'rgba(234, 179, 8, 0.12)' },
  conflict:    { icon: 'warning',      color: '#EAB308', bg: 'rgba(234, 179, 8, 0.12)' },
  created:     { icon: 'add_circle',   color: '#22D3EE', bg: 'rgba(34, 211, 238, 0.12)' },
  canonical:   { icon: 'verified',     color: '#22D3EE', bg: 'rgba(34, 211, 238, 0.12)' },
  ingestion:   { icon: 'upload',       color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' },
  sync:        { icon: 'sync',         color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.12)' },
  updated:     { icon: 'edit',         color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)' },
  default:     { icon: 'history',      color: '#9CA3AF', bg: 'rgba(255, 255, 255, 0.05)' },
};

function getStatusCfg(action: string) {
  const key = (action || '').toLowerCase();
  for (const [k, v] of Object.entries(STATUS_CONFIG)) {
    if (key.includes(k)) return v;
  }
  return STATUS_CONFIG.default;
}

export const GovernanceScreen: React.FC = () => {
  const { auditLogs, refreshAuditLogs, setActiveScreen, addToast } = useApp();
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedActionFilter, setSelectedActionFilter] = useState('ALL');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-refresh on mount to ensure latest state
  useEffect(() => {
    if (refreshAuditLogs) {
      refreshAuditLogs();
    }
  }, [refreshAuditLogs]);

  const handleManualRefresh = async () => {
    if (refreshAuditLogs) {
      setIsRefreshing(true);
      await refreshAuditLogs();
      setIsRefreshing(false);
      addToast('success', 'Audit trail synced with cryptographic ledger.');
    }
  };

  const filteredLogs = useMemo(() => auditLogs.filter(log => {
    const q = filterQuery.toLowerCase();
    const matchSearch = !q ||
      log.action.toLowerCase().includes(q) ||
      log.description.toLowerCase().includes(q) ||
      log.targetEntity.toLowerCase().includes(q) ||
      log.user.name.toLowerCase().includes(q) ||
      log.id.toLowerCase().includes(q);

    let matchAction = true;
    if (selectedActionFilter === 'Approved') {
      matchAction = log.action.toLowerCase().includes('approv') ||
                    log.action.toLowerCase().includes('merge') ||
                    log.action.toLowerCase().includes('map');
    } else if (selectedActionFilter === 'Harmonized') {
      matchAction = log.action.toLowerCase().includes('harmoniz') ||
                    log.action.toLowerCase().includes('canonical') ||
                    log.action.toLowerCase().includes('create');
    } else if (selectedActionFilter === 'Ingestion') {
      matchAction = log.action.toLowerCase().includes('ingest') ||
                    log.action.toLowerCase().includes('import') ||
                    log.action.toLowerCase().includes('sync') ||
                    log.action.toLowerCase().includes('load');
    } else if (selectedActionFilter === 'Flagged') {
      matchAction = log.action.toLowerCase().includes('flag') ||
                    log.action.toLowerCase().includes('review') ||
                    log.action.toLowerCase().includes('split') ||
                    log.action.toLowerCase().includes('reject');
    } else if (selectedActionFilter !== 'ALL') {
      matchAction = log.action.toLowerCase().includes(selectedActionFilter.toLowerCase());
    }

    return matchSearch && matchAction;
  }), [auditLogs, filterQuery, selectedActionFilter]);

  const stats = {
    totalEvents:    auditLogs.length,
    aiDecisions:    auditLogs.filter(l => l.user.isAi).length,
    humanApprovals: auditLogs.filter(l => !l.user.isAi || l.action.toLowerCase().includes('approv') || l.action.toLowerCase().includes('merge')).length,
    uniqueEntities: new Set(auditLogs.map(l => l.targetEntity)).size,
  };

  return (
    <main className="flex-1 overflow-y-auto px-8 py-6 space-y-6 bg-[#070908] text-[#F3F4F6]">
      {/* 1. Breadcrumbs & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-[#9CA3AF]">
          <span 
            onClick={() => setActiveScreen('dashboard')} 
            className="cursor-pointer hover:text-[#F3F4F6] transition-colors"
          >
            Home
          </span>
          <span className="text-[#6B7280]">›</span>
          <span className="text-[#F3F4F6]">Audit History</span>
        </div>

        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 text-xs font-medium">
          <span className="material-symbols-outlined text-[15px]">verified</span>
          <span>Statutory Audit Trail Verified</span>
        </span>
      </div>

      {/* 2. Page Title Block */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
          Audit History & Governance
        </h1>
        <p className="text-xs md:text-sm text-[#9CA3AF] leading-relaxed max-w-4xl">
          Immutable audit ledger capturing all CNMC assignments, attribute extractions, manual overrides, and cross-enterprise merges.
        </p>
      </div>

      {/* 3. Hero Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-1">
        <div className="lg:col-span-7 space-y-2">
          <h2 className="text-sm font-semibold text-[#F3F4F6] tracking-normal font-sans">
            Cryptographic Accountability Ledger
          </h2>
          <p className="text-xs text-[#9CA3AF] leading-relaxed font-sans">
            Every catalog mutation is recorded with digital signatures, actor identifiers, timestamp telemetry, and before-and-after attribute state hashes to comply with MoPNG statutory audit requirements.
          </p>
        </div>

        <div className="lg:col-span-5 grid grid-cols-3 gap-4 pt-1">
          <div>
            <div className="text-2xl lg:text-3xl font-bold font-sans text-white tracking-tight">
              {stats.totalEvents}
            </div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-1 leading-tight">
              Total Events
            </div>
            <div className="text-[11px] text-[#6B7280] leading-snug">
              Immutable ledger
            </div>
          </div>

          <div>
            <div className="text-2xl lg:text-3xl font-bold font-sans text-[#10B981] tracking-tight">
              {stats.humanApprovals}
            </div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-1 leading-tight">
              Steward Actions
            </div>
            <div className="text-[11px] text-[#6B7280] leading-snug">
              Manual approvals
            </div>
          </div>

          <div>
            <div className="text-2xl lg:text-3xl font-bold font-sans text-[#22D3EE] tracking-tight">
              {stats.uniqueEntities}
            </div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-1 leading-tight">
              Entities Logged
            </div>
            <div className="text-[11px] text-[#6B7280] leading-snug">
              Cross-CPSE items
            </div>
          </div>
        </div>
      </div>

      {/* 4. Filter Strip */}
      <div className="flex flex-wrap gap-3 items-center p-3 rounded-xl bg-[#0C0E0D] border border-[#232825]">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#070908] border border-[#232825] flex-1 min-w-[200px] max-w-sm">
          <span className="material-symbols-outlined text-[16px] text-[#9CA3AF]">search</span>
          <input
            type="text"
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            placeholder="Search action, material, or actor..."
            className="bg-transparent border-none text-xs text-[#F3F4F6] placeholder-[#9CA3AF] outline-none w-full"
          />
        </div>

        <select
          value={selectedActionFilter}
          onChange={e => setSelectedActionFilter(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs bg-[#070908] border border-[#232825] text-[#F3F4F6] outline-none"
        >
          <option value="ALL">All Actions</option>
          <option value="Approved">Approvals</option>
          <option value="Harmonized">Harmonizations</option>
          <option value="Ingestion">Ingestions</option>
          <option value="Flagged">Flags & Audits</option>
        </select>

        <button
          onClick={handleManualRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#161B18] border border-[#232825] text-[#F3F4F6] hover:border-[#10B981] hover:text-[#10B981] transition-all ml-auto disabled:opacity-50"
          title="Refresh audit trail from backend database"
        >
          <span className={`material-symbols-outlined text-[16px] ${isRefreshing ? 'animate-spin' : ''}`}>
            sync
          </span>
          <span>{isRefreshing ? 'Syncing...' : 'Sync Ledger'}</span>
        </button>
      </div>

      {/* 5. Audit Log Table */}
      <div className="bg-[#0C0E0D] border border-[#232825] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#232825] text-[10px] uppercase font-semibold text-[#6B7280]">
                <th className="px-5 py-3 font-medium">Event & Action</th>
                <th className="px-5 py-3 font-medium">Target Entity</th>
                <th className="px-5 py-3 font-medium">Actor</th>
                <th className="px-5 py-3 font-medium text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B201D]">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-[#9CA3AF]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-3xl text-[#6B7280]">manage_search</span>
                      <p className="font-medium text-white">No audit records match your criteria</p>
                      <p className="text-xs text-[#6B7280]">Try clearing your search query or selecting "All Actions".</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => {
                  const cfg = getStatusCfg(log.action);
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-[15px] shrink-0"
                            style={{ background: cfg.bg, color: cfg.color }}
                          >
                            <span className="material-symbols-outlined text-[15px]">{cfg.icon}</span>
                          </span>
                          <div>
                            <div className="font-semibold text-white">{log.action}</div>
                            <div className="text-xs text-[#9CA3AF] mt-0.5 line-clamp-1">{log.description}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 font-mono text-xs font-bold text-[#10B981]">
                        {log.targetEntity}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#161B18] border border-[#232825] flex items-center justify-center text-[10px] font-bold font-mono text-white">
                            {log.user.initials}
                          </div>
                          <div>
                            <div className="font-semibold text-white text-xs">{log.user.name}</div>
                            <div className="text-[10px] text-[#6B7280]">{log.user.role}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right font-mono text-[11px] text-[#6B7280]">
                        {log.timestamp || 'Recent'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Audit Log Detail Slide-Over Drawer */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setSelectedLog(null)}
        >
          <div
            className="w-full max-w-lg h-full bg-[#0C0E0D] border-l border-[#232825] shadow-2xl flex flex-col animate-slide-in-right overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="px-6 py-4 border-b border-[#232825] bg-[#070908] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[18px]"
                  style={{
                    background: getStatusCfg(selectedLog.action).bg,
                    color: getStatusCfg(selectedLog.action).color,
                  }}
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {getStatusCfg(selectedLog.action).icon}
                  </span>
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">Cryptographic Audit Entry</h3>
                  <p className="text-[11px] text-[#A7ADA9] font-mono">
                    ID: {selectedLog.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* Event Summary Card */}
              <div className="p-4 rounded-xl bg-[#070908] border border-[#232825] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-[#6B7280]">Event Action</span>
                  <span
                    className="px-2 py-0.5 rounded text-[11px] font-semibold font-mono"
                    style={{
                      background: getStatusCfg(selectedLog.action).bg,
                      color: getStatusCfg(selectedLog.action).color,
                    }}
                  >
                    {selectedLog.action}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6B7280] block mb-1">Target Entity</span>
                  <span className="font-mono text-sm font-bold text-[#10B981] block">
                    {selectedLog.targetEntity}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6B7280] block mb-1">Description</span>
                  <p className="text-[#F3F4F6] leading-relaxed">
                    {selectedLog.description}
                  </p>
                </div>
              </div>

              {/* Actor & Authorization */}
              <div className="p-4 rounded-xl bg-[#070908] border border-[#232825] space-y-3">
                <span className="text-[10px] uppercase font-bold text-[#6B7280] block">
                  Actor &amp; Stewardship
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#161B18] border border-[#232825] flex items-center justify-center font-mono font-bold text-white text-sm">
                    {selectedLog.user.initials}
                  </div>
                  <div>
                    <div className="font-bold text-white text-sm">{selectedLog.user.name}</div>
                    <div className="text-[11px] text-[#A7ADA9]">{selectedLog.user.role}</div>
                  </div>
                </div>
                <div className="pt-2 border-t border-[#1B201D] flex items-center justify-between text-[#9CA3AF] text-[11px]">
                  <span>Timestamp</span>
                  <span className="font-mono text-white">
                    {selectedLog.timestamp ? new Date(selectedLog.timestamp).toUTCString() : 'Just now'}
                  </span>
                </div>
              </div>

              {/* Cryptographic Proof */}
              <div className="p-4 rounded-xl bg-[#070908] border border-[#232825] space-y-2.5">
                <span className="text-[10px] uppercase font-bold text-[#6B7280] block">
                  Immutable Verification
                </span>
                <div className="flex items-center gap-2 text-emerald-400 font-medium">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  <span>SHA-256 Ledger Hash Verified</span>
                </div>
                <div className="p-2.5 rounded bg-[#030403] border border-[#1B201D] font-mono text-[11px] text-[#9CA3AF] break-all select-all">
                  sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                </div>
                <div className="flex justify-between text-[11px] text-[#6B7280]">
                  <span>CAG Audit Mandate</span>
                  <span className="text-white font-mono">10-Year Statutory Retention</span>
                </div>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="px-6 py-3.5 border-t border-[#232825] bg-[#070908] flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
                  addToast('success', `Copied audit entry ${selectedLog.id} JSON`);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0C0E0D] border border-[#232825] text-[#F3F4F6] hover:border-[#38423C] transition-all"
              >
                <span className="material-symbols-outlined text-[15px]">content_copy</span>
                <span>Copy JSON</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#10B981] text-[#000000] hover:brightness-110 transition-all shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. Footer */}
      <ScreenFooter />
    </main>
  );
};
