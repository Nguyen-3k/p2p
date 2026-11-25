import React from 'react';
import { X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'primary' | 'danger' | 'success';
  onConfirm: () => void;
  onCancel: () => void;
  children?: React.ReactNode;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  open,
  title,
  description,
  confirmLabel = 'Xác nhận',
  cancelLabel = 'Hủy bỏ',
  variant = 'primary',
  onConfirm,
  onCancel,
  children,
}) => {
  if (!open) return null;

  const btnStyle =
    variant === 'danger'
      ? 'bg-rose-600 hover:bg-rose-700 text-white'
      : variant === 'success'
      ? 'bg-[#15803D] hover:bg-emerald-800 text-white'
      : 'bg-[#0F2544] hover:bg-[#16335B] text-white';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px]">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-bold text-[#0F2544]">{title}</h3>
          <button
            type="button"
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="mt-2 text-sm text-slate-600 leading-relaxed">{description}</p>
        {children && <div className="mt-4">{children}</div>}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${btnStyle}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
