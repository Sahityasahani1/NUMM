import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { ScreenFooter } from '../common/FooterLegalModal';
import { CPSE } from '../../types/material';
import { api } from '../../services/api';

/* ─── Mouse-tracking spotlight card ─────────────────────────── */
const SpotlightCard: React.FC<{
  cpse: CPSE;
  index: number;
  syncingId: string | null;
  onSync: (id: string, name: string) => void;
  onClick: (cpse: CPSE) => void;
}> = ({ cpse, index, syncingId, onSync, onClick }) => {
  const { viewPendingReviewsForCpse, viewCatalogueForCpse } = useApp();
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const springY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set(e.clientX - rect.left);
    mouseY.set(e.clientY - rect.top);
  }, [mouseX, mouseY]);

  const cpseColor =
    cpse.name.includes('ONGC') ? '#991B1B' :
    cpse.name.includes('IOCL') ? '#EA580C' :
    cpse.name.includes('GAIL') ? '#15803D' :
    cpse.name.includes('HPCL') ? '#7C3AED' :
    cpse.name.includes('BPCL') ? '#0369A1' :
    '#2563EB';

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick(cpse)}
      style={{ position: 'relative', cursor: 'pointer' }}
      whileHover={{ y: -5, transition: { duration: 0.2, ease: 'easeOut' } }}
      whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
      className="bg-[#0C0E0D] border border-[#232825] rounded-xl p-5 flex flex-col justify-between space-y-4 overflow-hidden select-none"
      layout
    >
      {/* Spotlight glow — follows mouse */}
      <motion.div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          borderRadius: 'inherit',
          background: `radial-gradient(300px circle at ${springX.get()}px ${springY.get()}px, rgba(16,185,129,0.08) 0%, transparent 70%)`,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          zIndex: 0,
        }}
        // Re-render on spring changes
        animate={{
          background: `radial-gradient(300px circle at ${mouseX.get()}px ${mouseY.get()}px, rgba(16,185,129,0.08) 0%, transparent 70%)`,
        }}
      />

      {/* Animated spotlight using CSS custom prop approach */}
      {hovered && (
        <SpotlightFollower mouseX={springX} mouseY={springY} />
      )}

      {/* Card border glow on hover */}
      <motion.div
        style={{
          position: 'absolute',
          inset: -1,
          borderRadius: 'inherit',
          pointerEvents: 'none',
          zIndex: 0,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          boxShadow: '0 0 0 1px rgba(16,185,129,0.25), 0 8px 32px -4px rgba(16,185,129,0.12)',
        }}
      />

      {/* Content — z-index above glow */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold font-mono shrink-0 shadow-sm text-white"
              style={{ background: cpseColor }}
            >
              {cpse.name[0]}
            </div>
            <div>
              <h3 className="font-bold text-sm text-white font-sans">{cpse.name}</h3>
              <p className="text-xs text-[#9CA3AF] truncate max-w-[160px]">{cpse.fullName}</p>
            </div>
          </div>

          <span
            className={`px-2 py-0.5 rounded text-[11px] font-semibold font-mono flex items-center gap-1.5 ${
              cpse.status === 'HEALTHY'
                ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                : 'bg-[#EAB308]/15 text-[#EAB308] border border-[#EAB308]/30'
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${cpse.status === 'HEALTHY' ? 'bg-[#10B981]' : 'bg-[#EAB308]'}`}
              style={{ animation: 'pulse 2s infinite' }}
            />
            {cpse.status}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="rounded-lg p-3 bg-[#070908] border border-[#232825] space-y-2 text-xs font-mono">
          <div className="flex justify-between items-center">
            <span className="text-[#6B7280] font-sans text-[11px]">ERP System</span>
            <span className="font-semibold text-white">{cpse.sourceSystem}</span>
          </div>
          <div
            onClick={(e) => { e.stopPropagation(); onClick(cpse); }}
            className="flex justify-between items-center cursor-pointer hover:bg-white/5 px-1.5 py-1 rounded transition-colors"
            title="Inspect CPSE details modal"
          >
            <span className="text-[#6B7280] font-sans text-[11px] flex items-center gap-1">
              Local Item Codes
              <span className="material-symbols-outlined text-[12px] opacity-60">info</span>
            </span>
            <span className="font-semibold text-[#9CA3AF] underline decoration-dashed decoration-1 underline-offset-2">
              {cpse.totalRecords.toLocaleString()}
            </span>
          </div>
          <div
            onClick={(e) => { e.stopPropagation(); viewCatalogueForCpse(cpse.name); }}
            className="flex justify-between items-center cursor-pointer hover:bg-[#10B981]/10 px-1.5 py-1 rounded transition-colors group"
            title={`Browse approved catalogue entries for ${cpse.name}`}
          >
            <span className="text-[#6B7280] font-sans text-[11px] flex items-center gap-1 group-hover:text-[#10B981]">
              Harmonized CNMC
              <span className="material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
            </span>
            <span className="font-semibold text-[#10B981] group-hover:underline">
              {cpse.mappedRecords.toLocaleString()}
            </span>
          </div>
          <div
            onClick={(e) => { e.stopPropagation(); viewPendingReviewsForCpse(cpse.name); }}
            className="flex justify-between items-center cursor-pointer hover:bg-[#EAB308]/10 px-1.5 py-1 rounded transition-colors group"
            title={`Jump directly to pending review queue for ${cpse.name}`}
          >
            <span className="text-[#6B7280] font-sans text-[11px] flex items-center gap-1 group-hover:text-[#EAB308]">
              Pending Queue
              <span className="material-symbols-outlined text-[12px] opacity-0 group-hover:opacity-100 transition-opacity">arrow_forward</span>
            </span>
            <span className="font-semibold text-[#EAB308] group-hover:underline flex items-center gap-1">
              {cpse.pendingRecords.toLocaleString()}
              <span className="text-[10px] px-1 py-0.2 rounded bg-[#EAB308]/20 text-[#EAB308]">view</span>
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="pt-3">
          <div className="flex justify-between text-xs mb-1.5 font-medium">
            <span className="text-[#9CA3AF]">Harmonization Rate</span>
            <span className="font-mono text-[#10B981] font-bold">{cpse.coveragePercentage}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[#161B18] overflow-hidden">
            <motion.div
              className="h-full bg-[#10B981] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${cpse.coveragePercentage}%` }}
              transition={{ duration: 0.9, delay: index * 0.07 + 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="pt-2 border-t border-[#1B201D] flex items-center justify-between"
        style={{ position: 'relative', zIndex: 1 }}
      >
        <span className="text-[11px] text-[#6B7280]">
          Last Sync: <strong className="text-[#9CA3AF] font-mono">{cpse.lastSync}</strong>
        </span>
        <button
          disabled={syncingId === cpse.id}
          onClick={e => { e.stopPropagation(); onSync(cpse.id, cpse.name); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#F3F4F6] bg-[#070908] border border-[#232825] hover:border-[#38423C] transition-all disabled:opacity-50"
        >
          <span className={`material-symbols-outlined text-[14px] ${syncingId === cpse.id ? 'animate-spin' : ''}`}>
            sync
          </span>
          <span>{syncingId === cpse.id ? 'Syncing...' : 'Trigger Sync'}</span>
        </button>
      </div>
    </motion.div>
  );
};

/* Spotlight that actually tracks mouse via framer spring values */
const SpotlightFollower: React.FC<{ mouseX: any; mouseY: any }> = ({ mouseX, mouseY }) => {
  const [pos, setPos] = useState({ x: 0, y: 0 });

  React.useEffect(() => {
    const unsubX = mouseX.on('change', (v: number) => setPos(p => ({ ...p, x: v })));
    const unsubY = mouseY.on('change', (v: number) => setPos(p => ({ ...p, y: v })));
    return () => { unsubX(); unsubY(); };
  }, [mouseX, mouseY]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        borderRadius: 'inherit',
        zIndex: 0,
        background: `radial-gradient(260px circle at ${pos.x}px ${pos.y}px, rgba(16,185,129,0.07) 0%, transparent 65%)`,
      }}
    />
  );
};

/* ─── Expanded popup overlay ─────────────────────────────────── */
const CPSEDetailPopup: React.FC<{
  cpse: CPSE;
  onClose: () => void;
  syncingId: string | null;
  onSync: (id: string, name: string) => void;
}> = ({ cpse, onClose, syncingId, onSync }) => {
  const { viewPendingReviewsForCpse, viewCatalogueForCpse, setActiveScreen } = useApp();

  const cpseColor =
    cpse.name.includes('ONGC') ? '#991B1B' :
    cpse.name.includes('IOCL') ? '#EA580C' :
    cpse.name.includes('GAIL') ? '#15803D' :
    cpse.name.includes('HPCL') ? '#7C3AED' :
    cpse.name.includes('BPCL') ? '#0369A1' :
    '#2563EB';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(0,0,0,0.7)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.88, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        onClick={e => e.stopPropagation()}
        className="w-full max-w-lg bg-[#0C0E0D] border border-[#232825] rounded-2xl p-6 shadow-2xl"
        style={{ boxShadow: '0 0 0 1px rgba(16,185,129,0.2), 0 32px 64px -16px rgba(0,0,0,0.8)' }}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center text-lg font-bold font-mono text-white shadow-lg"
              style={{ background: cpseColor }}
            >
              {cpse.name[0]}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-sans">{cpse.name}</h2>
              <p className="text-sm text-[#9CA3AF]">{cpse.fullName}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold font-mono flex items-center gap-1.5 ${
                    cpse.status === 'HEALTHY'
                      ? 'bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30'
                      : 'bg-[#EAB308]/15 text-[#EAB308] border border-[#EAB308]/30'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${cpse.status === 'HEALTHY' ? 'bg-[#10B981]' : 'bg-[#EAB308]'}`} />
                  {cpse.status}
                </span>
                <span className="text-[11px] text-[#6B7280] font-mono">{cpse.sourceSystem}</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#6B7280] hover:text-[#F3F4F6] hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Stats 2×2 grid - Fully Clickable Actions */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {[
            {
              label: 'Total Records',
              val: cpse.totalRecords.toLocaleString(),
              color: '#F3F4F6',
              icon: 'database',
              hint: 'View in Master Catalog →',
              action: () => {
                onClose();
                viewCatalogueForCpse(cpse.name);
              }
            },
            {
              label: 'Harmonized',
              val: cpse.mappedRecords.toLocaleString(),
              color: '#10B981',
              icon: 'check_circle',
              hint: 'Inspect Approved CNMCs →',
              action: () => {
                onClose();
                viewCatalogueForCpse(cpse.name);
              }
            },
            {
              label: 'Pending Review',
              val: cpse.pendingRecords.toLocaleString(),
              color: '#EAB308',
              icon: 'pending',
              hint: 'Open Pending Queue →',
              badge: 'Action Required',
              action: () => {
                onClose();
                viewPendingReviewsForCpse(cpse.name);
              }
            },
            {
              label: 'Coverage',
              val: `${cpse.coveragePercentage}%`,
              color: '#10B981',
              icon: 'analytics',
              hint: 'View Analytics & Spend →',
              action: () => {
                onClose();
                setActiveScreen('analytics');
              }
            },
          ].map((stat, i) => (
            <motion.button
              type="button"
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.25 }}
              onClick={stat.action}
              className="bg-[#070908] border border-[#232825] hover:border-[#38423C] rounded-xl p-4 text-left transition-all hover:scale-[1.02] active:scale-[0.98] group cursor-pointer relative overflow-hidden"
              style={{
                boxShadow: stat.label === 'Pending Review' ? '0 0 20px rgba(234,179,8,0.08)' : undefined
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#6B7280] group-hover:text-white transition-colors">
                    {stat.icon}
                  </span>
                  <span className="text-[11px] text-[#6B7280] group-hover:text-[#F3F4F6] font-sans uppercase tracking-wide transition-colors">
                    {stat.label}
                  </span>
                </div>
                <span className="material-symbols-outlined text-[14px] text-[#6B7280] opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                  arrow_forward
                </span>
              </div>
              <div className="text-2xl font-bold font-mono" style={{ color: stat.color }}>
                {stat.val}
              </div>
              <div className="text-[11px] text-[#9CA3AF] mt-2 flex items-center justify-between font-sans">
                <span className="group-hover:text-white transition-colors font-medium">{stat.hint}</span>
                {stat.badge && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#EAB308]/20 text-[#EAB308] font-mono font-semibold">
                    {stat.badge}
                  </span>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mb-5 bg-[#070908] border border-[#232825] rounded-xl p-4">
          <div className="flex justify-between text-xs mb-2 font-medium">
            <span className="text-[#9CA3AF]">Harmonization Progress</span>
            <span className="font-mono text-[#10B981] font-bold">{cpse.coveragePercentage}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#161B18] overflow-hidden">
            <motion.div
              className="h-full bg-[#10B981] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${cpse.coveragePercentage}%` }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#6B7280] mt-1.5 font-mono">
            <span>{cpse.mappedRecords.toLocaleString()} harmonized</span>
            <span>{cpse.pendingRecords.toLocaleString()} remaining</span>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#1B201D]">
          <span className="text-[12px] text-[#6B7280]">
            Last Sync: <strong className="text-[#9CA3AF] font-mono">{cpse.lastSync}</strong>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-xs font-medium text-[#9CA3AF] bg-[#070908] border border-[#232825] hover:border-[#38423C] transition-all"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                viewPendingReviewsForCpse(cpse.name);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-black bg-[#EAB308] hover:brightness-110 transition-all shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">rate_review</span>
              <span>Review {cpse.pendingRecords} Pending</span>
            </button>
            <button
              disabled={syncingId === cpse.id}
              onClick={() => onSync(cpse.id, cpse.name)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-[#000000] bg-[#10B981] hover:brightness-110 transition-all disabled:opacity-50 cursor-pointer"
            >
              <span className={`material-symbols-outlined text-[14px] ${syncingId === cpse.id ? 'animate-spin' : ''}`}>
                sync
              </span>
              {syncingId === cpse.id ? 'Syncing...' : 'Sync'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─── Main screen ────────────────────────────────────────────── */
export const DataHubScreen: React.FC = () => {
  const { cpseList, addAuditLog, openUploadModal, addToast, setActiveScreen, refreshAllData } = useApp();
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [selectedCpse, setSelectedCpse] = useState<CPSE | null>(null);

  const handleTriggerSync = async (cpseId: string, name: string) => {
    setSyncingId(cpseId);
    try {
      const res = await api.triggerCpseSync(cpseId);
      addToast('success', res.message || `Delta sync completed for ${name} (${res.records_analyzed} records).`);
      if (refreshAllData) await refreshAllData();
    } catch (err: any) {
      addToast('error', err?.message || `Failed to sync ${name}`);
    } finally {
      setSyncingId(null);
    }
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
          <span className="text-[#F3F4F6]">CPSE Data Hub</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openUploadModal('ONGC')}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#10B981] text-[#000000] hover:brightness-110 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            <span>Upload Dataset (CSV/XLS)</span>
          </button>
        </div>
      </div>

      {/* 2. Page Title Block */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
          CPSE Data Hub & Connectors
        </h1>
        <p className="text-xs md:text-sm text-[#9CA3AF] leading-relaxed max-w-4xl">
          Real-time integration telemetry with enterprise ERP systems (SAP S/4HANA, Oracle ERP Cloud) and continuous ingestion pipelines.
        </p>
      </div>

      {/* 3. Hero Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-1">
        <div className="lg:col-span-7 space-y-2">
          <h2 className="text-sm font-semibold text-[#F3F4F6] tracking-normal font-sans">
            Enterprise Ingestion Pipeline
          </h2>
          <p className="text-xs text-[#9CA3AF] leading-relaxed font-sans">
            Connectors establish bi-directional sync with participating Central Public Sector Enterprises. Changes in local inventory, purchase requisitions, and specifications are automatically queued for semantic matching against the National Master.
          </p>
        </div>

        <div className="lg:col-span-5 grid grid-cols-3 gap-4 pt-1">
          <div>
            <div className="text-2xl lg:text-3xl font-bold font-sans text-white tracking-tight">{cpseList.length}</div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-1 leading-tight">CPSEs Connected</div>
            <div className="text-[11px] text-[#6B7280] leading-snug">Active DB adapters</div>
          </div>
          <div>
            <div className="text-2xl lg:text-3xl font-bold font-sans text-[#10B981] tracking-tight">100%</div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-1 leading-tight">Pipeline Health</div>
            <div className="text-[11px] text-[#6B7280] leading-snug">All nodes online</div>
          </div>
          <div>
            <div className="text-2xl lg:text-3xl font-bold font-sans text-[#22D3EE] tracking-tight">
              {cpseList.reduce((acc, c) => acc + (c.totalRecords || 0), 0).toLocaleString()}
            </div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-1 leading-tight">Total Ingested</div>
            <div className="text-[11px] text-[#6B7280] leading-snug">SQLite materials</div>
          </div>
        </div>
      </div>

      {/* 4. CPSE Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cpseList.map((cpse, index) => (
          <SpotlightCard
            key={cpse.id}
            cpse={cpse}
            index={index}
            syncingId={syncingId}
            onSync={handleTriggerSync}
            onClick={setSelectedCpse}
          />
        ))}
      </div>

      {/* 5. Footer */}
      <ScreenFooter />

      {/* 6. Detail Popup Overlay */}
      <AnimatePresence>
        {selectedCpse && (
          <CPSEDetailPopup
            cpse={selectedCpse}
            onClose={() => setSelectedCpse(null)}
            syncingId={syncingId}
            onSync={handleTriggerSync}
          />
        )}
      </AnimatePresence>
    </main>
  );
};
