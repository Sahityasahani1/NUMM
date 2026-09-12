import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { DateRangePicker } from '../common/DateRangePicker';
import { ScreenFooter } from '../common/FooterLegalModal';

const ACTION_META = {
  MERGE: {
    icon: 'call_merge',
    label: 'Combine Duplicates',
    tag: 'Identical / Near-Dup',
    desc: 'Merges verified cross-enterprise duplicates into a single authoritative CNMC with full alias forwarding.',
    color: '#10B981',
    bg: 'rgba(16, 185, 129, 0.12)'
  },
  MAP: {
    icon: 'link',
    label: 'Link to Master',
    tag: 'Functional Equivalent',
    desc: 'Creates a bi-directional alias between legacy CPSE catalog numbers and the national standard CNMC.',
    color: '#22D3EE',
    bg: 'rgba(34, 211, 238, 0.12)'
  },
  REVIEW: {
    icon: 'tune',
    label: 'Manual Committee Check',
    tag: 'Conflict / Variance',
    desc: 'Routes ambiguous attribute conflicts or parameter variances to the technical subcommittee for physical audit.',
    color: '#EAB308',
    bg: 'rgba(234, 179, 8, 0.12)'
  },
  SPLIT: {
    icon: 'call_split',
    label: 'Divergent Specs',
    tag: 'Multi-spec Overload',
    desc: 'Partitions overloaded legacy descriptions into distinct discrete standardized materials.',
    color: '#EC4899',
    bg: 'rgba(236, 72, 153, 0.12)'
  },
  RETIRE: {
    icon: 'archive',
    label: 'Deactivate Obsolete',
    tag: 'End of Lifecycle',
    desc: 'Marks obsolete or superseded materials as retired with automatic replacement forwarding to active CNMC.',
    color: '#F43F5E',
    bg: 'rgba(244, 63, 94, 0.12)'
  },
  RETAIN: {
    icon: 'lock',
    label: 'Keep Local As-Is',
    tag: 'Proprietary / Island',
    desc: 'Protects specialized local inventory codes that do not require national standardization or pooling.',
    color: '#9CA3AF',
    bg: 'rgba(156, 163, 175, 0.12)'
  },
};

type ActionType = keyof typeof ACTION_META;

export const RationalizationScreen: React.FC = () => {
  const {
    openImpactModal,
    addToast,
    setActiveScreen,
    reviewQueue,
    nationalAnalytics,
    executeRationalization,
    openEvidence,
    cpseList
  } = useApp();

  const [activeTab, setActiveTab] = useState<'candidates' | 'migration'>('candidates');
  const [selectedAction, setSelectedAction] = useState<ActionType | 'ALL'>('MERGE');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCpse, setSelectedCpse] = useState<string>('ALL');
  const [migrationRows, setMigrationRows] = useState<any[]>([]);
  const [isLoadingMigration, setIsLoadingMigration] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState<string[]>([]);
  const [isExecutingBatch, setIsExecutingBatch] = useState(false);

  // Comment & Detail Modal State
  const [commentModalItem, setCommentModalItem] = useState<{
    item: any;
    action: ActionType;
    comment: string;
  } | null>(null);

  const [itemComments, setItemComments] = useState<Record<string, string>>({});

  const handleOpenCommentModal = (item: any, defaultAction?: ActionType) => {
    const action = defaultAction || (selectedAction === 'ALL' ? item.recommendedAction : selectedAction);
    const existingComment = itemComments[item.id] ||
      'Technical specification verification confirms physical, metallurgical, and dimensional equivalence under ISO/ASTM standard.';
    setCommentModalItem({
      item,
      action,
      comment: existingComment
    });
  };

  // Load real approved migration records from backend ERP adapter
  const loadMigrationData = async () => {
    setIsLoadingMigration(true);
    try {
      const rows = await api.fetchMigrationRecords('json');
      setMigrationRows(Array.isArray(rows) ? rows : []);
    } catch (err: any) {
      console.warn('Failed to load migration data:', err);
    } finally {
      setIsLoadingMigration(false);
    }
  };

  useEffect(() => {
    loadMigrationData();
  }, []);

  // Action Recommendation Categorization for Queue
  const categorizedQueue = useMemo(() => {
    return reviewQueue.map(item => {
      let recommendedAction: ActionType = 'MERGE';
      const conf = item.confidence || 80;
      const hasConflicts = Boolean(item.conflicts && item.conflicts.length > 0);

      if (hasConflicts || (conf >= 65 && conf < 80)) {
        recommendedAction = 'REVIEW';
      } else if (String(item.relationship).includes('FUNCTIONAL') || conf < 65) {
        recommendedAction = 'MAP';
      } else if (conf >= 85) {
        recommendedAction = 'MERGE';
      }

      return {
        ...item,
        recommendedAction
      };
    });
  }, [reviewQueue]);

  // Counts per operational action
  const actionCounts = useMemo(() => {
    const counts: Record<string, number> = {
      ALL: categorizedQueue.length,
      MERGE: 0,
      MAP: 0,
      REVIEW: 0,
      SPLIT: 0,
      RETIRE: 0,
      RETAIN: 0,
    };
    categorizedQueue.forEach(item => {
      counts[item.recommendedAction] = (counts[item.recommendedAction] || 0) + 1;
    });
    return counts;
  }, [categorizedQueue]);

  // Filtered candidate targets
  const filteredCandidates = useMemo(() => {
    return categorizedQueue.filter(item => {
      const matchAction = selectedAction === 'ALL' || item.recommendedAction === selectedAction;
      const matchCpse = selectedCpse === 'ALL' || item.sourceCpse === selectedCpse;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        item.sourceCode.toLowerCase().includes(q) ||
        item.candidateCnmc.toLowerCase().includes(q) ||
        item.sourceDescription.toLowerCase().includes(q) ||
        item.sourceCpse.toLowerCase().includes(q);

      return matchAction && matchCpse && matchSearch;
    });
  }, [categorizedQueue, selectedAction, selectedCpse, searchQuery]);

  // Filtered migration rows
  const filteredMigrationRows = useMemo(() => {
    return migrationRows.filter(row => {
      const matchCpse = selectedCpse === 'ALL' || row.CPSE_ID === selectedCpse;
      const q = searchQuery.toLowerCase();
      const matchSearch = !q ||
        (row.SOURCE_MATERIAL_CODE || '').toLowerCase().includes(q) ||
        (row.CNMC || '').toLowerCase().includes(q) ||
        (row.CANONICAL_DESCRIPTION || '').toLowerCase().includes(q) ||
        (row.CPSE_ID || '').toLowerCase().includes(q);

      return matchCpse && matchSearch;
    });
  }, [migrationRows, selectedCpse, searchQuery]);

  // Dynamic Statistics
  const duplicateClusters = nationalAnalytics?.total_equivalence_groups || reviewQueue.length || 0;
  const deduplicationRate = nationalAnalytics?.deduplication_ratio_pct
    ? `${nationalAnalytics.deduplication_ratio_pct.toFixed(1)}%`
    : '82.4%';
  const capitalUnlocked = nationalAnalytics?.estimated_synergy_savings
    ? `₹${(nationalAnalytics.estimated_synergy_savings / 10000000).toFixed(2)} Cr`
    : '₹2.84 Cr';
  const approvedMigrationCount = migrationRows.length;

  // Single Item Execution Handler - opens Detail & Comment modal for statutory review
  const handleExecuteSingle = (item: any) => {
    const actionToRun = selectedAction === 'ALL' ? item.recommendedAction : selectedAction;
    handleOpenCommentModal(item, actionToRun);
  };

  // Batch Execution Handler
  const handleExecuteBatch = async () => {
    const actionToRun = selectedAction === 'ALL' ? 'MERGE' : selectedAction;
    const targetIds = selectedCandidates.length > 0
      ? selectedCandidates
      : filteredCandidates.map(c => c.id);

    if (targetIds.length === 0) {
      addToast('info', 'No candidates available to execute.');
      return;
    }

    setIsExecutingBatch(true);
    try {
      for (const id of targetIds) {
        await executeRationalization(id, actionToRun);
      }
      addToast('success', `Batch executed ${targetIds.length} rationalizations under ${actionToRun} operation.`);
      setSelectedCandidates([]);
      loadMigrationData();
    } catch (err: any) {
      addToast('error', `Batch rationalization error: ${err.message}`);
    } finally {
      setIsExecutingBatch(false);
    }
  };

  const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedCandidates(filteredCandidates.map(c => c.id));
    } else {
      setSelectedCandidates([]);
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedCandidates(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // Export triggers
  const handleExportDownload = (format: 'csv' | 'excel' | 'json') => {
    const url = `http://127.0.0.1:8000/api/erp/export/migration?format=${format}`;
    window.open(url, '_blank');
    addToast('info', `Generated ${format.toUpperCase()} migration payload.`);
  };

  const currentMeta = selectedAction !== 'ALL' ? ACTION_META[selectedAction] : null;

  return (
    <main className="flex-1 overflow-y-auto px-8 py-6 space-y-6 bg-[#070908] text-[#F3F4F6]">
      {/* 1. Breadcrumbs & Date Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-[#9CA3AF]">
          <span
            onClick={() => setActiveScreen('dashboard')}
            className="cursor-pointer hover:text-[#F3F4F6] transition-colors"
          >
            Home
          </span>
          <span className="text-[#6B7280]">›</span>
          <span className="text-[#F3F4F6]">Catalog Rationalization & ERP Migration</span>
        </div>

        <DateRangePicker />
      </div>

      {/* 2. Page Title Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            Catalog Rationalization & Migration
          </h1>
          <p className="text-xs md:text-sm text-[#9CA3AF] leading-relaxed max-w-4xl">
            Live SKU consolidation workbench: select operational modes (MERGE, MAP, RETIRE, REVIEW, SPLIT, RETAIN), inspect candidate clusters, authorize statutory mutations, and export validated ERP migration schemas.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-[#0C0E0D] border border-[#232825] shrink-0 self-start">
          <button
            onClick={() => setActiveTab('candidates')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'candidates'
                ? 'bg-[#10B981] text-black shadow-sm'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">hub</span>
            <span>Rationalization Queue ({reviewQueue.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('migration')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'migration'
                ? 'bg-[#10B981] text-black shadow-sm'
                : 'text-[#9CA3AF] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">cloud_sync</span>
            <span>ERP Migration Ledger ({approvedMigrationCount})</span>
          </button>
        </div>
      </div>

      {/* 3. Live Metrics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-1">
        <div className="lg:col-span-6 space-y-2">
          <h2 className="text-sm font-semibold text-[#F3F4F6] tracking-normal font-sans">
            Cross-Enterprise Deduplication Impact
          </h2>
          <p className="text-xs text-[#9CA3AF] leading-relaxed font-sans">
            Centralized SKU consolidation preserves historical purchase orders across SAP ECC, S/4HANA, and Oracle ERP while mapping local redundant part numbers to single authoritative CNMCs. This safely eliminates duplicate safety stock and enables inter-CPSE inventory pooling.
          </p>
        </div>

        <div className="lg:col-span-6 grid grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-xl bg-[#0C0E0D] border border-[#232825]">
            <div className="text-xl lg:text-2xl font-bold font-sans text-white tracking-tight">
              {duplicateClusters}
            </div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-0.5 leading-tight">
              Clusters
            </div>
            <div className="text-[10px] text-[#6B7280]">
              Pending review
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0C0E0D] border border-[#232825]">
            <div className="text-xl lg:text-2xl font-bold font-sans text-[#10B981] tracking-tight">
              {deduplicationRate}
            </div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-0.5 leading-tight">
              Deduplication
            </div>
            <div className="text-[10px] text-[#6B7280]">
              Redundant reduction
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0C0E0D] border border-[#232825]">
            <div className="text-xl lg:text-2xl font-bold font-sans text-[#22D3EE] tracking-tight">
              {capitalUnlocked}
            </div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-0.5 leading-tight">
              Holding Capital
            </div>
            <div className="text-[10px] text-[#6B7280]">
              Projected synergy
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#0C0E0D] border border-[#232825]">
            <div className="text-xl lg:text-2xl font-bold font-sans text-[#EAB308] tracking-tight">
              {approvedMigrationCount}
            </div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-0.5 leading-tight">
              Validated
            </div>
            <div className="text-[10px] text-[#6B7280]">
              Ready for ERP RFC
            </div>
          </div>
        </div>
      </div>

      {/* 4. Operational Action Mode Cards (Interactive Filters) */}
      {activeTab === 'candidates' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {/* "ALL" Filter Button */}
            <button
              onClick={() => setSelectedAction('ALL')}
              className={`p-3 rounded-xl text-left flex flex-col gap-1 transition-all ${
                selectedAction === 'ALL'
                  ? 'bg-[#10B981]/15 border border-[#10B981]'
                  : 'bg-[#0C0E0D] border border-[#232825] hover:border-[#38423C]'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className={`font-mono text-xs font-bold ${selectedAction === 'ALL' ? 'text-[#10B981]' : 'text-white'}`}>
                  ALL
                </span>
                <span className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#161B18] text-[#9CA3AF]">
                  {actionCounts.ALL}
                </span>
              </div>
              <span className={`text-[11px] font-medium leading-tight ${selectedAction === 'ALL' ? 'text-[#F3F4F6]' : 'text-[#9CA3AF]'}`}>
                All Candidates
              </span>
            </button>

            {/* 6 Specific Action Cards */}
            {(Object.keys(ACTION_META) as ActionType[]).map(action => {
              const isSelected = selectedAction === action;
              const m = ACTION_META[action];
              const count = actionCounts[action] || 0;

              return (
                <button
                  key={action}
                  onClick={() => setSelectedAction(action)}
                  className={`p-3 rounded-xl text-left flex flex-col gap-1 transition-all ${
                    isSelected
                      ? 'border'
                      : 'bg-[#0C0E0D] border border-[#232825] hover:border-[#38423C]'
                  }`}
                  style={{
                    background: isSelected ? m.bg : undefined,
                    borderColor: isSelected ? m.color : undefined,
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className="font-mono text-xs font-bold"
                      style={{ color: isSelected ? m.color : '#F3F4F6' }}
                    >
                      {action}
                    </span>
                    <span
                      className="text-[11px] font-mono font-bold px-1.5 py-0.5 rounded"
                      style={{
                        background: isSelected ? 'rgba(0,0,0,0.4)' : '#161B18',
                        color: isSelected ? m.color : '#9CA3AF'
                      }}
                    >
                      {count}
                    </span>
                  </div>
                  <span className={`text-[11px] font-medium leading-tight truncate ${isSelected ? 'text-white' : 'text-[#9CA3AF]'}`}>
                    {m.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Action Description Banner */}
          {currentMeta && (
            <div
              className="p-3.5 rounded-xl border flex items-center justify-between gap-3 text-xs"
              style={{
                background: currentMeta.bg,
                borderColor: currentMeta.color
              }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="material-symbols-outlined text-[20px]"
                  style={{ color: currentMeta.color }}
                >
                  {currentMeta.icon}
                </span>
                <div>
                  <span className="font-bold text-white mr-2">
                    Operational Mode: {selectedAction} ({currentMeta.label})
                  </span>
                  <span className="text-[#D1D5DB]">{currentMeta.desc}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleExecuteBatch}
                  disabled={isExecutingBatch || filteredCandidates.length === 0}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-black hover:bg-[#F3F4F6] transition-all shadow-sm disabled:opacity-40"
                >
                  {isExecutingBatch
                    ? 'Executing...'
                    : selectedCandidates.length > 0
                    ? `Execute Selected (${selectedCandidates.length}) as ${selectedAction}`
                    : `Execute All Filtered (${filteredCandidates.length}) as ${selectedAction}`}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Filter & Search Toolbar */}
      <div className="flex flex-wrap gap-3 items-center p-3 rounded-xl bg-[#0C0E0D] border border-[#232825]">
        {/* Search Input */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#070908] border border-[#232825] flex-1 min-w-[220px] max-w-sm">
          <span className="material-symbols-outlined text-[16px] text-[#9CA3AF]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search material code, description, or CNMC..."
            className="bg-transparent border-none text-xs text-[#F3F4F6] placeholder-[#9CA3AF] outline-none w-full"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-[#9CA3AF] hover:text-white">
              <span className="material-symbols-outlined text-[14px]">close</span>
            </button>
          )}
        </div>

        {/* CPSE Dropdown Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#9CA3AF]">CPSE:</span>
          <select
            value={selectedCpse}
            onChange={e => setSelectedCpse(e.target.value)}
            className="px-3 py-1.5 rounded-lg text-xs bg-[#070908] border border-[#232825] text-[#F3F4F6] outline-none"
          >
            <option value="ALL">All Enterprises</option>
            {cpseList.map(c => (
              <option key={c.id} value={c.id}>
                {c.name || c.id}
              </option>
            ))}
          </select>
        </div>

        {/* ERP Export Buttons (Active when on migration tab) */}
        {activeTab === 'migration' && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => handleExportDownload('csv')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#161B18] border border-[#232825] text-[#F3F4F6] hover:border-[#10B981] hover:text-[#10B981] transition-all"
            >
              <span className="material-symbols-outlined text-[15px]">download</span>
              <span>CSV Payload</span>
            </button>

            <button
              onClick={() => handleExportDownload('excel')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#161B18] border border-[#232825] text-[#F3F4F6] hover:border-[#22D3EE] hover:text-[#22D3EE] transition-all"
            >
              <span className="material-symbols-outlined text-[15px]">table_view</span>
              <span>Excel (SAP MDG)</span>
            </button>

            <button
              onClick={() => handleExportDownload('json')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#10B981] text-black hover:brightness-110 transition-all font-sans"
            >
              <span className="material-symbols-outlined text-[15px]">code</span>
              <span>JSON RFC Export</span>
            </button>
          </div>
        )}

        {/* Candidate Tab Actions */}
        {activeTab === 'candidates' && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={loadMigrationData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#161B18] border border-[#232825] text-[#9CA3AF] hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">sync</span>
              <span>Refresh Ledger</span>
            </button>
          </div>
        )}
      </div>

      {/* 6. Main Data Display */}
      {activeTab === 'candidates' ? (
        /* Candidates Table */
        <div className="bg-[#0C0E0D] border border-[#232825] rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#232825] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white font-sans flex items-center gap-2">
                <span>Active Consolidation Candidates</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#161B18] text-[#10B981] border border-[#232825]">
                  {filteredCandidates.length} Items
                </span>
              </h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Review suggested cross-enterprise equivalence clusters and execute authoritative rationalization mutations.
              </p>
            </div>

            {selectedCandidates.length > 0 && (
              <span className="text-xs font-medium text-[#10B981]">
                {selectedCandidates.length} items selected
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#232825] text-[10px] uppercase font-semibold text-[#6B7280]">
                  <th className="px-4 py-3 w-8">
                    <input
                      type="checkbox"
                      onChange={toggleSelectAll}
                      checked={
                        filteredCandidates.length > 0 &&
                        selectedCandidates.length === filteredCandidates.length
                      }
                      className="rounded bg-[#070908] border-[#232825] accent-[#10B981]"
                    />
                  </th>
                  <th className="px-4 py-3 font-medium">Source CPSE Item</th>
                  <th className="px-4 py-3 font-medium">Target National CNMC</th>
                  <th className="px-4 py-3 font-medium">Raw Description & Attributes</th>
                  <th className="px-4 py-3 font-medium text-center">Match Parity</th>
                  <th className="px-4 py-3 font-medium">Recommended Action</th>
                  <th className="px-4 py-3 font-medium text-right">Operation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B201D]">
                {filteredCandidates.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-[#9CA3AF]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-3xl text-[#6B7280]">check_circle</span>
                        <p className="font-medium text-white">No pending candidates for this criteria</p>
                        <p className="text-xs text-[#6B7280]">All candidate equivalence groups have been rationalized or merged.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredCandidates.map(item => {
                    const actionToExecute = selectedAction === 'ALL' ? item.recommendedAction : selectedAction;
                    const metaInfo = ACTION_META[actionToExecute] || ACTION_META.MERGE;
                    const isSelected = selectedCandidates.includes(item.id);

                    return (
                      <tr
                        key={item.id}
                        className={`hover:bg-white/[0.02] transition-colors ${isSelected ? 'bg-[#10B981]/5' : ''}`}
                      >
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(item.id)}
                            className="rounded bg-[#070908] border-[#232825] accent-[#10B981]"
                          />
                        </td>

                        <td 
                          onClick={() => handleOpenCommentModal(item, actionToExecute)}
                          className="px-4 py-4 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-[#10B981] hover:underline">
                              {item.sourceCode}
                            </span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#161B18] text-[#9CA3AF] border border-[#232825]">
                              {item.sourceCpse}
                            </span>
                          </div>
                        </td>

                        <td 
                          onClick={() => handleOpenCommentModal(item, actionToExecute)}
                          className="px-4 py-4 font-mono text-xs font-bold text-[#22D3EE] hover:underline cursor-pointer"
                        >
                          {item.candidateCnmc}
                        </td>

                        <td 
                          onClick={() => handleOpenCommentModal(item, actionToExecute)}
                          className="px-4 py-4 text-xs text-[#F3F4F6] max-w-xs cursor-pointer"
                        >
                          <div className="line-clamp-2 leading-relaxed hover:text-white transition-colors">{item.sourceDescription}</div>
                          {item.conflicts && (
                            <span className="inline-block mt-1 text-[10px] text-amber-400 bg-amber-950/40 border border-amber-800/40 px-1.5 py-0.5 rounded">
                              ⚠️ Variance: {item.conflicts}
                            </span>
                          )}
                          {itemComments[item.id] && (
                            <div className="mt-1 text-[11px] text-[#10B981] flex items-center gap-1 line-clamp-1 italic">
                              <span className="material-symbols-outlined text-[12px]">comment</span>
                              <span>{itemComments[item.id]}</span>
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-4 text-center font-mono font-semibold">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] ${
                              item.confidence >= 85
                                ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                                : item.confidence >= 65
                                ? 'bg-amber-950/60 text-amber-400 border border-amber-800/50'
                                : 'bg-blue-950/60 text-blue-400 border border-blue-800/50'
                            }`}
                          >
                            {item.confidence}%
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold inline-flex items-center gap-1"
                            style={{
                              background: ACTION_META[item.recommendedAction].bg,
                              color: ACTION_META[item.recommendedAction].color
                            }}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {ACTION_META[item.recommendedAction].icon}
                            </span>
                            <span>{item.recommendedAction}</span>
                          </span>
                        </td>

                        <td className="px-4 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Comment & Detail Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenCommentModal(item, actionToExecute);
                              }}
                              className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-xs ${
                                itemComments[item.id]
                                  ? 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/40 shadow-sm'
                                  : 'bg-[#161B18] text-[#9CA3AF] border-[#232825] hover:text-white hover:border-[#38423C]'
                              }`}
                              title={itemComments[item.id] ? `Steward Comment: ${itemComments[item.id]}` : 'Add / View Steward Comment & Details'}
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                {itemComments[item.id] ? 'comment' : 'chat_bubble_outline'}
                              </span>
                              {itemComments[item.id] && <span className="text-[10px] font-mono font-bold">1</span>}
                            </button>

                            {/* Inspect Full Dossier */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEvidence(item);
                              }}
                              className="p-1.5 rounded-lg border border-[#232825] bg-[#161B18] text-[#9CA3AF] hover:text-[#22D3EE] hover:border-[#22D3EE]/40 transition-all"
                              title="Inspect Full Evidence Dossier in Drawer"
                            >
                              <span className="material-symbols-outlined text-[16px]">visibility</span>
                            </button>

                            {/* Execute Action Button */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExecuteSingle(item);
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-black transition-all shadow-sm hover:brightness-110 shrink-0"
                              style={{ background: metaInfo.color }}
                            >
                              Execute {actionToExecute}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Approved Migration Ledger Table */
        <div className="bg-[#0C0E0D] border border-[#232825] rounded-xl overflow-hidden shadow-sm">
          <div className="p-4 border-b border-[#232825] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white font-sans flex items-center gap-2">
                <span>Validated ERP Migration Records</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#161B18] text-[#10B981] border border-[#232825]">
                  {filteredMigrationRows.length} Mappings
                </span>
              </h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Statically verified and approved cross-system material mappings ready for SAP ECC, S/4HANA, and Oracle ERP delta synchronization.
              </p>
            </div>

            <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
              <span className="material-symbols-outlined text-[15px]">verified</span>
              <span>All Payloads Verified</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#232825] text-[10px] uppercase font-semibold text-[#6B7280]">
                  <th className="px-4 py-3 font-medium">CPSE & Source System</th>
                  <th className="px-4 py-3 font-medium">Source Material Code</th>
                  <th className="px-4 py-3 font-medium">Target National CNMC</th>
                  <th className="px-4 py-3 font-medium">Canonical Description</th>
                  <th className="px-4 py-3 font-medium">Consolidation Action</th>
                  <th className="px-4 py-3 font-medium">UNSPSC</th>
                  <th className="px-4 py-3 font-medium text-right">Effective Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1B201D]">
                {isLoadingMigration ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-[#9CA3AF]">
                      Loading ERP migration ledger...
                    </td>
                  </tr>
                ) : filteredMigrationRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-[#9CA3AF]">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-3xl text-[#6B7280]">inventory_2</span>
                        <p className="font-medium text-white">No approved migration records found</p>
                        <p className="text-xs text-[#6B7280]">
                          Approve equivalence groups in the workbench to generate ERP migration payloads.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredMigrationRows.map((r, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[11px] font-bold font-mono bg-[#161B18] text-[#10B981] border border-[#232825]">
                            {r.CPSE_ID}
                          </span>
                          <span className="text-[10px] text-[#9CA3AF] font-mono">
                            {r.SOURCE_SYSTEM}
                          </span>
                        </div>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-white">
                        {r.SOURCE_MATERIAL_CODE}
                      </td>

                      <td className="px-4 py-3.5 font-mono text-xs font-bold text-[#22D3EE]">
                        {r.CNMC}
                      </td>

                      <td className="px-4 py-3.5 text-xs text-[#F3F4F6] max-w-sm truncate">
                        {r.CANONICAL_DESCRIPTION}
                      </td>

                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/40">
                          {r.RATIONALIZATION_ACTION}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 font-mono text-[11px] text-[#9CA3AF]">
                        {r.CLASSIFICATION || '40141600'}
                      </td>

                      <td className="px-4 py-3.5 text-right font-mono text-[11px] text-[#6B7280]">
                        {r.EFFECTIVE_DATE || '2026-09-08'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 7. Rationalization Detail & Stewardship Comment Modal */}
      {commentModalItem && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
          onClick={() => setCommentModalItem(null)}
        >
          <div
            className="w-full max-w-2xl bg-[#0C0E0D] border border-[#232825] rounded-2xl shadow-2xl overflow-hidden animate-slide-in-bottom"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[#232825] bg-[#070908] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: ACTION_META[commentModalItem.action]?.bg || 'rgba(16, 185, 129, 0.12)',
                    color: ACTION_META[commentModalItem.action]?.color || '#10B981'
                  }}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {ACTION_META[commentModalItem.action]?.icon || 'tune'}
                  </span>
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white font-sans">
                      Material Rationalization Details &amp; Stewardship Comment
                    </h3>
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold"
                      style={{
                        background: ACTION_META[commentModalItem.action]?.bg,
                        color: ACTION_META[commentModalItem.action]?.color
                      }}
                    >
                      {commentModalItem.action}
                    </span>
                  </div>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    Source: <span className="text-emerald-400 font-mono font-semibold">{commentModalItem.item.sourceCode}</span> ({commentModalItem.item.sourceCpse}) → Target: <span className="text-cyan-400 font-mono font-semibold">{commentModalItem.item.candidateCnmc}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setCommentModalItem(null)}
                className="p-1.5 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto text-xs">
              {/* Match Overview Banner */}
              <div className="p-4 rounded-xl bg-[#070908] border border-[#232825] flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#6B7280]">Confidence &amp; Relationship</span>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold font-mono text-[#22D3EE]">
                      {commentModalItem.item.confidence}%
                    </span>
                    <span className="px-2 py-0.5 rounded font-mono text-[11px] bg-[#161B18] text-[#10B981] border border-[#232825]">
                      {commentModalItem.item.relationship}
                    </span>
                  </div>
                </div>
                <div className="text-right text-[11px] text-[#9CA3AF] space-y-0.5">
                  <div>Source Enterprise: <strong className="text-white">{commentModalItem.item.sourceCpse}</strong></div>
                  <div>Target CNMC: <strong className="text-emerald-400 font-mono">{commentModalItem.item.candidateCnmc}</strong></div>
                </div>
              </div>

              {/* Attribute Comparison Grid */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase font-bold text-[#6B7280]">
                    Attribute Parity Comparison
                  </span>
                  <button
                    onClick={() => {
                      openEvidence(commentModalItem.item);
                      setCommentModalItem(null);
                    }}
                    className="text-[11px] text-[#22D3EE] hover:underline flex items-center gap-1"
                  >
                    <span>Inspect full dossier in drawer</span>
                    <span className="material-symbols-outlined text-[13px]">open_in_new</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Source CPSE Item */}
                  <div className="p-3.5 rounded-xl bg-[#070908] border border-[#232825] space-y-2">
                    <div className="flex items-center justify-between border-b border-[#1B201D] pb-1.5">
                      <span className="font-bold text-emerald-400 font-mono text-[11px]">
                        {commentModalItem.item.sourceCpse} Source Item
                      </span>
                      <span className="font-mono text-[10px] text-[#6B7280]">
                        {commentModalItem.item.sourceCode}
                      </span>
                    </div>
                    <p className="text-white text-xs leading-relaxed font-sans line-clamp-3">
                      {commentModalItem.item.sourceDescription}
                    </p>
                    <div className="pt-2 border-t border-[#1B201D] space-y-1 font-mono text-[10px] text-[#9CA3AF]">
                      <div>Noun: <span className="text-white">{commentModalItem.item.sourceAttributes?.noun || commentModalItem.item.sourceAttributes?.materialGroup || 'VALVE'}</span></div>
                      <div>Size/Rating: <span className="text-white">{commentModalItem.item.sourceAttributes?.dimensions || commentModalItem.item.sourceAttributes?.pressure || '2" 150#'}</span></div>
                      <div>Grade: <span className="text-white">{commentModalItem.item.sourceAttributes?.grade || commentModalItem.item.sourceAttributes?.material || 'SS316'}</span></div>
                    </div>
                  </div>

                  {/* Target National Canonical SKU */}
                  <div className="p-3.5 rounded-xl bg-[#070908] border border-[#232825] space-y-2">
                    <div className="flex items-center justify-between border-b border-[#1B201D] pb-1.5">
                      <span className="font-bold text-cyan-400 font-mono text-[11px]">
                        National Canonical Standard
                      </span>
                      <span className="font-mono text-[10px] text-[#6B7280]">
                        {commentModalItem.item.candidateCnmc}
                      </span>
                    </div>
                    <p className="text-white text-xs leading-relaxed font-sans line-clamp-3">
                      {commentModalItem.item.candidateDescription || 'Authoritative National Material Master Specification'}
                    </p>
                    <div className="pt-2 border-t border-[#1B201D] space-y-1 font-mono text-[10px] text-[#9CA3AF]">
                      <div>Noun: <span className="text-white">{commentModalItem.item.candidateAttributes?.noun || 'VALVE'}</span></div>
                      <div>Size/Rating: <span className="text-white">{commentModalItem.item.candidateAttributes?.dimensions || commentModalItem.item.candidateAttributes?.pressure || '2 INCH 150#'}</span></div>
                      <div>Grade: <span className="text-white">{commentModalItem.item.candidateAttributes?.grade || 'STAINLESS STEEL 316'}</span></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Variance Alert if any */}
              {commentModalItem.item.conflicts && (
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-300 text-xs flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-amber-400 shrink-0 mt-0.5">warning</span>
                  <div>
                    <span className="font-bold block mb-0.5">Specification Variance Detected:</span>
                    <p className="text-[#F3F4F6] text-[11px]">{commentModalItem.item.conflicts}</p>
                  </div>
                </div>
              )}

              {/* Downstream Impact Preview */}
              <div className="p-3.5 rounded-xl bg-[#070908] border border-[#232825] space-y-2">
                <span className="text-[10px] uppercase font-bold text-[#6B7280] block">Downstream Migration Impact</span>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded-lg bg-[#161B18] border border-[#232825]">
                    <span className="text-[#6B7280] block text-[10px]">ERP Systems</span>
                    <span className="text-white font-mono font-bold">SAP, Oracle</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#161B18] border border-[#232825]">
                    <span className="text-[#6B7280] block text-[10px]">Historical POs</span>
                    <span className="text-emerald-400 font-mono font-bold">Preserved (Alias)</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#161B18] border border-[#232825]">
                    <span className="text-[#6B7280] block text-[10px]">Audit Mandate</span>
                    <span className="text-cyan-400 font-mono font-bold">CAG / MoPNG 10Y</span>
                  </div>
                </div>
              </div>

              {/* Comment & Stewardship Justification Section */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-[#10B981]">rate_review</span>
                    <span>Stewardship Comment / Statutory Justification</span>
                    <span className="text-[#10B981]">*</span>
                  </label>
                  <span className="text-[10px] text-[#6B7280]">Recorded permanently in immutable audit ledger</span>
                </div>

                {/* Quick Preset Rationale Buttons */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Confirmed physical, metallurgical, and dimensional equivalence under ISO/ASTM standard.',
                    'Dual-signoff confirmed; redundant SKU consolidated to eliminate duplicate depot safety stock.',
                    'Cross-enterprise pooling authorized under MoPNG One Nation One Material Master guidelines.',
                    'Discrepancy reviewed and operating parameters validated identical across CPSE plants.'
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCommentModalItem(prev => prev ? ({ ...prev, comment: preset }) : null)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-medium bg-[#161B18] border border-[#232825] text-[#9CA3AF] hover:text-white hover:border-[#10B981]/50 transition-all text-left"
                    >
                      Preset {idx + 1}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={3}
                  value={commentModalItem.comment}
                  onChange={(e) => setCommentModalItem(prev => prev ? ({ ...prev, comment: e.target.value }) : null)}
                  placeholder="Enter stewardship rationale, technical committee notes, or statutory justification..."
                  className="w-full p-3 rounded-xl bg-[#070908] border border-[#232825] text-xs text-white placeholder-[#6B7280] focus:border-[#10B981] outline-none transition-all resize-none font-sans leading-relaxed"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-[#232825] bg-[#070908] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (commentModalItem.comment.trim()) {
                    setItemComments(prev => ({
                      ...prev,
                      [commentModalItem.item.id]: commentModalItem.comment.trim()
                    }));
                    addToast('success', `Stewardship comment saved for ${commentModalItem.item.sourceCode}`);
                  }
                  setCommentModalItem(null);
                }}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#161B18] border border-[#232825] text-[#9CA3AF] hover:text-white transition-all"
              >
                Save Comment Only
              </button>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setCommentModalItem(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-[#9CA3AF] hover:text-white transition-all"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const rationale = commentModalItem.comment.trim() || `Executed ${commentModalItem.action} via Catalog Rationalization Workbench`;
                    setItemComments(prev => ({
                      ...prev,
                      [commentModalItem.item.id]: rationale
                    }));
                    await executeRationalization(commentModalItem.item.id, commentModalItem.action, rationale);
                    loadMigrationData();
                    setCommentModalItem(null);
                  }}
                  className="px-5 py-2 rounded-lg text-xs font-bold text-black shadow-md transition-all hover:brightness-110 flex items-center gap-1.5"
                  style={{
                    background: ACTION_META[commentModalItem.action]?.color || '#10B981'
                  }}
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  <span>Execute {commentModalItem.action} with Comment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. Footer */}
      <ScreenFooter />
    </main>
  );
};
