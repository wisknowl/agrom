import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  X,
  HelpCircle,
} from 'lucide-react';
import { useToastStore, ToastItem } from '@/store/toastStore';

export const AgromToastContainer: React.FC = () => {
  const { toasts, removeToast, confirmDialog, closeConfirm } = useToastStore();

  const getToastStyles = (type: ToastItem['type']) => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-[#EEF8F1] border-[#CCEBD5] text-[#173A20]',
          icon: <CheckCircle2 size={18} className="text-[#4E8B3F] shrink-0" />,
          titleColor: 'text-[#173A20]',
        };
      case 'warning':
        return {
          bg: 'bg-[#FEF2D8] border-[#F2DCAA] text-[#241A12]',
          icon: <AlertTriangle size={18} className="text-[#E2A63C] shrink-0" />,
          titleColor: 'text-[#7A4A2D]',
        };
      case 'error':
        return {
          bg: 'bg-[#FEF2F2] border-[#FECACA] text-[#7F1D1D]',
          icon: <AlertCircle size={18} className="text-[#DC2626] shrink-0" />,
          titleColor: 'text-[#991B1B]',
        };
      case 'info':
      default:
        return {
          bg: 'bg-[#FFF9EE] border-[#F2DCAA] text-[#241A12]',
          icon: <Info size={18} className="text-[#4E8B3F] shrink-0" />,
          titleColor: 'text-[#173A20]',
        };
    }
  };

  return (
    <>
      {/* Toast Stack (Bottom-Right on Desktop, Top-Center on Mobile) */}
      <div className="fixed z-9999 bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => {
          const style = getToastStyles(t.type);
          return (
            <div
              key={t.id}
              className={`pointer-events-auto p-3.5 sm:p-4 rounded-2xl border shadow-lg backdrop-blur-md flex items-start gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200 ${style.bg}`}
            >
              {style.icon}
              <div className="flex-1 min-w-0 pr-1">
                {t.title && (
                  <h4 className={`text-xs font-bold leading-tight mb-0.5 ${style.titleColor}`}>
                    {t.title}
                  </h4>
                )}
                <p className="text-xs font-medium leading-relaxed break-words">{t.message}</p>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                className="text-neutral-400 hover:text-neutral-700 transition cursor-pointer p-0.5"
                title="Dismiss"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirmation Dialog Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#241A12]/60 backdrop-blur-xs transition-opacity"
            onClick={closeConfirm}
          />
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#CCEBD5] space-y-4 z-10 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  confirmDialog.type === 'danger'
                    ? 'bg-[#FEF2F2] text-[#DC2626]'
                    : confirmDialog.type === 'warning'
                    ? 'bg-[#FEF2D8] text-[#E2A63C]'
                    : 'bg-[#EEF8F1] text-[#4E8B3F]'
                }`}
              >
                {confirmDialog.type === 'danger' ? (
                  <AlertCircle size={22} />
                ) : confirmDialog.type === 'warning' ? (
                  <AlertTriangle size={22} />
                ) : (
                  <HelpCircle size={22} />
                )}
              </div>
              <div>
                <h3 className="font-bold text-base text-[#173A20]">{confirmDialog.title}</h3>
                <p className="text-xs text-[#5C5245] mt-1 leading-relaxed">
                  {confirmDialog.message}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#CCEBD5]">
              <button
                type="button"
                onClick={() => {
                  if (confirmDialog.onCancel) confirmDialog.onCancel();
                  closeConfirm();
                }}
                className="px-4 py-2 rounded-full bg-[#EEF8F1] hover:bg-[#CCEBD5] text-xs font-bold text-[#173A20] transition cursor-pointer"
              >
                {confirmDialog.cancelText || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmDialog.onConfirm();
                  closeConfirm();
                }}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition shadow-xs cursor-pointer ${
                  confirmDialog.type === 'danger'
                    ? 'bg-[#DC2626] hover:bg-[#B91C1C] text-white'
                    : 'bg-[#4E8B3F] hover:bg-[#3d6e32] text-white'
                }`}
              >
                {confirmDialog.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AgromToastContainer;

