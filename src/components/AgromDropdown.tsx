import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface AgromDropdownOption {
  id: string;
  label: string;
  sublabel?: string;
  badge?: string;
  emoji?: string;
  icon?: React.ReactNode;
}

interface AgromDropdownProps {
  label?: string;
  required?: boolean;
  options: AgromDropdownOption[];
  selectedId: string;
  onSelect: (option: AgromDropdownOption) => void;
  placeholder?: string;
  className?: string;
  dropdownClassName?: string;
  disabled?: boolean;
  variant?: 'mint' | 'harvest';
}

export const AgromDropdown: React.FC<AgromDropdownProps> = ({
  label,
  required,
  options,
  selectedId,
  onSelect,
  placeholder = 'Select an option',
  className = '',
  dropdownClassName = '',
  disabled = false,
  variant = 'mint',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.id === selectedId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const isHarvest = variant === 'harvest';

  // Trigger button styling based on variant
  const triggerStyle = isHarvest
    ? isOpen
      ? 'bg-[#FEF7EE] border-[#E2A63C] ring-2 ring-[#E2A63C]/25'
      : 'bg-[#FEF7EE] border-[#F7D9A4] hover:border-[#E2A63C] hover:bg-[#FDF2E2]'
    : isOpen
      ? 'bg-[#EEF8F1] border-[#4E8B3F] ring-2 ring-[#4E8B3F]/20'
      : 'bg-[#EEF8F1] border-[#CCEBD5] hover:border-[#4E8B3F] hover:bg-[#E5F5E9]';

  const chevronColor = isHarvest ? 'text-[#E2A63C]' : 'text-[#4E8B3F]';
  const popoverBorder = isHarvest ? 'border-[#F7D9A4]' : 'border-[#CCEBD5]';

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-xs font-semibold text-[#5C5245] mb-1.5">
          {label} {required && <span className={isHarvest ? 'text-[#E2A63C]' : 'text-[#4E8B3F]'}>*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border transition text-left cursor-pointer shadow-2xs ${triggerStyle} ${disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {selectedOption?.icon && (
            <span className="shrink-0 flex items-center">{selectedOption.icon}</span>
          )}
          {selectedOption?.emoji && !selectedOption?.icon && (
            <span className="text-base shrink-0 leading-none">{selectedOption.emoji}</span>
          )}
          <div className="truncate">
            <span className={`text-sm font-bold block truncate ${isHarvest ? 'text-[#173A20]' : 'text-[#173A20]'}`}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            {selectedOption?.sublabel && (
              <span className={`text-[11px] block truncate mt-0.5 ${isHarvest ? 'text-[#8D5B28]' : 'text-[#5C5245]'}`}>
                {selectedOption.sublabel}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {selectedOption?.badge && (
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-mono-num font-bold ${isHarvest
                  ? 'bg-[#E2A63C]/20 text-[#8D5B28] border border-[#E2A63C]/30'
                  : 'bg-[#173A20] text-[#E2A63C]'
                }`}
            >
              {selectedOption.badge}
            </span>
          )}
          <ChevronDown
            size={18}
            className={`${chevronColor} transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </div>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div
          className={`absolute left-0 right-0 z-50 mt-1.5 max-h-64 overflow-y-auto rounded-2xl bg-white border ${popoverBorder} shadow-xl p-1.5 space-y-1 ${dropdownClassName}`}
        >
          {options.map((option) => {
            const isSelected = option.id === selectedId;
            const itemSelectedStyle = isHarvest
              ? isSelected
                ? 'bg-[#FEF7EE] border border-[#E2A63C]/50 text-[#8D5B28]'
                : 'hover:bg-[#FEF7EE]/70 text-[#241A12] border border-transparent'
              : isSelected
                ? 'bg-[#EEF8F1] border border-[#4E8B3F]/40 text-[#173A20]'
                : 'hover:bg-[#EEF8F1]/60 text-[#241A12] border border-transparent';

            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onSelect(option);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left transition cursor-pointer ${itemSelectedStyle}`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {option.icon && <span className="shrink-0 flex items-center">{option.icon}</span>}
                  {option.emoji && !option.icon && (
                    <span className="text-base shrink-0 leading-none">{option.emoji}</span>
                  )}
                  <div className="truncate">
                    <span
                      className={`text-xs block truncate ${isSelected
                          ? isHarvest
                            ? 'font-bold text-[#8D5B28]'
                            : 'font-bold text-[#173A20]'
                          : 'font-medium text-[#241A12]'
                        }`}
                    >
                      {option.label}
                    </span>
                    {option.sublabel && (
                      <span
                        className={`text-[10px] block truncate ${isHarvest ? 'text-[#8D5B28]/80' : 'text-[#5C5245]'
                          }`}
                      >
                        {option.sublabel}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {option.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono-num font-bold ${isHarvest
                          ? 'bg-[#E2A63C]/20 text-[#8D5B28]'
                          : 'bg-[#173A20] text-[#E2A63C]'
                        }`}
                    >
                      {option.badge}
                    </span>
                  )}
                  {isSelected && (
                    <Check
                      size={15}
                      className={isHarvest ? 'text-[#E2A63C] stroke-[2.5]' : 'text-[#4E8B3F] stroke-[2.5]'}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AgromDropdown;
