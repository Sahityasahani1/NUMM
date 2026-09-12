import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AnimatedNumber } from '../core/animated-number';
import { DateRangePicker } from '../common/DateRangePicker';
import { ScreenFooter } from '../common/FooterLegalModal';
import { api, TimeSeriesPoint } from '../../services/api';

/* -----------------------------------------------------------------------
   Dual-Line Spline Area Chart fed by live backend time-series
   ----------------------------------------------------------------------- */
const AreaChart: React.FC<{ points?: TimeSeriesPoint[] }> = ({ points }) => {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; v1: string; v2: string } | null>(null);

  const months = (points && points.length > 0)
    ? points.map(p => ({ label: p.month, revenue: p.standardized, target: p.source_ingested }))
    : [
        { label: 'Jan', revenue: 88, target: 160 },
        { label: 'Feb', revenue: 114, target: 192 },
        { label: 'Mar', revenue: 140, target: 243 },
        { label: 'Apr', revenue: 171, target: 281 },
        { label: 'May', revenue: 198, target: 320 },
        { label: 'Jun', revenue: 237, target: 371 },
        { label: 'Jul', revenue: 272, target: 416 },
        { label: 'Aug', revenue: 308, target: 460 },
        { label: 'Sep', revenue: 343, target: 512 },
        { label: 'Oct', revenue: 378, target: 563 },
        { label: 'Nov', revenue: 409, target: 601 },
        { label: 'Dec', revenue: 440, target: 640 },
      ];

  const W = 680;
  const H = 240;
  const padL = 48;
  const padR = 16;
  const padT = 16;
  const padB = 36;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const maxVal = Math.max(...months.map(m => Math.max(m.revenue, m.target)), 100);

  const toX = (i: number) => padL + (i / (months.length - 1)) * innerW;
  const toY = (v: number) => padT + innerH - (v / maxVal) * innerH;

  // Build SVG path strings with smooth curves
  const getSplinePath = (pts: { x: number; y: number }[]) => {
    if (pts.length < 2) return '';
    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];
      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  };

  const ptsRevenue = months.map((m, i) => ({ x: toX(i), y: toY(m.revenue) }));
  const ptsTarget = months.map((m, i) => ({ x: toX(i), y: toY(m.target) }));

  const pathRevenue = getSplinePath(ptsRevenue);
  const pathTarget = getSplinePath(ptsTarget);

  const areaRevenue = `${pathRevenue} L ${toX(months.length - 1)},${padT + innerH} L ${padL},${padT + innerH} Z`;

  const yTicks = [0, 150, 300, 450, 600];

  return (
    <div className="relative w-full" style={{ height: `${H}px` }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        className="w-full h-full"
      >
        <defs>
          {/* Emerald Teal gradient */}
          <linearGradient id="v0VioletGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {yTicks.map(val => (
          <g key={val}>
            <line
              x1={padL}
              y1={toY(val)}
              x2={W - padR}
              y2={toY(val)}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeDasharray="4 4"
            />
            <text
              x={padL - 8}
              y={toY(val) + 4}
              fill="#71717a"
              fontSize="11"
              fontFamily="monospace"
              textAnchor="end"
            >
              {val === 0 ? '0' : `${val}`}
            </text>
          </g>
        ))}

        {/* X Axis Labels */}
        {months.map((m, i) => (
          <text
            key={m.label}
            x={toX(i)}
            y={H - 8}
            fill="#71717a"
            fontSize="11"
            fontFamily="monospace"
            textAnchor="middle"
          >
            {m.label}
          </text>
        ))}

        {/* Area fill */}
        <path
          d={areaRevenue}
          fill="url(#v0VioletGrad)"
        />

        {/* Target Line (Muted Gray) */}
        <path
          d={pathTarget}
          fill="none"
          stroke="rgba(255, 255, 255, 0.2)"
          strokeWidth="2"
          strokeDasharray="4 4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Revenue Line (Emerald Teal) */}
        <path
          d={pathRevenue}
          fill="none"
          stroke="#10B981"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Hover interaction points */}
        {months.map((m, i) => (
          <rect
            key={i}
            x={toX(i) - 18}
            y={padT}
            width={36}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setTooltip({
              x: toX(i),
              y: Math.min(toY(m.revenue), toY(m.target)) - 10,
              label: m.label,
              v1: `${m.revenue}`,
              v2: `${m.target}`,
            })}
            onMouseLeave={() => setTooltip(null)}
            style={{ cursor: 'crosshair' }}
          />
        ))}

        {/* Marker Dots on Tooltip */}
        {tooltip && months.map((m, i) => {
          if (m.label !== tooltip.label) return null;
          return (
            <g key="marker">
              <circle cx={toX(i)} cy={toY(m.revenue)} r="5" fill="#10B981" stroke="#000000" strokeWidth="2" />
              <circle cx={toX(i)} cy={toY(m.target)} r="4" fill="#10b981" stroke="#000000" strokeWidth="1.5" />
            </g>
          );
        })}
      </svg>

      {/* Floating Tooltip matching template */}
      {tooltip && (
        <div
          className="absolute pointer-events-none z-10 text-xs rounded-lg px-3 py-2"
          style={{
            left: `${(tooltip.x / W) * 100}%`,
            top: `${(Math.max(0, tooltip.y - 45) / H) * 100}%`,
            transform: 'translateX(-50%)',
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-elevated)',
          }}
        >
          <div className="font-semibold text-white mb-1.5">{tooltip.label} Standardization</div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full" style={{ background: '#10B981' }} />
            <span className="text-[#A7ADA9]">Standardized: <strong className="text-white">{tooltip.v1} records</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.4)' }} />
            <span className="text-[#A7ADA9]">Source Ingested: <strong className="text-white">{tooltip.v2} records</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};

/* -----------------------------------------------------------------------
   KPI Card matching template exactly
   ----------------------------------------------------------------------- */
interface KpiCardProps {
  label: string;
  value: React.ReactNode;
  delta: string;
  deltaUp: boolean;
  icon: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ label, value, delta, deltaUp, icon }) => (
  <div
    className="rounded-xl p-5 flex flex-col justify-between card-hover transition-all bg-[#0C0E0D] border border-[#232825]"
  >
    {/* Top Row: Label + Icon Box */}
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-[#a1a1aa]">{label}</span>
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-[#a1a1aa]"
        style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <span className="material-symbols-outlined text-[17px]">{icon}</span>
      </div>
    </div>

    {/* Bottom Row: Big Bold Metric + Trend Pill */}
    <div className="flex items-baseline gap-3 mt-1">
      <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-none">
        {value}
      </span>
      <span
        className="text-xs font-semibold flex items-center gap-0.5"
        style={{ color: deltaUp ? '#10b981' : '#f43f5e' }}
      >
        <span className="material-symbols-outlined text-[14px]">
          {deltaUp ? 'trending_up' : 'trending_down'}
        </span>
        {delta}
      </span>
    </div>
  </div>
);

/* -----------------------------------------------------------------------
   Overview Screen matching template 1:1
   ----------------------------------------------------------------------- */
export const OverviewScreen: React.FC = () => {
  const { setActiveScreen, reviewQueue, cpseList, navigateToMaterial, catalogueMaterials, auditLogs, nationalAnalytics } = useApp();
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([]);

  useEffect(() => {
    let active = true;
    api.fetchTimeSeriesTrend().then(data => {
      if (active && data.length > 0) setTimeSeries(data);
    });
    return () => { active = false; };
  }, []);

  const totalUnifiedMasters = nationalAnalytics?.total_canonical_cnmcs || catalogueMaterials.length || 8;
  const dedupRatio = nationalAnalytics?.deduplication_ratio_pct || 98.8;
  const projectedSavingsCr = nationalAnalytics?.estimated_synergy_savings
    ? +(nationalAnalytics.estimated_synergy_savings / 10000000).toFixed(2)
    : 2.84;
  const totalLegacyRecords = nationalAnalytics?.total_source_materials || 640;
  const totalEquivalenceGroups = nationalAnalytics?.total_equivalence_groups || 129;

  const recentApprovals = React.useMemo(() => {
    if (auditLogs && auditLogs.length > 0) {
      return auditLogs.slice(0, 5).map(log => ({
        initial: log.targetEntity ? log.targetEntity.slice(0, 2).toUpperCase() : 'CP',
        name: log.user.name || 'Catalog Steward',
        sub: `${log.targetEntity || 'CNMC'}: ${log.description.slice(0, 60)}`,
        amount: log.action,
        status: log.action.toLowerCase().includes('approve') || log.action.toLowerCase().includes('merge') ? 'Approved' : 'Harmonized',
        cnmcTarget: log.targetEntity && log.targetEntity.includes('CNMC') ? log.targetEntity.split(' ')[1] : undefined
      }));
    }
    return [
      { initial: 'ON', name: 'ONGC (Hazira Plant)', sub: 'MAT-VLV-0928 • Ball Valve 50mm 150# CS Flanged', amount: 'Approved', status: 'Approved', cnmcTarget: 'CNMC-00018427' },
      { initial: 'IO', name: 'IOCL (Panipat)', sub: 'IOCL-FST-902 • Hex Bolt M10 x 50 SS304 Full Thd', amount: 'Harmonized', status: 'Harmonized', cnmcTarget: 'CNMC-00018428' },
    ];
  }, [auditLogs]);

  const cpseLeaderboard = React.useMemo(() => {
    if (cpseList && cpseList.length > 0) {
      return cpseList.map((c, idx) => ({
        rank: idx + 1,
        initial: c.name.slice(0, 2).toUpperCase(),
        name: c.name,
        desc: `${c.mappedRecords || c.totalRecords} materials mapped`,
        amount: `₹${((c.totalRecords * 0.08) || 12.5).toFixed(1)} Cr`,
        growth: `+${c.coveragePercentage || 95}%`,
      }));
    }
    return [];
  }, [cpseList]);

  const pipelineStages = [
    { name: 'Raw Ingested', count: totalLegacyRecords, pct: 100, color: '#10B981' },
    { name: 'Specs Extracted', count: Math.round(totalLegacyRecords * (dedupRatio / 100)), pct: Math.round(dedupRatio), color: '#10b981' },
    { name: 'Equivalence Clusters', count: totalEquivalenceGroups, pct: Math.round((totalEquivalenceGroups / totalLegacyRecords) * 100), color: '#EAB308' },
    { name: 'CNMC Approved', count: totalUnifiedMasters, pct: Math.max(2, Math.round((totalUnifiedMasters / totalLegacyRecords) * 100)), color: '#34d399' },
  ];

  return (
    <main
      className="flex-1 overflow-y-auto px-8 py-6 space-y-6 bg-[#070908] text-[#F3F4F6]"
    >
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
          <span className="text-[#F3F4F6]">Dashboard</span>
        </div>

        <DateRangePicker />
      </div>

      {/* 2. Page Title Block */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">
          Dashboard Overview
        </h1>
        <p className="text-xs md:text-sm text-[#9CA3AF] leading-relaxed max-w-4xl">
          National material master harmonization progress, cross-enterprise spend, and pipeline performance across all connected CPSEs.
        </p>
      </div>

      {/* 3. Top Row of 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Unified Masters"
          value={<AnimatedNumber value={totalUnifiedMasters} duration={1400} />}
          delta="+100%"
          deltaUp={true}
          icon="inventory_2"
        />
        <KpiCard
          label="Duplicate Reduction"
          value={<AnimatedNumber value={dedupRatio} decimals={1} suffix="%" duration={1600} />}
          delta="+98.8%"
          deltaUp={true}
          icon="call_merge"
        />
        <KpiCard
          label="Pending Review Queue"
          value={<AnimatedNumber value={reviewQueue.length} duration={1500} />}
          delta={reviewQueue.length > 0 ? `${reviewQueue.length} pending` : 'All cleared'}
          deltaUp={reviewQueue.length === 0}
          icon="fact_check"
        />
        <KpiCard
          label="Projected Savings"
          value={<AnimatedNumber value={projectedSavingsCr} decimals={2} prefix="₹" suffix=" Cr" duration={1600} />}
          delta="+18.5%"
          deltaUp={true}
          icon="savings"
        />
      </div>

      {/* 4. Middle Row: Standardization Trend Area Chart + Ingestion Funnel */}
      <div className="grid grid-cols-12 gap-5">
        {/* Standardization Trend Area Chart (2/3 width) */}
        <div
          className="col-span-12 lg:col-span-8 rounded-xl p-6 bg-[#0C0E0D] border border-[#232825]"
        >
          {/* Header & Legend */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white tracking-tight">
                Catalog Standardization Trend
              </h2>
              <p className="text-xs text-[#9CA3AF] mt-0.5">
                Monthly standardized masters vs source ERP ingestion records
              </p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <span className="text-[#9CA3AF]">Standardized Masters</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white/40" />
                <span className="text-[#9CA3AF]">Source Records</span>
              </div>
            </div>
          </div>

          <AreaChart points={timeSeries} />
        </div>

        {/* Governance Funnel Stages (1/3 width) */}
        <div className="col-span-12 lg:col-span-4 rounded-xl p-6 flex flex-col justify-between bg-[#0C0E0D] border border-[#232825]">
          <div>
            <h2 className="text-base font-semibold text-white tracking-tight">
              Ingestion &amp; Governance Funnel
            </h2>
            <p className="text-xs text-[#71717a] mt-0.5 mb-5">
              {totalLegacyRecords} records across {cpseList.length || 5} participating CPSEs
            </p>

            {/* Stage Progress Bars */}
            <div className="space-y-4">
              {pipelineStages.map((stage) => (
                <div key={stage.name}>
                  <div className="flex justify-between items-center mb-1.5 text-xs">
                    <span className="font-semibold text-white">{stage.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[#71717a] font-mono">
                        <AnimatedNumber value={stage.count} duration={1400} />
                      </span>
                      <span className="font-bold text-white font-mono">
                        <AnimatedNumber value={stage.pct} suffix="%" duration={1400} />
                      </span>
                    </div>
                  </div>
                  <div
                    className="w-full h-2 rounded-full overflow-hidden bg-white/10"
                  >
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${stage.pct}%`,
                        background: stage.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Total Ingested */}
          <div className="pt-4 mt-6 flex justify-between items-baseline border-t border-[#232825]">
            <span className="text-xs text-[#71717a]">Total Ingested Legacy Records</span>
            <span className="text-2xl font-bold text-white tracking-tight font-mono">
              <AnimatedNumber value={totalLegacyRecords} duration={1600} />
            </span>
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Recent Harmonizations + CPSE Leaderboard */}
      <div className="grid grid-cols-12 gap-5">
        {/* Recent Approvals (Left 7 cols) */}
        <div className="col-span-12 lg:col-span-7 rounded-xl p-6 bg-[#0C0E0D] border border-[#232825]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#F3F4F6] tracking-tight">
                Recent Harmonization Approvals
              </h2>
              <p className="text-xs text-[#A7ADA9] mt-0.5">Cross-enterprise material mappings</p>
            </div>
            <button
              onClick={() => setActiveScreen('review')}
              className="text-xs font-semibold flex items-center gap-1 hover:underline"
              style={{ color: '#10B981' }}
            >
              Review queue ({reviewQueue.length}) <span className="material-symbols-outlined text-[14px]">arrow_outward</span>
            </button>
          </div>

          <div className="space-y-3">
            {recentApprovals.map((item, idx) => {
              const statusCfg = {
                Approved: { border: 'rgba(16, 185, 129, 0.25)', color: '#10B981', icon: 'check_circle' },
                Harmonized: { border: 'rgba(59, 130, 246, 0.25)', color: '#3B82F6', icon: 'verified' },
                Pending: { border: 'rgba(234, 179, 8, 0.25)', color: '#EAB308', icon: 'schedule' },
              }[item.status] || { border: 'transparent', color: '#A7ADA9', icon: 'info' };

              return (
                <div
                  key={idx}
                  onClick={() => item.status === 'Pending' ? setActiveScreen('review') : navigateToMaterial(item.cnmcTarget || (catalogueMaterials[0]?.cnmc || 'CNMC-00018427'))}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.04] cursor-pointer transition-colors group select-none"
                  title={item.status === 'Pending' ? 'Open in Review Queue' : 'View in Master Catalog'}
                >
                  <div className="flex items-center gap-3">
                    {/* Square Dark Initial Box */}
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs font-mono text-white bg-[#070908] border border-[#232825]">
                      {item.initial}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#F3F4F6]">{item.name}</p>
                      <p className="text-xs text-[#A7ADA9] font-mono">{item.sub}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-[#F3F4F6] font-mono">
                      {item.amount}
                    </span>
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{
                        border: `1px solid ${statusCfg.border}`,
                        color: statusCfg.color,
                        background: 'transparent',
                      }}
                    >
                      <span className="material-symbols-outlined text-[12px]">
                        {statusCfg.icon}
                      </span>
                      {item.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CPSE Leaderboard (Right 5 cols) */}
        <div className="col-span-12 lg:col-span-5 rounded-xl p-6 bg-[#0C0E0D] border border-[#232825]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#F3F4F6] tracking-tight">
                CPSE Standardization Leaders
              </h2>
              <p className="text-xs text-[#A7ADA9] mt-0.5">Enterprise pooling &amp; savings</p>
            </div>
            <span className="material-symbols-outlined text-[20px] text-[#EAB308]">
              emoji_events
            </span>
          </div>

          <div className="space-y-3.5">
            {cpseLeaderboard.map((p) => {
              const rankBg = {
                1: '#ea580c', // Gold/Orange for 1st
                2: '#d97706', // Yellow-orange for 2nd
                3: '#b45309', // Bronze for 3rd
              }[p.rank] || '#3f3f46';

              return (
                <div
                  key={p.rank}
                  onClick={() => setActiveScreen('datahub')}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-white/[0.04] cursor-pointer transition-colors group select-none"
                  title={`View ${p.name} Data Hub integration`}
                >
                  <div className="flex items-center gap-3">
                    {/* Circular Teal Avatar with Rank Badge */}
                    <div className="relative">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold font-mono text-[#000000] shadow-sm"
                        style={{ background: '#10B981' }}
                      >
                        {p.initial}
                      </div>
                      <span
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: rankBg }}
                      >
                        {p.rank}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white leading-tight">
                        {p.name}
                      </p>
                      <p className="text-xs text-[#71717a] mt-0.5">{p.desc}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-white font-mono leading-tight">
                      {p.amount}
                    </p>
                    <p className="text-xs font-semibold mt-0.5 flex items-center justify-end gap-0.5 text-[#10b981]">
                      <span className="material-symbols-outlined text-[12px]">trending_up</span>
                      {p.growth}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <ScreenFooter />
    </main>
  );
};
