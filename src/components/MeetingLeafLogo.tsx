import React from 'react';
import { CreditTier } from '@/types';

export const MeetingLeafLogo: React.FC<{
  size?: number;
  showWordmark?: boolean;
  showDomainBadge?: boolean;
  variant?: 'light' | 'dark';
}> = ({ size = 36, showWordmark = true, showDomainBadge = false, variant = 'light' }) => {
  const wordmarkColor = variant === 'dark' ? '#F6EEDD' : '#173A20';

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      {/* The Meeting Leaf Mark (Grower Cultivated Green + Buyer Harvest Gold + Tilled Soil Stem) */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 220"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Left Half — Cultivated Green (The Grower) */}
        <path
          d="M100 18 C48 48 26 96 34 142 C41 178 68 194 98 196 L98 20 Z"
          fill="#4E8B3F"
        />
        {/* Right Half — Harvest Gold (The Buyer) */}
        <path
          d="M102 20 L102 196 C132 194 159 178 166 142 C174 96 152 48 102 18 Z"
          fill="#E2A63C"
        />
        {/* Leaf Veins */}
        <path
          d="M96 70 L64 52 M96 105 L56 84 M96 140 L66 122"
          stroke="#EEF8F1"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeOpacity="0.65"
        />
        <path
          d="M104 70 L136 52 M104 105 L144 84 M104 140 L134 122"
          stroke="#FFFDF7"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeOpacity="0.65"
        />
        {/* Tilled Soil Stem */}
        <path
          d="M100 192 C100 204 106 212 118 215"
          stroke={variant === 'dark' ? '#E2A63C' : '#7A4A2D'}
          strokeWidth="8"
          strokeLinecap="round"
        />
      </svg>

      {showWordmark && (
        <div className="flex items-baseline gap-1.5">
          <span
            className="font-display font-semibold tracking-tight leading-none"
            style={{ color: wordmarkColor, fontSize: Math.max(size * 0.66, 20) }}
          >
            Agrom
          </span>
          {showDomainBadge && (
            <span
              className={`font-mono-num text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${
                variant === 'dark'
                  ? 'bg-[#0E2515] text-[#E2A63C] border-[#4E8B3F]/40'
                  : 'bg-[#EEF8F1] text-[#4E8B3F] border-[#CCEBD5]'
              }`}
            >
              .app
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export const FarmerBadge: React.FC<{
  tier?: CreditTier | string;
  label?: string;
  size?: 'sm' | 'md';
}> = ({ tier = 'GOLD', label, size = 'sm' }) => {
  const normalized = (tier || 'GOLD').toUpperCase();

  const tierStyles: Record<
    string,
    { bg: string; border: string; text: string; dot: string; defaultLabel: string }
  > = {
    PLATINUM: {
      bg: 'bg-[#EEF8F1]',
      border: 'border-[#4E8B3F]/40',
      text: 'text-[#173A20]',
      dot: 'bg-[#173A20]',
      defaultLabel: 'Platinum Producer',
    },
    GOLD: {
      bg: 'bg-[#FEF6E8]',
      border: 'border-[#E2A63C]/45',
      text: 'text-[#8A5F1C]',
      dot: 'bg-[#E2A63C]',
      defaultLabel: 'Gold Tier',
    },
    SILVER: {
      bg: 'bg-[#EEF8F1]',
      border: 'border-[#CCEBD5]',
      text: 'text-[#4E8B3F]',
      dot: 'bg-[#4E8B3F]',
      defaultLabel: 'Silver Tier',
    },
    BRONZE: {
      bg: 'bg-[#FBF7F4]',
      border: 'border-[#7A4A2D]/25',
      text: 'text-[#7A4A2D]',
      dot: 'bg-[#7A4A2D]',
      defaultLabel: 'Bronze Tier',
    },
  };

  const cfg = tierStyles[normalized] || tierStyles.GOLD;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${cfg.bg} ${cfg.border} ${cfg.text} ${
        size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs'
      }`}
    >
      <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
      <span>{label || cfg.defaultLabel}</span>
    </span>
  );
};

export default MeetingLeafLogo;

