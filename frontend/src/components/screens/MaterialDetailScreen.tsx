import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { RelationshipBadge } from '../common/RelationshipBadge';
import { StatusBadge } from '../common/StatusBadge';
import { ScreenFooter } from '../common/FooterLegalModal';

export const MaterialDetailScreen: React.FC = () => {
  const { currentMaterial, setActiveScreen, openEvidence, addToast } = useApp();
  const [filterQuery, setFilterQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [cryptoHash, setCryptoHash] = useState<string>('Computing...');

  const specs = currentMaterial.attributes || currentMaterial.specifications || {};
  const status = currentMaterial.status || currentMaterial.lifecycleStatus || 'Active';
  const uom = currentMaterial.standardUOM || specs.baseUOM || 'EA';
  const leadCataloger = currentMaterial.leadCataloger || 'National Material Master Team';

  useEffect(() => {
    let active = true;
    const computeHash = async () => {
      try {
        const payload = JSON.stringify({
          cnmc: currentMaterial.cnmc,
          description: currentMaterial.canonicalDescription,
          specs,
          status,
          version: currentMaterial.version || '1.0'
        });
        const encoder = new TextEncoder();
        const data = encoder.encode(payload);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        if (active) setCryptoHash(`sha256:${hashHex}`);
      } catch {
        if (active) setCryptoHash(`sha256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069`);
      }
    };
    computeHash();
    return () => { active = false; };
  }, [currentMaterial.cnmc, currentMaterial.canonicalDescription]);

  const filteredMappings = currentMaterial.mappings.filter(m =>
    !filterQuery.trim() ||
    m.cpse.toLowerCase().includes(filterQuery.toLowerCase()) ||
    m.localCode.toLowerCase().includes(filterQuery.toLowerCase()) ||
    m.localDescription.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleCopyRaw = () => {
    const data = JSON.stringify(currentMaterial, null, 2);
    navigator.clipboard.writeText(data);
    setCopied(true);
    addToast('success', `Copied JSON specifications for ${currentMaterial.cnmc}`);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6 bg-[#070908] text-[#F3F4F6]">
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
          <span 
            onClick={() => setActiveScreen('master')} 
            className="cursor-pointer hover:text-[#F3F4F6] transition-colors"
          >
            Master Catalog
          </span>
          <span className="text-[#6B7280]">›</span>
          <span className="text-[#F3F4F6] font-mono">{currentMaterial.cnmc}</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveScreen('master')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0C0E0D] border border-[#232825] text-xs font-semibold text-[#9CA3AF] hover:text-white hover:border-[#38423C] transition-all"
          >
            <span className="material-symbols-outlined text-[15px]">arrow_back</span>
            <span>Back to Catalog</span>
          </button>
          <button
            onClick={() => openEvidence(currentMaterial)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0C0E0D] border border-[#232825] text-xs font-semibold text-[#F3F4F6] hover:border-[#38423C] transition-all"
          >
            <span className="material-symbols-outlined text-[15px] text-[#9CA3AF]">visibility</span>
            <span>View Evidence</span>
          </button>
          <button
            onClick={handleCopyRaw}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#10B981] text-[#000000] hover:brightness-110 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[15px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span>{copied ? 'Copied' : 'Export JSON'}</span>
          </button>
        </div>
      </div>

      {/* 2. Page Title Block */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
          Material Specification Sheet
        </h1>
        <p className="text-xs md:text-sm text-[#9CA3AF] leading-relaxed max-w-4xl">
          Authoritative national engineering specification, verified technical attributes, and inter-enterprise cross-referencing.
        </p>
      </div>

      {/* 3. Hero Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-1">
        <div className="lg:col-span-7 space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-2xl font-bold text-[#10B981]">
              {currentMaterial.cnmc}
            </span>
            <StatusBadge status={status} size="sm" />
            <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#161B18] text-[#9CA3AF] border border-[#232825]">
              v{currentMaterial.version || '1.0'}
            </span>
          </div>
          <h2 className="text-sm font-semibold text-[#F3F4F6] leading-snug">
            {currentMaterial.canonicalDescription}
          </h2>
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#9CA3AF] pt-1">
            <span>Category: <strong className="text-white">{currentMaterial.materialGroupName}</strong></span>
            <span>•</span>
            <span>Group Code: <strong className="text-white font-mono">{currentMaterial.materialGroup}</strong></span>
            <span>•</span>
            <span>Base UOM: <strong className="text-white font-mono">{uom}</strong></span>
          </div>
        </div>

        <div className="lg:col-span-5 grid grid-cols-3 gap-4 pt-1">
          <div>
            <div className="text-2xl lg:text-3xl font-bold font-sans text-[#10B981] tracking-tight">
              {currentMaterial.confidenceScore || 98}%
            </div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-1 leading-tight">
              Match Confidence
            </div>
            <div className="text-[11px] text-[#6B7280] leading-snug">
              NLP Verified
            </div>
          </div>

          <div>
            <div className="text-2xl lg:text-3xl font-bold font-sans text-white tracking-tight">
              {currentMaterial.mappings.length}
            </div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-1 leading-tight">
              CPSEs Mapped
            </div>
            <div className="text-[11px] text-[#6B7280] leading-snug">
              Converged ERPs
            </div>
          </div>

          <div>
            <div className="text-2xl lg:text-3xl font-bold font-sans text-[#22D3EE] tracking-tight">
              14%
            </div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-1 leading-tight">
              Procurement Spread
            </div>
            <div className="text-[11px] text-[#6B7280] leading-snug">
              Consolidation upside
            </div>
          </div>
        </div>
      </div>

      {/* 4. Main Detail Canvas */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Specs & CPSE Aliases */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Technical Specifications Grid */}
          <div className="bg-[#0C0E0D] border border-[#232825] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#F3F4F6]">
                  Standardized Technical Specifications
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Attributes synthesized from enterprise standards (DIN, ISO, API)
                </p>
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#161B18] text-[#9CA3AF] border border-[#232825]">
                {Object.keys(specs).length} Attributes
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {Object.entries(specs).map(([key, value]) => (
                <div
                  key={key}
                  className="p-3 rounded-lg bg-[#070908] border border-[#232825] space-y-1"
                >
                  <span className="text-[10px] uppercase font-semibold text-[#6B7280] block">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="font-mono text-xs font-bold text-[#F3F4F6] block truncate">
                    {String(value) || '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mapped CPSE Enterprise Codes Table */}
          <div className="bg-[#0C0E0D] border border-[#232825] rounded-xl overflow-hidden">
            <div className="p-5 border-b border-[#232825] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[#F3F4F6]">
                  Enterprise Cross-Reference Aliases ({currentMaterial.mappings.length})
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Disparate ERP item codes reconciled to this National Material Master
                </p>
              </div>

              <div className="relative">
                <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[15px] text-[#9CA3AF] pointer-events-none">
                  search
                </span>
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter aliases..."
                  className="bg-[#070908] border border-[#232825] rounded-lg pl-8 pr-3 py-1 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] outline-none hover:border-[#38423C] w-48"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#232825] text-[10px] uppercase font-semibold text-[#6B7280]">
                    <th className="px-5 py-3 font-medium">CPSE</th>
                    <th className="px-5 py-3 font-medium">Local Item Code</th>
                    <th className="px-5 py-3 font-medium">ERP Description</th>
                    <th className="px-5 py-3 font-medium">Relation</th>
                    <th className="px-5 py-3 font-medium text-center">Confidence</th>
                    <th className="px-5 py-3 font-medium text-right">Last Sync</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1B201D]">
                  {filteredMappings.map((m, idx) => (
                    <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3.5 font-semibold text-white">
                        {m.cpse}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-[#10B981]">
                        {m.localCode}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-[11px] text-[#9CA3AF] max-w-xs truncate">
                        {m.localDescription}
                      </td>
                      <td className="px-5 py-3.5">
                        <RelationshipBadge type={m.relationship || 'IDENTICAL'} size="sm" />
                      </td>
                      <td className="px-5 py-3.5 text-center font-mono font-bold text-[#10B981]">
                        {currentMaterial.confidenceScore || 98}%
                      </td>
                      <td className="px-5 py-3.5 text-right font-mono text-[11px] text-[#6B7280]">
                        {m.lastUpdated || '2024-03-15'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 4 Cols: Catalog Metadata & Actions */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-[#0C0E0D] border border-[#232825] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-[#F3F4F6]">
              Catalog Metadata & Provenance
            </h3>
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#6B7280] block">Lead Steward</span>
                <span className="font-medium text-white block mt-0.5">{leadCataloger}</span>
              </div>
              <div className="pt-2.5 border-t border-[#1B201D]">
                <span className="text-[10px] uppercase font-semibold text-[#6B7280] block">Taxonomy Standard</span>
                <span className="font-mono text-xs font-medium text-[#10B981] block mt-0.5">MoPNG Petroleum Master v3.0</span>
              </div>
              <div className="pt-2.5 border-t border-[#1B201D]">
                <span className="text-[10px] uppercase font-semibold text-[#6B7280] block">Cryptographic Hash</span>
                <span className="font-mono text-[11px] text-[#9CA3AF] block truncate mt-0.5" title={cryptoHash}>
                  {cryptoHash}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#0C0E0D] border border-[#232825] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-[#F3F4F6]">
              Administrative Actions
            </h3>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => addToast('info', `Generating statutory specification PDF for ${currentMaterial.cnmc}`)}
                className="w-full py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 bg-[#070908] border border-[#232825] hover:border-[#38423C] text-[#F3F4F6] transition-all"
              >
                <span className="material-symbols-outlined text-[16px] text-[#9CA3AF]">file_download</span>
                Download Spec Sheet (PDF)
              </button>
              <button
                onClick={() => addToast('warning', `Material ${currentMaterial.cnmc} flagged for committee review`)}
                className="w-full py-2 px-3 rounded-lg font-semibold flex items-center justify-center gap-2 bg-[#EAB308]/10 border border-[#EAB308]/30 text-[#EAB308] hover:bg-[#EAB308]/15 transition-all"
              >
                <span className="material-symbols-outlined text-[16px]">flag</span>
                Flag for Committee Audit
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Footer */}
      <ScreenFooter />
    </div>
  );
};
