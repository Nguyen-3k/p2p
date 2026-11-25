import type { LoanPackageType } from '../types';

export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return isoString;
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export const LOAN_PACKAGES: Record<
  LoanPackageType,
  {
    id: LoanPackageType;
    name: string;
    shortName: string;
    minAmount: number;
    maxAmount: number;
    defaultTerms: number[];
    simulatedMonthlyRate: number;
    description: string;
  }
> = {
  tuition_equipment: {
    id: 'tuition_equipment',
    name: 'Gói 1: Học phí & Thiết bị học tập',
    shortName: 'Học phí & Thiết bị',
    minAmount: 2_000_000,
    maxAmount: 10_000_000,
    defaultTerms: [3, 6, 9, 12],
    simulatedMonthlyRate: 0.008, // 0.8%/tháng giả lập
    description: 'Hỗ trợ học phí, máy tính, tài liệu, trang thiết bị phục vụ học tập.',
  },
  micro_emergency: {
    id: 'micro_emergency',
    name: 'Gói 2: Vay vi mô khẩn cấp',
    shortName: 'Vi mô khẩn cấp',
    minAmount: 500_000,
    maxAmount: 3_000_000,
    defaultTerms: [1, 2, 3, 4],
    simulatedMonthlyRate: 0.006, // 0.6%/tháng giả lập
    description: 'Hỗ trợ sinh hoạt phí và các khoản chi thiết yếu phát sinh đột xuất.',
  },
};

export function calculateTotalRepayable(
  principal: number,
  termMonths: number,
  monthlyRate: number
): number {
  const interest = Math.round(principal * monthlyRate * termMonths);
  return principal + interest;
}
