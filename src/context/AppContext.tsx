import React, { createContext, useContext, useEffect, useState } from 'react';
import type {
  ActivityLog,
  CapitalOffer,
  ConnectionProposal,
  CreditScoreResult,
  FinancialArticle,
  LoanConnection,
  LoanContract,
  LoanPackageType,
  LoanPurpose,
  LoanRequest,
  LoanStatus,
  NewsArticle,
  NotificationItem,
  RepaymentInstallment,
  RepaymentRecord,
  ToastMessage,
  User,
  UserRole,
  VerificationRequest,
} from '../types';
import {
  buildInitialCreditScores,
  DEMO_ACTIVITY_LOGS,
  DEMO_ARTICLES,
  DEMO_CAPITAL_OFFERS,
  DEMO_CONNECTIONS,
  DEMO_CONTRACTS,
  DEMO_INSTALLMENTS,
  DEMO_LOAN_REQUESTS,
  DEMO_NEWS,
  DEMO_NOTIFICATIONS,
  DEMO_PROPOSALS,
  DEMO_REPAYMENTS,
  DEMO_USERS,
  DEMO_VERIFICATION_REQUESTS,
} from '../data/seedData';
import { calculateSimulatedCreditScore } from '../utils/creditScoring';
import { calculateTotalRepayable, LOAN_PACKAGES } from '../utils/formatters';

const SCHEMA_VERSION = 'v2';

const STORAGE_KEYS = {
  schemaVersion: 'sp2p_schema_version',
  users: 'sp2p_users_v1',
  loans: 'sp2p_loans_v1',
  connections: 'sp2p_connections_v1',
  installments: 'sp2p_installments_v1',
  repayments: 'sp2p_repayments_v1',
  notifications: 'sp2p_notifications_v1',
  creditScores: 'sp2p_credit_scores_v1',
  articles: 'sp2p_articles_v1',
  logs: 'sp2p_activity_logs_v1',
  sessionUserId: 'sp2p_session_user_id_v1',
  verifications: 'sp2p_verifications_v2',
  capitalOffers: 'sp2p_capital_offers_v2',
  proposals: 'sp2p_proposals_v2',
  contracts: 'sp2p_contracts_v2',
  news: 'sp2p_news_v2',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed === null || parsed === undefined) return fallback;
    return parsed as T;
  } catch {
    return fallback;
  }
}

/**
 * Đảm bảo tương thích dữ liệu LocalStorage cũ khi nâng cấp lên schema v2.
 */
function migrateUsers(rawUsers: User[]): User[] {
  return rawUsers.map((u) => {
    const seedMatch = DEMO_USERS.find((du) => du.id === u.id);
    return {
      ...seedMatch,
      ...u,
      verificationStatus: u.verificationStatus ?? seedMatch?.verificationStatus ?? 'Chưa xác minh',
    };
  });
}

interface RegisterInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  university: string;
  studentId?: string;
  role: Extract<UserRole, 'borrower' | 'lender'>;
}

interface CreateLoanInput {
  packageType: LoanPackageType;
  purpose: LoanPurpose;
  amount: number;
  termMonths: number;
  description: string;
  incomeSource: string;
  university: string;
}

interface CreateCapitalInput {
  totalCapital: number;
  minPerLoan: number;
  maxPerLoan: number;
  supportedTerms: number[];
  expectedMonthlyRate: number;
  supportedPurposes: LoanPurpose[];
  notes: string;
  publishImmediately?: boolean;
}

interface AppContextValue {
  currentUser: User | null;
  users: User[];
  loanRequests: LoanRequest[];
  connections: LoanConnection[];
  installments: RepaymentInstallment[];
  repayments: RepaymentRecord[];
  notifications: NotificationItem[];
  creditScores: Record<string, CreditScoreResult>;
  articles: FinancialArticle[];
  newsArticles: NewsArticle[];
  activityLogs: ActivityLog[];
  verificationRequests: VerificationRequest[];
  capitalOffers: CapitalOffer[];
  proposals: ConnectionProposal[];
  contracts: LoanContract[];
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  login: (email: string, password: string) => { ok: boolean; error?: string; user?: User };
  register: (input: RegisterInput) => { ok: boolean; error?: string; user?: User };
  logout: () => void;
  updateMyProfile: (updates: Partial<User>) => { ok: boolean; error?: string };
  submitVerification: (confirmationNote: string) => { ok: boolean; error?: string };
  adminReviewVerification: (reqId: string, approved: boolean, rejectionReason?: string) => void;
  createCapitalOffer: (input: CreateCapitalInput) => { ok: boolean; error?: string };
  updateCapitalOffer: (
    offerId: string,
    updates: Partial<Pick<CapitalOffer, 'totalCapital' | 'minPerLoan' | 'maxPerLoan' | 'supportedTerms' | 'expectedMonthlyRate' | 'supportedPurposes' | 'notes' | 'status'>>
  ) => { ok: boolean; error?: string };
  toggleCapitalOfferStatus: (offerId: string) => void;
  createLoanRequest: (input: CreateLoanInput) => { ok: boolean; error?: string };
  updateLoanRequest: (
    loanId: string,
    updates: Partial<Pick<LoanRequest, 'amount' | 'termMonths' | 'purpose' | 'description' | 'incomeSource'>>
  ) => { ok: boolean; error?: string };
  cancelLoanRequest: (loanId: string) => void;
  proposeConnection: (
    loanId: string,
    capitalOfferId?: string,
    conditionsNote?: string
  ) => { ok: boolean; error?: string };
  borrowerRespondProposal: (proposalId: string, accept: boolean) => { ok: boolean; error?: string };
  lenderWithdrawProposal: (proposalId: string) => { ok: boolean; error?: string };
  lenderConfirmProposal: (proposalId: string) => { ok: boolean; error?: string };
  simulateRepayment: (loanRequestId: string, installmentId?: string) => { ok: boolean; error?: string };
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  adminUpdateLoanStatus: (loanId: string, status: LoanStatus) => { ok: boolean; error?: string };
  adminToggleUserLock: (userId: string) => void;
  adminAddNewsArticle: (input: Omit<NewsArticle, 'id' | 'publishedAt'>) => void;
  adminDeleteNewsArticle: (id: string) => void;
  adminAddFinancialArticle: (input: Omit<FinancialArticle, 'id' | 'slug' | 'publishedAt'>) => void;
  adminDeleteFinancialArticle: (id: string) => void;
  updateBorrowerProfileForScore: (gpa: number, monthlyIncome: number) => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() =>
    migrateUsers(loadFromStorage(STORAGE_KEYS.users, DEMO_USERS))
  );
  const [loanRequests, setLoanRequests] = useState<LoanRequest[]>(() =>
    loadFromStorage(STORAGE_KEYS.loans, DEMO_LOAN_REQUESTS)
  );
  const [connections, setConnections] = useState<LoanConnection[]>(() =>
    loadFromStorage(STORAGE_KEYS.connections, DEMO_CONNECTIONS)
  );
  const [installments, setInstallments] = useState<RepaymentInstallment[]>(() =>
    loadFromStorage(STORAGE_KEYS.installments, DEMO_INSTALLMENTS)
  );
  const [repayments, setRepayments] = useState<RepaymentRecord[]>(() =>
    loadFromStorage(STORAGE_KEYS.repayments, DEMO_REPAYMENTS)
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadFromStorage(STORAGE_KEYS.notifications, DEMO_NOTIFICATIONS)
  );
  const [creditScores, setCreditScores] = useState<Record<string, CreditScoreResult>>(() =>
    loadFromStorage(STORAGE_KEYS.creditScores, buildInitialCreditScores())
  );
  const [articles, setArticles] = useState<FinancialArticle[]>(() =>
    loadFromStorage(STORAGE_KEYS.articles, DEMO_ARTICLES)
  );
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>(() =>
    loadFromStorage(STORAGE_KEYS.news, DEMO_NEWS)
  );
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() =>
    loadFromStorage(STORAGE_KEYS.logs, DEMO_ACTIVITY_LOGS)
  );
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(() =>
    loadFromStorage(STORAGE_KEYS.verifications, DEMO_VERIFICATION_REQUESTS)
  );
  const [capitalOffers, setCapitalOffers] = useState<CapitalOffer[]>(() =>
    loadFromStorage(STORAGE_KEYS.capitalOffers, DEMO_CAPITAL_OFFERS)
  );
  const [proposals, setProposals] = useState<ConnectionProposal[]>(() =>
    loadFromStorage(STORAGE_KEYS.proposals, DEMO_PROPOSALS)
  );
  const [contracts, setContracts] = useState<LoanContract[]>(() =>
    loadFromStorage(STORAGE_KEYS.contracts, DEMO_CONTRACTS)
  );
  const [sessionUserId, setSessionUserId] = useState<string | null>(() =>
    loadFromStorage<string | null>(STORAGE_KEYS.sessionUserId, null)
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const currentUser = users.find((u) => u.id === sessionUserId) ?? null;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.schemaVersion, SCHEMA_VERSION);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.loans, JSON.stringify(loanRequests));
  }, [loanRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.connections, JSON.stringify(connections));
  }, [connections]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.installments, JSON.stringify(installments));
  }, [installments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.repayments, JSON.stringify(repayments));
  }, [repayments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.creditScores, JSON.stringify(creditScores));
  }, [creditScores]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.articles, JSON.stringify(articles));
  }, [articles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.news, JSON.stringify(newsArticles));
  }, [newsArticles]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(activityLogs));
  }, [activityLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.verifications, JSON.stringify(verificationRequests));
  }, [verificationRequests]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.capitalOffers, JSON.stringify(capitalOffers));
  }, [capitalOffers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.proposals, JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.contracts, JSON.stringify(contracts));
  }, [contracts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.sessionUserId, JSON.stringify(sessionUserId));
  }, [sessionUserId]);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const pushNotification = (notif: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => {
    const item: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [item, ...prev]);
  };

  const pushLog = (actorName: string, actorRole: UserRole | 'system', action: string, target: string) => {
    const entry: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      actorName,
      actorRole,
      action,
      target,
      createdAt: new Date().toISOString(),
    };
    setActivityLogs((prev) => [entry, ...prev]);
  };

  const login = (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const found = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!found) {
      return { ok: false, error: 'Không tìm thấy tài khoản với email này.' };
    }
    if (found.password !== password) {
      return { ok: false, error: 'Mật khẩu không chính xác.' };
    }
    if (found.status === 'locked') {
      return { ok: false, error: 'Tài khoản này đang bị khóa bởi Quản trị viên.' };
    }
    setSessionUserId(found.id);
    pushLog(found.fullName, found.role, 'Đăng nhập hệ thống', found.email);
    showToast({ type: 'success', title: 'Đăng nhập thành công', description: `Chào mừng ${found.fullName}!` });
    return { ok: true, user: found };
  };

  const register = (input: RegisterInput) => {
    const cleanEmail = input.email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { ok: false, error: 'Email này đã được đăng ký trong hệ thống.' };
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      fullName: input.fullName.trim(),
      email: cleanEmail,
      phone: input.phone.trim(),
      password: input.password,
      role: input.role,
      university: input.university.trim(),
      studentId: input.studentId?.trim(),
      gpa: input.role === 'borrower' ? 3.1 : undefined,
      monthlyIncome: input.role === 'borrower' ? 2800000 : undefined,
      simulatedCapital: input.role === 'lender' ? 30000000 : undefined,
      verificationStatus: 'Chưa xác minh',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    if (newUser.role === 'borrower') {
      const scoreResult = calculateSimulatedCreditScore(newUser, []);
      setCreditScores((prev) => ({ ...prev, [newUser.id]: scoreResult }));
    }
    setSessionUserId(newUser.id);
    pushNotification({
      userId: newUser.id,
      title: 'Chào mừng đến với Student P2P',
      message: 'Hãy hoàn thiện hồ sơ cá nhân và gửi xác minh mô phỏng để trải nghiệm đầy đủ quy trình.',
      type: 'info',
      link: '/app/profile',
    });
    pushLog(newUser.fullName, newUser.role, 'Đăng ký tài khoản mới', newUser.email);
    showToast({ type: 'success', title: 'Đăng ký thành công', description: 'Tài khoản đã được khởi tạo.' });
    return { ok: true, user: newUser };
  };

  const logout = () => {
    setSessionUserId(null);
    showToast({ type: 'info', title: 'Đã đăng xuất' });
  };

  const updateMyProfile = (updates: Partial<User>) => {
    if (!currentUser) return { ok: false, error: 'Bạn chưa đăng nhập.' };
    if (updates.fullName !== undefined && !updates.fullName.trim()) {
      return { ok: false, error: 'Họ tên không được để trống.' };
    }
    if (updates.phone !== undefined && updates.phone.trim().length < 9) {
      return { ok: false, error: 'Số điện thoại phải có ít nhất 9 chữ số.' };
    }
    if (updates.gpa !== undefined && (updates.gpa < 0 || updates.gpa > 4)) {
      return { ok: false, error: 'GPA phải nằm trong khoảng 0.0 – 4.0.' };
    }

    // Không cho phép tự ý thay đổi role hoặc status
    const safeUpdates: Partial<User> = {
      fullName: updates.fullName?.trim() ?? currentUser.fullName,
      phone: updates.phone?.trim() ?? currentUser.phone,
      university: updates.university?.trim() ?? currentUser.university,
      studentId: updates.studentId?.trim() ?? currentUser.studentId,
      major: updates.major?.trim() ?? currentUser.major,
      yearOfStudy: updates.yearOfStudy?.trim() ?? currentUser.yearOfStudy,
      gpa: updates.gpa ?? currentUser.gpa,
      monthlyIncome: updates.monthlyIncome ?? currentUser.monthlyIncome,
      incomeSource: updates.incomeSource?.trim() ?? currentUser.incomeSource,
      capitalPurpose: updates.capitalPurpose?.trim() ?? currentUser.capitalPurpose,
      occupation: updates.occupation?.trim() ?? currentUser.occupation,
      simulatedCapital: updates.simulatedCapital ?? currentUser.simulatedCapital,
    };

    const updatedUser: User = { ...currentUser, ...safeUpdates };
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));

    if (updatedUser.role === 'borrower') {
      const nextScore = calculateSimulatedCreditScore(updatedUser, repayments);
      setCreditScores((prev) => ({ ...prev, [updatedUser.id]: nextScore }));
    }

    pushLog(updatedUser.fullName, updatedUser.role, 'Cập nhật hồ sơ cá nhân', updatedUser.email);
    showToast({ type: 'success', title: 'Đã lưu thông tin hồ sơ' });
    return { ok: true };
  };

  const submitVerification = (confirmationNote: string) => {
    if (!currentUser) return { ok: false, error: 'Bạn chưa đăng nhập.' };
    if (!currentUser.university.trim()) {
      return { ok: false, error: 'Vui lòng cập nhật Trường đại học / Đơn vị trước khi gửi xác minh.' };
    }
    if (currentUser.role === 'borrower' && !currentUser.studentId?.trim()) {
      return { ok: false, error: 'Sinh viên cần điền Mã sinh viên trước khi gửi xác minh mô phỏng.' };
    }
    if (!confirmationNote.trim()) {
      return { ok: false, error: 'Vui lòng nhập nội dung xác nhận hồ sơ.' };
    }

    const req: VerificationRequest = {
      id: `ver-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.fullName,
      userRole: currentUser.role,
      university: currentUser.university,
      studentId: currentUser.studentId,
      confirmationNote: confirmationNote.trim(),
      status: 'Đang chờ duyệt',
      submittedAt: new Date().toISOString(),
    };

    setVerificationRequests((prev) => [req, ...prev]);
    setUsers((prev) =>
      prev.map((u) =>
        u.id === currentUser.id
          ? { ...u, verificationStatus: 'Đang chờ duyệt', verificationNote: undefined }
          : u
      )
    );

    pushNotification({
      userId: currentUser.id,
      title: 'Đã gửi yêu cầu xác minh mô phỏng',
      message: 'Hồ sơ của bạn đang ở trạng thái Chờ duyệt bởi Quản trị viên.',
      type: 'info',
      link: '/app/profile',
    });
    pushLog(currentUser.fullName, currentUser.role, 'Gửi yêu cầu xác minh mô phỏng', currentUser.email);
    showToast({ type: 'success', title: 'Đã gửi yêu cầu xác minh', description: 'Trạng thái: Đang chờ duyệt' });
    return { ok: true };
  };

  const adminReviewVerification = (reqId: string, approved: boolean, rejectionReason?: string) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    const req = verificationRequests.find((v) => v.id === reqId);
    if (!req) return;

    const nextStatus = approved ? 'Đã xác minh mô phỏng' : 'Không được chấp nhận';
    const nowIso = new Date().toISOString();

    setVerificationRequests((prev) =>
      prev.map((v) =>
        v.id === reqId
          ? {
              ...v,
              status: nextStatus,
              rejectionReason: approved ? undefined : rejectionReason?.trim() || 'Hồ sơ chưa đáp ứng tiêu chí mô phỏng.',
              reviewedAt: nowIso,
              reviewedBy: currentUser.fullName,
            }
          : v
      )
    );

    setUsers((prev) =>
      prev.map((u) =>
        u.id === req.userId
          ? {
              ...u,
              verificationStatus: nextStatus,
              verificationNote: approved ? undefined : rejectionReason?.trim(),
            }
          : u
      )
    );

    pushNotification({
      userId: req.userId,
      title: approved ? 'Xác minh hồ sơ thành công' : 'Yêu cầu xác minh chưa được chấp nhận',
      message: approved
        ? 'Hồ sơ của bạn đã được cập nhật trạng thái Đã xác minh mô phỏng.'
        : `Lý do: ${rejectionReason?.trim() || 'Thông tin cần bổ sung thêm.'}`,
      type: approved ? 'success' : 'warning',
      link: '/app/profile',
    });
    pushLog(
      currentUser.fullName,
      'admin',
      approved ? 'Duyệt xác minh mô phỏng' : 'Từ chối xác minh mô phỏng',
      req.userName
    );
    showToast({
      type: approved ? 'success' : 'info',
      title: approved ? 'Đã duyệt xác minh' : 'Đã từ chối xác minh',
      description: req.userName,
    });
  };

  const createCapitalOffer = (input: CreateCapitalInput) => {
    if (!currentUser || currentUser.role !== 'lender') {
      return { ok: false, error: 'Chỉ người có vốn mới có thể đăng ký nguồn vốn.' };
    }
    if (input.totalCapital < 500_000) {
      return { ok: false, error: 'Số vốn đăng ký tối thiểu là 500.000 đ.' };
    }
    if (input.minPerLoan <= 0 || input.maxPerLoan < input.minPerLoan || input.maxPerLoan > input.totalCapital) {
      return { ok: false, error: 'Hạn mức tối thiểu/tối đa mỗi kết nối không hợp lệ so với tổng vốn.' };
    }
    if (input.supportedTerms.length === 0 || input.supportedPurposes.length === 0) {
      return { ok: false, error: 'Vui lòng chọn ít nhất 1 kỳ hạn và 1 mục đích hỗ trợ.' };
    }

    const nextNum = capitalOffers.length + 1;
    const code = `CAP-2026-${String(nextNum).padStart(3, '0')}`;
    const nowIso = new Date().toISOString();

    const newOffer: CapitalOffer = {
      id: `cap-${Date.now()}`,
      code,
      lenderId: currentUser.id,
      lenderName: currentUser.fullName,
      totalCapital: input.totalCapital,
      allocatedCapital: 0,
      minPerLoan: input.minPerLoan,
      maxPerLoan: input.maxPerLoan,
      supportedTerms: input.supportedTerms,
      expectedMonthlyRate: input.expectedMonthlyRate,
      supportedPurposes: input.supportedPurposes,
      notes: input.notes.trim(),
      status: input.publishImmediately === false ? 'Bản nháp' : 'Đang khả dụng',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setCapitalOffers((prev) => [newOffer, ...prev]);
    pushLog(
      currentUser.fullName,
      'lender',
      'Đăng ký nguồn vốn mô phỏng',
      `${code} (${input.totalCapital.toLocaleString('vi-VN')} đ)`
    );
    showToast({ type: 'success', title: 'Đã đăng ký nguồn vốn', description: `Mã nguồn vốn: ${code}` });
    return { ok: true };
  };

  const updateCapitalOffer = (
    offerId: string,
    updates: Partial<
      Pick<
        CapitalOffer,
        | 'totalCapital'
        | 'minPerLoan'
        | 'maxPerLoan'
        | 'supportedTerms'
        | 'expectedMonthlyRate'
        | 'supportedPurposes'
        | 'notes'
        | 'status'
      >
    >
  ) => {
    const target = capitalOffers.find((c) => c.id === offerId);
    if (!target) return { ok: false, error: 'Không tìm thấy nguồn vốn.' };
    if (!currentUser || (currentUser.role !== 'admin' && target.lenderId !== currentUser.id)) {
      return { ok: false, error: 'Bạn không có quyền chỉnh sửa nguồn vốn này.' };
    }
    const nextTotal = updates.totalCapital ?? target.totalCapital;
    if (nextTotal < target.allocatedCapital) {
      return { ok: false, error: 'Tổng vốn không được nhỏ hơn số vốn đã phân bổ.' };
    }

    setCapitalOffers((prev) =>
      prev.map((c) =>
        c.id === offerId ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      )
    );
    showToast({ type: 'success', title: 'Đã cập nhật nguồn vốn', description: target.code });
    return { ok: true };
  };

  const toggleCapitalOfferStatus = (offerId: string) => {
    const target = capitalOffers.find((c) => c.id === offerId);
    if (!target) return;
    if (!currentUser || (currentUser.role !== 'admin' && target.lenderId !== currentUser.id)) {
      return;
    }

    const isPaused = target.status === 'Đã tạm ngừng' || target.status === 'Bản nháp';
    const nextStatus = isPaused
      ? target.allocatedCapital >= target.totalCapital
        ? 'Đã sử dụng hết'
        : target.allocatedCapital > 0
        ? 'Đã phân bổ một phần'
        : 'Đang khả dụng'
      : 'Đã tạm ngừng';

    setCapitalOffers((prev) =>
      prev.map((c) =>
        c.id === offerId ? { ...c, status: nextStatus, updatedAt: new Date().toISOString() } : c
      )
    );
    pushLog(currentUser.fullName, currentUser.role, `Đổi trạng thái nguồn vốn thành "${nextStatus}"`, target.code);
    showToast({ type: 'info', title: `${target.code}: ${nextStatus}` });
  };

  const createLoanRequest = (input: CreateLoanInput) => {
    if (!currentUser || currentUser.role !== 'borrower') {
      return { ok: false, error: 'Chỉ tài khoản sinh viên mới có thể tạo yêu cầu vay.' };
    }
    const pkg = LOAN_PACKAGES[input.packageType];
    if (input.amount < pkg.minAmount || input.amount > pkg.maxAmount) {
      return {
        ok: false,
        error: `Số tiền của ${pkg.shortName} phải từ ${pkg.minAmount.toLocaleString('vi-VN')} đ đến ${pkg.maxAmount.toLocaleString('vi-VN')} đ.`,
      };
    }

    const scoreResult = calculateSimulatedCreditScore(currentUser, repayments, input.amount);
    setCreditScores((prev) => ({ ...prev, [currentUser.id]: scoreResult }));

    const nextNum = loanRequests.length + 1;
    const code = `REQ-2026-${String(nextNum).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const newLoan: LoanRequest = {
      id: `loan-${Date.now()}`,
      code,
      borrowerId: currentUser.id,
      borrowerName: currentUser.fullName,
      university: input.university.trim() || currentUser.university,
      packageType: input.packageType,
      purpose: input.purpose,
      amount: input.amount,
      termMonths: input.termMonths,
      description: input.description.trim(),
      incomeSource: input.incomeSource.trim(),
      simulatedMonthlyRate: pkg.simulatedMonthlyRate,
      status: 'Đang tìm người kết nối',
      creditGrade: scoreResult.grade,
      creditScore: scoreResult.score,
      createdAt: now,
      updatedAt: now,
    };

    setLoanRequests((prev) => [newLoan, ...prev]);
    pushNotification({
      userId: currentUser.id,
      title: `Yêu cầu vay ${code} đã được tiếp nhận`,
      message: `Yêu cầu ${input.amount.toLocaleString('vi-VN')} đ (${input.purpose}) đang hiển thị cho người có vốn.`,
      type: 'success',
      link: '/app/borrower',
    });
    pushLog(currentUser.fullName, 'borrower', 'Tạo yêu cầu vay', `${code} (${input.amount.toLocaleString('vi-VN')} đ)`);
    showToast({ type: 'success', title: 'Tạo yêu cầu thành công', description: `Mã yêu cầu: ${code}` });
    return { ok: true };
  };

  const updateLoanRequest = (
    loanId: string,
    updates: Partial<Pick<LoanRequest, 'amount' | 'termMonths' | 'purpose' | 'description' | 'incomeSource'>>
  ) => {
    const target = loanRequests.find((l) => l.id === loanId);
    if (!target) return { ok: false, error: 'Không tìm thấy yêu cầu vay.' };
    if (!currentUser || target.borrowerId !== currentUser.id) {
      return { ok: false, error: 'Bạn không có quyền sửa yêu cầu này.' };
    }
    if (target.status !== 'Chờ đánh giá' && target.status !== 'Đang tìm người kết nối') {
      return { ok: false, error: 'Chỉ có thể chỉnh sửa yêu cầu chưa được kết nối.' };
    }
    const pkg = LOAN_PACKAGES[target.packageType];
    const nextAmount = updates.amount ?? target.amount;
    if (nextAmount < pkg.minAmount || nextAmount > pkg.maxAmount) {
      return {
        ok: false,
        error: `Số tiền phải nằm trong hạn mức ${pkg.minAmount.toLocaleString('vi-VN')} - ${pkg.maxAmount.toLocaleString('vi-VN')} đ.`,
      };
    }

    setLoanRequests((prev) =>
      prev.map((l) =>
        l.id === loanId ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
      )
    );
    showToast({ type: 'success', title: 'Đã cập nhật yêu cầu vay', description: target.code });
    return { ok: true };
  };

  const cancelLoanRequest = (loanId: string) => {
    const target = loanRequests.find((l) => l.id === loanId);
    if (!target) return;
    if (!currentUser || (currentUser.role !== 'admin' && target.borrowerId !== currentUser.id)) {
      return;
    }
    setLoanRequests((prev) =>
      prev.map((l) =>
        l.id === loanId ? { ...l, status: 'Đã hủy', updatedAt: new Date().toISOString() } : l
      )
    );
    setProposals((prev) =>
      prev.map((p) =>
        p.loanRequestId === loanId &&
        (p.status === 'Chờ người vay xác nhận' || p.status === 'Người vay đã đồng ý')
          ? { ...p, status: 'Đã hủy', updatedAt: new Date().toISOString() }
          : p
      )
    );
    pushLog(currentUser.fullName, currentUser.role, 'Hủy yêu cầu vay', target.code);
    showToast({ type: 'info', title: 'Đã hủy yêu cầu vay', description: target.code });
  };

  /**
   * BƯỚC 1: Người có vốn gửi đề xuất kết nối (KHÔNG tự động tạo khoản vay đang hoạt động).
   */
  const proposeConnection = (loanId: string, capitalOfferId?: string, conditionsNote?: string) => {
    if (!currentUser || currentUser.role !== 'lender') {
      return { ok: false, error: 'Chỉ tài khoản người có vốn mới có thể đề xuất kết nối.' };
    }
    const loan = loanRequests.find((l) => l.id === loanId);
    if (!loan) return { ok: false, error: 'Không tìm thấy yêu cầu vay.' };
    if (loan.borrowerId === currentUser.id) {
      return { ok: false, error: 'Không thể tự kết nối với yêu cầu của chính mình.' };
    }
    if (loan.status !== 'Đang tìm người kết nối' && loan.status !== 'Chờ đánh giá') {
      return { ok: false, error: 'Yêu cầu vay này không còn khả dụng để đề xuất kết nối.' };
    }

    const existingActiveProposal = proposals.find(
      (p) =>
        p.loanRequestId === loanId &&
        p.lenderId === currentUser.id &&
        (p.status === 'Chờ người vay xác nhận' || p.status === 'Người vay đã đồng ý')
    );
    if (existingActiveProposal) {
      return { ok: false, error: `Bạn đã gửi đề xuất (${existingActiveProposal.code}) cho yêu cầu này rồi.` };
    }

    const existingConnAmount = connections
      .filter((c) => c.loanRequestId === loanId)
      .reduce((sum, c) => sum + c.amount, 0);
    if (existingConnAmount + loan.amount > loan.amount) {
      return { ok: false, error: 'Yêu cầu vay này đã được kết nối đủ số tiền.' };
    }

    const lenderOffers = capitalOffers.filter(
      (c) =>
        c.lenderId === currentUser.id &&
        (c.status === 'Đang khả dụng' || c.status === 'Đang chờ kết nối' || c.status === 'Đã phân bổ một phần')
    );
    const chosenOffer = capitalOfferId
      ? lenderOffers.find((c) => c.id === capitalOfferId)
      : lenderOffers.find((c) => c.totalCapital - c.allocatedCapital >= loan.amount);

    if (!chosenOffer) {
      return {
        ok: false,
        error: 'Bạn chưa có nguồn vốn khả dụng đủ số dư. Hãy đăng ký nguồn vốn tại mục "Nguồn vốn của tôi".',
      };
    }

    const availableCapital = chosenOffer.totalCapital - chosenOffer.allocatedCapital;
    if (availableCapital < loan.amount) {
      return {
        ok: false,
        error: `Nguồn vốn ${chosenOffer.code} chỉ còn ${availableCapital.toLocaleString('vi-VN')} đ khả dụng (cần ${loan.amount.toLocaleString('vi-VN')} đ).`,
      };
    }

    const nextNum = proposals.length + 1;
    const propCode = `PROP-2026-${String(nextNum).padStart(3, '0')}`;
    const nowIso = new Date().toISOString();

    const newProposal: ConnectionProposal = {
      id: `prop-${Date.now()}`,
      code: propCode,
      loanRequestId: loan.id,
      loanCode: loan.code,
      capitalOfferId: chosenOffer.id,
      capitalCode: chosenOffer.code,
      lenderId: currentUser.id,
      lenderName: currentUser.fullName,
      borrowerId: loan.borrowerId,
      borrowerName: loan.borrowerName,
      university: loan.university,
      purpose: loan.purpose,
      amount: loan.amount,
      termMonths: loan.termMonths,
      simulatedMonthlyRate: chosenOffer.expectedMonthlyRate || loan.simulatedMonthlyRate,
      conditionsNote:
        conditionsNote?.trim() ||
        `Đề xuất kết nối từ ${chosenOffer.code}, kỳ hạn ${loan.termMonths} tháng.`,
      status: 'Chờ người vay xác nhận',
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setProposals((prev) => [newProposal, ...prev]);

    pushNotification({
      userId: loan.borrowerId,
      title: `Có đề xuất kết nối mới ${propCode}`,
      message: `${currentUser.fullName} muốn kết nối ${loan.amount.toLocaleString('vi-VN')} đ cho ${loan.code}. Vui lòng xem xét và xác nhận.`,
      type: 'info',
      link: '/app/borrower',
    });

    pushLog(
      currentUser.fullName,
      'lender',
      'Gửi đề xuất kết nối (Chờ SV xác nhận)',
      `${propCode} → ${loan.code}`
    );
    showToast({
      type: 'success',
      title: 'Đã gửi đề xuất kết nối',
      description: `${propCode} đang chờ sinh viên xác nhận.`,
    });
    return { ok: true };
  };

  /**
   * BƯỚC 2: Sinh viên đồng ý hoặc từ chối đề xuất kết nối.
   */
  const borrowerRespondProposal = (proposalId: string, accept: boolean) => {
    if (!currentUser || currentUser.role !== 'borrower') {
      return { ok: false, error: 'Chỉ sinh viên mới có thể phản hồi đề xuất này.' };
    }
    const prop = proposals.find((p) => p.id === proposalId);
    if (!prop || prop.borrowerId !== currentUser.id) {
      return { ok: false, error: 'Không tìm thấy đề xuất hợp lệ.' };
    }
    if (prop.status !== 'Chờ người vay xác nhận') {
      return { ok: false, error: 'Đề xuất này không còn ở trạng thái chờ xác nhận.' };
    }

    const nowIso = new Date().toISOString();
    const nextStatus = accept ? 'Người vay đã đồng ý' : 'Người vay từ chối';

    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId
          ? {
              ...p,
              status: nextStatus,
              borrowerConfirmedAt: accept ? nowIso : undefined,
              updatedAt: nowIso,
            }
          : p
      )
    );

    pushNotification({
      userId: prop.lenderId,
      title: accept
        ? `Sinh viên đã đồng ý đề xuất ${prop.code}`
        : `Sinh viên đã từ chối đề xuất ${prop.code}`,
      message: accept
        ? `${prop.borrowerName} đã đồng ý điều kiện cho ${prop.loanCode}. Vui lòng xác nhận bước cuối để tạo hợp đồng dự thảo.`
        : `${prop.borrowerName} đã từ chối đề xuất ${prop.code}. Không có khoản vay nào được tạo.`,
      type: accept ? 'success' : 'warning',
      link: '/app/lender',
    });

    pushLog(
      currentUser.fullName,
      'borrower',
      accept ? 'Đồng ý đề xuất kết nối' : 'Từ chối đề xuất kết nối',
      prop.code
    );
    showToast({
      type: accept ? 'success' : 'info',
      title: accept ? 'Đã đồng ý đề xuất' : 'Đã từ chối đề xuất',
      description: accept
        ? 'Đang chờ người có vốn xác nhận bước cuối.'
        : 'Đề xuất đã được đóng.',
    });
    return { ok: true };
  };

  const lenderWithdrawProposal = (proposalId: string) => {
    if (!currentUser || currentUser.role !== 'lender') {
      return { ok: false, error: 'Không có quyền thực hiện.' };
    }
    const prop = proposals.find((p) => p.id === proposalId && p.lenderId === currentUser.id);
    if (!prop) return { ok: false, error: 'Không tìm thấy đề xuất.' };
    if (prop.status !== 'Chờ người vay xác nhận' && prop.status !== 'Người vay đã đồng ý') {
      return { ok: false, error: 'Không thể rút đề xuất ở trạng thái hiện tại.' };
    }

    setProposals((prev) =>
      prev.map((p) =>
        p.id === proposalId
          ? { ...p, status: 'Người cho vay đã rút đề xuất', updatedAt: new Date().toISOString() }
          : p
      )
    );
    pushNotification({
      userId: prop.borrowerId,
      title: `Đề xuất ${prop.code} đã được rút lại`,
      message: `${prop.lenderName} đã rút đề xuất kết nối cho ${prop.loanCode}.`,
      type: 'warning',
    });
    pushLog(currentUser.fullName, 'lender', 'Rút đề xuất kết nối', prop.code);
    showToast({ type: 'info', title: `Đã rút đề xuất ${prop.code}` });
    return { ok: true };
  };

  /**
   * BƯỚC 3: Người có vốn xác nhận cuối cùng → Tạo Connection + Draft Contract + Repayment Schedule.
   */
  const lenderConfirmProposal = (proposalId: string) => {
    if (!currentUser || currentUser.role !== 'lender') {
      return { ok: false, error: 'Chỉ người có vốn mới có thể xác nhận bước cuối.' };
    }
    const prop = proposals.find((p) => p.id === proposalId && p.lenderId === currentUser.id);
    if (!prop) return { ok: false, error: 'Không tìm thấy đề xuất kết nối.' };
    if (prop.status !== 'Người vay đã đồng ý') {
      return { ok: false, error: 'Sinh viên chưa đồng ý đề xuất này.' };
    }

    const loan = loanRequests.find((l) => l.id === prop.loanRequestId);
    if (!loan || (loan.status !== 'Đang tìm người kết nối' && loan.status !== 'Chờ đánh giá')) {
      return { ok: false, error: 'Yêu cầu vay đã được kết nối hoặc không còn khả dụng.' };
    }

    const offer = capitalOffers.find((c) => c.id === prop.capitalOfferId);
    if (!offer || offer.totalCapital - offer.allocatedCapital < prop.amount) {
      return { ok: false, error: 'Nguồn vốn không đủ số dư khả dụng để hoàn tất xác nhận.' };
    }

    const borrowerUser = users.find((u) => u.id === prop.borrowerId);
    const now = new Date();
    const nowIso = now.toISOString();
    const totalRepayable = calculateTotalRepayable(prop.amount, prop.termMonths, prop.simulatedMonthlyRate);
    const baseInstallment = Math.floor(totalRepayable / prop.termMonths);
    const remainder = totalRepayable - baseInstallment * prop.termMonths;

    const connId = `conn-${Date.now()}`;
    const connCode = `CON-2026-${String(connections.length + 1).padStart(3, '0')}`;
    const ctrId = `ctr-${Date.now()}`;
    const ctrCode = `CTR-2026-${String(contracts.length + 1).padStart(3, '0')}`;

    const newConnection: LoanConnection = {
      id: connId,
      code: connCode,
      proposalId: prop.id,
      contractId: ctrId,
      contractCode: ctrCode,
      capitalOfferId: offer.id,
      loanRequestId: loan.id,
      loanCode: loan.code,
      lenderId: currentUser.id,
      lenderName: currentUser.fullName,
      borrowerId: loan.borrowerId,
      borrowerName: loan.borrowerName,
      university: loan.university,
      purpose: loan.purpose,
      amount: prop.amount,
      termMonths: prop.termMonths,
      simulatedMonthlyRate: prop.simulatedMonthlyRate,
      totalRepayable,
      paidAmount: 0,
      status: 'Đang hoạt động',
      connectedAt: nowIso,
    };

    const newInstallments: RepaymentInstallment[] = Array.from({ length: prop.termMonths }, (_, idx) => {
      const due = new Date(now);
      due.setMonth(due.getMonth() + idx + 1);
      return {
        id: `inst-${connId}-${idx + 1}`,
        loanRequestId: loan.id,
        connectionId: connId,
        installmentNumber: idx + 1,
        dueDate: due.toISOString(),
        amount: idx === prop.termMonths - 1 ? baseInstallment + remainder : baseInstallment,
        status: 'Chưa thanh toán',
      };
    });

    const newContract: LoanContract = {
      id: ctrId,
      code: ctrCode,
      proposalId: prop.id,
      connectionId: connId,
      loanRequestId: loan.id,
      loanCode: loan.code,
      borrowerId: loan.borrowerId,
      borrowerName: loan.borrowerName,
      borrowerUniversity: loan.university,
      borrowerStudentId: borrowerUser?.studentId,
      lenderId: currentUser.id,
      lenderName: currentUser.fullName,
      amount: prop.amount,
      termMonths: prop.termMonths,
      simulatedMonthlyRate: prop.simulatedMonthlyRate,
      totalRepayable,
      installmentAmount: baseInstallment,
      firstDueDate: newInstallments[0].dueDate,
      status: 'Đã xác nhận mô phỏng',
      borrowerConfirmedAt: prop.borrowerConfirmedAt,
      lenderConfirmedAt: nowIso,
      createdAt: nowIso,
    };

    // Update capital offer allocation
    const nextAllocated = offer.allocatedCapital + prop.amount;
    const nextCapStatus =
      nextAllocated >= offer.totalCapital ? 'Đã sử dụng hết' : 'Đã phân bổ một phần';

    setCapitalOffers((prev) =>
      prev.map((c) =>
        c.id === offer.id
          ? { ...c, allocatedCapital: nextAllocated, status: nextCapStatus, updatedAt: nowIso }
          : c
      )
    );
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id === prop.id) {
          return {
            ...p,
            status: 'Đã tạo hợp đồng dự thảo',
            lenderConfirmedAt: nowIso,
            updatedAt: nowIso,
          };
        }
        // Tự động hủy các đề xuất khác đang chờ trên cùng yêu cầu vay đã chốt
        if (
          p.loanRequestId === loan.id &&
          (p.status === 'Chờ người vay xác nhận' || p.status === 'Người vay đã đồng ý')
        ) {
          return { ...p, status: 'Đã hủy', updatedAt: nowIso };
        }
        return p;
      })
    );
    setConnections((prev) => [newConnection, ...prev]);
    setContracts((prev) => [newContract, ...prev]);
    setInstallments((prev) => [...prev, ...newInstallments]);
    setLoanRequests((prev) =>
      prev.map((l) =>
        l.id === loan.id ? { ...l, status: 'Đang hoàn trả', updatedAt: nowIso } : l
      )
    );

    pushNotification({
      userId: loan.borrowerId,
      title: `Đã tạo hợp đồng dự thảo ${ctrCode}`,
      message: `Hai bên đã xác nhận kết nối ${loan.code}. Hợp đồng dự thảo ${ctrCode} và lịch thanh toán ${prop.termMonths} kỳ đã sẵn sàng.`,
      type: 'success',
      link: '/app/contracts',
    });
    pushNotification({
      userId: currentUser.id,
      title: `Hoàn tất kết nối & tạo hợp đồng ${ctrCode}`,
      message: `Bạn đã xác nhận kết nối với ${loan.borrowerName} (${prop.amount.toLocaleString('vi-VN')} đ).`,
      type: 'success',
      link: '/app/contracts',
    });
    pushLog(
      currentUser.fullName,
      'lender',
      'Xác nhận kết nối & tạo hợp đồng dự thảo',
      `${ctrCode} (${loan.code})`
    );
    showToast({
      type: 'success',
      title: 'Kết nối & tạo hợp đồng thành công',
      description: `Mã hợp đồng: ${ctrCode}`,
    });
    return { ok: true };
  };

  const simulateRepayment = (loanRequestId: string, installmentId?: string) => {
    const conn = connections.find((c) => c.loanRequestId === loanRequestId);
    const loan = loanRequests.find((l) => l.id === loanRequestId);
    if (!conn || !loan) {
      return { ok: false, error: 'Không tìm thấy thông tin khoản vay đã kết nối.' };
    }
    if (
      !currentUser ||
      (currentUser.role !== 'admin' && currentUser.id !== loan.borrowerId)
    ) {
      return { ok: false, error: 'Bạn không có quyền thực hiện thanh toán cho khoản vay này.' };
    }

    const unpaid = installments
      .filter((i) => i.loanRequestId === loanRequestId && i.status === 'Chưa thanh toán')
      .sort((a, b) => a.installmentNumber - b.installmentNumber);

    if (unpaid.length === 0) {
      return { ok: false, error: 'Khoản vay này đã hoàn thành tất cả các kỳ thanh toán.' };
    }

    const targetInst = installmentId
      ? unpaid.find((i) => i.id === installmentId)
      : unpaid[0];

    if (!targetInst) {
      return { ok: false, error: 'Kỳ thanh toán này đã được thanh toán trước đó.' };
    }

    const nowIso = new Date().toISOString();

    setInstallments((prev) =>
      prev.map((i) =>
        i.id === targetInst.id ? { ...i, status: 'Đã thanh toán', paidAt: nowIso } : i
      )
    );

    const newPaidAmount = Math.min(conn.totalRepayable, conn.paidAmount + targetInst.amount);
    const isCompleted = unpaid.length === 1 || newPaidAmount >= conn.totalRepayable;

    setConnections((prev) =>
      prev.map((c) =>
        c.id === conn.id
          ? {
              ...c,
              paidAmount: newPaidAmount,
              status: isCompleted ? 'Đã hoàn thành' : 'Đang hoạt động',
            }
          : c
      )
    );

    if (isCompleted) {
      setLoanRequests((prev) =>
        prev.map((l) =>
          l.id === loanRequestId ? { ...l, status: 'Đã hoàn thành', updatedAt: nowIso } : l
        )
      );
    }

    const newRepayment: RepaymentRecord = {
      id: `rep-${Date.now()}`,
      loanRequestId,
      loanCode: loan.code,
      connectionId: conn.id,
      borrowerId: loan.borrowerId,
      borrowerName: loan.borrowerName,
      amount: targetInst.amount,
      note: `Thanh toán mô phỏng kỳ ${targetInst.installmentNumber}/${loan.termMonths}`,
      paidAt: nowIso,
    };

    const nextRepayments = [newRepayment, ...repayments];
    setRepayments(nextRepayments);

    const borrowerUser = users.find((u) => u.id === loan.borrowerId);
    if (borrowerUser) {
      const updatedScore = calculateSimulatedCreditScore(borrowerUser, nextRepayments, loan.amount);
      setCreditScores((prev) => ({ ...prev, [borrowerUser.id]: updatedScore }));
    }

    pushNotification({
      userId: loan.borrowerId,
      title: `Thanh toán mô phỏng thành công (${loan.code})`,
      message: `Đã ghi nhận ${targetInst.amount.toLocaleString('vi-VN')} đ cho kỳ ${targetInst.installmentNumber}/${loan.termMonths}.`,
      type: 'success',
      link: '/app/loans',
    });

    pushNotification({
      userId: conn.lenderId,
      title: `Nhận hoàn trả mô phỏng (${loan.code})`,
      message: `${loan.borrowerName} vừa thanh toán mô phỏng kỳ ${targetInst.installmentNumber}/${loan.termMonths} (${targetInst.amount.toLocaleString('vi-VN')} đ).`,
      type: 'info',
      link: '/app/loans',
    });

    pushLog(
      loan.borrowerName,
      'borrower',
      `Thanh toán mô phỏng kỳ ${targetInst.installmentNumber}/${loan.termMonths}`,
      `${loan.code} (${targetInst.amount.toLocaleString('vi-VN')} đ)`
    );

    showToast({
      type: 'success',
      title: 'Thanh toán mô phỏng thành công',
      description: `Kỳ ${targetInst.installmentNumber}/${loan.termMonths}: ${targetInst.amount.toLocaleString('vi-VN')} đ`,
    });

    return { ok: true };
  };

  const markNotificationRead = (notifId: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) => (n.userId === currentUser.id ? { ...n, isRead: true } : n))
    );
    showToast({ type: 'info', title: 'Đã đánh dấu tất cả thông báo là đã đọc' });
  };

  const adminUpdateLoanStatus = (loanId: string, status: LoanStatus) => {
    if (!currentUser || currentUser.role !== 'admin') {
      return { ok: false, error: 'Chỉ Admin mới có quyền cập nhật trạng thái.' };
    }
    const target = loanRequests.find((l) => l.id === loanId);
    if (!target) return { ok: false, error: 'Không tìm thấy yêu cầu.' };

    const hasConnection = connections.some((c) => c.loanRequestId === loanId);
    if ((status === 'Đang hoàn trả' || status === 'Đã hoàn thành') && !hasConnection) {
      showToast({
        type: 'error',
        title: 'Không thể chuyển trạng thái',
        description: 'Yêu cầu vay chưa có kết nối hai bên xác nhận.',
      });
      return { ok: false, error: 'Chưa có kết nối hợp lệ.' };
    }

    setLoanRequests((prev) =>
      prev.map((l) =>
        l.id === loanId ? { ...l, status, updatedAt: new Date().toISOString() } : l
      )
    );
    pushNotification({
      userId: target.borrowerId,
      title: `Cập nhật trạng thái ${target.code}`,
      message: `Admin đã cập nhật trạng thái yêu cầu ${target.code} thành "${status}".`,
      type: 'info',
      link: '/app/borrower',
    });
    pushLog(currentUser.fullName, 'admin', `Cập nhật trạng thái thành "${status}"`, target.code);
    showToast({ type: 'success', title: 'Đã cập nhật trạng thái', description: `${target.code} → ${status}` });
    return { ok: true };
  };

  const adminToggleUserLock = (userId: string) => {
    const target = users.find((u) => u.id === userId);
    if (!target || target.role === 'admin') return;
    const nextStatus = target.status === 'active' ? 'locked' : 'active';
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: nextStatus } : u)));
    if (currentUser) {
      pushLog(
        currentUser.fullName,
        'admin',
        nextStatus === 'locked' ? 'Khóa tài khoản' : 'Mở khóa tài khoản',
        target.email
      );
    }
    showToast({
      type: 'info',
      title: nextStatus === 'locked' ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản',
      description: target.fullName,
    });
  };

  const adminAddNewsArticle = (input: Omit<NewsArticle, 'id' | 'publishedAt'>) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    const item: NewsArticle = {
      ...input,
      id: `news-${Date.now()}`,
      publishedAt: new Date().toISOString(),
    };
    setNewsArticles((prev) => [item, ...prev]);
    pushLog(currentUser.fullName, 'admin', 'Thêm bài tin tức mới', input.title);
    showToast({ type: 'success', title: 'Đã thêm tin tức mới' });
  };

  const adminDeleteNewsArticle = (id: string) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    setNewsArticles((prev) => prev.filter((n) => n.id !== id));
    showToast({ type: 'info', title: 'Đã xóa bài tin tức' });
  };

  const adminAddFinancialArticle = (
    input: Omit<FinancialArticle, 'id' | 'slug' | 'publishedAt'>
  ) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    const item: FinancialArticle = {
      ...input,
      id: `art-${Date.now()}`,
      slug: `bai-viet-${Date.now()}`,
      publishedAt: new Date().toISOString(),
    };
    setArticles((prev) => [item, ...prev]);
    pushLog(currentUser.fullName, 'admin', 'Thêm bài viết giáo dục tài chính', input.title);
    showToast({ type: 'success', title: 'Đã thêm bài viết giáo dục tài chính' });
  };

  const adminDeleteFinancialArticle = (id: string) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    setArticles((prev) => prev.filter((a) => a.id !== id));
    showToast({ type: 'info', title: 'Đã xóa bài viết' });
  };

  const updateBorrowerProfileForScore = (gpa: number, monthlyIncome: number) => {
    if (!currentUser) return;
    const updatedUser: User = { ...currentUser, gpa, monthlyIncome };
    setUsers((prev) => prev.map((u) => (u.id === currentUser.id ? updatedUser : u)));
    const nextScore = calculateSimulatedCreditScore(updatedUser, repayments);
    setCreditScores((prev) => ({ ...prev, [currentUser.id]: nextScore }));
    showToast({
      type: 'success',
      title: 'Đã cập nhật điểm tín nhiệm mô phỏng',
      description: `Xếp hạng mới: ${nextScore.grade} (${nextScore.score}/100 điểm)`,
    });
  };

  const resetDemoData = () => {
    setUsers(DEMO_USERS);
    setLoanRequests(DEMO_LOAN_REQUESTS);
    setConnections(DEMO_CONNECTIONS);
    setInstallments(DEMO_INSTALLMENTS);
    setRepayments(DEMO_REPAYMENTS);
    setNotifications(DEMO_NOTIFICATIONS);
    setCreditScores(buildInitialCreditScores());
    setArticles(DEMO_ARTICLES);
    setNewsArticles(DEMO_NEWS);
    setActivityLogs(DEMO_ACTIVITY_LOGS);
    setVerificationRequests(DEMO_VERIFICATION_REQUESTS);
    setCapitalOffers(DEMO_CAPITAL_OFFERS);
    setProposals(DEMO_PROPOSALS);
    setContracts(DEMO_CONTRACTS);
    showToast({
      type: 'success',
      title: 'Đã khôi phục dữ liệu mẫu ban đầu',
      description: 'Toàn bộ dữ liệu đề xuất, hợp đồng, nguồn vốn và khoản vay đã được đặt lại.',
    });
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        loanRequests,
        connections,
        installments,
        repayments,
        notifications,
        creditScores,
        articles,
        newsArticles,
        activityLogs,
        verificationRequests,
        capitalOffers,
        proposals,
        contracts,
        toasts,
        dismissToast,
        showToast,
        login,
        register,
        logout,
        updateMyProfile,
        submitVerification,
        adminReviewVerification,
        createCapitalOffer,
        updateCapitalOffer,
        toggleCapitalOfferStatus,
        createLoanRequest,
        updateLoanRequest,
        cancelLoanRequest,
        proposeConnection,
        borrowerRespondProposal,
        lenderWithdrawProposal,
        lenderConfirmProposal,
        simulateRepayment,
        markNotificationRead,
        markAllNotificationsRead,
        adminUpdateLoanStatus,
        adminToggleUserLock,
        adminAddNewsArticle,
        adminDeleteNewsArticle,
        adminAddFinancialArticle,
        adminDeleteFinancialArticle,
        updateBorrowerProfileForScore,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
