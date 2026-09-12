import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { AnimatedNumber } from '../core/animated-number';
import { GridPattern } from '../core/grid-pattern';
import { AnimatedThemeToggle } from '../ui/animated-theme-toggle';

/* ─────────────────────────────────────────────────────────────
   DESIGN ENGINEERING & ANIMATION TOKENS
   - Emil Kowalski guidelines:
     * Custom cubic-bezier for enters: [0.23, 1, 0.32, 1]
     * Springs for interactive tactile elements (buttons: 600/35, cards: 380/28)
     * Never animate from scale(0) — use scale(0.96) minimum
     * Never use transition: all — specify exact CSS properties
     * Durations under 300ms for UI actions
   - Impeccable guidelines:
     * Authentic industrial palette (no generic neon AI blur blobs)
     * Balanced spacing tailored for 1366px+ displays (no collision)
     * Near-black/near-white semantic tokens
───────────────────────────────────────────────────────────── */
const EASE_OUT = [0.23, 1, 0.32, 1] as const;
const SPRING_CARD = { type: 'spring' as const, stiffness: 380, damping: 28, mass: 0.8 };
const SPRING_BUTTON = { type: 'spring' as const, stiffness: 600, damping: 35 };

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: EASE_OUT, delay },
});

const stagger = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.04 } },
};

const staggerChild = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
};

/* ─────────────────────────────────────────────────────────────
   DATA DEFINITIONS
───────────────────────────────────────────────────────────── */
type SandboxKey = 'valve' | 'fastener' | 'pump';

const sandboxItems = {
  valve: {
    label: 'Valves',
    cnmc: '4014.1607.1842',
    canonical: 'Valve, Ball: 2 IN, ASME Class 150, Flanged RF, ASTM A216 WCB Body, SS316 Trim',
    confidence: '99.1%',
    sources: [
      { cpse: 'ONGC Hazira', code: 'MAT-VLV-0928', desc: 'BALL VALVE 50MM 150LBS CS FLANGED A216 WCB', price: '₹14,200 / EA', color: '#10B981' },
      { cpse: 'IOCL Panipat', code: '10049281', desc: 'VLV BALL 2IN 150# FLG WCB/316 PTFE', price: '₹16,500 / EA', color: '#3B82F6' },
      { cpse: 'GAIL Vijaipur', code: 'G-201-9482', desc: 'VALVE BALL FLGD 2 INCH CLASS 150 CS BODY', price: '₹15,100 / EA', color: '#10B981' },
    ],
    chips: ['ASTM A216 WCB', 'ASME Class 150', '2 Inch (DN 50)', 'PTFE Seat'],
    insight: 'Spare part interchangeable between GAIL & IOCL — lead-time 8 wks → 24 hrs',
  },
  fastener: {
    label: 'Fasteners',
    cnmc: '3116.1504.8920',
    canonical: 'Bolt, Hex Head, M10 × 50mm, Stainless Steel 304, Fully Threaded (DIN 933)',
    confidence: '98.4%',
    sources: [
      { cpse: 'ONGC', code: 'MAT-10482', desc: 'HEX BOLT M10 X 50 SS304', price: '₹48 / EA', color: '#10B981' },
      { cpse: 'IOCL', code: 'IOCL-FST-902', desc: 'BOLT HEX SS304 M10X50MM FULL THD', price: '₹55 / EA', color: '#3B82F6' },
      { cpse: 'NTPC', code: 'NGC-BLT-004', desc: 'FASTENER HEX HEAD M10*50 AISI-304', price: '₹52 / EA', color: '#8B5CF6' },
    ],
    chips: ['SS 304', 'M10 × 1.5mm', 'Length 50mm', 'DIN 933'],
    insight: '14% bulk discount via cross-CPSE pooling → ₹12.4L/yr saved',
  },
  pump: {
    label: 'Rotating Equipment',
    cnmc: '4320.1009.4412',
    canonical: 'Impeller, Centrifugal Pump: Enclosed, 210mm OD, 32mm Bore, Phosphor Bronze ASTM B584',
    confidence: '96.3%',
    sources: [
      { cpse: 'ONGC', code: 'ONGC-PMP-9102', desc: 'IMPELLER CENTRIFUGAL PUMP BRONZE DIA 210MM', price: '₹38,000 / EA', color: '#10B981' },
      { cpse: 'IOCL', code: 'IOCL-ROT-449', desc: 'BRONZE IMPELLER FOR WATER PUMP OD210 BORE32', price: '₹41,500 / EA', color: '#3B82F6' },
      { cpse: 'GAIL', code: 'GAIL-PMP-009', desc: 'IMPELLER ENCLOSED PHOS BRONZE 210MM', price: '₹39,200 / EA', color: '#10B981' },
    ],
    chips: ['Bronze C90500', 'OD: 210mm', 'Bore: 32mm', 'API 610 11th Ed'],
    insight: 'Cross-CPSE maintenance pool eliminates ₹1.8Cr duplicate safety buffer inventory',
  },
};

const cpsesData = [
  { name: 'ONGC', numRecords: 4.2, suffix: 'M', label: 'Offshore & Onshore' },
  { name: 'IOCL', numRecords: 3.8, suffix: 'M', label: 'Refineries & Pipelines' },
  { name: 'GAIL', numRecords: 2.1, suffix: 'M', label: 'Natural Gas Grid' },
  { name: 'NTPC', numRecords: 2.4, suffix: 'M', label: 'Thermal & Hydro Power' },
  { name: 'SAIL', numRecords: 1.7, suffix: 'M', label: 'Steel Manufacturing' },
  { name: 'BHEL', numRecords: 1.2, suffix: 'M', label: 'Heavy Engineering' },
];

const waypoints = [
  { id: 'hero', index: '01', label: 'OVERVIEW' },
  { id: 'architecture', index: '02', label: 'PIPELINE' },
  { id: 'workbench', index: '03', label: 'PARITY DEMO' },
  { id: 'bento', index: '04', label: 'CAPABILITIES' },
  { id: 'impact', index: '05', label: 'FISCAL IMPACT' },
];

/* ─────────────────────────────────────────────────────────────
   MOTION BUTTON WITH SPRING ACTIVE FEEDBACK
───────────────────────────────────────────────────────────── */
const Btn = ({
  children,
  onClick,
  className = '',
  style,
  href,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  href?: string;
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium select-none cursor-pointer";
  if (href) {
    return (
      <motion.a
        href={href}
        whileTap={{ scale: 0.97, transition: SPRING_BUTTON }}
        whileFocus={{ outline: '2px solid var(--primary)', outlineOffset: '2px' }}
        className={`${baseClasses} ${className}`}
        style={style}
      >
        {children}
      </motion.a>
    );
  }
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.97, transition: SPRING_BUTTON }}
      whileFocus={{ outline: '2px solid var(--primary)', outlineOffset: '2px' }}
      className={`${baseClasses} ${className}`}
      style={style}
    >
      {children}
    </motion.button>
  );
};

/* ─────────────────────────────────────────────────────────────
   CPSE CARD WITH SCROLL-TRIGGERED NUMBER ANIMATION
───────────────────────────────────────────────────────────── */
const CpseCard: React.FC<{
  c: typeof cpsesData[0];
  index: number;
}> = ({ c, index }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 16 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
      whileHover={{ y: -4, transition: SPRING_CARD }}
      transition={{ duration: 0.45, ease: EASE_OUT, delay: index * 0.07 }}
      className="flex flex-col items-center gap-1.5 py-4 px-3 rounded-xl transition-shadow"
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <span className="text-sm font-extrabold tracking-wider" style={{ color: 'var(--text-primary)' }}>
        {c.name}
      </span>
      <div className="text-[11px] font-mono font-bold text-[#10B981] flex items-center">
        {isInView ? (
          <AnimatedNumber value={c.numRecords} decimals={1} duration={1400} />
        ) : (
          <span>0.0</span>
        )}
        <span>{c.suffix} records</span>
      </div>
      <span className="text-[10px] text-center leading-tight font-medium" style={{ color: 'var(--text-muted)' }}>
        {c.label}
      </span>
    </motion.div>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export const LandingPage: React.FC = () => {
  const { setActiveScreen } = useApp();
  const [activeTab, setActiveTab] = useState<SandboxKey>('valve');
  const [activeSection, setActiveSection] = useState<string>('hero');

  const item = sandboxItems[activeTab];

  // Scrollspy to track active section for the Architectural Waypoint Rail
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 220;
      for (let i = waypoints.length - 1; i >= 0; i--) {
        const elem = document.getElementById(waypoints[i].id);
        if (elem && elem.offsetTop <= scrollPos) {
          setActiveSection(waypoints[i].id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div
      className="min-h-screen relative overflow-x-hidden selection:bg-emerald-500/20 selection:text-emerald-300"
      style={{
        background: 'var(--bg)',
        color: 'var(--text-primary)',
        transitionProperty: 'background-color, color',
        transitionDuration: '150ms',
      }}
    >
      {/* ══════════════════════════════════════════════════════════════
          AUTHENTIC INDUSTRIAL ARCHITECTURAL CANVAS (No AI blobs!)
          Clean, authoritative, engineering-grade blueprint texture
      ══════════════════════════════════════════════════════════════ */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        {/* Subtle, restrained neutral ambient lighting from top center (no neon saturation) */}
        <div
          className="absolute -top-[10%] left-1/2 -translate-x-1/2 w-[80vw] max-w-[1200px] h-[450px] opacity-40 dark:opacity-25 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(16, 185, 129, 0.05) 0%, transparent 70%)',
          }}
        />

        {/* Crisp CAD Blueprint Grid spanning the full page with subtle vignette */}
        <GridPattern
          width={36}
          height={36}
          strokeDasharray="4 2"
          className="stroke-black/[0.035] dark:stroke-white/[0.04] opacity-80 [mask-image:radial-gradient(ellipse_80%_80%_at_50%_35%,white_30%,transparent_95%)]"
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          FULL-WIDTH TOP NAVIGATION BAR
          Proper edge-to-edge header: perfectly aligned controls
      ══════════════════════════════════════════════════════════════ */}
      <header
        className="landing-header w-full h-16 px-6 sm:px-12 flex items-center justify-between border-b relative z-30"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border)',
        }}
      >
        {/* Left: Emblem & Ministry Brand Identity */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shadow-sm shrink-0"
            style={{ background: '#10B981' }}
          >
            <span className="material-symbols-outlined icon-fill text-[18px] text-black">
              inventory_2
            </span>
          </div>
          <div>
            <p className="text-sm font-bold tracking-tight leading-tight" style={{ color: 'var(--text-primary)' }}>
              National Material Master
            </p>
            <p className="text-[10px] font-mono tracking-wide" style={{ color: 'var(--text-muted)' }}>
              MoPNG · SIH26099 · Government of India
            </p>
          </div>
        </div>

        {/* Right: Perfectly Aligned Controls (Matching h-9 Height & Spacing) */}
        <div className="flex items-center gap-3">
          {/* Animated Theme Toggle (h-9 w-9) */}
          <AnimatedThemeToggle className="h-9 w-9 p-0 shrink-0" />

          {/* Launch Dashboard Button (Exact h-9 height for pixel-perfect vertical alignment) */}
          <Btn
            onClick={() => setActiveScreen('dashboard')}
            className="h-9 px-4 rounded-lg text-xs font-bold text-black shadow-sm shrink-0 gap-1.5"
            style={{ background: '#10B981' }}
          >
            <span>Launch Dashboard</span>
            <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
          </Btn>
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          OPTION 2: ARCHITECTURAL WAYPOINT RAIL (Blueprint Side-Index)
          Replaces the cliché floating pill!
          Positioned with generous margins on 1366px+ viewports (no overlap).
      ══════════════════════════════════════════════════════════════ */}
      <nav
        aria-label="Blueprint Navigation Rail"
        className="fixed right-4 2xl:right-8 top-1/2 -translate-y-1/2 z-40 hidden xl:flex flex-col items-end gap-2 pointer-events-auto"
      >
        <div
          className="px-2.5 py-3 rounded-xl flex flex-col items-end gap-3 backdrop-blur-md"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            boxShadow: 'var(--shadow-card)',
            opacity: 0.94,
          }}
        >
          {waypoints.map((wp) => {
            const isActive = activeSection === wp.id;
            return (
              <button
                key={wp.id}
                onClick={() => scrollTo(wp.id)}
                className="group flex items-center gap-2 text-right cursor-pointer focus-visible:outline-none"
                title={`Jump to ${wp.label}`}
              >
                {/* Monospace Waypoint Text */}
                <span
                  className="font-mono text-[9px] tracking-wider transition-colors duration-150"
                  style={{
                    color: isActive ? '#10B981' : 'var(--text-muted)',
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  <span className="opacity-40">{wp.index} // </span>
                  <span>{wp.label}</span>
                </span>

                {/* Technical Laser Tick Indicator */}
                <div
                  className="transition-all duration-200 rounded-full"
                  style={{
                    width: isActive ? '3px' : '2px',
                    height: isActive ? '16px' : '8px',
                    backgroundColor: isActive ? '#10B981' : 'var(--border)',
                    boxShadow: isActive ? '0 0 8px #10B981' : 'none',
                  }}
                />
              </button>
            );
          })}
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 1: HERO (Decluttered & Balanced Layout)
      ══════════════════════════════════════════════════════════════ */}
      <section id="hero" className="relative z-10 pt-12 sm:pt-16 pb-20 px-6 sm:px-10 max-w-[1060px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">

          {/* Left Column: Mission Statement */}
          <motion.div
            variants={stagger}
            initial="initial"
            animate="animate"
            className="lg:col-span-6 flex flex-col items-start"
          >
            {/* SIH Official Status Chip */}
            <motion.div variants={staggerChild}>
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-5"
                style={{
                  background: 'rgba(16,185,129,0.08)',
                  border: '1px solid rgba(16,185,129,0.25)',
                  color: '#10B981',
                }}
              >
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                Smart India Hackathon 2024 · SIH26099
              </div>
            </motion.div>

            {/* H1 Headline */}
            <motion.h1
              variants={staggerChild}
              className="text-3xl sm:text-4xl lg:text-[3rem] font-black leading-[1.1] tracking-tight mb-5"
              style={{ color: 'var(--text-primary)' }}
            >
              One Platform to{' '}
              <span className="text-[#10B981]">Unify 14.2 Million</span>{' '}
              CPSE Material Records
            </motion.h1>

            {/* Concise Value Description */}
            <motion.p
              variants={staggerChild}
              className="text-sm sm:text-base leading-relaxed mb-7 max-w-lg"
              style={{ color: 'var(--text-secondary)' }}
            >
              India’s energy leaders maintain fragmented, incompatible ERP catalogs. Our semantic AI
              harmonization engine eliminates catalog duplication and unlocks{' '}
              <strong className="text-[#10B981] font-bold">₹4,820 Crore</strong> in pooled procurement savings.
            </motion.p>

            {/* Action Buttons */}
            <motion.div variants={staggerChild} className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Btn
                onClick={() => setActiveScreen('dashboard')}
                className="h-11 px-6 rounded-lg text-sm font-bold text-black gap-2 shadow-lg"
                style={{ background: '#10B981' }}
              >
                <span>Launch Dashboard</span>
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
              </Btn>

              <Btn
                onClick={() => scrollTo('architecture')}
                className="h-11 px-5 rounded-lg text-sm font-semibold gap-2 border transition-colors"
                style={{
                  background: 'var(--bg-card)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
              >
                <span className="material-symbols-outlined text-[17px] text-[#10B981]">architecture</span>
                <span>Explore Architecture ↓</span>
              </Btn>
            </motion.div>

            {/* Federation Strip */}
            <motion.div
              variants={staggerChild}
              className="flex items-center gap-3.5 mt-8 pt-5 border-t border-[var(--border-subtle)] text-xs font-mono"
            >
              <span style={{ color: 'var(--text-muted)' }}>Federated with:</span>
              <span className="font-bold text-[#10B981]">ONGC</span>
              <span className="font-bold text-[#3B82F6]">IOCL</span>
              <span className="font-bold text-[#10B981]">GAIL</span>
              <span className="font-bold text-[#8B5CF6]">NTPC</span>
              <span className="font-bold text-[#EC4899]">SAIL</span>
              <span className="font-bold text-[#F59E0B]">BHEL</span>
            </motion.div>
          </motion.div>

          {/* Right Column: Harmonization Workbench Parity Inspector Card */}
          <motion.div
            id="showcase"
            {...fadeUp(0.18)}
            className="lg:col-span-6 relative"
          >
            <motion.div
              whileHover={{ y: -4, transition: SPRING_CARD }}
              className="rounded-2xl overflow-hidden border transition-shadow"
              style={{
                background: 'var(--bg-card)',
                borderColor: 'var(--border)',
                boxShadow: 'var(--shadow-elevated)',
              }}
            >
              {/* Window Chrome Header */}
              <div
                className="px-4 py-3 flex items-center justify-between border-b"
                style={{
                  background: 'var(--bg-surface)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  <span className="ml-2 text-xs font-mono font-semibold truncate" style={{ color: 'var(--text-secondary)' }}>
                    Harmonization Workbench · Parity Inspector
                  </span>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold text-[#10B981] shrink-0"
                  style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)' }}
                >
                  <span className="material-symbols-outlined text-[13px]">verified</span>
                  98.4% AI Match
                </span>
              </div>

              {/* Inspector Content: Disparate Inputs → AI Disambiguation → Harmonized Standard */}
              <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-4 items-center relative">

                {/* Left Side: 3 Legacy ERP Records with Live Scanning Pulse */}
                <div className="md:col-span-5 space-y-2 relative">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold uppercase tracking-wider font-mono text-[9px]" style={{ color: 'var(--text-muted)' }}>
                      Legacy ERP Records
                    </span>
                    <span className="font-mono text-[10px] text-rose-500 font-bold">3 Redundant Codes</span>
                  </div>

                  {/* Scanning Laser Beam Line */}
                  <div className="relative overflow-hidden rounded-xl space-y-2">
                    <motion.div
                      animate={{ y: [0, 140, 0] }}
                      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                      className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#10B981] to-transparent z-20 pointer-events-none opacity-60"
                      style={{ boxShadow: '0 0 6px #10B981' }}
                    />

                    {[
                      { cpse: 'ONGC Hazira', code: 'MAT-VLV-0928', desc: 'BALL VALVE 50MM 150LBS CS FLANGED A216 WCB', dot: '#10B981' },
                      { cpse: 'IOCL Panipat', code: '10049281', desc: 'VLV BALL 2IN 150# FLG WCB/316 PTFE', dot: '#3B82F6' },
                      { cpse: 'GAIL Vijaipur', code: 'G-201-9482', desc: 'VALVE BALL FLGD 2 INCH CLASS 150 CS BODY', dot: '#10B981' },
                    ].map((r, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg border transition-colors"
                        style={{
                          background: 'var(--bg-surface)',
                          borderColor: 'var(--border)',
                        }}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-[11px] font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                            <span className="w-1.5 h-1.5 rounded-full" style={{ background: r.dot }} />
                            {r.cpse}
                          </span>
                          <span className="text-[10px] font-mono" style={{ color: 'var(--text-muted)' }}>{r.code}</span>
                        </div>
                        <p className="text-[10px] font-mono leading-tight truncate" style={{ color: 'var(--text-secondary)' }}>{r.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Center: AI Harmonization Connector Badge */}
                <div className="md:col-span-2 flex flex-col items-center justify-center text-center gap-1 py-1">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[#10B981] shadow-sm"
                    style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)' }}
                  >
                    <span className="material-symbols-outlined text-[18px]">compare_arrows</span>
                  </motion.div>
                  <span className="text-[10px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>AI Engine</span>
                  <span className="text-[9px] font-mono text-[#10B981] font-semibold">100% Match</span>
                </div>

                {/* Right Side: Common National Material Code (CNMC) Output Card */}
                <div
                  className="md:col-span-5 p-3.5 rounded-xl space-y-2 border"
                  style={{
                    background: 'rgba(16,185,129,0.05)',
                    borderColor: 'rgba(16,185,129,0.25)',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#10B981] font-mono">
                      Normalized CNMC
                    </span>
                    <span
                      className="text-[11px] font-mono font-bold rounded px-1.5 py-0.5 border"
                      style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                    >
                      4014.1607.1842
                    </span>
                  </div>

                  <p className="text-xs font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
                    Valve, Ball: 2 IN, ASME Class 150, Flanged RF, ASTM A216 WCB Body
                  </p>

                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {['ASTM A216 WCB', 'ASME Class 150', '2 Inch (DN 50)', 'PTFE Seat'].map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] px-1.5 py-0.5 rounded font-mono font-medium text-purple-400 bg-purple-500/10 border border-purple-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div
                    className="pt-1.5 flex items-center justify-between text-[11px] border-t"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    <span style={{ color: 'var(--text-muted)' }}>Pooled procurement</span>
                    <span className="font-bold text-[#10B981]">14% Savings</span>
                  </div>
                </div>

              </div>
            </motion.div>
          </motion.div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2: SCROLL-TRIGGERED CPSE INTEGRATION BAND
      ══════════════════════════════════════════════════════════════ */}
      <section id="cpses" className="py-10 px-6 border-y border-[var(--border-subtle)] bg-[var(--bg-surface)] relative z-10">
        <div className="max-w-[1060px] mx-auto">
          <p className="text-center text-xs font-bold uppercase tracking-widest mb-6 font-mono" style={{ color: 'var(--text-muted)' }}>
            Integrated With India's Major Public Sector Enterprises
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {cpsesData.map((c, i) => (
              <CpseCard key={c.name} c={c} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3: 3-STEP ANIMATED ARCHITECTURE PIPELINE
      ══════════════════════════════════════════════════════════════ */}
      <section id="architecture" className="py-20 px-6 sm:px-10 max-w-[1060px] mx-auto relative z-10">
        <div className="text-center mb-14">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-3 font-mono"
            style={{
              background: 'rgba(16,185,129,0.08)',
              border: '1px solid rgba(16,185,129,0.25)',
              color: '#10B981',
            }}
          >
            <span className="material-symbols-outlined text-[15px]">account_tree</span>
            Core Technology Architecture
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            How the AI Engine Unifies CPSE Data
          </h2>
          <p className="text-sm sm:text-base max-w-xl mx-auto mt-2.5" style={{ color: 'var(--text-secondary)' }}>
            India has ₹1.4 Lakh Crore worth of industrial spares locked across siloed CPSE ERPs.
            Here is the 3-phase automated pipeline that unifies them under MoPNG governance:
          </p>
        </div>

        {/* 3 Interactive Pipeline Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">

          {/* Step 01 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            whileHover={{ y: -4, transition: SPRING_CARD }}
            className="p-6 rounded-2xl flex flex-col justify-between border"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20">
                  LAYER 01 // TELEMETRY
                </span>
                <span className="material-symbols-outlined text-[22px] text-amber-500">
                  database
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Multi-ERP Data Ingestion
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Direct connectors integrate SAP S/4HANA, Oracle ERP, and IBM Maximo instances from ONGC, IOCL,
                and GAIL, extracting raw, chaotic material text strings in real time.
              </p>
            </div>

            <div className="mt-6 pt-3.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
              <span style={{ color: 'var(--text-muted)' }}>Ingestion speed</span>
              <span className="font-mono font-bold text-[#10B981]">14.2M Records Streaming</span>
            </div>
          </motion.div>

          {/* Step 02 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.08 }}
            whileHover={{ y: -4, transition: SPRING_CARD }}
            className="p-6 rounded-2xl flex flex-col justify-between border"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20">
                  LAYER 02 // NLP ENGINE
                </span>
                <span className="material-symbols-outlined text-[22px] text-[#10B981]">
                  psychology
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Semantic Normalization
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Domain NLP extracts engineering specs (ASTM, DIN, ASME), decomposes non-standard abbreviations,
                and computes vector similarity to match duplicates across enterprises.
              </p>
            </div>

            <div className="mt-6 pt-3.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
              <span style={{ color: 'var(--text-muted)' }}>Matching accuracy</span>
              <span className="font-mono font-bold text-[#10B981]">98.4% Confidence Score</span>
            </div>
          </motion.div>

          {/* Step 03 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.16 }}
            whileHover={{ y: -4, transition: SPRING_CARD }}
            className="p-6 rounded-2xl flex flex-col justify-between border"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-blue-500 bg-blue-500/10 border border-blue-500/20">
                  LAYER 03 // VALUE CREATION
                </span>
                <span className="material-symbols-outlined text-[22px] text-blue-500">
                  hub
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
                Unified CNMC &amp; Pooling
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Assigns canonical 12-digit CNMC codes, identifies interchangeable maintenance spares, and enables
                centralized bulk rate negotiations across all public sector buyers.
              </p>
            </div>

            <div className="mt-6 pt-3.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
              <span style={{ color: 'var(--text-muted)' }}>Fiscal unlock</span>
              <span className="font-mono font-bold text-[#10B981]">₹4,820 Cr Annual Savings</span>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4: INTERACTIVE PARITY DEMO SANDBOX
      ══════════════════════════════════════════════════════════════ */}
      <section id="workbench" className="py-20 px-6 sm:px-10 max-w-[1060px] mx-auto relative z-10">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#10B981] font-mono">
            Interactive Parity Workbench
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold mt-1.5 tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Test Real Material Harmonization
          </h2>
          <p className="text-sm max-w-md mx-auto mt-2" style={{ color: 'var(--text-secondary)' }}>
            Switch categories to examine how disparate CPSE records converge into one canonical master:
          </p>

          {/* Category Tabs */}
          <div
            className="inline-flex gap-1 mt-6 p-1 rounded-xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            {(['valve', 'fastener', 'pump'] as SandboxKey[]).map((tab) => (
              <motion.button
                key={tab}
                onClick={() => setActiveTab(tab)}
                whileTap={{ scale: 0.97, transition: SPRING_BUTTON }}
                className="relative px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer"
                style={{
                  color: activeTab === tab ? '#000000' : 'var(--text-muted)',
                  transitionProperty: 'color',
                  transitionDuration: '150ms',
                }}
              >
                {activeTab === tab && (
                  <motion.span
                    layoutId="sandbox-tab-pill"
                    className="absolute inset-0 rounded-lg shadow-sm"
                    style={{ background: '#10B981' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{sandboxItems[tab].label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Tab Content Display */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: EASE_OUT }}
            className="rounded-2xl p-6 sm:p-7 border"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-elevated)',
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Left: Raw Source Records */}
              <div className="space-y-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider font-mono text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  Raw Source Records in CPSE ERPs
                </span>
                <div className="space-y-2">
                  {item.sources.map((s, i) => (
                    <motion.div
                      key={s.code}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.25, ease: EASE_OUT, delay: i * 0.05 }}
                      className="p-3 rounded-xl space-y-0.5 border"
                      style={{
                        background: 'var(--bg-surface)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold flex items-center gap-1.5" style={{ color: 'var(--text-primary)' }}>
                          <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                          {s.cpse}
                        </span>
                        <span className="font-mono text-[11px]" style={{ color: 'var(--text-muted)' }}>{s.code}</span>
                        <span className="font-mono font-semibold" style={{ color: 'var(--text-primary)' }}>{s.price}</span>
                      </div>
                      <p className="text-xs font-mono" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Right: Unified CNMC Canonical Record */}
              <div
                className="p-5 rounded-xl flex flex-col justify-between border"
                style={{
                  background: 'rgba(16,185,129,0.04)',
                  borderColor: 'rgba(16,185,129,0.22)',
                }}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#10B981] font-mono">
                      Normalized National Master
                    </span>
                    <span
                      className="text-xs font-mono font-bold rounded px-2 py-0.5 border"
                      style={{
                        background: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      {item.cnmc}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className="text-[11px] px-2 py-0.5 rounded-full font-semibold text-[#10B981]"
                      style={{ background: 'rgba(16,185,129,0.1)' }}
                    >
                      {item.confidence} match confidence
                    </span>
                  </div>

                  <p className="text-sm font-bold leading-snug" style={{ color: 'var(--text-primary)' }}>
                    {item.canonical}
                  </p>

                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-semibold" style={{ color: 'var(--text-muted)' }}>
                      Extracted Standard Attributes:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {item.chips.map((c) => (
                        <span
                          key={c}
                          className="text-xs font-mono px-2 py-0.5 rounded text-purple-400 bg-purple-500/10 border border-purple-500/20"
                        >
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className="mt-4 pt-3 text-xs text-[#10B981] font-semibold flex items-center gap-1.5 border-t"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <span className="material-symbols-outlined text-[16px]">trending_up</span>
                  {item.insight}
                </div>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 5: ENTERPRISE CAPABILITIES BENTO GRID
      ══════════════════════════════════════════════════════════════ */}
      <section id="bento" className="py-20 px-6 sm:px-10 max-w-[1060px] mx-auto relative z-10">
        <div className="mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#10B981] font-mono">
            Enterprise Governance
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mt-1" style={{ color: 'var(--text-primary)' }}>
            Built for National-Scale Auditing &amp; Interoperability
          </h2>
          <p className="text-sm mt-2 max-w-lg" style={{ color: 'var(--text-secondary)' }}>
            Fully compliant with MoPNG statutory taxonomy, RTI auditability, and ERP data-exchange standards.
          </p>
        </div>

        {/* Asymmetric Bento: Row 1 (2+1), Row 2 (1+2) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Bento Card 1: Semantic AI Engine (Large, col-span-2) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, transition: SPRING_CARD }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className="md:col-span-2 p-6 sm:p-7 rounded-2xl flex flex-col justify-between border"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-card)',
              minHeight: '210px',
            }}
          >
            <div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[#10B981] mb-4"
                style={{ background: 'rgba(16,185,129,0.1)' }}
              >
                <span className="material-symbols-outlined text-[22px]">psychology</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Semantic AI Engine
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed max-w-md" style={{ color: 'var(--text-secondary)' }}>
                Domain-tuned NLP resolves abbreviations, metric-imperial units, and catalog discrepancies across
                14.2M records, trained on decades of Indian public sector engineering nomenclature.
              </p>
            </div>
            <div
              className="flex items-center justify-between mt-5 pt-4 border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#10B981]">98.4%</div>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Confidence precision</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#10B981]">68.2%</div>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Duplicate reduction</div>
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-extrabold text-[#10B981]">&lt;2s</div>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Per-record latency</div>
              </div>
            </div>
          </motion.div>

          {/* Bento Card 2: Inter-CPSE Spend Pooling (Small) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, transition: SPRING_CARD }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.08 }}
            className="p-6 rounded-2xl flex flex-col justify-between border"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-card)',
              minHeight: '210px',
            }}
          >
            <div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[#10B981] mb-4"
                style={{ background: 'rgba(16,185,129,0.1)' }}
              >
                <span className="material-symbols-outlined text-[20px]">monitoring</span>
              </div>
              <h3 className="text-base font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Inter-CPSE Spend Pooling
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Aggregates demand across public sector buyers to unlock collective tier discounts unavailable to individual enterprises.
              </p>
            </div>
            <div
              className="mt-4 pt-3 text-xs font-semibold text-[#10B981] border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              ₹4,820 Cr Realized Savings
            </div>
          </motion.div>

          {/* Bento Card 3: Rationalization Workflows (Small) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, transition: SPRING_CARD }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.12 }}
            className="p-6 rounded-2xl flex flex-col justify-between border"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-amber-500 mb-4"
                style={{ background: 'rgba(234,179,8,0.1)' }}
              >
                <span className="material-symbols-outlined text-[20px]">call_merge</span>
              </div>
              <h3 className="text-base font-bold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Rationalization Engine
              </h3>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Six precision workflows — MAP, MERGE, RETAIN, RETIRE, SPLIT, REVIEW — with downstream impact previews.
              </p>
            </div>
            <div
              className="mt-4 pt-3 text-xs font-semibold text-amber-500 border-t"
              style={{ borderColor: 'var(--border)' }}
            >
              68.2% Duplicate Reduction
            </div>
          </motion.div>

          {/* Bento Card 4: Immutable Audit Trail (Wide, col-span-2) */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4, transition: SPRING_CARD }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.45, ease: EASE_OUT, delay: 0.16 }}
            className="md:col-span-2 p-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div className="flex items-start gap-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[#3B82F6] shrink-0"
                style={{ background: 'rgba(59,130,246,0.1)' }}
              >
                <span className="material-symbols-outlined text-[20px]">gavel</span>
              </div>
              <div>
                <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  Immutable Audit Trail
                </h3>
                <p className="text-xs leading-relaxed max-w-sm" style={{ color: 'var(--text-secondary)' }}>
                  Every harmonization event is cryptographically logged with state-before/state-after telemetry.
                  RTI-compliant and CAG audit ready.
                </p>
              </div>
            </div>
            <div
              className="flex items-center gap-3 shrink-0 px-4 py-2.5 rounded-xl border"
              style={{
                background: 'rgba(59,130,246,0.06)',
                borderColor: 'rgba(59,130,246,0.2)',
              }}
            >
              <span className="material-symbols-outlined text-[24px] text-[#3B82F6]">shield</span>
              <div>
                <div className="text-base font-extrabold text-[#3B82F6]">100%</div>
                <div className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Traceability</div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 6: MEASURABLE FISCAL IMPACT STATS
      ══════════════════════════════════════════════════════════════ */}
      <section
        id="impact"
        className="py-16 border-y relative z-10"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="max-w-[1060px] mx-auto px-6">
          <div className="text-center mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#10B981] font-mono">
              National Economic Impact
            </span>
            <h2 className="text-2xl font-bold tracking-tight mt-1" style={{ color: 'var(--text-primary)' }}>
              Measurable National Fiscal Value
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0">
            {[
              { prefix: '₹', value: 4820, suffix: ' Cr', decimals: 0, label: 'Annual Savings', sub: 'Via cross-CPSE demand pooling' },
              { prefix: '', value: 14.2, suffix: 'M+', decimals: 1, label: 'Source Records', sub: 'Across 6 CPSE enterprise systems' },
              { prefix: '', value: 3.1, suffix: 'M', decimals: 1, label: 'CNMC Masters', sub: 'Governed under MoPNG taxonomy' },
              { prefix: '', value: 91.4, suffix: '%', decimals: 1, label: 'Parity Score', sub: 'Standard taxonomy alignment' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, ease: EASE_OUT, delay: i * 0.08 }}
                className="text-center px-4 py-3 md:py-4"
                style={{
                  borderRight: i < 3 ? '1px solid var(--border)' : undefined,
                }}
              >
                <div className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-1 text-[#10B981]">
                  {stat.prefix}
                  <AnimatedNumber value={stat.value} decimals={stat.decimals} duration={1600} />
                  {stat.suffix}
                </div>
                <div className="text-xs sm:text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>
                  {stat.label}
                </div>
                <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 7: EDITORIAL MOMENT / FINAL CALL TO ACTION
      ══════════════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: EASE_OUT }}
          className="max-w-xl mx-auto space-y-5"
        >
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Ready to Experience the National Master?
          </h2>
          <p className="text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Launch the executive console to monitor live harmonization metrics, inspect duplicate
            candidates, and access India's national public sector procurement hub.
          </p>
          <Btn
            onClick={() => setActiveScreen('dashboard')}
            className="h-11 inline-flex items-center gap-2 px-8 rounded-lg text-sm font-bold text-black shadow-xl"
            style={{ background: '#10B981' }}
          >
            <span>Launch Dashboard</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Btn>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FOOTER (Statutory Governance & Navigation)
      ══════════════════════════════════════════════════════════════ */}
      <footer
        className="py-5 px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs border-t relative z-10"
        style={{
          background: 'var(--bg-surface)',
          borderColor: 'var(--border)',
          color: 'var(--text-muted)',
        }}
      >
        <span>© 2024 National Unified Material Master · SIH26099 · Ministry of Petroleum &amp; Natural Gas</span>
        <div className="flex items-center gap-5">
          {[
            { label: 'Audit Trail', screen: 'governance' as const },
            { label: 'Settings', screen: 'settings' as const },
            { label: 'Documentation', screen: 'support' as const },
          ].map(({ label, screen }) => (
            <button
              key={label}
              onClick={() => setActiveScreen(screen)}
              className="hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              style={{ transitionProperty: 'color', transitionDuration: '150ms' }}
            >
              {label}
            </button>
          ))}
        </div>
      </footer>

    </div>
  );
};
