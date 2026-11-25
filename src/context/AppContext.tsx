import React, { createContext, useContext, useEffect, useState } from 'react';
import type {
  ActivityLog,
  CreditScoreResult,
  FinancialArticle,
  LoanConnection,
  LoanPackageType,
  LoanPurpose,
  LoanRequest,
  LoanStatus,
  NotificationItem,
  RepaymentInstallment,
  RepaymentRecord,
  ToastMessage,
  User,
  UserRole,
} from '../types';
import {
  buildInitialCreditScores,
  DEMO_ACTIVITY_LOGS,
  DEMO_ARTICLES,
  DEMO_CONNECTIONS,
  DEMO_INSTALLMENTS,
  DEMO_LOAN_REQUESTS,
  DEMO_NOTIFICATIONS,
  DEMO_REPAYMENTS,
  DEMO_USERS,
} from '../data/seedData';
import { calculateSimulatedCreditScore } from '../utils/creditScoring';
import { calculateTotalRepayable, LOAN_PACKAGES } from '../utils/formatters';

const STORAGE_KEYS = {
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
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
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
  activityLogs: ActivityLog[];
  toasts: ToastMessage[];
  dismissToast: (id: string) => void;
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  login: (email: string, password: string) => { ok: boolean; error?: string; user?: User };
  register: (input: RegisterInput) => { ok: boolean; error?: string; user?: User };
  logout: () => void;
  createLoanRequest: (input: CreateLoanInput) => { ok: boolean; error?: string };
  updateLoanRequest: (
    loanId: string,
    updates: Partial<Pick<LoanRequest, 'amount' | 'termMonths' | 'purpose' | 'description' | 'incomeSource'>>
  ) => { ok: boolean; error?: string };
  cancelLoanRequest: (loanId: string) => void;
  proposeConnection: (loanId: string) => { ok: boolean; error?: string };
  simulateRepayment: (loanRequestId: string, installmentId?: string) => { ok: boolean; error?: string };
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  adminUpdateLoanStatus: (loanId: string, status: LoanStatus) => void;
  adminToggleUserLock: (userId: string) => void;
  updateBorrowerProfileForScore: (gpa: number, monthlyIncome: number) => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<User[]>(() => loadFromStorage(STORAGE_KEYS.users, DEMO_USERS));
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
  const [articles] = useState<FinancialArticle[]>(() =>
    loadFromStorage(STORAGE_KEYS.articles, DEMO_ARTICLES)
  );
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() =>
    loadFromStorage(STORAGE_KEYS.logs, DEMO_ACTIVITY_LOGS)
  );
  const [sessionUserId, setSessionUserId] = useState<string | null>(() =>
    loadFromStorage<string | null>(STORAGE_KEYS.sessionUserId, null)
  );
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const currentUser = users.find((u) => u.id === sessionUserId) ?? null;

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
    localStorage.setItem(STORAGE_KEYS.logs, JSON.stringify(activityLogs));
  }, [activityLogs]);

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
      return { ok: false, error: 'Tài khoản demo này đang bị khóa bởi Admin.' };
    }
    setSessionUserId(found.id);
    showToast({ type: 'success', title: 'Đăng nhập thành công', description: `Chào mừng ${found.fullName}!` });
    return { ok: true, user: found };
  };

  const register = (input: RegisterInput) => {
    const cleanEmail = input.email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { ok: false, error: 'Email này đã được đăng ký trong hệ thống demo.' };
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
      title: 'Chào mừng đến với Student P2P (Demo)',
      message: 'Tài khoản mô phỏng của bạn đã sẵn sàng để trải nghiệm nền tảng.',
      type: 'info',
    });
    pushLog(newUser.fullName, newUser.role, 'Đăng ký tài khoản demo mới', newUser.email);
    showToast({ type: 'success', title: 'Đăng ký thành công', description: 'Phiên demo đã được khởi tạo.' });
    return { ok: true, user: newUser };
  };

  const logout = () => {
    setSessionUserId(null);
    showToast({ type: 'info', title: 'Đã đăng xuất khỏi phiên demo' });
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
      message: `Yêu cầu ${input.amount.toLocaleString('vi-VN')} đ (${input.purpose}) đang hiển thị cho người có vốn mô phỏng.`,
      type: 'success',
      link: '/app/borrower',
    });
    pushLog(currentUser.fullName, 'borrower', 'Tạo yêu cầu vay mô phỏng', `${code} (${input.amount.toLocaleString('vi-VN')} đ)`);
    showToast({ type: 'success', title: 'Tạo yêu cầu thành công', description: `Mã yêu cầu: ${code}` });
    return { ok: true };
  };

  const updateLoanRequest = (
    loanId: string,
    updates: Partial<Pick<LoanRequest, 'amount' | 'termMonths' | 'purpose' | 'description' | 'incomeSource'>>
  ) => {
    const target = loanRequests.find((l) => l.id === loanId);
    if (!target) return { ok: false, error: 'Không tìm thấy yêu cầu vay.' };
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
        l.id === loanId
          ? {
              ...l,
              ...updates,
              updatedAt: new Date().toISOString(),
            }
          : l
      )
    );
    showToast({ type: 'success', title: 'Đã cập nhật yêu cầu vay', description: target.code });
    return { ok: true };
  };

  const cancelLoanRequest = (loanId: string) => {
    const target = loanRequests.find((l) => l.id === loanId);
    if (!target) return;
    setLoanRequests((prev) =>
      prev.map((l) =>
        l.id === loanId ? { ...l, status: 'Đã hủy', updatedAt: new Date().toISOString() } : l
      )
    );
    if (currentUser) {
      pushLog(currentUser.fullName, currentUser.role, 'Hủy yêu cầu vay', target.code);
    }
    showToast({ type: 'info', title: 'Đã hủy yêu cầu vay', description: target.code });
  };

  const proposeConnection = (loanId: string) => {
    if (!currentUser || currentUser.role !== 'lender') {
      return { ok: false, error: 'Chỉ tài khoản người có vốn mới có thể đề xuất kết nối.' };
    }
    const loan = loanRequests.find((l) => l.id === loanId);
    if (!loan) return { ok: false, error: 'Không tìm thấy yêu cầu vay.' };
    if (loan.status !== 'Đang tìm người kết nối' && loan.status !== 'Chờ đánh giá') {
      return { ok: false, error: 'Yêu cầu này đã được kết nối hoặc không còn khả dụng.' };
    }

    const totalRepayable = calculateTotalRepayable(loan.amount, loan.termMonths, loan.simulatedMonthlyRate);
    const connId = `conn-${Date.now()}`;
    const now = new Date();

    const newConnection: LoanConnection = {
      id: connId,
      loanRequestId: loan.id,
      loanCode: loan.code,
      lenderId: currentUser.id,
      lenderName: currentUser.fullName,
      borrowerId: loan.borrowerId,
      borrowerName: loan.borrowerName,
      university: loan.university,
      purpose: loan.purpose,
      amount: loan.amount,
      termMonths: loan.termMonths,
      totalRepayable,
      paidAmount: 0,
      status: 'Đang hoạt động',
      connectedAt: now.toISOString(),
    };

    // Tạo lịch thanh toán mô phỏng theo từng tháng
    const baseInstallment = Math.floor(totalRepayable / loan.termMonths);
    const remainder = totalRepayable - baseInstallment * loan.termMonths;
    const newInstallments: RepaymentInstallment[] = Array.from({ length: loan.termMonths }, (_, idx) => {
      const due = new Date(now);
      due.setMonth(due.getMonth() + idx + 1);
      return {
        id: `inst-${connId}-${idx + 1}`,
        loanRequestId: loan.id,
        connectionId: connId,
        installmentNumber: idx + 1,
        dueDate: due.toISOString(),
        amount: idx === loan.termMonths - 1 ? baseInstallment + remainder : baseInstallment,
        status: 'Chưa thanh toán',
      };
    });

    setConnections((prev) => [newConnection, ...prev]);
    setInstallments((prev) => [...prev, ...newInstallments]);
    setLoanRequests((prev) =>
      prev.map((l) =>
        l.id === loan.id ? { ...l, status: 'Đang hoàn trả', updatedAt: now.toISOString() } : l
      )
    );

    pushNotification({
      userId: loan.borrowerId,
      title: `Có đề xuất kết nối mới cho ${loan.code}`,
      message: `${currentUser.fullName} đã kết nối mô phỏng khoản vay ${loan.amount.toLocaleString('vi-VN')} đ. Lịch thanh toán ${loan.termMonths} kỳ đã được tạo.`,
      type: 'success',
      link: '/app/loans',
    });

    pushNotification({
      userId: currentUser.id,
      title: `Kết nối thành công ${loan.code}`,
      message: `Bạn đã kết nối mô phỏng với sinh viên ${loan.borrowerName} (${loan.amount.toLocaleString('vi-VN')} đ).`,
      type: 'success',
      link: '/app/loans',
    });

    pushLog(currentUser.fullName, 'lender', 'Đề xuất kết nối mô phỏng', `${loan.code} (${loan.amount.toLocaleString('vi-VN')} đ)`);
    showToast({
      type: 'success',
      title: 'Kết nối mô phỏng thành công',
      description: `Đã tạo lịch hoàn trả cho mã ${loan.code}.`,
    });
    return { ok: true };
  };

  const simulateRepayment = (loanRequestId: string, installmentId?: string) => {
    const conn = connections.find((c) => c.loanRequestId === loanRequestId);
    const loan = loanRequests.find((l) => l.id === loanRequestId);
    if (!conn || !loan) {
      return { ok: false, error: 'Không tìm thấy thông tin khoản vay đã kết nối.' };
    }

    const unpaid = installments
      .filter((i) => i.loanRequestId === loanRequestId && i.status === 'Chưa thanh toán')
      .sort((a, b) => a.installmentNumber - b.installmentNumber);

    if (unpaid.length === 0) {
      return { ok: false, error: 'Khoản vay này đã hoàn thành tất cả các kỳ thanh toán.' };
    }

    const targetInst = installmentId ? unpaid.find((i) => i.id === installmentId) ?? unpaid[0] : unpaid[0];
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
    const target = loanRequests.find((l) => l.id === loanId);
    if (!target) return;
    setLoanRequests((prev) =>
      prev.map((l) =>
        l.id === loanId ? { ...l, status, updatedAt: new Date().toISOString() } : l
      )
    );
    pushNotification({
      userId: target.borrowerId,
      title: `Cập nhật trạng thái ${target.code}`,
      message: `Admin demo đã cập nhật trạng thái yêu cầu ${target.code} thành "${status}".`,
      type: 'info',
      link: '/app/borrower',
    });
    if (currentUser) {
      pushLog(currentUser.fullName, 'admin', `Cập nhật trạng thái thành "${status}"`, target.code);
    }
    showToast({ type: 'success', title: 'Đã cập nhật trạng thái', description: `${target.code} → ${status}` });
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
        nextStatus === 'locked' ? 'Khóa tài khoản demo' : 'Mở khóa tài khoản demo',
        target.email
      );
    }
    showToast({
      type: 'info',
      title: nextStatus === 'locked' ? 'Đã khóa tài khoản' : 'Đã mở khóa tài khoản',
      description: target.fullName,
    });
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
    setActivityLogs(DEMO_ACTIVITY_LOGS);
    showToast({
      type: 'success',
      title: 'Đã khôi phục dữ liệu demo ban đầu',
      description: 'Tất cả khoản vay, kết nối và thông báo đã được đưa về trạng thái mặc định.',
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
        activityLogs,
        toasts,
        dismissToast,
        showToast,
        login,
        register,
        logout,
        createLoanRequest,
        updateLoanRequest,
        cancelLoanRequest,
        proposeConnection,
        simulateRepayment,
        markNotificationRead,
        markAllNotificationsRead,
        adminUpdateLoanStatus,
        adminToggleUserLock,
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
