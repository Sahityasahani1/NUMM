import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ScreenFooter } from '../common/FooterLegalModal';
import { AnimatedThemeToggle } from '@/components/ui/animated-theme-toggle';
import { api } from '../../services/api';

export const SettingsScreen: React.FC = () => {
  const { theme, toggleTheme, openUploadModal, addToast, catalogueMaterials, nationalAnalytics, refreshAllData } = useApp();
  const [cadence, setCadence] = useState('Real-Time WebSockets');
  const [defaultLanding, setDefaultLanding] = useState('Executive Overview');
  const [approvalThreshold, setApprovalThreshold] = useState(98);
  const [matchingModel, setMatchingModel] = useState('all-MiniLM-L6-v2 + FAISS IndexFlatIP');

  const [loadingBenchmark, setLoadingBenchmark] = useState(false);
  const [benchmarkStatus, setBenchmarkStatus] = useState<{ rows: number; vectors: number } | null>(null);
  const [runningMatching, setRunningMatching] = useState(false);

  const handleLoadBenchmark = async () => {
    setLoadingBenchmark(true);
    try {
      const res = await api.loadBenchmark500();
      setBenchmarkStatus({ rows: res.rows_loaded, vectors: res.total_faiss_indexed });
      addToast('success', `Benchmark Ingestion Complete: ${res.rows_loaded} MRO items indexed into FAISS vector space.`);
      if (refreshAllData) await refreshAllData();
    } catch (err: any) {
      addToast('error', err?.message || 'Failed to load benchmark dataset');
    } finally {
      setLoadingBenchmark(false);
    }
  };

  const handleRunMatchingEngine = async () => {
    setRunningMatching(true);
    try {
      const res = await api.runMatchingEngine();
      addToast('success', `Matching Engine Finished: ${res.groups_created} equivalence groups generated.`);
      if (refreshAllData) await refreshAllData();
    } catch (err: any) {
      addToast('error', err?.message || 'Failed to execute matching engine');
    } finally {
      setRunningMatching(false);
    }
  };

  const handleIntegrityCheck = async () => {
    try {
      const res = await api.checkIntegrity();
      if (res.status === 'HEALTHY') {
        addToast('success', `Catalog Schema Integrity Check: ${res.total_records_checked} verified records in active database with 0 anomalies.`);
      } else {
        addToast('warning', `Integrity Warning: ${res.anomalies_count} anomalies detected.`);
      }
    } catch (err: any) {
      addToast('error', err?.message || 'Integrity check failed');
    }
  };

  const handleFlushCache = async () => {
    try {
      const res = await api.flushCache();
      addToast('info', res.message || 'Local metadata and session cache successfully flushed.');
    } catch (err: any) {
      addToast('error', err?.message || 'Flush cache failed');
    }
  };

  const handleExportConfig = () => {
    const config = {
      platform: 'National Unified Material Master',
      version: '2024.4 LTS',
      taxonomyStandard: 'MoPNG v3.0',
      autoApprovalThreshold: 0.98,
      matchingModel: 'all-MiniLM-L6-v2 + FAISS IndexFlatIP',
      uomNormalization: true,
      dataResidency: 'MeitY National Cloud',
      exportedAt: new Date().toISOString(),
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    addToast('success', 'Configuration JSON copied to clipboard.');
  };

  const { setActiveScreen } = useApp();

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
          <span className="text-[#F3F4F6]">Settings</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0C0E0D] border border-[#232825] text-xs text-[#9CA3AF]">
          <span className="material-symbols-outlined text-[15px] text-[#9CA3AF]">tune</span>
          <span>Platform v2024.4 LTS</span>
        </div>
      </div>

      {/* 2. Page Title Block */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
          Settings & Platform Configuration
        </h1>
        <p className="text-xs md:text-sm text-[#9CA3AF] leading-relaxed max-w-4xl">
          Manage system-wide taxonomy standards, automated machine learning thresholds, enterprise connector schedules, and governance policies.
        </p>
      </div>

      {/* 3. Hero Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-1">
        <div className="lg:col-span-7 space-y-2">
          <h2 className="text-sm font-semibold text-[#F3F4F6] tracking-normal font-sans">
            National Cataloging Framework Configuration
          </h2>
          <p className="text-xs text-[#9CA3AF] leading-relaxed font-sans">
            Policies defined here govern real-time delta ingestions, confidence cutoffs for automated CNMC assignments, and data retention mandates under statutory petroleum ministry guidelines.
          </p>
        </div>

        <div className="lg:col-span-5 grid grid-cols-3 gap-4 pt-1">
          <div>
            <div className="text-2xl lg:text-3xl font-bold font-sans text-[#10B981] tracking-tight">
              98%
            </div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-1 leading-tight">
              Auto-Approval Cutoff
            </div>
            <div className="text-[11px] text-[#6B7280] leading-snug">
              ML threshold
            </div>
          </div>

          <div>
            <div className="text-2xl lg:text-3xl font-bold font-sans text-white tracking-tight">
              v3.0
            </div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-1 leading-tight">
              Schema Standard
            </div>
            <div className="text-[11px] text-[#6B7280] leading-snug">
              MoPNG Taxonomy
            </div>
          </div>

          <div>
            <div className="text-2xl lg:text-3xl font-bold font-sans text-[#22D3EE] tracking-tight">
              10 Yrs
            </div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-1 leading-tight">
              Audit Retention
            </div>
            <div className="text-[11px] text-[#6B7280] leading-snug">
              CAG compliant
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Primary Preferences & AI Rules (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Application Appearance */}
          <div
            className="rounded-xl p-6 space-y-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Application Theme &amp; Workspace
              </h2>
              <p className="text-xs text-[#A7ADA9] mt-0.5">
                Customize appearance preferences and display configurations.
              </p>
            </div>

            <div className="space-y-3">
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl"
                style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}
              >
                <div>
                  <p className="text-sm font-semibold text-white">Current Active Theme</p>
                  <p className="text-xs text-[#A7ADA9] mt-0.5">
                    Currently operating in {theme === 'dark' ? 'Pitch Black Industrial Dark Mode' : 'Clean Government Light Mode'}.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <AnimatedThemeToggle className="h-9 w-9 p-0 shrink-0" />
                  <span className="text-xs font-semibold text-[#A7ADA9]">
                    {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                  </span>
                </div>
              </div>

              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl"
                style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}
              >
                <div>
                  <p className="text-sm font-semibold text-white">Refresh Cadence</p>
                  <p className="text-xs text-[#A7ADA9] mt-0.5">
                    Live synchronization interval for CPSE ingestion feeds and review queues.
                  </p>
                </div>
                <select
                  value={cadence}
                  onChange={(e) => {
                    setCadence(e.target.value);
                    addToast('info', `Sync cadence set to: ${e.target.value}`);
                  }}
                  className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg shrink-0 bg-[#0C0E0D] border border-[#232825] text-[#10B981] outline-none cursor-pointer hover:border-[#38423C]"
                >
                  <option value="Real-Time WebSockets">Real-Time WebSockets</option>
                  <option value="30 Seconds Poll">30 Seconds Poll</option>
                  <option value="5 Minutes Batch">5 Minutes Batch</option>
                  <option value="Manual Trigger">Manual Trigger Only</option>
                </select>
              </div>

              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl"
                style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}
              >
                <div>
                  <p className="text-sm font-semibold text-white">Default Landing View</p>
                  <p className="text-xs text-[#A7ADA9] mt-0.5">
                    Initial screen loaded on platform launch for catalog stewards.
                  </p>
                </div>
                <select
                  value={defaultLanding}
                  onChange={(e) => {
                    setDefaultLanding(e.target.value);
                    addToast('info', `Default view updated: ${e.target.value}`);
                  }}
                  className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg shrink-0 bg-[#0C0E0D] border border-[#232825] text-[#F3F4F6] outline-none cursor-pointer hover:border-[#38423C]"
                >
                  <option value="Executive Overview">Executive Overview</option>
                  <option value="Problem & Architecture">Problem & Architecture</option>
                  <option value="Harmonization Workbench">Harmonization Workbench</option>
                  <option value="Master Catalog">Master Catalog</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: AI Harmonization Rules */}
          <div
            className="rounded-xl p-6 space-y-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                AI Harmonization &amp; NLP Matching Rules
              </h2>
              <p className="text-xs text-[#A7ADA9] mt-0.5">
                Configure automated decision thresholds, semantic models, and taxonomy parsing.
              </p>
            </div>

            <div className="space-y-3">
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl"
                style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}
              >
                <div>
                  <p className="text-sm font-semibold text-white">Auto-Approval Threshold</p>
                  <p className="text-xs text-[#A7ADA9] mt-0.5">
                    Matches with confidence score at or above this threshold are approved automatically.
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <input
                    type="range"
                    min="90"
                    max="100"
                    step="1"
                    value={approvalThreshold}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setApprovalThreshold(val);
                      addToast('info', `Auto-approval cutoff set to ≥ ${val}.0%`);
                    }}
                    className="w-24 accent-[#10B981] cursor-pointer"
                  />
                  <span
                    className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg shrink-0 min-w-[64px] text-center"
                    style={{ background: 'var(--blue-dim)', color: 'var(--blue)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                  >
                    ≥ {approvalThreshold}.0%
                  </span>
                </div>
              </div>

              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl"
                style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}
              >
                <div>
                  <p className="text-sm font-semibold text-white">Active Matching Model</p>
                  <p className="text-xs text-[#A7ADA9] mt-0.5">
                    Domain-tuned semantic taxonomy engine trained on oil, gas, and power engineering records.
                  </p>
                </div>
                <select
                  value={matchingModel}
                  onChange={(e) => {
                    setMatchingModel(e.target.value);
                    addToast('info', `Inference engine switched to: ${e.target.value}`);
                  }}
                  className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg shrink-0 bg-[#0C0E0D] border border-[#232825] text-[#22D3EE] outline-none cursor-pointer hover:border-[#38423C]"
                >
                  <option value="Technical-RoBERTa v4.2">Technical-RoBERTa v4.2 (Default)</option>
                  <option value="PetroBERT-Domain v2.1">PetroBERT-Domain v2.1</option>
                  <option value="Ensemble NLP-Spec v5.0">Ensemble NLP-Spec v5.0</option>
                </select>
              </div>

              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl"
                style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}
              >
                <div>
                  <p className="text-sm font-semibold text-white">Automatic UOM Normalization</p>
                  <p className="text-xs text-[#A7ADA9] mt-0.5">
                    Converts legacy imperial and non-standard units (Inches, Lbs, PSI) to SI standards.
                  </p>
                </div>
                <span
                  className="text-xs font-semibold px-3 py-1.5 rounded-full shrink-0"
                  style={{ background: 'var(--success-dim)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
                >
                  Enforced
                </span>
              </div>

              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl"
                style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}
              >
                <div>
                  <p className="text-sm font-semibold text-white">Fuzzy Match Sensitivity</p>
                  <p className="text-xs text-[#A7ADA9] mt-0.5">
                    Levenshtein &amp; token similarity tolerance for catalog typos and legacy abbreviations.
                  </p>
                </div>
                <span
                  className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg shrink-0"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                >
                  High (0.85 Jaccard)
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Ingestion Pipeline */}
          <div
            className="rounded-xl p-6 space-y-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Data Ingestion &amp; Batch Pipelines
              </h2>
              <p className="text-xs text-[#A7ADA9] mt-0.5">
                Manage spreadsheet onboarding and enterprise ERP connector feeds.
              </p>
            </div>

            <div className="space-y-3">
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl"
                style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}
              >
                <div>
                  <p className="text-sm font-semibold text-white">Spreadsheet Batch Importer</p>
                  <p className="text-xs text-[#A7ADA9] mt-0.5">
                    Batch upload CSV, XLS, or XLSX spreadsheets from ONGC, IOCL, GAIL, NTPC, SAIL, or BHEL.
                  </p>
                </div>
                <button
                  onClick={() => openUploadModal('ONGC')}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:brightness-110 shadow-sm shrink-0"
                  style={{ background: 'var(--blue)', color: '#000000' }}
                >
                  <span className="material-symbols-outlined text-[16px]">upload_file</span>
                  Upload Dataset
                </button>
              </div>

              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl"
                style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}
              >
                <div>
                  <p className="text-sm font-semibold text-white">Ingestion Queue Concurrency</p>
                  <p className="text-xs text-[#A7ADA9] mt-0.5">
                    Maximum parallel threads parsing and scoring incoming catalog batches.
                  </p>
                </div>
                <span
                  className="text-xs font-mono font-semibold px-3 py-1.5 rounded-lg shrink-0"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                >
                  8 Worker Threads
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Demonstration & Benchmark Data Management */}
          <div
            className="rounded-xl p-6 space-y-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Demonstration &amp; Benchmark Data Management
              </h2>
              <p className="text-xs text-[#A7ADA9] mt-0.5">
                Seed standardized CPSE catalogs, generate dense vector embeddings, and trigger cross-catalog clustering for evaluation.
              </p>
            </div>

            <div className="space-y-3">
              {/* Load 500 benchmark */}
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl"
                style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-white">Load 500-Row Industrial Benchmark Dataset</p>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#161B18] text-[#10B981] border border-[#232825]">
                      SIH26099 v2
                    </span>
                  </div>
                  <p className="text-xs text-[#A7ADA9] mt-0.5 max-w-lg">
                    Seeds 500 validated mechanical and instrumentation materials across ONGC, IOCL, GAIL, and BPCL, indexing 384-d embeddings into FAISS.
                  </p>
                </div>

                <button
                  onClick={handleLoadBenchmark}
                  disabled={loadingBenchmark}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:brightness-110 shadow-sm shrink-0 disabled:opacity-50"
                  style={{ background: 'var(--primary)', color: '#000000' }}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {loadingBenchmark ? 'hourglass_top' : 'dataset'}
                  </span>
                  <span>{loadingBenchmark ? 'Ingesting Benchmark...' : 'Load 500 Benchmark'}</span>
                </button>
              </div>

              {/* Trigger Matching */}
              <div
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl"
                style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}
              >
                <div>
                  <p className="text-sm font-semibold text-white">Execute Candidate Matching Engine</p>
                  <p className="text-xs text-[#A7ADA9] mt-0.5 max-w-lg">
                    Runs multi-signal semantic retrieval across all ingested source materials, populating the Harmonization Workbench and Review Queue.
                  </p>
                </div>

                <button
                  onClick={handleRunMatchingEngine}
                  disabled={runningMatching}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:brightness-110 shadow-sm shrink-0 border border-[#22D3EE]/40 disabled:opacity-50"
                  style={{ background: '#22D3EE', color: '#000000' }}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {runningMatching ? 'hourglass_top' : 'play_circle'}
                  </span>
                  <span>{runningMatching ? 'Clustering Catalog...' : 'Run Matching Engine'}</span>
                </button>
              </div>

              {/* Ingestion Report if available */}
              {benchmarkStatus && (
                <div className="p-3.5 rounded-lg bg-[#070908] border border-[#10B981]/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#10B981] text-[18px]">verified</span>
                    <span className="text-xs font-semibold text-white">
                      Active Benchmark Index: {benchmarkStatus.rows} Rows Ingested
                    </span>
                  </div>
                  <span className="text-xs font-mono text-[#22D3EE]">
                    {benchmarkStatus.vectors} Vectors Active
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: System Diagnostics, Compliance & Actions (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Diagnostics Card */}
          <div
            className="rounded-xl p-6 space-y-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-white tracking-tight">Engine Diagnostics</h2>
                <p className="text-xs text-[#A7ADA9] mt-0.5">Real-time health telemetry</p>
              </div>
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: 'var(--success-dim)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                Operational
              </span>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-[#A7ADA9]">Inference Latency:</span>
                <span className="font-mono font-bold text-white">42 ms</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-[#A7ADA9]">Memory Allocation:</span>
                <span className="font-mono font-bold text-white">1.24 GB / 8.0 GB</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-[#A7ADA9]">Master Records:</span>
                <span className="font-mono font-bold text-white">3,102,445 CNMC</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-[#A7ADA9]">Cluster Node:</span>
                <span className="font-mono font-bold text-white">NIC-GovCloud-01</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A7ADA9]">Schema Standard:</span>
                <span className="font-mono font-bold text-[#10B981]">MoPNG v3.0</span>
              </div>
            </div>
          </div>

          {/* Security & Statutory Compliance */}
          <div
            className="rounded-xl p-6 space-y-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Security &amp; Statutory Audit</h2>
              <p className="text-xs text-[#A7ADA9] mt-0.5">Government governance posture</p>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-[#A7ADA9]">Audit Ledger:</span>
                <span className="font-semibold text-white">SHA-256 Chained</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-[#A7ADA9]">Statutory Retention:</span>
                <span className="font-semibold text-white">7 Years (RTI Act)</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <span className="text-[#A7ADA9]">Data Residency:</span>
                <span className="font-semibold text-white">MeitY Certified (India)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A7ADA9]">Access Control:</span>
                <span className="font-semibold text-white">Role-Based (RBAC)</span>
              </div>
            </div>
          </div>

          {/* Maintenance Actions Card */}
          <div
            className="rounded-xl p-6 space-y-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">System Maintenance</h2>
              <p className="text-xs text-[#A7ADA9] mt-0.5">Administrative utilities</p>
            </div>

            <div className="space-y-2.5 pt-1">
              <button
                onClick={handleIntegrityCheck}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold text-white transition-all hover:bg-white/10"
                style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#10B981]">verified</span>
                  Verify Schema Integrity
                </span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>

              <button
                onClick={handleFlushCache}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold text-white transition-all hover:bg-white/10"
                style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#EAB308]">cached</span>
                  Flush Temporary Cache
                </span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>

              <button
                onClick={handleExportConfig}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold text-white transition-all hover:bg-white/10"
                style={{ background: 'var(--bg-hover)', border: '1px solid var(--border)' }}
              >
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px] text-[#3B82F6]">download</span>
                  Export Configuration (JSON)
                </span>
                <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <ScreenFooter />
    </main>
  );
};

export const SupportScreen: React.FC = () => {
  const { addToast, setActiveScreen } = useApp();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleDownload = (name: string) => {
    addToast('info', `Downloading ${name}...`);
  };

  const faqs = [
    {
      q: 'How is the 12-digit Common National Material Code (CNMC) structured?',
      a: 'The CNMC syntax consists of 4 segments: [Group (4 digits)] . [Subgroup (4 digits)] . [Sequential Identifier (4 digits)], strictly mapped to the Ministry of Petroleum & Natural Gas (MoPNG) Technical Classification standard.',
    },
    {
      q: 'What occurs when two CPSEs maintain identical materials under differing tolerances?',
      a: 'The NLP engine normalizes the noun-modifier hierarchy first. If engineering tolerances or material grades diverge (e.g. SS304 vs SS316), the engine automatically assigns distinct CNMCs while linking them as "RELATED_SUBSTITUTE" aliases for procurement pooling.',
    },
    {
      q: 'How are backward-compatibility aliases routed back to existing enterprise ERPs?',
      a: 'When an item is harmonized, the platform generates automated BAPI/REST payloads for SAP S/4HANA, Oracle Cloud, and IBM Maximo that map the local code to the CNMC in the ERP alias registry without disrupting existing plant-level inventory bins.',
    },
  ];

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
          <span className="text-[#F3F4F6]">Help & Support</span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0C0E0D] border border-[#232825] text-xs text-[#9CA3AF]">
          <span className="material-symbols-outlined text-[15px] text-[#9CA3AF]">help</span>
          <span>MoPNG Knowledge Base</span>
        </div>
      </div>

      {/* 2. Page Title Block */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
          Documentation, Standards & Support
        </h1>
        <p className="text-xs md:text-sm text-[#9CA3AF] leading-relaxed max-w-4xl">
          Official MoPNG cataloging taxonomy guidelines, cross-reference matrices, statutory audit compliance frameworks, and enterprise connector manuals.
        </p>
      </div>

      {/* Top Row: 4 KPI Summary Cards matching Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div
          className="rounded-xl p-5 flex flex-col justify-between card-hover transition-all"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">Taxonomy Standard</span>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#10B981]"
              style={{ background: 'var(--blue-dim)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
            >
              <span className="material-symbols-outlined text-[17px]">verified</span>
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-none">
              MoPNG v3.0
            </span>
            <p className="text-xs text-[#A7ADA9] mt-1.5">Official National Syntax</p>
          </div>
        </div>

        <div
          className="rounded-xl p-5 flex flex-col justify-between card-hover transition-all"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">Cross-Mapping</span>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#3B82F6]"
              style={{ background: 'var(--indigo-dim)', border: '1px solid rgba(59, 130, 246, 0.3)' }}
            >
              <span className="material-symbols-outlined text-[17px]">dataset</span>
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-none">
              MESC &amp; UNSPSC
            </span>
            <p className="text-xs text-[#A7ADA9] mt-1.5">Bi-directional cross-indexing</p>
          </div>
        </div>

        <div
          className="rounded-xl p-5 flex flex-col justify-between card-hover transition-all"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">Support SLA</span>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#EAB308]"
              style={{ background: 'var(--warning-dim)', border: '1px solid rgba(234, 179, 8, 0.3)' }}
            >
              <span className="material-symbols-outlined text-[17px]">timer</span>
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-none">
              &lt; 2 Hours
            </span>
            <p className="text-xs text-[#A7ADA9] mt-1.5">Tier-1 Enterprise Support</p>
          </div>
        </div>

        <div
          className="rounded-xl p-5 flex flex-col justify-between card-hover transition-all"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">API Release</span>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#10B981]"
              style={{ background: 'var(--blue-dim)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
            >
              <span className="material-symbols-outlined text-[17px]">code</span>
            </div>
          </div>
          <div>
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-none">
              v2.4 LTS
            </span>
            <p className="text-xs text-[#A7ADA9] mt-1.5">OpenAPI 3.0 Production Ready</p>
          </div>
        </div>
      </div>

      {/* Two-Column Rich Documentation Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Governance Manuals, API Specs & FAQ (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Governance Manuals Card */}
          <div
            className="rounded-xl p-6 space-y-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Cataloging Governance Standards &amp; Manuals
              </h2>
              <p className="text-xs text-[#A7ADA9] mt-0.5">
                Official publications issued under the MoPNG National Standardization Taskforce.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  title: 'MoPNG National Taxonomy Guideline v3.0',
                  desc: 'Definitive syntax specification for Fasteners, Valves, Pumps, Electrical, and Instrumentation materials.',
                  format: 'PDF (4.2 MB)',
                  version: 'v3.0.4',
                },
                {
                  title: 'MESC & UNSPSC Cross-Reference Matrix 2024.1',
                  desc: 'Complete bidirectional mapping schema aligning legacy MESC codes and global UNSPSC identifiers with CNMC.',
                  format: 'XLSX (18.5 MB)',
                  version: '2024.1',
                },
                {
                  title: 'CPSE ERP Connector Integration Guide',
                  desc: 'Comprehensive implementation guide for SAP S/4HANA (BAPI/iDoc), Oracle SCM Cloud, and IBM Maximo integration.',
                  format: 'PDF (6.1 MB)',
                  version: 'v2.2',
                },
              ].map((doc) => (
                <div
                  key={doc.title}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl transition-colors hover:bg-white/[0.02]"
                  style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                      style={{ background: 'var(--blue-dim)', color: 'var(--blue)' }}
                    >
                      <span className="material-symbols-outlined text-[22px]">description</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-white">{doc.title}</p>
                        <span
                          className="text-[11px] font-mono px-2 py-0.5 rounded"
                          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                        >
                          {doc.version}
                        </span>
                      </div>
                      <p className="text-xs text-[#A7ADA9] mt-1 leading-relaxed">{doc.desc}</p>
                      <span className="text-[11px] font-mono text-[#71717a] mt-1 inline-block">{doc.format}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownload(doc.title)}
                    className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all hover:brightness-110 shrink-0 self-start sm:self-center"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Integration Docs */}
          <div
            className="rounded-xl p-6 space-y-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                REST API Endpoints &amp; Integration Hooks
              </h2>
              <p className="text-xs text-[#A7ADA9] mt-0.5">
                Machine-to-machine interfaces for automated catalog synchronization.
              </p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div
                className="p-3.5 rounded-xl space-y-2"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#10B981]/20 text-[#10B981]">POST</span>
                    <span className="text-white font-semibold">/api/v2/harmonize/batch</span>
                  </span>
                  <span className="text-[#A7ADA9]">Batch Match Scoring</span>
                </div>
                <p className="text-[11px] font-sans text-[#A7ADA9]">
                  Ingests array of raw CPSE material descriptions and returns normalized CNMC candidates with confidence scores.
                </p>
              </div>

              <div
                className="p-3.5 rounded-xl space-y-2"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#3B82F6]/20 text-[#3B82F6]">GET</span>
                    <span className="text-white font-semibold">/api/v2/catalog/cnmc/{'{code}'}</span>
                  </span>
                  <span className="text-[#A7ADA9]">Fetch Master Spec</span>
                </div>
                <p className="text-[11px] font-sans text-[#A7ADA9]">
                  Retrieves complete authoritative JSON specifications, attribute dictionaries, and active CPSE cross-references.
                </p>
              </div>
            </div>
          </div>

          {/* Frequently Asked Questions */}
          <div
            className="rounded-xl p-6 space-y-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Frequently Asked Operational Questions
              </h2>
              <p className="text-xs text-[#A7ADA9] mt-0.5">
                Standard guidelines for CPSE cataloging stewards and review committees.
              </p>
            </div>

            <div className="space-y-2.5">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl overflow-hidden transition-all"
                    style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm text-white hover:text-[#10B981] transition-colors"
                    >
                      <span>{faq.q}</span>
                      <span
                        className="material-symbols-outlined text-[18px] transition-transform duration-200"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                      >
                        expand_more
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-[#A7ADA9] leading-relaxed border-t border-white/5 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Directorate Contacts & Compliance Checklist (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Nodal Directorate Contact Card */}
          <div
            className="rounded-xl p-6 space-y-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Nodal Directorate Contacts
              </h2>
              <p className="text-xs text-[#A7ADA9] mt-0.5">
                Ministry of Petroleum &amp; Natural Gas
              </p>
            </div>

            <div className="space-y-3 pt-2 text-xs">
              <div>
                <span className="block text-[#A7ADA9] mb-0.5">Stewardship Directorate:</span>
                <span className="font-semibold text-white">Central Standardization Directorate</span>
              </div>
              <div className="pt-2.5 border-t border-white/5">
                <span className="block text-[#A7ADA9] mb-0.5">Nodal Technical Secretary:</span>
                <span className="font-semibold text-white">Shri Rajesh K. Verma, Sc. 'G'</span>
              </div>
              <div className="pt-2.5 border-t border-white/5">
                <span className="block text-[#A7ADA9] mb-0.5">Enterprise Helpdesk Email:</span>
                <span className="font-mono text-[#10B981]">catalog-support@mopng.gov.in</span>
              </div>
              <div className="pt-2.5 border-t border-white/5">
                <span className="block text-[#A7ADA9] mb-0.5">Technical Hotline:</span>
                <span className="font-mono text-white">+91 11 2338-7491 (Ext. 204)</span>
              </div>
              <div className="pt-2.5 border-t border-white/5">
                <span className="block text-[#A7ADA9] mb-0.5">Operating Hours:</span>
                <span className="text-white">Monday – Friday: 09:00 – 18:00 IST</span>
              </div>
            </div>
          </div>

          {/* Quality Standards & Governance Compliance */}
          <div
            className="rounded-xl p-6 space-y-4"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">
                Statutory Compliance Standards
              </h2>
              <p className="text-xs text-[#A7ADA9] mt-0.5">
                Governing quality and audit frameworks
              </p>
            </div>

            <div className="space-y-3 pt-1 text-xs">
              <div className="p-3 rounded-lg" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>
                <span className="font-bold text-white block">ISO 8000-110:2021</span>
                <span className="text-[#A7ADA9] text-[11px] block mt-0.5">Data Quality: Master Data Syntax &amp; Semantic Conformity</span>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>
                <span className="font-bold text-white block">ISO 22745 (Open Technical Dictionaries)</span>
                <span className="text-[#A7ADA9] text-[11px] block mt-0.5">Exchange of characteristic data in XML/JSON schemas</span>
              </div>
              <div className="p-3 rounded-lg" style={{ background: 'var(--bg-hover)', border: '1px solid var(--border-subtle)' }}>
                <span className="font-bold text-white block">Central Vigilance Commission (CVC)</span>
                <span className="text-[#A7ADA9] text-[11px] block mt-0.5">Transparency in Public Procurement &amp; Vendor Parity</span>
              </div>
            </div>
          </div>

          {/* Quick Help Action */}
          <div
            className="rounded-xl p-5 space-y-3"
            style={{ background: 'var(--blue-dim)', border: '1px solid rgba(16, 185, 129, 0.3)' }}
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px] text-[#10B981]">help</span>
              <span className="text-sm font-bold text-white">Need Committee Escalation?</span>
            </div>
            <p className="text-xs text-[#A7ADA9] leading-relaxed">
              If an item code cannot be resolved through automated NLP matching, submit a dispute directly to the National Catalog Committee.
            </p>
            <button
              onClick={() => addToast('info', 'Technical Committee ticket draft created.')}
              className="w-full py-2 px-3 rounded-lg text-xs font-bold transition-all hover:brightness-110 shadow-sm"
              style={{ background: 'var(--blue)', color: '#000000' }}
            >
              Open Technical Ticket →
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <ScreenFooter />
    </main>
  );
};
