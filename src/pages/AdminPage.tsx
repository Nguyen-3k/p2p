import React, { useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  FileCheck2,
  FileText,
  Handshake,
  Lock,
  Newspaper,
  PauseCircle,
  PlayCircle,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  Unlock,
  UserCheck,
  Users,
  Wallet,
  XCircle,
} from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import {
  CapitalStatusBadge,
  ContractStatusBadge,
  CreditBadge,
  ProposalStatusBadge,
  StatusBadge,
  VerificationBadge,
} from '../components/Badges';
import { ConfirmModal } from '../components/ConfirmModal';
import { useApp } from '../context/AppContext';
import type { LoanStatus, NewsArticle } from '../types';
import { formatDate, formatDateTime, formatVND } from '../utils/formatters';

const ALL_STATUSES: LoanStatus[] = [
  'Chờ đánh giá',
  'Đang tìm người kết nối',
  'Đã tìm được kết nối',
  'Đang hoàn trả',
  'Đã hoàn thành',
  'Đã hủy',
];

type AdminTab =
  | 'loans'
  | 'users'
  | 'verifications'
  | 'capital'
  | 'proposals'
  | 'contracts'
  | 'content'
  | 'repayments'
  | 'logs';

export const AdminPage: React.FC = () => {
  const {
    users,
    loanRequests,
    connections,
    repayments,
    activityLogs,
    verificationRequests,
    capitalOffers,
    proposals,
    contracts,
    newsArticles,
    articles,
    adminUpdateLoanStatus,
    adminToggleUserLock,
    adminReviewVerification,
    toggleCapitalOfferStatus,
    adminAddNewsArticle,
    adminDeleteNewsArticle,
  } = useApp();

  const [tab, setTab] = useState<AdminTab>('loans');

  // Filters
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');
  const [loanSearch, setLoanSearch] = useState('');
  const [loanStatusFilter, setLoanStatusFilter] = useState('ALL');
  const [contractStatusFilter, setContractStatusFilter] = useState('ALL');

  // Verification reject modal
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Add news form
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState<NewsArticle['category']>('Tin tức dự án');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsContent, setNewsContent] = useState('');

  // Real computed overview metrics
  const studentCount = users.filter((u) => u.role === 'borrower').length;
  const lenderCount = users.filter((u) => u.role === 'lender').length;
  const activeUserCount = users.filter((u) => u.status === 'active').length;
  const lockedUserCount = users.filter((u) => u.status === 'locked').length;
  const pendingLoansCount = loanRequests.filter(
    (l) => l.status === 'Đang tìm người kết nối' || l.status === 'Chờ đánh giá'
  ).length;
  const totalCapitalRegistered = capitalOffers.reduce((s, c) => s + c.totalCapital, 0);
  const totalCapitalAvailable = capitalOffers.reduce(
    (s, c) => s + Math.max(0, c.totalCapital - c.allocatedCapital),
    0
  );
  const pendingProposalsCount = proposals.filter(
    (p) => p.status === 'Chờ người vay xác nhận' || p.status === 'Người vay đã đồng ý'
  ).length;
  const activeLoansCount = connections.filter((c) => c.status === 'Đang hoạt động').length;
  const completedLoansCount = connections.filter((c) => c.status === 'Đã hoàn thành').length;
  const pendingVerificationsCount = verificationRequests.filter(
    (v) => v.status === 'Đang chờ duyệt'
  ).length;

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
      if (userStatusFilter !== 'ALL' && u.status !== userStatusFilter) return false;
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        if (
          !u.fullName.toLowerCase().includes(q) &&
          !u.email.toLowerCase().includes(q) &&
          !u.university.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [users, userRoleFilter, userStatusFilter, userSearch]);

  const filteredLoans = useMemo(() => {
    return loanRequests.filter((l) => {
      if (loanStatusFilter !== 'ALL' && l.status !== loanStatusFilter) return false;
      if (loanSearch.trim()) {
        const q = loanSearch.toLowerCase();
        if (
          !l.code.toLowerCase().includes(q) &&
          !l.borrowerName.toLowerCase().includes(q) &&
          !l.university.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [loanRequests, loanStatusFilter, loanSearch]);

  const filteredContracts = useMemo(() => {
    return contracts.filter(
      (c) => contractStatusFilter === 'ALL' || c.status === contractStatusFilter
    );
  }, [contracts, contractStatusFilter]);

  const handleAddNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsSummary.trim() || !newsContent.trim()) return;
    adminAddNewsArticle({
      title: newsTitle.trim(),
      category: newsCategory,
      summary: newsSummary.trim(),
      content: newsContent.trim(),
    });
    setNewsTitle('');
    setNewsSummary('');
    setNewsContent('');
  };

  return (
    <AppLayout
      title="Trang quản trị Admin"
      subtitle="Giám sát toàn bộ người dùng, xác minh, nguồn vốn, kết nối, hợp đồng và nhật ký"
    >
      {/* Comprehensive Live Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Người dùng ({users.length})</span>
            <Users className="w-4 h-4 text-[#102F59]" />
          </div>
          <p className="text-xl font-extrabold text-[#102F59]">
            {studentCount} SV • {lenderCount} Có vốn
          </p>
          <p className="text-xs text-slate-500">
            Hoạt động: {activeUserCount} • Bị khóa: {lockedUserCount}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Yêu cầu vay ({loanRequests.length})</span>
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-xl font-extrabold text-[#102F59]">
            {pendingLoansCount} chờ kết nối
          </p>
          <p className="text-xs text-slate-500">
            Đang trả: {activeLoansCount} • Hoàn thành: {completedLoansCount}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Nguồn vốn ({capitalOffers.length})</span>
            <Wallet className="w-4 h-4 text-[#15803D]" />
          </div>
          <p className="text-xl font-extrabold text-[#15803D]">
            {formatVND(totalCapitalAvailable)}
          </p>
          <p className="text-xs text-slate-500">
            Khả dụng / Tổng {formatVND(totalCapitalRegistered)}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Kết nối & Hợp đồng</span>
            <Handshake className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-xl font-extrabold text-indigo-700">
            {connections.length} kết nối • {contracts.length} HĐ
          </p>
          <p className="text-xs text-slate-500">
            Đề xuất chờ: {pendingProposalsCount} • Xác minh chờ: {pendingVerificationsCount}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] overflow-hidden">
        <div className="px-4 sm:px-6 py-3 border-b border-slate-100 flex flex-wrap gap-2">
          {[
            { id: 'loans', label: `Yêu cầu vay (${loanRequests.length})` },
            { id: 'users', label: `Người dùng (${users.length})` },
            {
              id: 'verifications',
              label: `Xác minh (${verificationRequests.length})`,
              alert: pendingVerificationsCount,
            },
            { id: 'capital', label: `Nguồn vốn (${capitalOffers.length})` },
            { id: 'proposals', label: `Đề xuất (${proposals.length})` },
            { id: 'contracts', label: `Hợp đồng (${contracts.length})` },
            { id: 'content', label: `Nội dung (${newsArticles.length + articles.length})` },
            { id: 'repayments', label: `Giao dịch (${repayments.length})` },
            { id: 'logs', label: `Nhật ký (${activityLogs.length})` },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id as AdminTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 ${
                tab === t.id
                  ? 'bg-[#102F59] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{t.label}</span>
              {typeof t.alert === 'number' && t.alert > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-[#D9A83F] text-[#102F59]">
                  {t.alert}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab: Loan Requests */}
        {tab === 'loans' && (
          <div>
            <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={loanSearch}
                  onChange={(e) => setLoanSearch(e.target.value)}
                  placeholder="Tìm mã, tên sinh viên, trường..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <select
                value={loanStatusFilter}
                onChange={(e) => setLoanStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="ALL">Tất cả trạng thái</option>
                {ALL_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FFFAF0] text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                    <th className="py-3 px-4 font-semibold">Mã</th>
                    <th className="py-3 px-4 font-semibold">Sinh viên</th>
                    <th className="py-3 px-4 font-semibold">Số tiền</th>
                    <th className="py-3 px-4 font-semibold">Tín nhiệm</th>
                    <th className="py-3 px-4 font-semibold">Trạng thái</th>
                    <th className="py-3 px-4 font-semibold">Cập nhật</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredLoans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-bold text-[#102F59]">{loan.code}</td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-[#102F59]">{loan.borrowerName}</p>
                        <p className="text-xs text-slate-500">{loan.university}</p>
                      </td>
                      <td className="py-3.5 px-4 font-semibold">{formatVND(loan.amount)}</td>
                      <td className="py-3.5 px-4">
                        <CreditBadge grade={loan.creditGrade} score={loan.creditScore} />
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={loan.status} />
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={loan.status}
                          onChange={(e) =>
                            adminUpdateLoanStatus(loan.id, e.target.value as LoanStatus)
                          }
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium"
                        >
                          {ALL_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Users */}
        {tab === 'users' && (
          <div>
            <div className="p-4 border-b border-slate-100 flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Tìm họ tên, email, trường..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>
              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="ALL">Tất cả vai trò</option>
                <option value="borrower">Sinh viên</option>
                <option value="lender">Người có vốn</option>
                <option value="admin">Admin</option>
              </select>
              <select
                value={userStatusFilter}
                onChange={(e) => setUserStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="ALL">Mọi trạng thái</option>
                <option value="active">Hoạt động</option>
                <option value="locked">Đang khóa</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FFFAF0] text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                    <th className="py-3 px-4 font-semibold">Họ tên</th>
                    <th className="py-3 px-4 font-semibold">Email</th>
                    <th className="py-3 px-4 font-semibold">Vai trò</th>
                    <th className="py-3 px-4 font-semibold">Xác minh</th>
                    <th className="py-3 px-4 font-semibold">Trạng thái</th>
                    <th className="py-3 px-4 font-semibold text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#102F59]">{u.fullName}</p>
                        <p className="text-xs text-slate-500">{u.university}</p>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {u.role === 'borrower'
                            ? 'Sinh viên'
                            : u.role === 'lender'
                            ? 'Người có vốn'
                            : 'Admin'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <VerificationBadge status={u.verificationStatus} />
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {u.status === 'active' ? 'Hoạt động' : 'Đang khóa'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {u.role !== 'admin' ? (
                          <button
                            type="button"
                            onClick={() => adminToggleUserLock(u.id)}
                            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                              u.status === 'active'
                                ? 'border-rose-200 text-rose-700 hover:bg-rose-50'
                                : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {u.status === 'active' ? (
                              <>
                                <Lock className="w-3.5 h-3.5" /> Khóa
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3.5 h-3.5" /> Mở khóa
                              </>
                            )}
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                            <ShieldCheck className="w-3.5 h-3.5" /> Hệ thống
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab: Verification Requests */}
        {tab === 'verifications' && (
          <div className="divide-y divide-slate-100">
            {verificationRequests.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                Chưa có yêu cầu xác minh nào.
              </div>
            ) : (
              verificationRequests.map((ver) => (
                <div
                  key={ver.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <UserCheck className="w-4 h-4 text-[#102F59]" />
                      <span className="text-sm font-bold text-[#102F59]">{ver.userName}</span>
                      <VerificationBadge status={ver.status} />
                    </div>
                    <p className="text-xs text-slate-600">
                      {ver.university} {ver.studentId ? `• Mã SV: ${ver.studentId}` : ''} • Gửi:{' '}
                      {formatDateTime(ver.submittedAt)}
                    </p>
                    <p className="text-xs text-slate-500">{ver.confirmationNote}</p>
                    {ver.rejectionReason && (
                      <p className="text-xs text-rose-700">Lý do từ chối: {ver.rejectionReason}</p>
                    )}
                  </div>

                  {ver.status === 'Đang chờ duyệt' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setRejectReason('');
                          setRejectTargetId(ver.id);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-semibold"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Từ chối
                      </button>
                      <button
                        type="button"
                        onClick={() => adminReviewVerification(ver.id, true)}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#15803D] hover:bg-emerald-800 text-white text-xs font-semibold"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Chấp nhận
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab: Capital Offers */}
        {tab === 'capital' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFFAF0] text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <th className="py-3 px-4 font-semibold">Mã nguồn vốn</th>
                  <th className="py-3 px-4 font-semibold">Chủ sở hữu</th>
                  <th className="py-3 px-4 font-semibold">Tổng vốn</th>
                  <th className="py-3 px-4 font-semibold">Đã phân bổ</th>
                  <th className="py-3 px-4 font-semibold">Khả dụng</th>
                  <th className="py-3 px-4 font-semibold">Trạng thái</th>
                  <th className="py-3 px-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {capitalOffers.map((cap) => {
                  const avail = Math.max(0, cap.totalCapital - cap.allocatedCapital);
                  const isPaused = cap.status === 'Đã tạm ngừng';
                  return (
                    <tr key={cap.id} className="hover:bg-slate-50/70">
                      <td className="py-3.5 px-4 font-bold text-[#102F59]">{cap.code}</td>
                      <td className="py-3.5 px-4">{cap.lenderName}</td>
                      <td className="py-3.5 px-4 font-semibold">{formatVND(cap.totalCapital)}</td>
                      <td className="py-3.5 px-4 text-amber-700 font-semibold">
                        {formatVND(cap.allocatedCapital)}
                      </td>
                      <td className="py-3.5 px-4 text-[#15803D] font-bold">
                        {formatVND(avail)}
                      </td>
                      <td className="py-3.5 px-4">
                        <CapitalStatusBadge status={cap.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => toggleCapitalOfferStatus(cap.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold hover:bg-slate-50"
                        >
                          {isPaused ? (
                            <>
                              <PlayCircle className="w-3.5 h-3.5 text-[#15803D]" /> Kích hoạt
                            </>
                          ) : (
                            <>
                              <PauseCircle className="w-3.5 h-3.5 text-amber-600" /> Tạm ngừng
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab: Connection Proposals */}
        {tab === 'proposals' && (
          <div className="divide-y divide-slate-100">
            {proposals.map((prop) => (
              <div key={prop.id} className="p-5 flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <strong className="text-[#102F59]">{prop.code}</strong>
                    <span className="text-slate-400">
                      • {prop.loanCode} • {prop.capitalCode}
                    </span>
                    <ProposalStatusBadge status={prop.status} />
                  </div>
                  <p className="text-slate-700">
                    Người có vốn: <strong>{prop.lenderName}</strong> → Sinh viên:{' '}
                    <strong>{prop.borrowerName}</strong> ({formatVND(prop.amount)} /{' '}
                    {prop.termMonths} tháng)
                  </p>
                  <p className="text-xs text-slate-500">{prop.conditionsNote}</p>
                </div>
                <span className="text-xs text-slate-400">{formatDateTime(prop.updatedAt)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Draft Contracts */}
        {tab === 'contracts' && (
          <div>
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <select
                value={contractStatusFilter}
                onChange={(e) => setContractStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              >
                <option value="ALL">Tất cả trạng thái hợp đồng</option>
                <option value="Đã xác nhận mô phỏng">Đã xác nhận mô phỏng</option>
                <option value="Bản dự thảo">Bản dự thảo</option>
                <option value="Chờ xác nhận">Chờ xác nhận</option>
              </select>
            </div>
            <div className="divide-y divide-slate-100">
              {filteredContracts.map((ctr) => (
                <div key={ctr.id} className="p-5 flex flex-wrap items-center justify-between gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-[#15803D]" />
                      <strong className="text-[#102F59]">{ctr.code}</strong>
                      <ContractStatusBadge status={ctr.status} />
                    </div>
                    <p className="text-xs text-slate-600">
                      {ctr.borrowerName} ↔ {ctr.lenderName} • {formatVND(ctr.amount)} ({ctr.termMonths}{' '}
                      tháng) • Tạo: {formatDate(ctr.createdAt)}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#15803D]">
                    Tổng hoàn trả: {formatVND(ctr.totalRepayable)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Content Management */}
        {tab === 'content' && (
          <div className="p-6 space-y-6">
            <form
              onSubmit={handleAddNews}
              className="rounded-2xl bg-[#FFFAF0] border border-[#EBE6DC] p-5 space-y-3"
            >
              <h3 className="text-sm font-bold text-[#102F59] flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#15803D]" />
                Thêm bài Tin tức / Kiến thức mới
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newsTitle}
                  onChange={(e) => setNewsTitle(e.target.value)}
                  placeholder="Tiêu đề bài viết..."
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                />
                <select
                  value={newsCategory}
                  onChange={(e) => setNewsCategory(e.target.value as NewsArticle['category'])}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
                >
                  <option value="Tin tức dự án">Tin tức dự án</option>
                  <option value="Kiến thức tài chính">Kiến thức tài chính</option>
                  <option value="Quản lý chi tiêu">Quản lý chi tiêu</option>
                  <option value="Vay có trách nhiệm">Vay có trách nhiệm</option>
                </select>
              </div>
              <input
                type="text"
                value={newsSummary}
                onChange={(e) => setNewsSummary(e.target.value)}
                placeholder="Tóm tắt ngắn..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              />
              <textarea
                rows={2}
                value={newsContent}
                onChange={(e) => setNewsContent(e.target.value)}
                placeholder="Nội dung chi tiết..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#102F59] text-white text-xs font-semibold"
              >
                Đăng bài viết
              </button>
            </form>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tin tức hiện có ({newsArticles.length})
              </h4>
              <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl">
                {newsArticles.map((n) => (
                  <div key={n.id} className="p-4 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-start gap-2.5">
                      <Newspaper className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-[#102F59]">{n.title}</p>
                        <p className="text-slate-500">
                          {n.category} • {formatDate(n.publishedAt)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => adminDeleteNewsArticle(n.id)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                      title="Xóa bài"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Repayments */}
        {tab === 'repayments' && (
          <div className="divide-y divide-slate-100">
            {repayments.map((r) => (
              <div key={r.id} className="px-6 py-4 flex items-center justify-between text-sm">
                <div>
                  <p className="font-bold text-[#102F59]">
                    {r.loanCode} • {r.borrowerName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {r.note} • {formatDateTime(r.paidAt)}
                  </p>
                </div>
                <span className="font-extrabold text-[#15803D]">{formatVND(r.amount)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Tab: Activity Logs */}
        {tab === 'logs' && (
          <div className="divide-y divide-slate-100">
            {activityLogs.map((log) => (
              <div key={log.id} className="px-6 py-3.5 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-[#15803D] shrink-0" />
                  <div>
                    <p className="font-semibold text-[#102F59]">
                      {log.actorName} ({log.actorRole}) —{' '}
                      <span className="text-slate-600">{log.action}</span>
                    </p>
                    <p className="text-slate-500">Đối tượng: {log.target}</p>
                  </div>
                </div>
                <span className="text-slate-400 shrink-0">{formatDateTime(log.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reject Verification Modal */}
      <ConfirmModal
        open={Boolean(rejectTargetId)}
        title="Từ chối yêu cầu xác minh mô phỏng"
        description="Vui lòng nhập lý do từ chối để người dùng bổ sung thông tin hồ sơ."
        confirmLabel="Xác nhận từ chối"
        variant="danger"
        onConfirm={() => {
          if (rejectTargetId) {
            adminReviewVerification(rejectTargetId, false, rejectReason);
          }
          setRejectTargetId(null);
        }}
        onCancel={() => setRejectTargetId(null)}
      >
        <textarea
          rows={3}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Nhập lý do từ chối..."
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
        />
      </ConfirmModal>
    </AppLayout>
  );
};
