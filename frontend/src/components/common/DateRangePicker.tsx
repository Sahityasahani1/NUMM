import React, { useState, useRef, useEffect } from 'react';

export type DateRangeOption = 'Last 7 days' | 'Last 30 days' | 'Last 90 days' | 'FY 2024-25' | 'All Time';

interface DateRangePickerProps {
  value?: DateRangeOption;
  onChange?: (range: DateRangeOption) => void;
  className?: string;
}

const OPTIONS: DateRangeOption[] = [
  'Last 7 days',
  'Last 30 days',
  'Last 90 days',
  'FY 2024-25',
  'All Time',
];

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  value: controlledValue,
  onChange,
  className = '',
}) => {
  const [internalValue, setInternalValue] = useState<DateRangeOption>('Last 30 days');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedValue = controlledValue !== undefined ? controlledValue : internalValue;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (option: DateRangeOption) => {
    if (onChange) onChange(option);
    setInternalValue(option);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0C0E0D] border border-[#232825] text-xs font-semibold text-[#F3F4F6] hover:border-[#38423C] hover:bg-[#131715] transition-all shadow-sm select-none"
      >
        <span className="material-symbols-outlined text-[15px] text-[#9CA3AF]">
          calendar_today
        </span>
        <span>{selectedValue}</span>
        <span
          className={`material-symbols-outlined text-[15px] text-[#6B7280] transition-transform duration-150 ${
            isOpen ? 'rotate-180 text-[#10B981]' : ''
          }`}
        >
          expand_more
        </span>
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-1.5 w-44 rounded-xl shadow-2xl z-50 overflow-hidden py-1 border border-[#232825] bg-[#0C0E0D] animate-fade-in"
          style={{ backdropFilter: 'blur(8px)' }}
        >
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#6B7280] border-b border-[#1B201D]">
            Reporting Window
          </div>
          {OPTIONS.map((opt) => {
            const isSelected = opt === selectedValue;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => handleSelect(opt)}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-[#10B981]/15 text-[#10B981] font-semibold'
                    : 'text-[#9CA3AF] hover:text-[#F3F4F6] hover:bg-white/[0.04]'
                }`}
              >
                <span>{opt}</span>
                {isSelected && (
                  <span className="material-symbols-outlined text-[14px]">check</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
