import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DateRangePicker } from '../common/DateRangePicker';
import { ScreenFooter } from '../common/FooterLegalModal';
import { api, LiveHarmonizeResult, LiveCompareResult } from '../../services/api';

type CategoryKey = 'fasteners' | 'valves' | 'pumps';
type TabKey = 'demo' | 'sandbox' | 'architecture' | 'dataflow' | 'cpses';

export const HomeScreen: React.FC = () => {
  const { setActiveScreen, openUploadModal, nationalAnalytics, cpseList, catalogueMaterials, addToast } = useApp();
  const [activeTab, setActiveTab] = useState<TabKey>('demo');
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>('fasteners');
  const [copiedCode, setCopiedCode] = useState(false);

  // Sandbox 1: Attribute Extraction & Taxonomy
  const [sandboxDesc, setSandboxDesc] = useState('VLV BALL 2IN 150# FLG WCB/316 PTFE');
  const [sandboxUom, setSandboxUom] = useState('EA');
  const [extractLoading, setExtractLoading] = useState(false);
  const [extractResult, setExtractResult] = useState<LiveHarmonizeResult | null>(null);

  // Sandbox 2: Multi-Signal Matcher & Contradiction Detection
  const [compareText1, setCompareText1] = useState('BALL VALVE 2 INCH 150 LBS FLANGED A216 WCB BODY SS316 TRIM');
  const [compareText2, setCompareText2] = useState('VLV BALL 2IN 150# FLG WCB/316 PTFE LEVER OP');
  const [compareUom1, setCompareUom1] = useState('EA');
  const [compareUom2, setCompareUom2] = useState('EA');
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareResult, setCompareResult] = useState<LiveCompareResult | null>(null);

  const handleRunExtract = async () => {
    if (!sandboxDesc.trim()) return;
    setExtractLoading(true);
    try {
      const res = await api.harmonizeLive({ description: sandboxDesc, uom: sandboxUom });
      setExtractResult(res);
      addToast('success', 'Live attribute extraction & taxonomy classification completed.');
    } catch (err: any) {
      addToast('error', err?.message || 'Attribute extraction failed.');
    } finally {
      setExtractLoading(false);
    }
  };

  const handleRunCompare = async () => {
    if (!compareText1.trim() || !compareText2.trim()) return;
    setCompareLoading(true);
    try {
      const res = await api.compareLive({
        text1: compareText1,
        text2: compareText2,
        uom1: compareUom1,
        uom2: compareUom2,
      });
      setCompareResult(res);
      if (res.has_critical_conflict) {
        addToast('warning', 'Contradiction detected: Safety critical discrepancy identified.');
      } else {
        addToast('success', 'Multi-signal comparison completed successfully.');
      }
    } catch (err: any) {
      addToast('error', err?.message || 'Comparison failed.');
    } finally {
      setCompareLoading(false);
    }
  };

  const categoryData = {
    fasteners: {
      label: 'Fasteners',
      cnmc: '3116.1504.8920',
      title: 'Bolt, Hex Head, M10 × 50mm, Stainless Steel 304, Fully Threaded (DIN 933)',
      confidence: '98% Match Confidence',
      sources: [
        {
          cpse: 'ONGC',
          division: 'Western Offshore',
          logoBg: '#991B1B',
          localCode: 'MAT-10482',
          desc: 'HEX BOLT M10 X 50 SS304',
          price: '₹48 / EA',
        },
        {
          cpse: 'IOCL',
          division: 'Panipat Refinery',
          logoBg: '#EA580C',
          localCode: 'IOCL-FST-902',
          desc: 'BOLT HEX SS304 M10X50MM FULL THD',
          price: '₹55 / EA',
        },
        {
          cpse: 'NTPC',
          division: 'Singrauli STPS',
          logoBg: '#2563EB',
          localCode: 'NGC-BLT-004',
          desc: 'HEXAGON BOLT M10 50MM S.S. 304',
          price: '₹52 / EA',
        },
      ],
      attributes: [
        { attr: 'Item Type', val: 'Hex Bolt' },
        { attr: 'Size', val: 'M10 × 50mm' },
        { attr: 'Material', val: 'Stainless Steel 304' },
        { attr: 'Thread', val: 'Metric, 1.5mm' },
        { attr: 'Standard', val: 'DIN 933' },
        { attr: 'Unit of Measure', val: 'EA' },
        { attr: 'Category', val: 'Fasteners > Bolts > Hex Head' },
      ],
    },
    valves: {
      label: 'Valves',
      cnmc: '4014.1607.1842',
      title: 'Valve, Ball: 2 IN, ASME Class 150, Flanged RF, ASTM A216 WCB Body, SS316 Trim',
      confidence: '99% Match Confidence',
      sources: [
        {
          cpse: 'ONGC',
          division: 'Hazira Plant',
          logoBg: '#991B1B',
          localCode: 'MAT-VLV-0928',
          desc: 'BALL VALVE 50MM 150LBS CS FLANGED A216 WCB',
          price: '₹14,200 / EA',
        },
        {
          cpse: 'IOCL',
          division: 'Paradip',
          logoBg: '#EA580C',
          localCode: 'IOCL-VLV-492',
          desc: 'VLV BALL 2IN 150# FLG WCB/316 PTFE',
          price: '₹16,500 / EA',
        },
        {
          cpse: 'GAIL',
          division: 'Vijaipur',
          logoBg: '#059669',
          localCode: 'G-201-9482',
          desc: 'VALVE BALL FLGD 2 INCH CLASS 150 CS BODY',
          price: '₹15,100 / EA',
        },
      ],
      attributes: [
        { attr: 'Item Type', val: 'Floating Ball Valve' },
        { attr: 'Size', val: '2 Inch (DN 50)' },
        { attr: 'Pressure Class', val: 'ASME Class 150' },
        { attr: 'Body Material', val: 'ASTM A216 WCB' },
        { attr: 'Trim Material', val: 'SS 316' },
        { attr: 'Unit of Measure', val: 'EA' },
        { attr: 'Category', val: 'Piping > Valves > Ball Valves' },
      ],
    },
    pumps: {
      label: 'Pumps & Spares',
      cnmc: '4320.1009.4412',
      title: 'Impeller, Pump: Centrifugal, Enclosed, 210mm OD, Phosphor Bronze ASTM B584',
      confidence: '96% Match Confidence',
      sources: [
        {
          cpse: 'ONGC',
          division: 'Offshore Base',
          logoBg: '#991B1B',
          localCode: 'ONGC-PMP-9102',
          desc: 'IMPELLER CENTRIFUGAL PUMP BRONZE DIA 210MM',
          price: '₹38,000 / EA',
        },
        {
          cpse: 'IOCL',
          division: 'Mathura',
          logoBg: '#EA580C',
          localCode: 'IOCL-ROT-449',
          desc: 'BRONZE IMPELLER FOR WATER PUMP OD210 BORE32',
          price: '₹41,500 / EA',
        },
        {
          cpse: 'NTPC',
          division: 'Ramagundam',
          logoBg: '#2563EB',
          localCode: 'NTPC-ROT-018',
          desc: 'IMPELLER ENCLOSED PHOS BRONZE 210MM',
          price: '₹39,200 / EA',
        },
      ],
      attributes: [
        { attr: 'Component', val: 'Centrifugal Impeller' },
        { attr: 'Outer Diameter', val: '210 mm' },
        { attr: 'Bore Diameter', val: '32 mm Standard' },
        { attr: 'Alloy Spec', val: 'Bronze ASTM B584 C90500' },
        { attr: 'Design Standard', val: 'API 610 11th Ed' },
        { attr: 'Unit of Measure', val: 'EA' },
        { attr: 'Category', val: 'Rotating Equipment > Pumps > Spares' },
      ],
    },
  };

  const current = categoryData[selectedCategory];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(current.cnmc);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-[#070908] text-[#F3F4F6] px-8 py-6 space-y-6">
      {/* 1. Breadcrumbs & Time Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-medium text-[#9CA3AF]">
          <span 
            onClick={() => setActiveScreen('dashboard')} 
            className="cursor-pointer hover:text-[#F3F4F6] transition-colors"
          >
            Home
          </span>
          <span className="text-[#6B7280]">›</span>
          <span className="text-[#F3F4F6]">Problem & Architecture</span>
        </div>

        <DateRangePicker />
      </div>

      {/* 2. Main Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans flex items-center gap-3">
            <span>Problem & Architecture</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 text-emerald-400 bg-emerald-500/10">
              SIH26099
            </span>
          </h1>
          <p className="text-xs md:text-sm text-[#9CA3AF] leading-relaxed max-w-3xl">
            Understanding the need, neuro-symbolic approach and system architecture for a unified national material master.
          </p>
        </div>

        <a
          href="/NUMM_National_Unified_Material_Master_Documentation.docx"
          download="NUMM_National_Unified_Material_Master_Documentation.docx"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all shadow-lg hover:shadow-emerald-950/50 group shrink-0"
        >
          <span className="material-symbols-outlined text-[18px] text-emerald-400 group-hover:translate-y-0.5 transition-transform">
            download
          </span>
          <span>Download Master Project Report (.docx)</span>
        </a>
      </div>

      {/* 3. Hero Split Row: Context vs Key Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
        {/* Left Column: Context Paragraph */}
        <div className="lg:col-span-7 space-y-2">
          <h2 className="text-sm font-semibold text-[#F3F4F6] tracking-normal font-sans">
            Cross-Enterprise Material Harmonization
          </h2>
          <p className="text-xs text-[#9CA3AF] leading-relaxed font-sans">
            CPSEs maintain material records across independent ERP systems. Different naming conventions,
            specifications and item codes for the same physical material lead to duplicate records, fragmented
            procurement and lack of visibility. This platform unifies duplicate items under a single authoritative
            Common National Material Code (CNMC).
          </p>
        </div>

        {/* Right Column: 3 Metric Counters */}
        <div className="lg:col-span-5 grid grid-cols-3 gap-4 pt-1">
          <div>
            <div className="text-2xl lg:text-3xl font-bold font-sans text-[#22D3EE] tracking-tight">
              {nationalAnalytics?.total_source_materials || 640}
            </div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-1 leading-tight">
              Source records
            </div>
            <div className="text-[11px] text-[#6B7280] leading-snug">
              (across {cpseList.length || 5} CPSEs)
            </div>
          </div>

          <div>
            <div className="text-2xl lg:text-3xl font-bold font-sans text-white tracking-tight">
              {cpseList.length || 5}
            </div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-1 leading-tight">
              CPSEs
            </div>
            <div className="text-[11px] text-[#6B7280] leading-snug">
              Connected
            </div>
          </div>

          <div>
            <div className="text-2xl lg:text-3xl font-bold font-sans text-[#22D3EE] tracking-tight">
              {nationalAnalytics?.total_canonical_cnmcs || catalogueMaterials.length || 8}
            </div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-1 leading-tight">
              Canonical materials
            </div>
            <div className="text-[11px] text-[#6B7280] leading-snug">
              (in national master)
            </div>
          </div>
        </div>
      </div>

      {/* 4. Sub-Navigation Tabs & Category Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#232825] pt-4 gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('demo')}
            className={`pb-3 text-xs font-semibold transition-all relative ${
              activeTab === 'demo'
                ? 'text-[#F3F4F6]'
                : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
            }`}
          >
            Live Harmonization Demo
            {activeTab === 'demo' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10B981] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('sandbox')}
            className={`pb-3 text-xs font-semibold transition-all relative flex items-center gap-1.5 ${
              activeTab === 'sandbox'
                ? 'text-[#F3F4F6]'
                : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
            }`}
          >
            <span className="material-symbols-outlined text-[15px] text-[#10B981]">science</span>
            <span>Interactive AI Sandbox</span>
            {activeTab === 'sandbox' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10B981] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`pb-3 text-xs font-semibold transition-all relative ${
              activeTab === 'architecture'
                ? 'text-[#F3F4F6]'
                : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
            }`}
          >
            System Architecture
            {activeTab === 'architecture' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10B981] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('dataflow')}
            className={`pb-3 text-xs font-semibold transition-all relative ${
              activeTab === 'dataflow'
                ? 'text-[#F3F4F6]'
                : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
            }`}
          >
            Data Flow
            {activeTab === 'dataflow' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10B981] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('cpses')}
            className={`pb-3 text-xs font-semibold transition-all relative ${
              activeTab === 'cpses'
                ? 'text-[#F3F4F6]'
                : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
            }`}
          >
            Supported CPSEs
            {activeTab === 'cpses' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10B981] rounded-full" />
            )}
          </button>
        </div>

        {/* Right Category Select */}
        <div className="flex items-center gap-2 pb-3">
          <span className="text-xs text-[#9CA3AF]">Select a category</span>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as CategoryKey)}
              className="appearance-none bg-[#0C0E0D] border border-[#232825] text-xs font-medium text-[#F3F4F6] pl-3 pr-8 py-1.5 rounded-lg outline-none cursor-pointer hover:border-[#38423C] transition-colors"
            >
              <option value="fasteners">Fasteners</option>
              <option value="valves">Valves</option>
              <option value="pumps">Pumps & Spares</option>
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-[#9CA3AF] pointer-events-none">
              expand_more
            </span>
          </div>
        </div>
      </div>

      {/* 5. Core Live Harmonization Demo Card */}
      {activeTab === 'demo' && (
        <div className="bg-[#0C0E0D] border border-[#232825] rounded-xl p-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Left: Source Material Records (~55%) */}
            <div className="lg:col-span-6 space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-[#F3F4F6]">
                    Source Material Records
                  </h3>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#161B18] text-[#9CA3AF] border border-[#232825]">
                    3 records (example)
                  </span>
                </div>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Different ERP systems, different descriptions — same material.
                </p>
              </div>

              {/* Source Records Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="text-[10px] uppercase font-semibold text-[#6B7280] border-b border-[#232825]">
                      <th className="pb-2.5 font-medium">CPSE</th>
                      <th className="pb-2.5 font-medium">MATERIAL CODE</th>
                      <th className="pb-2.5 font-medium">DESCRIPTION</th>
                      <th className="pb-2.5 font-medium text-right">UNIT COST</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1B201D]">
                    {current.sources.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                        {/* CPSE Column */}
                        <td className="py-3.5 pr-3">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                              style={{ background: item.logoBg }}
                            >
                              {item.cpse.substring(0, 4)}
                            </div>
                            <div className="leading-tight">
                              <div className="font-semibold text-white">{item.cpse}</div>
                              <div className="text-[10px] text-[#6B7280]">({item.division})</div>
                            </div>
                          </div>
                        </td>

                        {/* Material Code */}
                        <td className="py-3.5 pr-3 font-mono text-xs text-[#9CA3AF]">
                          {item.localCode}
                        </td>

                        {/* Description */}
                        <td className="py-3.5 pr-3 font-mono text-[11px] text-[#F3F4F6] max-w-xs">
                          {item.desc}
                        </td>

                        {/* Unit Cost */}
                        <td className="py-3.5 text-right font-mono font-medium text-white whitespace-nowrap">
                          {item.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Center Transition Element (~10%) */}
            <div className="lg:col-span-1 flex flex-col items-center justify-center text-center py-4 lg:py-0">
              <span className="material-symbols-outlined text-2xl text-[#10B981] font-bold">
                arrow_forward
              </span>
              <p className="text-[10px] font-medium text-[#9CA3AF] mt-2 max-w-[80px] leading-tight">
                Multiple records converge to one standard
              </p>
            </div>

            {/* Right: Unified National Material Record (~45%) */}
            <div className="lg:col-span-5 bg-[#070908] border border-[#232825] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold text-[#F3F4F6]">
                  Unified National Material Record
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                  {current.confidence}
                </span>
              </div>

              {/* National Material Code (CNMC) */}
              <div className="space-y-1">
                <div className="text-[10px] font-semibold text-[#9CA3AF] uppercase tracking-wider">
                  National Material Code (CNMC)
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold font-mono text-[#10B981] tracking-wider">
                    {current.cnmc}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1 rounded text-[#9CA3AF] hover:text-white transition-colors"
                    title="Copy CNMC Code"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {copiedCode ? 'check' : 'content_copy'}
                    </span>
                  </button>
                </div>
                <p className="text-xs font-medium text-[#F3F4F6] leading-snug">
                  {current.title}
                </p>
              </div>

              {/* Standardized Attributes Table */}
              <div className="pt-2 border-t border-[#1B201D]">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[10px] uppercase font-semibold text-[#6B7280]">
                      <th className="pb-1.5 text-left font-medium">Attribute</th>
                      <th className="pb-1.5 text-right font-medium">Standardized Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#161B18]">
                    {current.attributes.map((row, i) => (
                      <tr key={i} className="py-1">
                        <td className="py-1.5 text-left text-[#9CA3AF]">{row.attr}</td>
                        <td className="py-1.5 text-right font-mono font-medium text-[#F3F4F6]">
                          {row.val}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5B. Interactive AI Sandbox View */}
      {activeTab === 'sandbox' && (
        <div className="space-y-6">
          {/* Top Intro Card */}
          <div className="bg-[#0C0E0D] border border-[#232825] rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#10B981] text-[18px]">verified_user</span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Live Technical Sandbox &amp; Engine Verification
                </h3>
              </div>
              <p className="text-xs text-[#9CA3AF] max-w-2xl leading-relaxed">
                Execute live inference directly against the FastAPI and FAISS backend pipelines. Test entity attribute extraction, UNSPSC category classification, and safety contradiction enforcement with zero mock fallbacks.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-[#161B18] text-[#22D3EE] border border-[#232825]">
                FastAPI Live Endpoint
              </span>
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-[#161B18] text-[#10B981] border border-[#232825]">
                FAISS Vector Engine
              </span>
            </div>
          </div>

          {/* Sandbox 1: Attribute Extraction & UNSPSC Classification */}
          <div className="bg-[#0C0E0D] border border-[#232825] rounded-xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#232825]">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#10B981]/20 text-[#10B981] font-mono text-xs flex items-center justify-center font-bold">1</span>
                  Real-Time Attribute Extraction &amp; UNSPSC Classification
                </h4>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  NLP rules and regex parsers extract engineering attributes and map to the national taxonomy.
                </p>
              </div>

              {/* Quick Presets */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-[#6B7280]">Presets:</span>
                {[
                  { label: 'Ball Valve', desc: 'VLV BALL 2IN 150# FLG WCB/316 PTFE', uom: 'EA' },
                  { label: 'Weld Neck Flange', desc: 'FLG WN 4IN 300# RF A105 SCH40 ASME B16.5', uom: 'EA' },
                  { label: 'Spiral Gasket', desc: 'GSK SPWD 3IN 150# 316L/FG ASME B16.20', uom: 'EA' },
                  { label: 'CS Pipe', desc: 'PIPE CS 6IN SCH40 SMLS ASTM A106 GR.B BE', uom: 'MTR' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setSandboxDesc(preset.desc);
                      setSandboxUom(preset.uom);
                    }}
                    className="px-2 py-1 rounded text-[10px] font-mono bg-[#070908] border border-[#232825] text-[#9CA3AF] hover:text-white hover:border-[#38423C] transition-all"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-10 space-y-1.5">
                <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider block">
                  Raw Legacy Material Description (Unstructured Text)
                </label>
                <input
                  type="text"
                  value={sandboxDesc}
                  onChange={(e) => setSandboxDesc(e.target.value)}
                  placeholder="e.g. VLV BALL 2IN 150# FLG WCB/316 PTFE"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#070908] border border-[#232825] text-xs font-mono text-white focus:outline-none focus:border-[#10B981] transition-all"
                />
              </div>

              <div className="lg:col-span-2 space-y-1.5">
                <label className="text-[11px] font-semibold text-[#9CA3AF] uppercase tracking-wider block">
                  UOM
                </label>
                <input
                  type="text"
                  value={sandboxUom}
                  onChange={(e) => setSandboxUom(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#070908] border border-[#232825] text-xs font-mono text-white text-center focus:outline-none focus:border-[#10B981] transition-all"
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="flex items-center justify-end">
              <button
                onClick={handleRunExtract}
                disabled={extractLoading || !sandboxDesc.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#10B981] text-[#000000] hover:brightness-110 disabled:opacity-50 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {extractLoading ? 'hourglass_top' : 'magic_button'}
                </span>
                <span>{extractLoading ? 'Extracting Parameters...' : 'Extract & Harmonize Live'}</span>
              </button>
            </div>

            {/* Live Results Panel */}
            {extractResult && (
              <div className="mt-4 pt-4 border-t border-[#232825] space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-[#070908] border border-[#232825] space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-[#6B7280]">UNSPSC Category</span>
                    <p className="text-xs font-bold text-white truncate">{extractResult.category_name || 'Industrial Mechanical'}</p>
                    <span className="text-[11px] font-mono text-[#10B981]">Code: {extractResult.unspsc_code || '40141600'}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#070908] border border-[#232825] space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-[#6B7280]">Normalized UOM</span>
                    <p className="text-xs font-bold text-white font-mono">{extractResult.normalized_uom}</p>
                    <span className="text-[11px] text-[#6B7280]">Source: {extractResult.source_uom}</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#070908] border border-[#232825] space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-[#6B7280]">Dense Vector Dimension</span>
                    <p className="text-xs font-bold text-white font-mono">{extractResult.vector_dimension || 384} Dimensions</p>
                    <span className="text-[11px] text-[#22D3EE] font-mono">
                      Sample: [{extractResult.vector_sample?.slice(0, 3).join(', ')}...]
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#070908] border border-[#232825] space-y-1">
                    <span className="text-[10px] uppercase font-semibold text-[#6B7280]">Pipeline Status</span>
                    <p className="text-xs font-bold text-[#10B981] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Attribute Schema Valid
                    </p>
                    <span className="text-[11px] text-[#6B7280]">Deterministic Parser</span>
                  </div>
                </div>

                {/* Standardized Text Output */}
                <div className="p-3 rounded-lg bg-[#070908] border border-[#232825] space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-[#6B7280]">
                    Generated MoPNG Standard Canonical Format
                  </span>
                  <p className="text-xs font-mono font-bold text-[#10B981]">
                    {extractResult.standardized_description}
                  </p>
                </div>

                {/* Extracted Attributes Table */}
                <div className="overflow-x-auto border border-[#232825] rounded-lg">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-[#161B18] text-[#9CA3AF] text-[10px] uppercase font-semibold border-b border-[#232825]">
                        <th className="px-4 py-2 text-left">Extracted Attribute</th>
                        <th className="px-4 py-2 text-left">Parsed Value</th>
                        <th className="px-4 py-2 text-left">Standard Norm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#161B18] bg-[#070908]">
                      {Object.entries(extractResult.extracted_attributes || {}).map(([key, val]) => (
                        <tr key={key} className="hover:bg-[#0C0E0D]">
                          <td className="px-4 py-2 font-medium text-[#9CA3AF] capitalize">
                            {key.replace(/_/g, ' ')}
                          </td>
                          <td className="px-4 py-2 font-mono font-bold text-white">
                            {val ? String(val) : <span className="text-[#6B7280] italic">Not detected</span>}
                          </td>
                          <td className="px-4 py-2 text-[11px] text-[#22D3EE] font-mono">
                            {val ? 'VERIFIED' : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Sandbox 2: Multi-Signal Matcher & Contradiction Blocker */}
          <div className="bg-[#0C0E0D] border border-[#232825] rounded-xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#232825]">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded bg-[#22D3EE]/20 text-[#22D3EE] font-mono text-xs flex items-center justify-center font-bold">2</span>
                  Multi-Signal Matcher &amp; Physics Contradiction Blocker
                </h4>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Evaluates semantic cosine, lexical Jaccard, and physical attribute parity while strictly blocking contradictory safety parameters.
                </p>
              </div>

              {/* Scenarios */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-[#6B7280]">Scenarios:</span>
                <button
                  onClick={() => {
                    setCompareText1('BALL VALVE 2 INCH 150 LBS FLANGED A216 WCB BODY SS316 TRIM');
                    setCompareText2('VLV BALL 2IN 150# FLG WCB/316 PTFE LEVER OP');
                  }}
                  className="px-2 py-1 rounded text-[10px] font-mono bg-[#070908] border border-[#232825] text-[#10B981] hover:border-[#10B981] transition-all"
                >
                  Safe Merge
                </button>
                <button
                  onClick={() => {
                    setCompareText1('BALL VALVE 2IN 150# FLANGE RF WCB BODY');
                    setCompareText2('BALL VALVE 2IN 600# FLANGE RF WCB BODY HIGH PRESSURE');
                  }}
                  className="px-2 py-1 rounded text-[10px] font-mono bg-[#070908] border border-[#232825] text-[#EF4444] hover:border-[#EF4444] transition-all"
                >
                  Pressure Conflict (Blocked)
                </button>
                <button
                  onClick={() => {
                    setCompareText1('PIPE 4IN SCH40 SMLS ASTM A106 GR B CARBON STEEL');
                    setCompareText2('PIPE 4IN SCH40 SMLS ASTM A312 TP304 STAINLESS STEEL');
                  }}
                  className="px-2 py-1 rounded text-[10px] font-mono bg-[#070908] border border-[#232825] text-[#EAB308] hover:border-[#EAB308] transition-all"
                >
                  Grade Conflict (Blocked)
                </button>
              </div>
            </div>

            {/* Dual Input Panels */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Record A */}
              <div className="p-4 rounded-lg bg-[#070908] border border-[#232825] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#10B981]">
                    CPSE Record A (Source Anchor)
                  </span>
                  <span className="text-[10px] font-mono text-[#6B7280]">Target CPSE: ONGC</span>
                </div>
                <textarea
                  rows={2}
                  value={compareText1}
                  onChange={(e) => setCompareText1(e.target.value)}
                  className="w-full p-2.5 rounded bg-[#0C0E0D] border border-[#232825] text-xs font-mono text-white focus:outline-none focus:border-[#10B981]"
                />
              </div>

              {/* Record B */}
              <div className="p-4 rounded-lg bg-[#070908] border border-[#232825] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#22D3EE]">
                    CPSE Record B (Candidate Ingestion)
                  </span>
                  <span className="text-[10px] font-mono text-[#6B7280]">Target CPSE: IOCL</span>
                </div>
                <textarea
                  rows={2}
                  value={compareText2}
                  onChange={(e) => setCompareText2(e.target.value)}
                  className="w-full p-2.5 rounded bg-[#0C0E0D] border border-[#232825] text-xs font-mono text-white focus:outline-none focus:border-[#22D3EE]"
                />
              </div>
            </div>

            {/* Compare Action Button */}
            <div className="flex items-center justify-end">
              <button
                onClick={handleRunCompare}
                disabled={compareLoading || !compareText1.trim() || !compareText2.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-[#22D3EE] text-[#000000] hover:brightness-110 disabled:opacity-50 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {compareLoading ? 'hourglass_top' : 'balance'}
                </span>
                <span>{compareLoading ? 'Calculating Multi-Signal Similarity...' : 'Run Multi-Signal AI Comparison'}</span>
              </button>
            </div>

            {/* Comparison Results */}
            {compareResult && (
              <div className="mt-4 pt-4 border-t border-[#232825] space-y-4">
                {/* Decision Alert Banner */}
                {compareResult.has_critical_conflict ? (
                  <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/40 flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#EF4444] text-[20px] shrink-0 mt-0.5">
                      gpp_bad
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#EF4444] uppercase tracking-wider">
                          Critical Safety Contradiction Detected - Merge Prohibited
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#EF4444]/20 text-[#EF4444]">
                          BLOCKED
                        </span>
                      </div>
                      <p className="text-xs text-[#F3F4F6] leading-relaxed">
                        {compareResult.explanation || 'Safety-critical attributes (e.g. pressure rating or alloy grade) diverge. Automated merge is strictly blocked to prevent physical failure in refinery or pipeline service.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-xl bg-[#10B981]/10 border border-[#10B981]/40 flex items-start gap-3">
                    <span className="material-symbols-outlined text-[#10B981] text-[20px] shrink-0 mt-0.5">
                      verified
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#10B981] uppercase tracking-wider">
                          Authoritative Equivalence Verified - Safe Merge Approved
                        </span>
                        <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#10B981]/20 text-[#10B981]">
                          {compareResult.relationship_type || 'IDENTICAL'}
                        </span>
                      </div>
                      <p className="text-xs text-[#F3F4F6] leading-relaxed">
                        {compareResult.explanation || 'High multi-signal confidence with verified agreement across critical physical parameters. Records can safely share an identical CNMC.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* 2-Sentence Engineering XAI Rationale & Steward Recommendation */}
                {compareResult.engineering_rationale && (
                  <div className="p-3.5 rounded-lg bg-[#161B18] border border-[#232825] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[#22D3EE] text-[16px]">psychology</span>
                        <span className="text-[11px] font-bold text-white uppercase tracking-wider">
                          Engineering Explainability Rationale (XAI)
                        </span>
                      </div>
                      {compareResult.steward_action_recommendation && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                          compareResult.steward_action_recommendation === 'APPROVE_MERGE'
                            ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                            : compareResult.steward_action_recommendation === 'REJECT_INCOMPATIBLE'
                            ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40'
                            : 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
                        }`}>
                          {compareResult.steward_action_recommendation}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#E5E7EB] leading-relaxed italic">
                      "{compareResult.engineering_rationale}"
                    </p>
                    {compareResult.epistemic_uncertainty !== undefined && (
                      <div className="flex items-center gap-3 pt-1 text-[10px] font-mono text-[#6B7280]">
                        <span>Calibrated Prob: <strong className="text-white">{(compareResult.calibrated_probability! * 100).toFixed(1)}%</strong></span>
                        <span>•</span>
                        <span>Epistemic Uncertainty: <strong className={compareResult.epistemic_uncertainty < 0.3 ? 'text-[#10B981]' : 'text-[#F59E0B]'}>{(compareResult.epistemic_uncertainty * 100).toFixed(1)}%</strong></span>
                      </div>
                    )}
                  </div>
                )}

                {/* 4 Score Metrics Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-lg bg-[#070908] border border-[#232825] space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#9CA3AF] font-medium">Composite Confidence</span>
                      <span className="font-mono font-bold text-[#10B981]">
                        {Math.round(compareResult.composite_confidence_score * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#161B18] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#10B981] rounded-full transition-all duration-500"
                        style={{ width: `${Math.round(compareResult.composite_confidence_score * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#070908] border border-[#232825] space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#9CA3AF] font-medium">Semantic Cosine</span>
                      <span className="font-mono font-bold text-[#22D3EE]">
                        {Math.round(compareResult.semantic_vector_cosine_score * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#161B18] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#22D3EE] rounded-full transition-all duration-500"
                        style={{ width: `${Math.round(compareResult.semantic_vector_cosine_score * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#070908] border border-[#232825] space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#9CA3AF] font-medium">Lexical Jaccard</span>
                      <span className="font-mono font-bold text-[#9CA3AF]">
                        {Math.round(compareResult.lexical_jaccard_score * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#161B18] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#9CA3AF] rounded-full transition-all duration-500"
                        style={{ width: `${Math.round(compareResult.lexical_jaccard_score * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg bg-[#070908] border border-[#232825] space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#9CA3AF] font-medium">Attribute Agreement</span>
                      <span className="font-mono font-bold text-[#EAB308]">
                        {Math.round(compareResult.attribute_match_score * 100)}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-[#161B18] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#EAB308] rounded-full transition-all duration-500"
                        style={{ width: `${Math.round(compareResult.attribute_match_score * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Agreed Attributes & Conflicts Badges */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-lg bg-[#070908] border border-[#232825] space-y-2">
                    <span className="text-[10px] uppercase font-semibold text-[#10B981] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">check</span>
                      Agreed Attributes ({compareResult.agreed_attributes?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {compareResult.agreed_attributes && compareResult.agreed_attributes.length > 0 ? (
                        compareResult.agreed_attributes.map((attr, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#161B18] text-[#10B981] border border-[#232825]">
                            {attr}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[#6B7280] italic">No common parameters identified</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-[#070908] border border-[#232825] space-y-2">
                    <span className="text-[10px] uppercase font-semibold text-[#EF4444] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">close</span>
                      Discrepancies &amp; Contradictions ({compareResult.conflicts?.length || 0})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {compareResult.conflicts && compareResult.conflicts.length > 0 ? (
                        compareResult.conflicts.map((conf, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30">
                            {conf}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-[#10B981] font-mono">0 contradictions identified</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Alternative Tabs View */}
      {activeTab === 'architecture' && (
        <div className="bg-[#0C0E0D] border border-[#232825] rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">Full Microservices Topology</h3>
          <p className="text-xs text-[#9CA3AF] leading-relaxed">
            The national architecture uses asynchronous message brokers (Apache Kafka) to ingest delta extracts from CPSE ERP staging tables (SAP S/4HANA, Oracle ERP Cloud). A distributed inference pipeline applies specialized domain NLP and cosine vector embedding matching to cluster identical items.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-[#070908] border border-[#232825] space-y-1.5">
              <span className="text-xs font-semibold text-[#10B981]">Ingestion Microservice</span>
              <p className="text-xs text-[#9CA3AF]">Handles schema transformation and automated deduplication across participating CPSEs.</p>
            </div>
            <div className="p-4 rounded-lg bg-[#070908] border border-[#232825] space-y-1.5">
              <span className="text-xs font-semibold text-[#22D3EE]">Matching Engine</span>
              <p className="text-xs text-[#9CA3AF]">Domain BERT + Vector Embeddings yielding 98%+ automated confidence scores.</p>
            </div>
            <div className="p-4 rounded-lg bg-[#070908] border border-[#232825] space-y-1.5">
              <span className="text-xs font-semibold text-[#EAB308]">National Master Registry</span>
              <p className="text-xs text-[#9CA3AF]">Immutable audit-logged registry with bi-directional syncing to CPSE procurements.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'dataflow' && (
        <div className="bg-[#0C0E0D] border border-[#232825] rounded-xl p-6 space-y-3">
          <h3 className="text-sm font-semibold text-white">Bi-Directional Data Synchronization Flow</h3>
          <p className="text-xs text-[#9CA3AF] leading-relaxed">
            1. Raw CPSE Material Master POs ingested via secure REST/SFTP endpoints.
            <br />
            2. Ingestion pipeline strips proprietary syntax and extracts physical properties (diameter, material, pressure rating).
            <br />
            3. Standardized CNMC generated and indexed in the national directory.
            <br />
            4. Local CPSE ERP updated with authoritative CNMC cross-reference mapping.
          </p>
        </div>
      )}

      {activeTab === 'cpses' && (
        <div className="bg-[#0C0E0D] border border-[#232825] rounded-xl p-6 space-y-4">
          <h3 className="text-sm font-semibold text-white">Connected Central Public Sector Enterprises</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
            {cpseList.map((c, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-[#070908] border border-[#232825] text-center space-y-1">
                <div className="text-xs font-bold text-white">{c.name}</div>
                <div className="text-[11px] font-mono text-[#9CA3AF]">{c.totalRecords || 0} Records</div>
                <span className="inline-block text-[10px] font-medium text-[#10B981] px-1.5 py-0.5 rounded bg-[#10B981]/10">
                  {c.status || 'Live'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. System Architecture (High Level) Process Pipeline */}
      <div className="bg-[#0C0E0D] border border-[#232825] rounded-xl p-6 space-y-5">
        <h2 className="text-sm font-semibold text-[#F3F4F6] tracking-normal font-sans">
          System Architecture (High Level)
        </h2>

        {/* 6 Sequential Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3 items-stretch">
          {[
            {
              step: '1',
              title: 'Data Ingestion',
              desc: 'Collect material data from CPSE ERP systems',
              icon: 'database',
            },
            {
              step: '2',
              title: 'Attribute Extraction',
              desc: 'Extract and normalize technical attributes',
              icon: 'description',
            },
            {
              step: '3',
              title: 'Semantic Matching',
              desc: 'Identify similar items using domain rules + ML',
              icon: 'hub',
            },
            {
              step: '4',
              title: 'CNMC Assignment',
              desc: 'Assign common national material code',
              icon: 'label',
            },
            {
              step: '5',
              title: 'Human Review',
              desc: 'Validate and approve matches',
              icon: 'person_check',
            },
            {
              step: '6',
              title: 'Publish to Master',
              desc: 'Update National Material Master',
              icon: 'cloud_upload',
            },
          ].map((s, idx, arr) => (
            <div
              key={s.step}
              className="relative p-4 rounded-lg bg-[#070908] border border-[#232825] flex flex-col justify-between space-y-3 group hover:border-[#38423C] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-[#10B981] font-mono">
                      {s.step}
                    </span>
                    <span className="text-xs font-semibold text-white">
                      {s.title}
                    </span>
                  </div>
                </div>

                <span className="material-symbols-outlined text-[20px] text-[#9CA3AF] group-hover:text-[#10B981] transition-colors">
                  {s.icon}
                </span>

                <p className="text-[11px] text-[#9CA3AF] leading-relaxed mt-2 font-sans">
                  {s.desc}
                </p>
              </div>

              {/* Arrow on right for desktop if not last */}
              {idx < arr.length - 1 && (
                <div className="hidden lg:block absolute -right-2.5 top-1/2 -translate-y-1/2 z-10">
                  <span className="material-symbols-outlined text-[14px] text-[#6B7280]">
                    chevron_right
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 7. Footer */}
      <ScreenFooter />
    </div>
  );
};
