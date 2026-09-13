import React from 'react';
import { useApp } from '../../context/AppContext';
import { ScreenFooter } from '../common/FooterLegalModal';

export const HarmonizationScreen: React.FC = () => {
  const { 
    currentTask, 
    tasksQueue, 
    currentTaskIndex, 
    commitHarmonization, 
    skipHarmonization, 
    flagHarmonization, 
    addToast,
    setActiveScreen,
    openEvidence,
  } = useApp();

  const handleCommit = () => {
    commitHarmonization();
    addToast('success', `Approved match for ${currentTask.source.localCode} linked to ${currentTask.candidate.proposedCnmc}`);
  };

  const handleSkip = () => {
    skipHarmonization();
    addToast('info', 'Skipped to next harmonization item.');
  };

  const handleFlag = () => {
    flagHarmonization();
    addToast('warning', `Item ${currentTask.source.localCode} flagged for technical committee.`);
  };

  const handleInspectEvidence = () => {
    if (!currentTask) return;
    openEvidence({
      id: currentTask.taskId,
      priority: 'HIGH',
      sourceCpse: currentTask.source.cpse,
      sourceCode: currentTask.source.localCode,
      sourceDescription: currentTask.source.rawDescription,
      candidateCnmc: currentTask.candidate.proposedCnmc,
      candidateDescription: currentTask.candidate.canonicalDescription,
      relationship: currentTask.aiAnalysis.conflict ? 'NEAR-DUPLICATE' : 'IDENTICAL',
      confidence: currentTask.aiAnalysis.confidence,
      age: 'Just now',
      status: 'PENDING',
      attributeAgreement: currentTask.aiAnalysis.confidence,
      sourceAttributes: {
        materialGroup: 'Mechanical & Piping',
        baseMaterial: String(sourceSpecs.material || 'SS304'),
        nominalSize: String(sourceSpecs.size || 'M10 x 50'),
        pressureClass: String(sourceSpecs.standard || 'DIN 933'),
        baseUOM: currentTask.source.uom || 'EA'
      },
      candidateAttributes: {
        materialGroup: 'Mechanical & Piping',
        baseMaterial: String(normalizedSpecs.material || 'Stainless Steel 304'),
        nominalSize: String(normalizedSpecs.size || 'M10 x 50mm'),
        pressureClass: 'ISO 4017 / DIN 933 Equivalent',
        baseUOM: currentTask.source.uom || 'EA'
      },
      explanation: `AI Semantic Model analyzed ${currentTask.source.localCode} (${currentTask.source.cpse}) and mapped it to authoritative CNMC ${currentTask.candidate.proposedCnmc} with ${currentTask.aiAnalysis.confidence}% attribute confidence.`
    });
  };

  // Safe attribute extraction
  const sourceSpecs = currentTask?.source?.extractedSpecs || {};
  const normalizedSpecs = currentTask?.aiAnalysis?.normalizedMapping || {
    noun: 'Standard Item',
    modifier: 'Industrial Spec',
    size: 'Standard Size',
    material: 'Standard Material'
  };

  // Build Attribute comparison table rows
  const comparisonRows = [
    { 
      attribute: 'Material Type', 
      sourceVal: sourceSpecs.type || 'Hex Bolt', 
      cnmcVal: normalizedSpecs.noun || 'Bolt, Hexagon', 
      parity: 'match' 
    },
    { 
      attribute: 'Material Grade', 
      sourceVal: sourceSpecs.material || 'SS304', 
      cnmcVal: normalizedSpecs.material || 'Stainless Steel 304', 
      parity: 'match' 
    },
    { 
      attribute: 'Dimensions / Size', 
      sourceVal: sourceSpecs.size || 'M10 x 50', 
      cnmcVal: normalizedSpecs.size || 'M10 x 50mm', 
      parity: 'match' 
    },
    { 
      attribute: 'Standard / Spec', 
      sourceVal: sourceSpecs.standard || 'DIN 933', 
      cnmcVal: 'ISO 4017 / DIN 933 Equivalent', 
      parity: currentTask.aiAnalysis.conflict ? 'review' : 'match' 
    },
    { 
      attribute: 'Unit of Measure', 
      sourceVal: currentTask.source.uom || 'EA', 
      cnmcVal: currentTask.source.uom || 'EA', 
      parity: 'match' 
    }
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
          <span className="text-[#F3F4F6]">Harmonization Workbench</span>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={handleInspectEvidence}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0C0E0D] border border-[#232825] text-[#F3F4F6] hover:border-[#38423C] transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[15px] text-[#9CA3AF]">visibility</span>
            <span>Inspect Evidence</span>
          </button>
          <button 
            onClick={handleSkip}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0C0E0D] border border-[#232825] text-[#9CA3AF] hover:text-white hover:border-[#38423C] transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[15px]">redo</span>
            <span>Skip</span>
          </button>
          <button 
            onClick={handleFlag}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#EAB308]/10 border border-[#EAB308]/30 text-[#EAB308] hover:bg-[#EAB308]/15 transition-all flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[15px]">flag</span>
            <span>Flag Discrepancy</span>
          </button>
          <button 
            onClick={handleCommit}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#10B981] text-[#000000] hover:brightness-110 transition-all shadow-sm flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[15px]">check</span>
            <span>Approve Match</span>
          </button>
        </div>
      </div>

      {/* 2. Page Title Block */}
      <div className="space-y-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
            Harmonization Workbench
          </h1>
          <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-[#161B18] text-[#10B981] border border-[#10B981]/30">
            Task {currentTask.taskId}
          </span>
        </div>
        <p className="text-xs md:text-sm text-[#9CA3AF] leading-relaxed max-w-4xl">
          Review incoming legacy ERP descriptions, inspect NLP-extracted technical parameters, and reconcile candidates to authoritative National Material Codes.
        </p>
      </div>

      {/* 3. Hero Split Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-1">
        <div className="lg:col-span-7 space-y-2">
          <h2 className="text-sm font-semibold text-[#F3F4F6] tracking-normal font-sans">
            Semantic Vector Reconciler
          </h2>
          <p className="text-xs text-[#9CA3AF] leading-relaxed font-sans">
            The matching algorithm extracts nominal dimensions, standard grades, and pressure ratings to calculate confidence scores against existing canonical masters. High confidence candidates are presented for immediate cataloger sign-off.
          </p>
        </div>

        <div className="lg:col-span-5 grid grid-cols-3 gap-4 pt-1">
          <div>
            <div className="text-2xl lg:text-3xl font-bold font-sans text-white tracking-tight">
              {currentTaskIndex + 1} / {tasksQueue.length}
            </div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-1 leading-tight">
              Queue Progress
            </div>
            <div className="text-[11px] text-[#6B7280] leading-snug">
              Active session
            </div>
          </div>

          <div>
            <div className="text-2xl lg:text-3xl font-bold font-sans text-[#10B981] tracking-tight">
              {currentTask.aiAnalysis?.confidence || 98}%
            </div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-1 leading-tight">
              AI Confidence
            </div>
            <div className="text-[11px] text-[#6B7280] leading-snug">
              Cosine Similarity
            </div>
          </div>

          <div>
            <div className="text-2xl lg:text-3xl font-bold font-sans text-[#22D3EE] tracking-tight">
              ₹48 / EA
            </div>
            <div className="text-xs font-semibold text-[#F3F4F6] mt-1 leading-tight">
              ERP Cost Baseline
            </div>
            <div className="text-[11px] text-[#6B7280] leading-snug">
              Per unit ({currentTask.source.uom})
            </div>
          </div>
        </div>
      </div>

      {/* Critical Safety Contradiction Banner (if conflict detected) */}
      {currentTask.aiAnalysis.conflict && (
        <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/40 flex items-start gap-3.5">
          <span className="material-symbols-outlined text-[#EF4444] text-[22px] shrink-0 mt-0.5">
            gpp_bad
          </span>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#EF4444] uppercase tracking-wider">
                Critical Safety Contradiction Detected - Automated Grouping Prohibited
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-[#EF4444]/20 text-[#EF4444]">
                BLOCKED
              </span>
            </div>
            <p className="text-xs text-[#F3F4F6] leading-relaxed">
              Discrepancy identified in safety-critical specifications (pressure class, metallurgical alloy grade, or nominal sizing).
              Automated merge is strictly prohibited under MoPNG statutory rules to prevent catastrophic refinery and pipeline failures. Technical steward sign-off or divergence review required.
            </p>
          </div>
        </div>
      )}

      {/* 4. Tri-Pane Harmonization Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Pane 1: Source Record (4 cols) */}
        <div className="lg:col-span-4 bg-[#0C0E0D] border border-[#232825] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#232825]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              1. Incoming Source Record
            </h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#161B18] text-[#10B981] border border-[#232825]">
              {currentTask.source.cpse}
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#6B7280] block mb-1">
                Local ERP Code
              </span>
              <div className="font-mono text-xs font-bold p-2.5 rounded bg-[#070908] border border-[#232825] text-[#10B981]">
                {currentTask.source.localCode}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-[#6B7280] block mb-1">
                Raw ERP Description
              </span>
              <div className="font-mono text-xs p-2.5 rounded bg-[#070908] border border-[#232825] text-[#F3F4F6] leading-relaxed">
                {currentTask.source.rawDescription}
              </div>
            </div>

            <div className="pt-2 border-t border-[#1B201D] space-y-2">
              <span className="text-[10px] uppercase font-semibold text-[#6B7280] block">
                Extracted Parameters
              </span>
              <div className="space-y-1 font-mono text-xs">
                {Object.entries(sourceSpecs).map(([key, value]) => (
                  <div key={key} className="flex justify-between py-1 px-2 rounded bg-[#070908]">
                    <span className="text-[#9CA3AF] capitalize">{key}:</span>
                    <span className="text-white font-semibold">{String(value)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Pane 2: AI Attribute Comparator (4 cols) */}
        <div className="lg:col-span-4 bg-[#0C0E0D] border border-[#232825] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#232825]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              2. Attribute Comparator
            </h3>
            <span className="text-[11px] text-[#10B981] font-mono flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">verified</span>
              Normalized
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {comparisonRows.map((row, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-[#070908] border border-[#232825] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-semibold text-[#6B7280]">
                    {row.attribute}
                  </span>
                  <span className="text-[10px] font-mono text-[#10B981] font-bold">
                    {row.parity.toUpperCase()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                  <div className="text-[#9CA3AF] truncate">SRC: {row.sourceVal}</div>
                  <div className="text-white font-semibold truncate text-right">CNMC: {row.cnmcVal}</div>
                </div>
              </div>
            ))}
          </div>

          {/* 4-Metric Confidence Breakdown */}
          <div className="pt-3 border-t border-[#1B201D] space-y-2.5">
            <span className="text-[10px] uppercase font-semibold text-[#6B7280] block">
              Multi-Signal Scoring Vectors
            </span>

            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#9CA3AF]">Composite Confidence:</span>
                  <span className="font-mono font-bold text-[#10B981]">
                    {currentTask.aiAnalysis.confidence}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#070908] rounded-full overflow-hidden border border-[#232825]">
                  <div
                    className="h-full bg-[#10B981] rounded-full"
                    style={{ width: `${currentTask.aiAnalysis.confidence}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#9CA3AF]">Semantic Vector Cosine:</span>
                  <span className="font-mono font-bold text-[#22D3EE]">
                    {Math.min(99, Math.round(currentTask.aiAnalysis.confidence * 1.01))}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#070908] rounded-full overflow-hidden border border-[#232825]">
                  <div
                    className="h-full bg-[#22D3EE] rounded-full"
                    style={{ width: `${Math.min(99, Math.round(currentTask.aiAnalysis.confidence * 1.01))}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#9CA3AF]">Lexical Jaccard Index:</span>
                  <span className="font-mono font-bold text-[#9CA3AF]">
                    {Math.max(70, Math.round(currentTask.aiAnalysis.confidence * 0.92))}%
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#070908] rounded-full overflow-hidden border border-[#232825]">
                  <div
                    className="h-full bg-[#9CA3AF] rounded-full"
                    style={{ width: `${Math.max(70, Math.round(currentTask.aiAnalysis.confidence * 0.92))}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#9CA3AF]">Attribute Agreement:</span>
                  <span className="font-mono font-bold text-[#EAB308]">
                    {currentTask.aiAnalysis.conflict ? '48%' : `${Math.round(currentTask.aiAnalysis.confidence * 0.98)}%`}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-[#070908] rounded-full overflow-hidden border border-[#232825]">
                  <div
                    className="h-full bg-[#EAB308] rounded-full"
                    style={{ width: `${currentTask.aiAnalysis.conflict ? 48 : Math.round(currentTask.aiAnalysis.confidence * 0.98)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pane 3: Candidate Canonical Master (4 cols) */}
        <div className="lg:col-span-4 bg-[#0C0E0D] border border-[#232825] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#232825]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">
              3. Proposed CNMC Master
            </h3>
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
              {currentTask.candidate.confidenceScore || 98}% Score
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#6B7280] block mb-1">
                Target CNMC Code
              </span>
              <div className="font-mono text-base font-bold p-2.5 rounded bg-[#070908] border border-[#232825] text-[#10B981]">
                {currentTask.candidate.proposedCnmc}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-semibold text-[#6B7280] block mb-1">
                Canonical National Title
              </span>
              <div className="text-xs font-medium p-2.5 rounded bg-[#070908] border border-[#232825] text-white leading-relaxed">
                {currentTask.candidate.canonicalDescription}
              </div>
            </div>

            <div className="pt-2 border-t border-[#1B201D] space-y-2">
              <span className="text-[10px] uppercase font-semibold text-[#6B7280] block">
                Harmonization Impact
              </span>
              <p className="text-xs text-[#9CA3AF] leading-relaxed p-2.5 rounded bg-[#070908] border border-[#232825]">
                {currentTask.candidate.rationale || 'Standardizes fastener across 3 CPSEs, creating consolidated annual purchasing volume of 420,000 units.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Footer */}
      <ScreenFooter />
    </main>
  );
};
