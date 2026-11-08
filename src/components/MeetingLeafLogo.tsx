import React from 'react';
import { CreditTier } from '@/types';

export const MeetingLeafLogo: React.FC<{
  size?: number;
  showWordmark?: boolean;
  showDomainBadge?: boolean;
  variant?: 'light' | 'dark';
}> = ({ size = 36, showWordmark = true, variant = 'light' }) => {
  const wordmarkColor = variant === 'dark' ? '#F6EEDD' : '#173A20';

  // Natural leaf aspect ratio is 516/839 (~0.615).
  // Set exact slim width matching the visual contours so it sits directly against 'Agrom'
  // like a stylized leading emblem letter (leafAgrom) without any whitespace or gutter.
  const leafHeight = size;
  const leafWidth = Math.round(leafHeight * 0.50);

  return (
    <div className="inline-flex items-center gap-0 select-none">
      <img
        src="/assets/agromarket.png"
        alt="Agrom Leaf"
        style={{ width: leafWidth, height: leafHeight }}
        className="shrink-0 object-contain -mr-[1px]"
      />

      {showWordmark && (
        <span
          className="font-display font-bold tracking-tight leading-none"
          style={{ color: wordmarkColor, fontSize: Math.max(size * 0.72, 21) }}
        >
          Agrom
        </span>
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
