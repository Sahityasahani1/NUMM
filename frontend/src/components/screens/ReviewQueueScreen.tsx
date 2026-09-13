import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { RelationshipBadge } from '../common/RelationshipBadge';
import { ConfidenceBar } from '../common/ConfidenceBar';
import { ScreenFooter } from '../common/FooterLegalModal';

export const ReviewQueueScreen: React.FC = () => {
  const {
    reviewQueue, selectedReviewIds, toggleSelectReviewItem,
    toggleSelectAllReviewItems, approveReviewItem, bulkApproveReviewItems,
    flagReviewItem, openEvidence, openUploadModal, setActiveScreen,
    reviewCpseFilter, setReviewCpseFilter, auditLogs, addToast
  } = useApp();

  const approvedCount = useMemo(() => {
    return auditLogs.filter(l => l.action.toLowerCase().includes('approve') || l.action.toLowerCase().includes('merge')).length;
  }, [auditLogs]);

  const avgConfidence = useMemo(() => {
    if (!reviewQueue || reviewQueue.length === 0) return 0;
    return Math.round(reviewQueue.reduce((acc, item) => acc + item.confidence, 0) / reviewQueue.length);
  }, [reviewQueue]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCpse, setSelectedCpse] = useState(() => reviewCpseFilter || 'ALL');
  const [selectedRelationship, setSelectedRelationship] = useState('ALL');
  const [minConfidence, setMinConfidence] = useState(70);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Mandatory Justification Modal State
  interface JustificationTarget {
    type: 'single-approve' | 'single-flag' | 'bulk-approve';
    itemId?: string;
    itemIds?: string[];
    sourceCode?: string;
    candidateCnmc?: string;
  }

  const [justificationTarget, setJustificationTarget] = useState<JustificationTarget | null>(null);
  const [customRationale, setCustomRationale] = useState<string>('');

  const rationaleTemplates = [
    {
      id: 'spec-verified',
      label: 'Technical Specification Parity',
      text: 'Technical specification verification confirms physical, metallurgical, and dimensional equivalence under ISO/ASTM standard.',
    },
    {
      id: 'operating-threshold',
      label: 'Operational Threshold Alignment',
      text: 'Dimensional tolerances, pressure ratings, and connection types conform to identical operational threshold.',
    },
    {
      id: 'nomenclature-abbrev',
      label: 'Abbreviation & Nomenclature Reconciliation',
      text: 'Vendor catalog nomenclature divergence verified against manufacturer original specification sheet.',
    },
    {
      id: 'subcommittee-audit',
      label: 'Technical Subcommittee Referral',
      text: 'Discrepancy identified in operating parameters; forwarded for technical subcommittee audit.',
    },
  ];

  const handleOpenApprove = (item: { id: string; sourceCode: string; candidateCnmc: string }) => {
    setJustificationTarget({
      type: 'single-approve',
      itemId: item.id,
      sourceCode: item.sourceCode,
      candidateCnmc: item.candidateCnmc,
    });
    setCustomRationale('Technical specification verification confirms physical, metallurgical, and dimensional equivalence under ISO/ASTM standard.');
  };

  const handleOpenFlag = (item: { id: string; sourceCode: string; candidateCnmc: string }) => {
    setJustificationTarget({
      type: 'single-flag',
      itemId: item.id,
      sourceCode: item.sourceCode,
      candidateCnmc: item.candidateCnmc,
    });
    setCustomRationale('Discrepancy identified in operating parameters; forwarded for technical subcommittee audit.');
  };

  const handleOpenBulkApprove = () => {
    setJustificationTarget({
      type: 'bulk-approve',
      itemIds: selectedReviewIds,
    });
    setCustomRationale(`Batch governance approval across ${selectedReviewIds.length} candidate equivalence groups.`);
  };

  const handleCommitJustification = () => {
    if (!justificationTarget) return;
    if (!customRationale.trim()) {
      addToast('warning', 'Mandatory governance rationale is required for statutory compliance.');
      return;
    }

    if (justificationTarget.type === 'single-approve' && justificationTarget.itemId) {
      approveReviewItem(justificationTarget.itemId, customRationale);
    } else if (justificationTarget.type === 'single-flag' && justificationTarget.itemId) {
      flagReviewItem(justificationTarget.itemId, customRationale);
    } else if (justificationTarget.type === 'bulk-approve' && justificationTarget.itemIds) {
      bulkApproveReviewItems(justificationTarget.itemIds, customRationale);
    }

    setJustificationTarget(null);
  };

  React.useEffect(() => {
    if (reviewCpseFilter) {
      setSelectedCpse(reviewCpseFilter);
    }
  }, [reviewCpseFilter]);

  const filteredItems = useMemo(() => reviewQueue.filter(item => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      item.sourceCode.toLowerCase().includes(q) ||
      item.candidateCnmc.toLowerCase().includes(q) ||
      item.candidateDescription.toLowerCase().includes(q) ||
      item.sourceDescription.toLowerCase().includes(q);
    const matchesCpse = selectedCpse === 'ALL' || item.sourceCpse === selectedCpse;
    const matchesRel = selectedRelationship === 'ALL' || item.relationship === selectedRelationship;
    return matchesSearch && matchesCpse && matchesRel && item.confidence >= minConfidence;
  }), [reviewQueue, searchQuery, selectedCpse, selectedRelationship, minConfidence]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const paginatedItems = filteredItems.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const allSelectedOnPage = paginatedItems.length > 0 && paginatedItems.every(i => selectedReviewIds.includes(i.id));

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
          <span className="text-[#F3F4F6]">Review Queue</span>
        </div>

        <div className="flex items-center gap-3">
          {selectedReviewIds.length > 0 && (
            <button
              onClick={handleOpenBulkApprove}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#10B981] text-[#000000] hover:brightness-110 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-[15px]">done_all</span>
              <span>Approve Selected ({selectedReviewIds.length})</span>
            </button>
          )}
          <button
            onClick={() => openUploadModal('ONGC')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0C0E0D] border border-[#232825] text-[#F3F4F6] hover:border-[#38423C] transition-all"
          >
            <span className="material-symbols-outlined text-[15px] text-[#9CA3AF]">upload_file</span>
            <span>Import CSV/XLS</span>
          </button>
        </div>
      </div>

      {/* 2. Page Title Block */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
          Harmonization Review Queue
        </h1>
        <p className="text-xs md:text-sm text-[#9CA3AF] leading-relaxed max-w-4xl">
          Suspected duplicate materials and borderline similarity recommendations requiring human-in-the-loop validation.
        </p>
      </div>

      {/* 3. Hero Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-1">
        <div className="lg:col-span-7 space-y-2">
          <h2 className="text-sm font-semibold text-[#F3F4F6] tracking-normal font-sans">
            Cataloger Verification Queue
          </h2>
          <p className="text-xs text-[#9CA3AF] leading-relaxed font-sans">
            Automated machine learning algorithms flag records when differences in unit of measurement, thread pitch, or alloy grade fall between 70% and 95% confidence. Approved matches are immediately indexed into the National Master.
          </p>
        </div>

        <div className="lg:col-span-5 grid grid-cols-3 gap-4 pt-1">
          <div>
            <div className="text-2xl lg:text-3xl font-bold font-sans text-[#EAB308] tracking-tight">
              {reviewQueue.length}
            </div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-1 leading-tight">
              Pending Items
            </div>
            <div className="text-[11px] text-[#6B7280] leading-snug">
              Awaiting review
            </div>
          </div>

          <div>
            <div className="text-2xl lg:text-3xl font-bold font-sans text-[#10B981] tracking-tight">
              {approvedCount}
            </div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-1 leading-tight">
              Approved Records
            </div>
            <div className="text-[11px] text-[#6B7280] leading-snug">
              Audited in ledger
            </div>
          </div>

          <div>
            <div className="text-2xl lg:text-3xl font-bold font-sans text-[#22D3EE] tracking-tight">
              {avgConfidence}%
            </div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-1 leading-tight">
              Avg Confidence
            </div>
            <div className="text-[11px] text-[#6B7280] leading-snug">
              Semantic match
            </div>
          </div>
        </div>
      </div>

      {/* 4. Filter Toolbar */}
      <div className="flex flex-wrap gap-3 items-center p-3 rounded-xl bg-[#0C0E0D] border border-[#232825]">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#070908] border border-[#232825] flex-1 min-w-[200px] max-w-sm">
          <span className="material-symbols-outlined text-[16px] text-[#9CA3AF]">search</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search code or description..."
            className="bg-transparent border-none text-xs text-[#F3F4F6] placeholder-[#9CA3AF] outline-none w-full"
          />
        </div>

        <select
          value={selectedCpse}
          onChange={e => setSelectedCpse(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs bg-[#070908] border border-[#232825] text-[#F3F4F6] outline-none"
        >
          <option value="ALL">All CPSEs</option>
          <option value="ONGC">ONGC</option>
          <option value="IOCL">IOCL</option>
          <option value="GAIL">GAIL</option>
          <option value="NTPC">NTPC</option>
        </select>

        <select
          value={selectedRelationship}
          onChange={e => setSelectedRelationship(e.target.value)}
          className="px-3 py-1.5 rounded-lg text-xs bg-[#070908] border border-[#232825] text-[#F3F4F6] outline-none"
        >
          <option value="ALL">All Relationships</option>
          <option value="IDENTICAL">Identical</option>
          <option value="INTERCHANGEABLE">Interchangeable</option>
          <option value="NEAR_DUPLICATE">Near-Duplicate</option>
        </select>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#070908] border border-[#232825] text-xs">
          <span className="text-[#6B7280]">Confidence:</span>
          <select
            value={minConfidence}
            onChange={e => setMinConfidence(Number(e.target.value))}
            className="bg-transparent text-[#10B981] font-mono font-semibold outline-none cursor-pointer"
          >
            <option value="50" className="bg-[#0C0E0D] text-white">All (&ge;50%)</option>
            <option value="70" className="bg-[#0C0E0D] text-white">&ge;70% (Default)</option>
            <option value="80" className="bg-[#0C0E0D] text-white">&ge;80% (High)</option>
            <option value="90" className="bg-[#0C0E0D] text-white">&ge;90% (Strict)</option>
            <option value="95" className="bg-[#0C0E0D] text-white">&ge;95% (Near-Certain)</option>
          </select>
        </div>
      </div>

      {/* 5. Queue Table */}
      <div className="bg-[#0C0E0D] border border-[#232825] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#232825] text-[10px] uppercase font-semibold text-[#6B7280]">
                <th className="px-5 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allSelectedOnPage}
                    onChange={(e) => toggleSelectAllReviewItems(e.target.checked)}
                    className="rounded bg-[#070908] border-[#232825] text-[#10B981] focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="px-5 py-3 font-medium">Source Record (CPSE)</th>
                <th className="px-5 py-3 font-medium">Target Candidate (CNMC)</th>
                <th className="px-5 py-3 font-medium text-center">Relationship</th>
                <th className="px-5 py-3 font-medium text-center">Confidence</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B201D]">
              {paginatedItems.map(item => {
                const isSelected = selectedReviewIds.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-white/[0.02] transition-colors ${
                      isSelected ? 'bg-white/[0.03]' : ''
                    }`}
                  >
                    <td className="px-5 py-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectReviewItem(item.id)}
                        className="rounded bg-[#070908] border-[#232825] text-[#10B981] focus:ring-0 cursor-pointer"
                      />
                    </td>

                    <td className="px-5 py-4 max-w-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs font-bold text-[#10B981]">
                          {item.sourceCode}
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-[#161B18] text-[#9CA3AF] border border-[#232825]">
                          {item.sourceCpse}
                        </span>
                      </div>
                      <p className="text-xs text-[#F3F4F6] truncate">{item.sourceDescription}</p>
                    </td>

                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-mono text-xs font-bold text-[#22D3EE] mb-1">
                        {item.candidateCnmc}
                      </div>
                      <p className="text-xs text-[#9CA3AF] truncate">{item.candidateDescription}</p>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <RelationshipBadge type={item.relationship} size="sm" />
                    </td>

                    <td className="px-5 py-4 text-center">
                      <div className="w-24 mx-auto">
                        <ConfidenceBar confidence={item.confidence} />
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenFlag({ id: item.id, sourceCode: item.sourceCode, candidateCnmc: item.candidateCnmc })}
                          className="p-1.5 rounded-lg border border-[#232825] text-[#EAB308] hover:bg-[#EAB308]/10 transition-all"
                          title="Flag Discrepancy"
                        >
                          <span className="material-symbols-outlined text-[15px]">flag</span>
                        </button>
                        <button
                          onClick={() => handleOpenApprove({ id: item.id, sourceCode: item.sourceCode, candidateCnmc: item.candidateCnmc })}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#10B981] text-[#000000] hover:brightness-110 transition-all shadow-sm"
                        >
                          Approve
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-5 py-3 border-t border-[#232825] bg-[#070908] flex items-center justify-between text-xs text-[#9CA3AF]">
          <div>
            Showing Page <strong className="text-white font-mono">{currentPage}</strong> of <strong className="text-white font-mono">{totalPages}</strong>
          </div>
          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-1 rounded border border-[#232825] hover:border-[#38423C] disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-1 rounded border border-[#232825] hover:border-[#38423C] disabled:opacity-30"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mandatory Governance Review Justification Modal */}
      {justificationTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0C0E0D] border border-[#232825] rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#232825]">
              <div className="flex items-center gap-2.5">
                <span className={`material-symbols-outlined text-[20px] ${
                  justificationTarget.type === 'single-flag' ? 'text-[#EAB308]' : 'text-[#10B981]'
                }`}>
                  {justificationTarget.type === 'single-flag' ? 'flag' : 'verified_user'}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    Authoritative Governance Decision
                  </h3>
                  <p className="text-[11px] text-[#9CA3AF]">
                    Mandatory justification required for statutory MoPNG audit compliance.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setJustificationTarget(null)}
                className="p-1 rounded text-[#9CA3AF] hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Target Details Badge */}
            <div className="p-3 rounded-lg bg-[#070908] border border-[#232825] space-y-1">
              <span className="text-[10px] uppercase font-semibold text-[#6B7280]">
                {justificationTarget.type === 'bulk-approve' ? 'Batch Scope' : 'Target Entity'}
              </span>
              <div className="flex items-center justify-between text-xs font-mono">
                {justificationTarget.type === 'bulk-approve' ? (
                  <span className="text-white font-bold">
                    {justificationTarget.itemIds?.length} Selected Candidate Records
                  </span>
                ) : (
                  <>
                    <span className="text-[#10B981] font-bold">{justificationTarget.sourceCode}</span>
                    <span className="text-[#6B7280]">maps to</span>
                    <span className="text-[#22D3EE] font-bold">{justificationTarget.candidateCnmc}</span>
                  </>
                )}
              </div>
            </div>

            {/* Standard Compliance Templates */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider block">
                Standard Regulatory Compliance Templates
              </label>
              <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto pr-1">
                {rationaleTemplates.map((tpl) => (
                  <button
                    key={tpl.id}
                    type="button"
                    onClick={() => setCustomRationale(tpl.text)}
                    className={`text-left p-2.5 rounded-lg border text-xs transition-all ${
                      customRationale === tpl.text
                        ? 'bg-[#161B18] border-[#10B981] text-white'
                        : 'bg-[#070908] border-[#232825] text-[#9CA3AF] hover:border-[#38423C] hover:text-white'
                    }`}
                  >
                    <div className="font-semibold text-white mb-0.5">{tpl.label}</div>
                    <div className="text-[11px] leading-snug line-clamp-2 text-[#9CA3AF]">{tpl.text}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Custom Rationale Field */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider block">
                Technical Justification &amp; Audit Comments
              </label>
              <textarea
                rows={3}
                value={customRationale}
                onChange={(e) => setCustomRationale(e.target.value)}
                placeholder="Enter technical rationale verifying material equivalence..."
                className="w-full p-3 rounded-lg bg-[#070908] border border-[#232825] text-xs font-mono text-white focus:outline-none focus:border-[#10B981] leading-relaxed"
              />
            </div>

            {/* Compliance Stamp */}
            <div className="p-2.5 rounded-lg bg-[#070908] border border-[#232825] flex items-center justify-between text-[11px] text-[#6B7280]">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#10B981]">shield</span>
                Actor: National Master Steward
              </span>
              <span className="font-mono text-[10px]">ISO 8000 / CAG Audited</span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setJustificationTarget(null)}
                className="px-3.5 py-2 rounded-lg text-xs font-medium bg-[#070908] border border-[#232825] text-[#9CA3AF] hover:text-white hover:border-[#38423C] transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCommitJustification}
                disabled={!customRationale.trim()}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-black transition-all shadow-sm disabled:opacity-50 ${
                  justificationTarget.type === 'single-flag'
                    ? 'bg-[#EAB308] hover:brightness-110'
                    : 'bg-[#10B981] hover:brightness-110'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">done</span>
                <span>Commit Authoritative Decision</span>
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
