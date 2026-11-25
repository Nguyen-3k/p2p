import React from 'react';
import type { CreditGrade, LoanStatus } from '../types';

export const CreditBadge: React.FC<{ grade: CreditGrade; score?: number }> = ({
  grade,
  score,
}) => {
  const styles: Record<CreditGrade, string> = {
    A: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    B: 'bg-sky-50 text-sky-800 border-sky-200',
    C: 'bg-amber-50 text-amber-800 border-amber-200',
    D: 'bg-rose-50 text-rose-800 border-rose-200',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[grade]}`}
      title="Xếp hạng tín nhiệm mô phỏng"
    >
      Hạng {grade}
      {typeof score === 'number' && <span className="opacity-75">({score}đ)</span>}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: LoanStatus }> = ({ status }) => {
  const styles: Record<LoanStatus, string> = {
    'Chờ đánh giá': 'bg-slate-100 text-slate-700 border-slate-200',
    'Đang tìm người kết nối': 'bg-amber-50 text-amber-800 border-amber-200',
    'Đã tìm được kết nối': 'bg-sky-50 text-sky-800 border-sky-200',
    'Đang hoàn trả': 'bg-indigo-50 text-indigo-800 border-indigo-200',
    'Đã hoàn thành': 'bg-emerald-50 text-emerald-800 border-emerald-200',
    'Đã hủy': 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
    >
      {status}
    </span>
  );
};
