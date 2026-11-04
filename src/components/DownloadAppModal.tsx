import React from 'react';
import { X, Smartphone, Download, QrCode, Sparkles, CheckCircle2 } from 'lucide-react';
import MeetingLeafLogo from './MeetingLeafLogo';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#241A12]/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#CCEBD5] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header Strip with Gradient Pattern */}
        <div className="bg-linear-to-r from-[#173A20] via-[#245731] to-[#173A20] p-6 text-white text-center relative overflow-hidden">
          <div className="absolute top-2 right-2">
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
            <Smartphone size={24} className="text-[#E2A63C]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#E2A63C]/20 border border-[#E2A63C]/40 text-[#E2A63C] text-[11px] font-bold tracking-wide uppercase mb-1.5">
            <Sparkles size={11} />
            Native Mobile Companion
          </div>
          <h3 className="font-display-italic text-2xl font-semibold text-[#F7F2E7]">
            Get Agrom on Your Phone
          </h3>
          <p className="text-xs text-[#E1F3E7]/80 mt-1 max-w-xs mx-auto">
            Real-time harvest alerts, MoMo Smart Escrow confirmations & offline farm management
          </p>
        </div>

        {/* Modal Body: QR Code & Stores */}
        <div className="p-6 text-center">
          {/* Mockup SVG QR Code */}
          <div className="inline-block p-4 bg-white rounded-2xl border-2 border-dashed border-[#CCEBD5] shadow-sm mb-4 relative group">
            <div className="w-48 h-48 mx-auto relative flex items-center justify-center bg-[#FAF8F5] rounded-xl p-2">
              {/* High-fidelity stylized SVG QR code */}
              <svg viewBox="0 0 100 100" className="w-full h-full text-[#173A20]" fill="currentColor">
                {/* Top-Left Position Detection Marker */}
                <rect x="5" y="5" width="26" height="26" rx="4" fill="currentColor" />
                <rect x="9" y="9" width="18" height="18" rx="2" fill="#FAF8F5" />
                <rect x="13" y="13" width="10" height="10" rx="1.5" fill="currentColor" />

                {/* Top-Right Position Detection Marker */}
                <rect x="69" y="5" width="26" height="26" rx="4" fill="currentColor" />
                <rect x="73" y="9" width="18" height="18" rx="2" fill="#FAF8F5" />
                <rect x="77" y="13" width="10" height="10" rx="1.5" fill="currentColor" />

                {/* Bottom-Left Position Detection Marker */}
                <rect x="5" y="69" width="26" height="26" rx="4" fill="currentColor" />
                <rect x="9" y="73" width="18" height="18" rx="2" fill="#FAF8F5" />
                <rect x="13" y="77" width="10" height="10" rx="1.5" fill="currentColor" />

                {/* Data Grid Mockup */}
                <rect x="36" y="8" width="5" height="5" rx="1" />
                <rect x="45" y="8" width="5" height="5" rx="1" />
                <rect x="56" y="8" width="5" height="5" rx="1" />
                <rect x="36" y="18" width="5" height="5" rx="1" />
                <rect x="49" y="18" width="5" height="5" rx="1" />
                <rect x="58" y="18" width="5" height="5" rx="1" />

                <rect x="8" y="36" width="5" height="5" rx="1" />
                <rect x="18" y="36" width="5" height="5" rx="1" />
                <rect x="8" y="48" width="5" height="5" rx="1" />
                <rect x="18" y="56" width="5" height="5" rx="1" />

                <rect x="72" y="36" width="5" height="5" rx="1" />
                <rect x="82" y="36" width="5" height="5" rx="1" />
                <rect x="88" y="46" width="5" height="5" rx="1" />
                <rect x="76" y="56" width="5" height="5" rx="1" />
                <rect x="86" y="56" width="5" height="5" rx="1" />

                <rect x="36" y="72" width="5" height="5" rx="1" />
                <rect x="46" y="72" width="5" height="5" rx="1" />
                <rect x="56" y="72" width="5" height="5" rx="1" />
                <rect x="38" y="84" width="5" height="5" rx="1" />
                <rect x="48" y="84" width="5" height="5" rx="1" />
                <rect x="58" y="84" width="5" height="5" rx="1" />
                <rect x="72" y="72" width="5" height="5" rx="1" />
                <rect x="82" y="82" width="5" height="5" rx="1" />
                <rect x="88" y="72" width="5" height="5" rx="1" />
                <rect x="72" y="88" width="5" height="5" rx="1" />
              </svg>

              {/* Center Brand Badge Overlay */}
              <div className="absolute inset-0 m-auto w-12 h-12 bg-white rounded-xl shadow-md border border-[#CCEBD5] flex items-center justify-center p-1.5">
                <MeetingLeafLogo size={28} showWordmark={false} variant="light" />
              </div>
            </div>
            <div className="text-[11px] font-mono-num font-semibold text-[#5C5245] mt-2 flex items-center justify-center gap-1">
              <QrCode size={13} className="text-[#4E8B3F]" />
              Scan with your phone camera
            </div>
          </div>

          {/* Value Props */}
          <div className="grid grid-cols-2 gap-2 text-left bg-[#EEF8F1] p-3 rounded-xl border border-[#CCEBD5] mb-5">
            <div className="flex items-center gap-2 text-xs text-[#173A20] font-medium">
              <CheckCircle2 size={14} className="text-[#4E8B3F] shrink-0" />
              <span>Instant Push Alerts</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#173A20] font-medium">
              <CheckCircle2 size={14} className="text-[#4E8B3F] shrink-0" />
              <span>Fast MoMo 1-Tap Pay</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#173A20] font-medium">
              <CheckCircle2 size={14} className="text-[#4E8B3F] shrink-0" />
              <span>Crate Camera Scanner</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#173A20] font-medium">
              <CheckCircle2 size={14} className="text-[#4E8B3F] shrink-0" />
              <span>Offline Farm Diary</span>
            </div>
          </div>

          {/* Platform Badges */}
          <div className="flex items-center justify-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#241A12] text-white text-xs font-semibold shadow-xs">
              <span className="text-base">🍎</span>
              <div className="text-left leading-tight">
                <div className="text-[9px] text-[#A3A3A3] uppercase font-mono-num">Coming to</div>
                <div className="font-bold text-[11px]">iOS App Store</div>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#241A12] text-white text-xs font-semibold shadow-xs">
              <span className="text-base">🤖</span>
              <div className="text-left leading-tight">
                <div className="text-[9px] text-[#A3A3A3] uppercase font-mono-num">Coming to</div>
                <div className="font-bold text-[11px]">Google Play</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#FAF8F5] px-6 py-3 border-t border-[#CCEBD5] flex items-center justify-between text-xs text-[#5C5245]">
          <span>Agrom v2.4 Native Expo Build</span>
          <button
            type="button"
            onClick={onClose}
            className="text-[#4E8B3F] font-semibold hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default DownloadAppModal;

