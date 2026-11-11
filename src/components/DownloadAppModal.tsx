import React, { useEffect, useState } from 'react';
import {
  X,
  Smartphone,
  Download,
  QrCode,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import QRCode from 'qrcode';
import MeetingLeafLogo from './MeetingLeafLogo';

interface DownloadAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DEFAULT_ANDROID_APK_URL =
  'https://github.com/wisknowl/agrom/releases/download/v1.0.0/agrom.apk';

export const getAndroidApkDownloadUrl = (): string => {
  if (import.meta.env.VITE_ANDROID_APK_URL) {
    return String(import.meta.env.VITE_ANDROID_APK_URL).trim();
  }
  return DEFAULT_ANDROID_APK_URL;
};

export const DownloadAppModal: React.FC<DownloadAppModalProps> = ({ isOpen, onClose }) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const apkUrl = getAndroidApkDownloadUrl();

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    QRCode.toDataURL(apkUrl, {
      width: 240,
      margin: 1,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#173A20',
        light: '#FAF8F5',
      },
    })
      .then((url) => {
        if (!cancelled) setQrDataUrl(url);
      })
      .catch(() => {
        if (!cancelled) setQrDataUrl('');
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, apkUrl]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#241A12]/65 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog: Fits comfortably within any viewport */}
      <div className="relative z-10 w-full max-w-md max-h-[92dvh] flex flex-col bg-white rounded-3xl shadow-2xl border border-[#CCEBD5] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Canopy Header */}
        <div className="bg-gradient-to-r from-[#173A20] via-[#245731] to-[#173A20] px-5 py-4 sm:py-5 text-white text-center relative shrink-0">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X size={16} />
          </button>

          <div className="w-10 h-10 mx-auto mb-2 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
            <Smartphone size={20} className="text-[#E2A63C]" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E2A63C]/20 border border-[#E2A63C]/40 text-[#E2A63C] text-[10px] font-bold tracking-wide uppercase mb-1">
            <Sparkles size={10} />
            Native Android App
          </div>

          <h3 className="font-display-italic text-xl sm:text-2xl font-semibold text-[#F7F2E7] leading-tight">
            Get Agrom on Android
          </h3>
          <p className="text-[11.5px] text-[#E1F3E7]/85 mt-1 max-w-xs mx-auto leading-snug">
            Real-time harvest alerts, MoMo Smart Escrow confirmations & offline farm management
          </p>
        </div>

        {/* Scrollable Body for Viewport Safety */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 text-center">
          {/* DESKTOP VIEW: Real Scannable QR Code + Fallback Link */}
          <div className="hidden md:flex flex-col items-center">
            <div className="inline-block p-3 bg-white rounded-2xl border-2 border-dashed border-[#CCEBD5] shadow-xs">
              <div className="w-40 h-40 relative flex items-center justify-center bg-[#FAF8F5] rounded-xl p-1.5 overflow-hidden">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Scan to download Agrom Android APK"
                    className="w-full h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full rounded-lg bg-[#EEF8F1] animate-pulse" />
                )}

                {/* Center Brand Badge Overlay (safe with ErrorCorrectionLevel 'H') */}
                <div className="absolute inset-0 m-auto w-9 h-9 bg-white rounded-lg shadow-sm border border-[#CCEBD5] flex items-center justify-center p-1 pointer-events-none">
                  <MeetingLeafLogo size={20} showWordmark={false} variant="light" />
                </div>
              </div>

              <div className="text-[11px] font-mono-num font-semibold text-[#5C5245] mt-2 flex items-center justify-center gap-1.5">
                <QrCode size={13} className="text-[#4E8B3F]" />
                <span>Scan with your Android camera</span>
              </div>
            </div>

            <a
              href={apkUrl}
              download="agrom.apk"
              className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-[#4E8B3F] hover:text-[#3D7030] hover:underline"
            >
              <Download size={13} />
              <span>Or download Agrom APK directly</span>
            </a>
          </div>

          {/* MOBILE VIEW: Direct One-Tap APK Download Button */}
          <div className="md:hidden space-y-2.5">
            <div className="bg-[#EEF8F1] border border-[#CCEBD5] rounded-2xl p-4 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white border border-[#CCEBD5] text-[10.5px] font-bold text-[#173A20]">
                <ShieldCheck size={12} className="text-[#4E8B3F]" />
                <span>Verified Release Build (Android APK)</span>
              </div>

              <a
                href={apkUrl}
                download="agrom.apk"
                className="w-full py-3.5 px-5 rounded-full bg-[#4E8B3F] hover:bg-[#3D7030] active:scale-[0.99] text-white text-sm font-bold inline-flex items-center justify-center gap-2 shadow-md transition"
              >
                <Download size={18} />
                <span>Download Agrom APK</span>
              </a>

              <p className="text-[11px] text-[#5C5245] leading-relaxed">
                Tap to download directly to your phone, then open the APK file to install.
              </p>
            </div>
          </div>

          {/* Key Mobile Features */}
          <div className="grid grid-cols-2 gap-2 text-left bg-[#EEF8F1] p-3 rounded-2xl border border-[#CCEBD5]">
            <div className="flex items-center gap-2 text-[11.5px] text-[#173A20] font-medium">
              <CheckCircle2 size={13} className="text-[#4E8B3F] shrink-0" />
              <span>Instant Push Alerts</span>
            </div>
            <div className="flex items-center gap-2 text-[11.5px] text-[#173A20] font-medium">
              <CheckCircle2 size={13} className="text-[#4E8B3F] shrink-0" />
              <span>Fast MoMo 1-Tap Pay</span>
            </div>
            <div className="flex items-center gap-2 text-[11.5px] text-[#173A20] font-medium">
              <CheckCircle2 size={13} className="text-[#4E8B3F] shrink-0" />
              <span>Crate Camera Scanner</span>
            </div>
            <div className="flex items-center gap-2 text-[11.5px] text-[#173A20] font-medium">
              <CheckCircle2 size={13} className="text-[#4E8B3F] shrink-0" />
              <span>Offline Farm Diary</span>
            </div>
          </div>

          {/* Android Only Badge (iOS removed until ready) */}
          <div className="hidden md:flex items-center justify-center">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-[#173A20] text-white text-xs font-semibold border border-[#CCEBD5]/30 shadow-xs">
              <span className="text-base">🤖</span>
              <div className="text-left leading-tight">
                <div className="text-[9px] text-[#E2A63C] uppercase font-mono-num font-bold">
                  Direct Android Install
                </div>
                <div className="font-bold text-[11px] text-white">Agrom APK v1.0.0</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#FAF8F5] px-5 py-2.5 border-t border-[#CCEBD5] flex items-center justify-between text-[11.5px] text-[#5C5245] shrink-0">
          <span className="font-mono-num">Agrom Android Production APK</span>
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
