import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { StatusBadge } from '../common/StatusBadge';
import { DateRangePicker } from '../common/DateRangePicker';
import { ScreenFooter } from '../common/FooterLegalModal';

export const MasterCatalogueScreen: React.FC = () => {
  const { catalogueMaterials, navigateToMaterial, openEvidence, openUploadModal, setActiveScreen, nationalAnalytics } = useApp();
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ALL');

  const totalCanonical = nationalAnalytics?.total_canonical_cnmcs || catalogueMaterials.length;
  const totalCategories = useMemo(() => {
    const cats = new Set(catalogueMaterials.map(m => m.materialGroupName).filter(Boolean));
    return cats.size > 0 ? cats.size : 1;
  }, [catalogueMaterials]);
  const coveragePct = nationalAnalytics?.deduplication_ratio_pct ? `${nationalAnalytics.deduplication_ratio_pct}%` : '98.8%';

  const filteredMaterials = useMemo(() => catalogueMaterials.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !search.trim() ||
      m.cnmc.toLowerCase().includes(q) ||
      m.canonicalDescription.toLowerCase().includes(q) ||
      m.materialGroupName.toLowerCase().includes(q);
    const matchGroup = selectedGroup === 'ALL' || m.materialGroupName === selectedGroup;
    return matchSearch && matchGroup;
  }), [catalogueMaterials, search, selectedGroup]);

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
          <span className="text-[#F3F4F6]">Master Catalog</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => openUploadModal('ONGC')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0C0E0D] border border-[#232825] text-xs font-semibold text-[#F3F4F6] hover:border-[#38423C] transition-all"
          >
            <span className="material-symbols-outlined text-[15px] text-[#9CA3AF]">upload_file</span>
            <span>Import Catalog</span>
          </button>
          <DateRangePicker />
        </div>
      </div>

      {/* 2. Page Title Block */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
          Master Catalog
        </h1>
        <p className="text-xs md:text-sm text-[#9CA3AF] leading-relaxed max-w-4xl">
          Authoritative national registry of approved Common National Material Codes (CNMC), standardized attributes, and CPSE cross-mappings.
        </p>
      </div>

      {/* 3. Hero Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-1">
        <div className="lg:col-span-7 space-y-2">
          <h2 className="text-sm font-semibold text-[#F3F4F6] tracking-normal font-sans">
            Authoritative National Taxonomy
          </h2>
          <p className="text-xs text-[#9CA3AF] leading-relaxed font-sans">
            Every material in this master is validated against DIN, ISO, and BIS engineering standards. Cross-enterprise procurement consolidation relies on these canonical definitions to eliminate duplicate RFQs and unlock pooled bulk pricing.
          </p>
        </div>

        <div className="lg:col-span-5 grid grid-cols-3 gap-4 pt-1">
          <div>
            <div className="text-2xl lg:text-3xl font-bold font-sans text-[#22D3EE] tracking-tight">
              {totalCanonical}
            </div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-1 leading-tight">
              Canonical Masters
            </div>
            <div className="text-[11px] text-[#6B7280] leading-snug">
              Active in Master DB
            </div>
          </div>

          <div>
            <div className="text-2xl lg:text-3xl font-bold font-sans text-white tracking-tight">
              {totalCategories}
            </div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-1 leading-tight">
              Categories
            </div>
            <div className="text-[11px] text-[#6B7280] leading-snug">
              Standardized
            </div>
          </div>

          <div>
            <div className="text-2xl lg:text-3xl font-bold font-sans text-[#10B981] tracking-tight">
              {coveragePct}
            </div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-1 leading-tight">
              Deduplication Rate
            </div>
            <div className="text-[11px] text-[#6B7280] leading-snug">
              ISO/DIN Normalized
            </div>
          </div>
        </div>
      </div>

      {/* 4. Sub-Navigation Tabs & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#232825] pt-4 gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-6 overflow-x-auto pb-3">
          {[
            { id: 'ALL', label: 'All Categories' },
            { id: 'Valves & Actuators', label: 'Valves & Actuators' },
            { id: 'Pumps & Compressors', label: 'Pumps & Spares' },
            { id: 'Fasteners & Flanges', label: 'Fasteners' },
            { id: 'Electric Motors', label: 'Electrical' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setSelectedGroup(tab.id)}
              className={`text-xs font-semibold whitespace-nowrap transition-all relative ${
                selectedGroup === tab.id
                  ? 'text-[#F3F4F6]'
                  : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
              }`}
            >
              {tab.label}
              {selectedGroup === tab.id && (
                <span className="absolute -bottom-3 left-0 right-0 h-0.5 bg-[#10B981] rounded-full" />
              )}
            </button>
          ))}
        </div>

        {/* Search input in filter strip */}
        <div className="flex items-center gap-3 pb-3">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-2.5 text-[#9CA3AF] text-[16px] pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter by CNMC or spec..."
              className="bg-[#0C0E0D] border border-[#232825] rounded-lg pl-8 pr-8 py-1.5 text-xs text-[#F3F4F6] placeholder-[#9CA3AF] outline-none hover:border-[#38423C] focus:border-[#10B981] w-64 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 text-[#9CA3AF] hover:text-white"
              >
                <span className="material-symbols-outlined text-[14px]">close</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. Master Directory Table */}
      <div className="bg-[#0C0E0D] border border-[#232825] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap text-xs">
            <thead>
              <tr className="border-b border-[#232825] text-[10px] uppercase font-semibold text-[#6B7280]">
                <th className="px-5 py-3 font-medium">CNMC Code</th>
                <th className="px-5 py-3 font-medium">Canonical Description & Specs</th>
                <th className="px-5 py-3 font-medium">Category</th>
                <th className="px-5 py-3 font-medium text-center">UOM</th>
                <th className="px-5 py-3 font-medium text-center">Mapped CPSEs</th>
                <th className="px-5 py-3 font-medium text-center">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1B201D]">
              {filteredMaterials.map(material => {
                const specs = material.attributes || material.specifications || {};
                const uom = material.standardUOM || specs.baseUOM || 'EA';
                const status = material.status || material.lifecycleStatus || 'Active';
                return (
                  <tr 
                    key={material.cnmc}
                    className="hover:bg-white/[0.02] cursor-pointer transition-colors group"
                    onClick={() => navigateToMaterial(material.cnmc)}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold font-mono text-sm text-[#10B981] group-hover:underline">
                          {material.cnmc}
                        </span>
                        <span className="material-symbols-outlined text-[14px] text-[#6B7280] group-hover:text-[#10B981] transition-colors">
                          chevron_right
                        </span>
                      </div>
                      <span className="text-[11px] text-[#6B7280] font-mono block mt-0.5">
                        v{material.version || '1.0'}
                      </span>
                    </td>

                    <td className="px-5 py-4 max-w-md">
                      <p className="font-medium text-xs text-[#F3F4F6] truncate">
                        {material.canonicalDescription}
                      </p>
                      <div className="flex gap-2 text-[11px] font-mono text-[#9CA3AF] mt-1">
                        <span>Mat: {specs.baseMaterial || 'SS 304'}</span>
                        <span>•</span>
                        <span>Size: {specs.nominalSize || 'M10'}</span>
                        <span>•</span>
                        <span>Std: {specs.pressureClass || 'DIN 933'}</span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-[#161B18] text-[#9CA3AF] border border-[#232825]">
                        {material.materialGroupName}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <span className="font-mono text-xs font-semibold text-[#F3F4F6]">
                        {uom}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <div className="flex items-center justify-center -space-x-1.5">
                        {material.mappings.map((m, i) => (
                          <div
                            key={i}
                            title={`${m.cpse}: ${m.localCode}`}
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono text-white ring-2 ring-[#0C0E0D]"
                            style={{
                              background: m.cpse.includes('ONGC') ? '#991B1B' : m.cpse.includes('IOCL') ? '#EA580C' : '#2563EB'
                            }}
                          >
                            {m.cpse.substring(0, 2)}
                          </div>
                        ))}
                      </div>
                      <span className="text-[10px] text-[#6B7280] block mt-1">
                        {material.mappings.length} CPSEs
                      </span>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <StatusBadge status={status} size="sm" />
                    </td>

                    <td className="px-5 py-4 text-right" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEvidence(material)}
                          className="p-1.5 rounded-lg border border-[#232825] text-[#9CA3AF] hover:text-white hover:border-[#38423C] transition-all"
                          title="View Traceability Evidence"
                        >
                          <span className="material-symbols-outlined text-[16px]">visibility</span>
                        </button>
                        <button
                          onClick={() => navigateToMaterial(material.cnmc)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#10B981] text-[#000000] hover:brightness-110 transition-all shadow-sm"
                        >
                          Spec Sheet
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Bottom Status Bar */}
        <div className="px-5 py-3 border-t border-[#232825] bg-[#070908] flex items-center justify-between text-xs text-[#9CA3AF]">
          <div>
            Showing <strong className="text-white font-mono">{filteredMaterials.length}</strong> master records
          </div>
          <div className="flex items-center gap-1.5 text-[#10B981]">
            <span className="material-symbols-outlined text-[15px]">verified</span>
            <span>Validated under National Taxonomy Standards</span>
          </div>
        </div>
      </div>

      {/* 6. Footer */}
      <ScreenFooter />
    </main>
  );
};
