export type UserRole = 'borrower' | 'lender' | 'admin';

export type UserStatus = 'active' | 'locked';

export type VerificationStatus =
  | 'Chưa xác minh'
  | 'Đang chờ duyệt'
  | 'Đã xác minh mô phỏng'
  | 'Không được chấp nhận';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  password: string; // Demo only - never use in production
  role: UserRole;
  university: string;
  studentId?: string;
  major?: string;
  yearOfStudy?: string;
  gpa?: number;
  monthlyIncome?: number;
  incomeSource?: string;
  capitalPurpose?: string;
  occupation?: string;
  simulatedCapital?: number; // For lenders
  verificationStatus?: VerificationStatus;
  verificationNote?: string;
  status: UserStatus;
  createdAt: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  university: string;
  studentId?: string;
  confirmationNote: string;
  status: VerificationStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export type CapitalOfferStatus =
  | 'Bản nháp'
  | 'Đang khả dụng'
  | 'Đang chờ kết nối'
  | 'Đã phân bổ một phần'
  | 'Đã sử dụng hết'
  | 'Đã tạm ngừng';

export interface CapitalOffer {
  id: string;
  code: string;
  lenderId: string;
  lenderName: string;
  totalCapital: number;
  allocatedCapital: number;
  minPerLoan: number;
  maxPerLoan: number;
  supportedTerms: number[];
  expectedMonthlyRate: number;
  supportedPurposes: LoanPurpose[];
  notes: string;
  status: CapitalOfferStatus;
  createdAt: string;
  updatedAt: string;
}

export type ProposalStatus =
  | 'Chờ người vay xác nhận'
  | 'Người vay đã đồng ý'
  | 'Người vay từ chối'
  | 'Người cho vay đã rút đề xuất'
  | 'Hai bên đã xác nhận'
  | 'Đã tạo hợp đồng dự thảo'
  | 'Đã hủy';

export interface ConnectionProposal {
  id: string;
  code: string;
  loanRequestId: string;
  loanCode: string;
  capitalOfferId: string;
  capitalCode: string;
  lenderId: string;
  lenderName: string;
  borrowerId: string;
  borrowerName: string;
  university: string;
  purpose: LoanPurpose;
  amount: number;
  termMonths: number;
  simulatedMonthlyRate: number;
  conditionsNote: string;
  status: ProposalStatus;
  borrowerConfirmedAt?: string;
  lenderConfirmedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ContractStatus =
  | 'Bản dự thảo'
  | 'Chờ xác nhận'
  | 'Đã xác nhận mô phỏng'
  | 'Đã hủy';

export interface LoanContract {
  id: string;
  code: string;
  proposalId: string;
  connectionId: string;
  loanRequestId: string;
  loanCode: string;
  borrowerId: string;
  borrowerName: string;
  borrowerUniversity: string;
  borrowerStudentId?: string;
  lenderId: string;
  lenderName: string;
  amount: number;
  termMonths: number;
  simulatedMonthlyRate: number;
  totalRepayable: number;
  installmentAmount: number;
  firstDueDate: string;
  status: ContractStatus;
  borrowerConfirmedAt?: string;
  lenderConfirmedAt?: string;
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
  simulatedMonthlyRate: number;
  status: LoanStatus;
  creditGrade: CreditGrade;
  creditScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoanConnection {
  id: string;
  code?: string;
  proposalId?: string;
  contractId?: string;
  contractCode?: string;
  capitalOfferId?: string;
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
  simulatedMonthlyRate?: number;
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
  profileScore: number;
  gpaScore: number;
  financialCapacityScore: number;
  incomeStabilityScore: number;
  repaymentHistoryScore: number;
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

export interface NewsArticle {
  id: string;
  title: string;
  category: 'Tin tức dự án' | 'Kiến thức tài chính' | 'Quản lý chi tiêu' | 'Vay có trách nhiệm';
  summary: string;
  content: string;
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
