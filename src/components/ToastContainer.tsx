import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((t) => {
        const icon =
          t.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : t.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-sky-600 shrink-0" />
          );

        return (
          <div
            key={t.id}
            className="pointer-events-auto bg-white border border-slate-200 shadow-lg rounded-xl p-3.5 flex items-start gap-3"
          >
            {icon}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0F2544]">{t.title}</p>
              {t.description && (
                <p className="text-xs text-slate-600 mt-0.5 leading-snug">{t.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="text-slate-400 hover:text-slate-600"
              aria-label="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
