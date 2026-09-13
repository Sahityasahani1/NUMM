import React, { useState } from 'react';
import { runLiveHarmonize, runLiveCompare, LiveHarmonizeResult, LiveCompareResult } from '../../services/api';

export const LiveSandboxes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'extract' | 'compare'>('extract');

  // Sandbox 1: Extraction State
  const [extractText, setExtractText] = useState('VLV BALL 2IN 150# ASTM A216 WCB RF');
  const [extractUom, setExtractUom] = useState('EA');
  const [extractResult, setExtractResult] = useState<LiveHarmonizeResult | null>(null);
  const [extractLoading, setExtractLoading] = useState(false);
  const [extractError, setExtractError] = useState<string | null>(null);

  // Sandbox 2: Compare State
  const [compareText1, setCompareText1] = useState('BALL VALVE 2IN 150# CS WCB');
  const [compareUom1, setCompareUom1] = useState('EA');
  const [compareText2, setCompareText2] = useState('2 INCH 150 LB WCB BALL VALVE');
  const [compareUom2, setCompareUom2] = useState('EA');
  const [compareResult, setCompareResult] = useState<LiveCompareResult | null>(null);
  const [compareLoading, setCompareLoading] = useState(false);
  const [compareError, setCompareError] = useState<string | null>(null);

  // Extraction handler
  const handleRunExtract = async () => {
    if (!extractText.trim()) return;
    setExtractLoading(true);
    setExtractError(null);
    try {
      const res = await runLiveHarmonize(extractText, extractUom);
      setExtractResult(res);
    } catch (err: any) {
      setExtractError(err?.message || 'Error executing live extraction');
    } finally {
      setExtractLoading(false);
    }
  };

  // Compare handler
  const handleRunCompare = async () => {
    if (!compareText1.trim() || !compareText2.trim()) return;
    setCompareLoading(true);
    setCompareError(null);
    try {
      const res = await runLiveCompare(compareText1, compareText2, compareUom1, compareUom2);
      setCompareResult(res);
    } catch (err: any) {
      setCompareError(err?.message || 'Error executing live comparison');
    } finally {
      setCompareLoading(false);
    }
  };

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
      {/* Sandbox Header */}
      <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-hover)' }}>
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]" style={{ color: 'var(--blue)' }}>bolt</span>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Interactive AI Sandbox &amp; Architecture Engine
            </h3>
          </div>
          <p className="text-xs text-[#a1a1aa] mt-0.5">
            Test real-time regex attribute normalization, FAISS semantic vector alignment, and physics contradiction blocking live.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex p-1 rounded-lg shrink-0" style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}>
          <button
            onClick={() => setActiveTab('extract')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'extract'
                ? 'bg-[#8b5cf6] text-white shadow-sm'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            1. Attribute Extractor &amp; UNSPSC
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'compare'
                ? 'bg-[#8b5cf6] text-white shadow-sm'
                : 'text-[#a1a1aa] hover:text-white'
            }`}
          >
            2. Multi-Signal Comparator
          </button>
        </div>
      </div>

      {/* Tab 1: Extraction */}
      {activeTab === 'extract' && (
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#71717a] font-medium">Quick Industry Presets:</span>
            {[
              { label: 'Ball Valve', text: 'VLV BALL 2IN 150# ASTM A216 WCB RF', uom: 'EA' },
              { label: 'Weld Neck Flange', text: 'FLG WN 4IN 600# A105 SCH 40 ASME B16.5', uom: 'NOS' },
              { label: 'Spiral Gasket', text: 'GSKT SPWD 3IN 150# SS316 ASME B16.20', uom: 'PC' },
              { label: 'Seamless Pipe', text: 'SEAMLESS PIPE 6IN SCH 80 ASTM A106 GR B', uom: 'MTR' }
            ].map(p => (
              <button
                key={p.label}
                onClick={() => {
                  setExtractText(p.text);
                  setExtractUom(p.uom);
                }}
                className="px-2.5 py-1 rounded text-xs transition-all hover:border-[#8b5cf6] hover:text-white"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-10 space-y-1">
              <label className="text-xs font-semibold text-[#a1a1aa]">Raw Procurement Material Description</label>
              <input
                type="text"
                value={extractText}
                onChange={e => setExtractText(e.target.value)}
                placeholder="Type or paste any industrial material string..."
                className="w-full px-3.5 py-2.5 rounded-lg text-sm outline-none text-white font-mono"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
              />
            </div>
            <div className="md:col-span-2">
              <button
                onClick={handleRunExtract}
                disabled={extractLoading}
                className="w-full py-2.5 px-4 rounded-lg text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 hover:brightness-110 disabled:opacity-50"
                style={{ background: 'var(--blue)' }}
              >
                <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                {extractLoading ? 'Extracting...' : 'Run Extraction'}
              </button>
            </div>
          </div>

          {extractError && (
            <div className="p-3 rounded-lg text-xs text-rose-400 bg-rose-950/40 border border-rose-800">
              {extractError}
            </div>
          )}

          {extractResult && (
            <div className="rounded-xl p-4 space-y-3 mt-4 animate-fade-in" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>
              <div className="flex flex-wrap justify-between items-center gap-2">
                <span className="text-xs uppercase font-bold text-[#8b5cf6] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">verified</span>
                  Standard MoPNG Canonical Title
                </span>
                <span className="font-mono text-xs px-2.5 py-1 rounded bg-[#8b5cf6]/20 text-[#c4b5fd] border border-[#8b5cf6]/40">
                  UNSPSC: {extractResult.unspsc_code} • {extractResult.category_name}
                </span>
              </div>
              <div className="text-sm font-semibold text-white">
                {extractResult.standardized_description}
              </div>

              <div className="pt-3 border-t border-white/5 space-y-2">
                <span className="text-xs uppercase font-semibold text-[#71717a]">Extracted &amp; Standardized Attributes:</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {Object.entries(extractResult.extracted_attributes).map(([k, v]) => (
                    <div key={k} className="p-2.5 rounded-lg" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                      <span className="text-[10px] uppercase font-bold text-[#71717a] block">{k}</span>
                      <span className="text-xs font-mono font-bold text-white block truncate">{String(v) || '—'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Dual Record Comparator */}
      {activeTab === 'compare' && (
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#71717a] font-medium">Test Safety Scenarios:</span>
            {[
              {
                label: '1. Identical Paraphrases',
                t1: 'BALL VALVE 2IN 150# CS WCB',
                t2: '2 INCH 150 LB WCB BALL VALVE'
              },
              {
                label: '2. 🚨 Pressure Hazard (150# vs 600#)',
                t1: 'GATE VALVE 4IN 150# WCB',
                t2: 'GATE VALVE 4IN 600# WCB'
              },
              {
                label: '3. 🚨 Alloy Incompatibility (CS vs SS316)',
                t1: 'FLANGE WN 2IN 300# ASTM A105',
                t2: 'FLANGE WN 2IN 300# SS 316'
              }
            ].map(s => (
              <button
                key={s.label}
                onClick={() => {
                  setCompareText1(s.t1);
                  setCompareText2(s.t2);
                }}
                className="px-2.5 py-1 rounded text-xs transition-all hover:border-[#8b5cf6] hover:text-white"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#a1a1aa]">Record A (e.g. ONGC)</label>
              <input
                type="text"
                value={compareText1}
                onChange={e => setCompareText1(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg text-xs font-mono text-white outline-none"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#a1a1aa]">Record B (e.g. IOCL / GAIL)</label>
              <input
                type="text"
                value={compareText2}
                onChange={e => setCompareText2(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg text-xs font-mono text-white outline-none"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleRunCompare}
              disabled={compareLoading}
              className="py-2 px-5 rounded-lg text-xs font-bold text-white transition-all flex items-center gap-1.5 hover:brightness-110 disabled:opacity-50"
              style={{ background: 'var(--blue)' }}
            >
              <span className="material-symbols-outlined text-[16px]">compare_arrows</span>
              {compareLoading ? 'Evaluating...' : 'Compare Dual Records'}
            </button>
          </div>

          {compareError && (
            <div className="p-3 rounded-lg text-xs text-rose-400 bg-rose-950/40 border border-rose-800">
              {compareError}
            </div>
          )}

          {compareResult && (
            <div className="rounded-xl p-5 space-y-4 animate-fade-in" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}>
              {/* Decision Banner */}
              {compareResult.has_critical_conflict ? (
                <div className="p-4 rounded-xl flex items-start gap-3 bg-rose-950/60 border border-rose-600 text-rose-200">
                  <span className="material-symbols-outlined text-2xl text-rose-400 shrink-0">dangerous</span>
                  <div>
                    <h4 className="text-sm font-bold text-rose-300">
                      🚨 Critical Engineering Contradiction Blocker Activated
                    </h4>
                    <p className="text-xs text-rose-200/90 mt-0.5">
                      Physical attribute conflict detected. High lexical or vector similarity cannot bypass critical safety thresholds. Consolidation is strictly blocked.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl flex items-start gap-3 bg-emerald-950/60 border border-emerald-600 text-emerald-200">
                  <span className="material-symbols-outlined text-2xl text-emerald-400 shrink-0">check_circle</span>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-300">
                      ✓ Safe for Equivalence Consolidation
                    </h4>
                    <p className="text-xs text-emerald-200/90 mt-0.5">
                      No engineering contradictions detected. High semantic and attribute agreement confirms candidate interchangeability.
                    </p>
                  </div>
                </div>
              )}

              {/* Score breakdown meters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-[#71717a] block">Composite Confidence</span>
                  <span className="text-lg font-mono font-bold text-[#8b5cf6]">
                    {(compareResult.composite_confidence_score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-[#71717a] block">Dense Vector Cosine</span>
                  <span className="text-lg font-mono font-bold text-white">
                    {(compareResult.semantic_vector_cosine_score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-[#71717a] block">Lexical Jaccard</span>
                  <span className="text-lg font-mono font-bold text-white">
                    {(compareResult.lexical_jaccard_score * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-black/40 border border-white/5">
                  <span className="text-[10px] uppercase font-bold text-[#71717a] block">Attribute Match</span>
                  <span className="text-lg font-mono font-bold text-white">
                    {(compareResult.attribute_match_score * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              {/* Explainability note */}
              <div className="p-3.5 rounded-lg text-xs leading-relaxed text-[#a1a1aa] bg-black/30 border border-white/5">
                <strong className="text-white">Explanation: </strong>
                {compareResult.explanation}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
