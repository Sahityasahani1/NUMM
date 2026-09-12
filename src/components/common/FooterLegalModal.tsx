import React, { useState } from 'react';

export type LegalModalType = 'privacy' | 'terms' | 'contact' | null;

interface FooterLegalModalProps {
  modalType: LegalModalType;
  onClose: () => void;
}

export const FooterLegalModal: React.FC<FooterLegalModalProps> = ({ modalType, onClose }) => {
  if (!modalType) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-2xl bg-[#0C0E0D] border border-[#232825] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#232825] bg-[#070908] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[18px]"
              style={{
                background:
                  modalType === 'privacy'
                    ? 'rgba(16, 185, 129, 0.12)'
                    : modalType === 'terms'
                    ? 'rgba(59, 130, 246, 0.12)'
                    : 'rgba(234, 179, 8, 0.12)',
                color:
                  modalType === 'privacy'
                    ? '#10B981'
                    : modalType === 'terms'
                    ? '#3B82F6'
                    : '#EAB308',
              }}
            >
              <span className="material-symbols-outlined text-[18px]">
                {modalType === 'privacy'
                  ? 'shield'
                  : modalType === 'terms'
                  ? 'gavel'
                  : 'contact_support'}
              </span>
            </span>
            <div>
              <h3 className="text-sm font-bold text-white">
                {modalType === 'privacy' && 'Statutory Privacy & Data Governance'}
                {modalType === 'terms' && 'Inter-CPSE Master Governance Terms'}
                {modalType === 'contact' && 'Technical Secretariat & Support Desk'}
              </h3>
              <p className="text-[11px] text-[#A7ADA9] font-mono">
                MoPNG · SIH26099 Enterprise Policy
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#9CA3AF] hover:text-white hover:bg-white/5 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-[#A7ADA9] leading-relaxed">
          {modalType === 'privacy' && (
            <>
              <p>
                The <strong>National Unified Material Master (NUMM)</strong> operates under the directive of the Ministry of Petroleum &amp; Natural Gas (MoPNG) and strictly complies with the Digital Personal Data Protection (DPDP) Act 2023 and MeitY cloud security benchmarks.
              </p>
              <div className="p-3.5 rounded-xl bg-[#070908] border border-[#232825] space-y-2">
                <span className="font-bold text-white text-[11px] uppercase tracking-wider block">
                  Key Data Protection Safeguards
                </span>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li><strong className="text-white">Zero Vendor Pricing Leakage:</strong> Commercial contract terms between individual CPSEs and vendors are strictly masked; only aggregate volume tier baselines are pooled.</li>
                  <li><strong className="text-white">Immutable Audit Hash:</strong> All catalog mappings, deduplications, and approvals generate SHA-256 cryptographic records retained for 10 years for CAG audit compliance.</li>
                  <li><strong className="text-white">Sovereign Data Residency:</strong> Hosted within MeitY-empaneled Tier-IV data centers within Indian sovereign jurisdiction.</li>
                </ul>
              </div>
            </>
          )}

          {modalType === 'terms' && (
            <>
              <p>
                Participation in the National Unified Material Master is governed by <strong>Inter-Enterprise Protocol Memorandum (MoPNG/NUMM/2024/09)</strong> adopted by ONGC, IOCL, GAIL, NTPC, SAIL, and BHEL.
              </p>
              <div className="p-3.5 rounded-xl bg-[#070908] border border-[#232825] space-y-2">
                <span className="font-bold text-white text-[11px] uppercase tracking-wider block">
                  Standard Operating Mandates
                </span>
                <ul className="space-y-1.5 list-disc list-inside">
                  <li><strong className="text-white">Authoritative CNMC Primacy:</strong> When an item is unified into a Common National Material Code, participating enterprises must maintain the CNMC alias in local ERPs (SAP, Oracle Cloud).</li>
                  <li><strong className="text-white">Consolidated Spend Pooling:</strong> Standardized bulk procurement tenders must be routed through the unified demand aggregator to realize negotiated national volume rebates.</li>
                  <li><strong className="text-white">Catalog Stewardship:</strong> Technical committee catalogers must complete dual-signoff on all MERGE and SPLIT rationalization workflows.</li>
                </ul>
              </div>
            </>
          )}

          {modalType === 'contact' && (
            <>
              <p>
                For technical assistance, API connector onboarding, or catalog standardization escalations, contact the National Material Master Secretariat:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3.5 rounded-xl bg-[#070908] border border-[#232825] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#6B7280]">Secretariat Office</span>
                  <p className="text-white font-medium">Ministry of Petroleum &amp; Natural Gas</p>
                  <p className="text-[#9CA3AF]">Shastri Bhawan, Dr. Rajendra Prasad Rd</p>
                  <p className="text-[#9CA3AF]">New Delhi, Delhi 110001</p>
                </div>
                <div className="p-3.5 rounded-xl bg-[#070908] border border-[#232825] space-y-1">
                  <span className="text-[10px] uppercase font-bold text-[#6B7280]">National Helpdesk</span>
                  <p className="text-[#10B981] font-mono font-bold">support-numm@mopng.gov.in</p>
                  <p className="text-[#9CA3AF] font-mono">Toll-Free: 1800-11-8844</p>
                  <p className="text-[11px] text-[#6B7280]">Mon–Fri: 09:00 – 18:00 IST</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-[#232825] bg-[#070908] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#10B981] text-[#000000] hover:brightness-110 transition-all shadow-sm"
          >
            Acknowledge &amp; Close
          </button>
        </div>
      </div>
    </div>
  );
};

export const ScreenFooter: React.FC = () => {
  const [modalType, setModalType] = useState<LegalModalType>(null);

  return (
    <>
      <footer className="flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B7280] pt-6 pb-2 border-t border-[#1B201D] gap-2">
        <div>
          National Material Master &nbsp;|&nbsp; Government of India &nbsp;|&nbsp; SIH26099
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setModalType('privacy')}
            className="hover:text-[#9CA3AF] transition-colors cursor-pointer bg-transparent border-none p-0 text-xs"
          >
            Privacy
          </button>
          <button
            type="button"
            onClick={() => setModalType('terms')}
            className="hover:text-[#9CA3AF] transition-colors cursor-pointer bg-transparent border-none p-0 text-xs"
          >
            Terms
          </button>
          <button
            type="button"
            onClick={() => setModalType('contact')}
            className="hover:text-[#9CA3AF] transition-colors cursor-pointer bg-transparent border-none p-0 text-xs"
          >
            Contact
          </button>
        </div>
      </footer>

      <FooterLegalModal modalType={modalType} onClose={() => setModalType(null)} />
    </>
  );
};
