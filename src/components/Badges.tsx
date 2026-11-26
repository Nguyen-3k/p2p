import React from 'react';
import type {
  CapitalOfferStatus,
  ContractStatus,
  CreditGrade,
  LoanStatus,
  ProposalStatus,
  VerificationStatus,
} from '../types';

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

export const VerificationBadge: React.FC<{ status?: VerificationStatus }> = ({
  status = 'Chưa xác minh',
}) => {
  const styles: Record<VerificationStatus, string> = {
    'Chưa xác minh': 'bg-slate-100 text-slate-700 border-slate-200',
    'Đang chờ duyệt': 'bg-amber-50 text-amber-800 border-amber-200',
    'Đã xác minh mô phỏng': 'bg-emerald-50 text-emerald-800 border-emerald-200',
    'Không được chấp nhận': 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}
    >
      {status}
    </span>
  );
};

export const ProposalStatusBadge: React.FC<{ status: ProposalStatus }> = ({ status }) => {
  const styles: Record<ProposalStatus, string> = {
    'Chờ người vay xác nhận': 'bg-amber-50 text-amber-800 border-amber-200',
    'Người vay đã đồng ý': 'bg-sky-50 text-sky-800 border-sky-200',
    'Người vay từ chối': 'bg-rose-50 text-rose-700 border-rose-200',
    'Người cho vay đã rút đề xuất': 'bg-slate-100 text-slate-600 border-slate-200',
    'Hai bên đã xác nhận': 'bg-indigo-50 text-indigo-800 border-indigo-200',
    'Đã tạo hợp đồng dự thảo': 'bg-emerald-50 text-emerald-800 border-emerald-200',
    'Đã hủy': 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}
    >
      {status}
    </span>
  );
};

export const CapitalStatusBadge: React.FC<{ status: CapitalOfferStatus }> = ({ status }) => {
  const styles: Record<CapitalOfferStatus, string> = {
    'Bản nháp': 'bg-slate-100 text-slate-700 border-slate-200',
    'Đang khả dụng': 'bg-emerald-50 text-emerald-800 border-emerald-200',
    'Đang chờ kết nối': 'bg-sky-50 text-sky-800 border-sky-200',
    'Đã phân bổ một phần': 'bg-indigo-50 text-indigo-800 border-indigo-200',
    'Đã sử dụng hết': 'bg-amber-50 text-amber-800 border-amber-200',
    'Đã tạm ngừng': 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}
    >
      {status}
    </span>
  );
};

export const ContractStatusBadge: React.FC<{ status: ContractStatus }> = ({ status }) => {
  const styles: Record<ContractStatus, string> = {
    'Bản dự thảo': 'bg-slate-100 text-slate-700 border-slate-200',
    'Chờ xác nhận': 'bg-amber-50 text-amber-800 border-amber-200',
    'Đã xác nhận mô phỏng': 'bg-emerald-50 text-emerald-800 border-emerald-200',
    'Đã hủy': 'bg-rose-50 text-rose-700 border-rose-200',
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status]}`}
    >
      {status}
    </span>
  );
};
