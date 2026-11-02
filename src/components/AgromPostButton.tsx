import React from 'react';

interface AgromPostButtonProps {
  onClick: (e: React.MouseEvent) => void;
  label?: string;
  compact?: boolean;
  className?: string;
}

export const AgromPostButton: React.FC<AgromPostButtonProps> = ({
  onClick,
  label = 'Post Story',
  compact = false,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative inline-flex items-center justify-center group cursor-pointer transition-transform active:scale-95 ${className}`}
      title={label}
    >
      {/* Background Left Color Wing: Fresh Mint Green */}
      <div className="absolute inset-y-0 -left-1.5 w-6 bg-[#4E8B3F] rounded-l-xl shadow-xs transition-transform group-hover:-translate-x-0.5" />

      {/* Background Right Color Wing: Harvest Gold */}
      <div className="absolute inset-y-0 -right-1.5 w-6 bg-[#E2A63C] rounded-r-xl shadow-xs transition-transform group-hover:translate-x-0.5" />

      {/* Center Foreground Overlay Card */}
      <div
        className={`relative z-10 bg-white border border-[#F2DCAA] rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition group-hover:bg-[#FFFDF7] ${
          compact ? 'px-2.5 py-1.5' : 'px-4 py-2.5'
        }`}
      >
        {/* Crisp Center + Sign */}
        <span className="font-black text-sm text-[#173A20] leading-none select-none">+</span>
        {label ? (
          <span className="text-xs font-bold text-[#173A20] tracking-tight">{label}</span>
        ) : null}
      </div>
    </button>
  );
};

export default AgromPostButton;

