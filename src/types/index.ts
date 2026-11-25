export type UserRole = 'borrower' | 'lender' | 'admin';

export type UserStatus = 'active' | 'locked';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password: string; // Demo only - never use in production
  role: UserRole;
  university: string;
  studentId?: string;
  gpa?: number;
  monthlyIncome?: number;
  simulatedCapital?: number; // For lenders
  status: UserStatus;
  createdAt: string;
}

export type LoanPurpose =
  | 'Học phí'
  | 'Thiết bị học tập'
  | 'Sinh hoạt'
  | 'Chi phí khẩn cấp'
  | 'Khác';

export type LoanPackageType = 'tuition_equipment' | 'micro_emergency';

export type LoanStatus =
  | 'Chờ đánh giá'
  | 'Đang tìm người kết nối'
  | 'Đã tìm được kết nối'
  | 'Đang hoàn trả'
  | 'Đã hoàn thành'
  | 'Đã hủy';

export type CreditGrade = 'A' | 'B' | 'C' | 'D';

export interface LoanRequest {
  id: string;
  code: string;
  borrowerId: string;
  borrowerName: string;
  university: string;
  packageType: LoanPackageType;
  purpose: LoanPurpose;
  amount: number;
  termMonths: number;
  description: string;
  incomeSource: string;
  simulatedMonthlyRate: number; // e.g. 0.008 (0.8%/month simulated)
  status: LoanStatus;
  creditGrade: CreditGrade;
  creditScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoanConnection {
  id: string;
  loanRequestId: string;
  loanCode: string;
  lenderId: string;
  lenderName: string;
  borrowerId: string;
  borrowerName: string;
  university: string;
  purpose: LoanPurpose;
  amount: number;
  termMonths: number;
  totalRepayable: number;
  paidAmount: number;
  status: 'Đang hoạt động' | 'Đã hoàn thành';
  connectedAt: string;
}

export interface RepaymentInstallment {
  id: string;
  loanRequestId: string;
  connectionId: string;
  installmentNumber: number;
  dueDate: string;
  amount: number;
  status: 'Chưa thanh toán' | 'Đã thanh toán';
  paidAt?: string;
}

export interface RepaymentRecord {
  id: string;
  loanRequestId: string;
  loanCode: string;
  connectionId: string;
  borrowerId: string;
  borrowerName: string;
  amount: number;
  note: string;
  paidAt: string;
}

export interface CreditScoreFactors {
  profileScore: number; // max 20
  gpaScore: number; // max 20
  financialCapacityScore: number; // max 25
  incomeStabilityScore: number; // max 20
  repaymentHistoryScore: number; // max 15
}

export interface CreditScoreResult {
  userId: string;
  score: number;
  grade: CreditGrade;
  factors: CreditScoreFactors;
  reasons: string[];
  recommendations: string[];
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface FinancialArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  readTime: string;
  summary: string;
  content: string[];
  keyTakeaways: string[];
  publishedAt: string;
}

export interface ActivityLog {
  id: string;
  actorName: string;
  actorRole: UserRole | 'system';
  action: string;
  target: string;
  createdAt: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}
