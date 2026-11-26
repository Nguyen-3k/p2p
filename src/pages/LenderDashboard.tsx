import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Eye,
  Filter,
  Handshake,
  Search,
  Sparkles,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import {
  CreditBadge,
  ProposalStatusBadge,
  StatusBadge,
} from '../components/Badges';
import { ConfirmModal } from '../components/ConfirmModal';
import { useApp } from '../context/AppContext';
import type {
  ConnectionProposal,
  CreditGrade,
  LoanPurpose,
  LoanRequest,
  LoanStatus,
} from '../types';
import { calculateTotalRepayable, formatDate, formatVND } from '../utils/formatters';
import { computeSmartMatch } from '../utils/matching';

export const LenderDashboard: React.FC = () => {
  const {
    currentUser,
    loanRequests,
    connections,
    capitalOffers,
    proposals,
    proposeConnection,
    lenderConfirmProposal,
    lenderWithdrawProposal,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [purposeFilter, setPurposeFilter] = useState<string>('ALL');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [termFilter, setTermFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('Đang tìm người kết nối');
  const [amountFilter, setAmountFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'match'>('match');

  const [selectedLoan, setSelectedLoan] = useState<LoanRequest | null>(null);
  const [connectTarget, setConnectTarget] = useState<LoanRequest | null>(null);
  const [selectedOfferId, setSelectedOfferId] = useState<string>('');
  const [conditionsNote, setConditionsNote] = useState<string>('');
  const [confirmFinalProp, setConfirmFinalProp] = useState<ConnectionProposal | null>(null);
  const [withdrawTarget, setWithdrawTarget] = useState<ConnectionProposal | null>(null);

  const myOffers = useMemo(
    () => capitalOffers.filter((c) => c.lenderId === currentUser?.id),
    [capitalOffers, currentUser?.id]
  );

  const myActiveOffers = useMemo(
    () =>
      myOffers.filter(
        (c) =>
          (c.status === 'Đang khả dụng' ||
            c.status === 'Đang chờ kết nối' ||
            c.status === 'Đã phân bổ một phần') &&
          c.totalCapital - c.allocatedCapital > 0
      ),
    [myOffers]
  );

  const myConnections = useMemo(
    () => connections.filter((c) => c.lenderId === currentUser?.id),
    [connections, currentUser?.id]
  );

  const myProposals = useMemo(
    () => proposals.filter((p) => p.lenderId === currentUser?.id),
    [proposals, currentUser?.id]
  );

  const filteredLoans = useMemo(() => {
    const list = loanRequests
      .filter((l) => {
        if (statusFilter !== 'ALL' && l.status !== (statusFilter as LoanStatus)) return false;
        if (purposeFilter !== 'ALL' && l.purpose !== (purposeFilter as LoanPurpose)) return false;
        if (gradeFilter !== 'ALL' && l.creditGrade !== (gradeFilter as CreditGrade)) return false;
        if (termFilter !== 'ALL' && l.termMonths !== Number(termFilter)) return false;
        if (amountFilter === 'UNDER_3M' && l.amount > 3_000_000) return false;
        if (amountFilter === '3M_TO_6M' && (l.amount < 3_000_000 || l.amount > 6_000_000))
          return false;
        if (amountFilter === 'OVER_6M' && l.amount <= 6_000_000) return false;
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const match =
            l.code.toLowerCase().includes(q) ||
            l.borrowerName.toLowerCase().includes(q) ||
            l.university.toLowerCase().includes(q);
          if (!match) return false;
        }
        return true;
      })
      .map((loan) => ({
        loan,
        match: computeSmartMatch(loan, myActiveOffers),
      }));

    if (sortBy === 'match') {
      list.sort((a, b) => b.match.score - a.match.score);
    } else {
      list.sort(
        (a, b) => new Date(b.loan.createdAt).getTime() - new Date(a.loan.createdAt).getTime()
      );
    }
    return list;
  }, [
    loanRequests,
    statusFilter,
    purposeFilter,
    gradeFilter,
    termFilter,
    amountFilter,
    searchTerm,
    sortBy,
    myActiveOffers,
  ]);

  if (!currentUser) return null;

  const totalRegisteredCapital = myOffers.reduce((s, o) => s + o.totalCapital, 0);
  const totalAllocatedCapital = myOffers.reduce((s, o) => s + o.allocatedCapital, 0);
  const totalAvailableCapital = Math.max(0, totalRegisteredCapital - totalAllocatedCapital);
  const expectedRecovery = myConnections.reduce(
    (sum, c) => sum + Math.max(0, c.totalRepayable - c.paidAmount),
    0
  );

  const openProposeModal = (loan: LoanRequest) => {
    const match = computeSmartMatch(loan, myActiveOffers);
    const defaultOffer =
      match.bestOffer ??
      myActiveOffers.find((o) => o.totalCapital - o.allocatedCapital >= loan.amount) ??
      myActiveOffers[0];
    setSelectedOfferId(defaultOffer?.id ?? '');
    setConditionsNote(
      `Đề xuất kết nối kỳ hạn ${loan.termMonths} tháng cho mục đích ${loan.purpose}.`
    );
    setConnectTarget(loan);
  };

  return (
    <AppLayout
      title="Dashboard Người có vốn"
      subtitle={`Xin chào ${currentUser.fullName} • ${currentUser.university}`}
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Vốn khả dụng còn lại</span>
            <Wallet className="w-4 h-4 text-[#102F59]" />
          </div>
          <p className="text-2xl font-extrabold text-[#15803D]">
            {formatVND(totalAvailableCapital)}
          </p>
          <Link to="/app/capital" className="text-xs font-semibold text-[#102F59] hover:underline">
            Quản lý nguồn vốn ({myOffers.length}) →
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Vốn đã phân bổ</span>
            <Handshake className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-[#102F59]">
            {formatVND(totalAllocatedCapital)}
          </p>
          <p className="text-xs text-slate-500">
            Tổng đăng ký: {formatVND(totalRegisteredCapital)}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Đề xuất & Kết nối</span>
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-[#102F59]">
            {myConnections.length} kết nối
          </p>
          <p className="text-xs text-slate-500">
            Đề xuất đang xử lý:{' '}
            {
              myProposals.filter(
                (p) =>
                  p.status === 'Chờ người vay xác nhận' || p.status === 'Người vay đã đồng ý'
              ).length
            }
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Dự kiến thu hồi còn lại</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-indigo-700">{formatVND(expectedRecovery)}</p>
          <p className="text-xs text-slate-500">Bao gồm gốc & phí mô phỏng</p>
        </div>
      </div>

      {/* My Proposals (Two-sided confirmation workflow) */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-base font-bold text-[#102F59] flex items-center gap-2">
            <Handshake className="w-5 h-5 text-[#15803D]" />
            Đề xuất kết nối của tôi ({myProposals.length})
          </h2>
          <Link to="/app/contracts" className="text-xs font-semibold text-[#15803D] hover:underline">
            Xem hợp đồng dự thảo →
          </Link>
        </div>

        {myProposals.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            Bạn chưa gửi đề xuất kết nối nào.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {myProposals.map((prop) => (
              <div
                key={prop.id}
                className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-extrabold text-[#102F59]">{prop.code}</span>
                    <span className="text-xs text-slate-400">
                      • {prop.loanCode} • Nguồn: {prop.capitalCode}
                    </span>
                    <ProposalStatusBadge status={prop.status} />
                  </div>
                  <p className="text-sm font-bold text-[#102F59]">
                    Sinh viên: {prop.borrowerName} ({prop.university}) •{' '}
                    <span className="text-[#15803D]">{formatVND(prop.amount)}</span> ({prop.termMonths} tháng)
                  </p>
                  <p className="text-xs text-slate-500">{prop.conditionsNote}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {prop.status === 'Chờ người vay xác nhận' && (
                    <button
                      type="button"
                      onClick={() => setWithdrawTarget(prop)}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition"
                    >
                      Rút đề xuất
                    </button>
                  )}
                  {prop.status === 'Người vay đã đồng ý' && (
                    <button
                      type="button"
                      onClick={() => setConfirmFinalProp(prop)}
                      className="px-4 py-2 rounded-xl bg-[#15803D] hover:bg-emerald-800 text-white text-xs font-semibold transition"
                    >
                      Xác nhận bước cuối & Tạo hợp đồng
                    </button>
                  )}
                  {prop.status === 'Đã tạo hợp đồng dự thảo' && (
                    <Link
                      to="/app/contracts"
                      className="px-3.5 py-2 rounded-xl bg-[#102F59] text-white text-xs font-semibold hover:bg-[#18427a] transition"
                    >
                      Xem hợp đồng
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Filters & Smart Matching Marketplace */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-base font-bold text-[#102F59] flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#15803D]" />
            Tìm kiếm & Ghép nối thông minh ({filteredLoans.length})
          </h2>
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'match')}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white font-semibold text-[#102F59]"
            >
              <option value="match">Ưu tiên độ phù hợp cao nhất</option>
              <option value="newest">Mới đăng gần đây</option>
            </select>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setPurposeFilter('ALL');
                setGradeFilter('ALL');
                setTermFilter('ALL');
                setAmountFilter('ALL');
                setStatusFilter('Đang tìm người kết nối');
              }}
              className="text-xs font-semibold text-[#102F59] hover:underline"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã, tên SV, trường ĐH..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs"
            />
          </div>

          <select
            value={amountFilter}
            onChange={(e) => setAmountFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
          >
            <option value="ALL">Mọi mức vốn</option>
            <option value="UNDER_3M">Dưới 3 triệu</option>
            <option value="3M_TO_6M">3 – 6 triệu</option>
            <option value="OVER_6M">Trên 6 triệu</option>
          </select>

          <select
            value={purposeFilter}
            onChange={(e) => setPurposeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
          >
            <option value="ALL">Mọi mục đích</option>
            <option value="Học phí">Học phí</option>
            <option value="Thiết bị học tập">Thiết bị học tập</option>
            <option value="Sinh hoạt">Sinh hoạt</option>
            <option value="Chi phí khẩn cấp">Chi phí khẩn cấp</option>
          </select>

          <select
            value={termFilter}
            onChange={(e) => setTermFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
          >
            <option value="ALL">Mọi kỳ hạn</option>
            <option value="2">2 tháng</option>
            <option value="3">3 tháng</option>
            <option value="6">6 tháng</option>
            <option value="9">9 tháng</option>
            <option value="12">12 tháng</option>
          </select>

          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
          >
            <option value="ALL">Mọi tín nhiệm</option>
            <option value="A">Hạng A (Tốt)</option>
            <option value="B">Hạng B (Khá)</option>
            <option value="C">Hạng C (Xem xét)</option>
            <option value="D">Hạng D (Rủi ro cao)</option>
          </select>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Trạng thái:</span>
          {['Đang tìm người kết nối', 'ALL', 'Đang hoàn trả', 'Đã hoàn thành'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-full font-semibold transition ${
                statusFilter === st
                  ? 'bg-[#102F59] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : st}
            </button>
          ))}
        </div>

        {filteredLoans.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">
            Không có yêu cầu vay nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredLoans.map(({ loan, match }) => {
              const canConnect =
                loan.status === 'Đang tìm người kết nối' || loan.status === 'Chờ đánh giá';
              return (
                <div
                  key={loan.id}
                  className="rounded-2xl border border-[#E7E2D8] bg-[#FFFAF0] p-5 flex flex-col justify-between space-y-4 hover:border-[#102F59]/30 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#102F59]">{loan.code}</span>
                      <CreditBadge grade={loan.creditGrade} score={loan.creditScore} />
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#102F59]">{loan.borrowerName}</h3>
                      <p className="text-xs text-slate-500 truncate">{loan.university}</p>
                    </div>

                    {match.score > 0 && canConnect && (
                      <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-bold text-[#15803D]">
                          <span className="inline-flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" />
                            Độ phù hợp gợi ý
                          </span>
                          <span>{match.score}/100 điểm</span>
                        </div>
                        {match.reasons.length > 0 && (
                          <p className="text-[11px] text-emerald-800 line-clamp-2">
                            {match.reasons[0]}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-white p-3 border border-[#EBE6DC]">
                      <div>
                        <p className="text-[11px] text-slate-500">Số tiền cần vay</p>
                        <p className="text-sm font-extrabold text-[#15803D]">
                          {formatVND(loan.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500">Thời hạn</p>
                        <p className="text-sm font-bold text-[#102F59]">{loan.termMonths} tháng</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Mục đích: {loan.purpose}</span>
                      <StatusBadge status={loan.status} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-[#EBE6DC]">
                    <button
                      type="button"
                      onClick={() => setSelectedLoan(loan)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-[#102F59] hover:bg-slate-50 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Chi tiết
                    </button>
                    {canConnect && (
                      <button
                        type="button"
                        onClick={() => openProposeModal(loan)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#15803D] hover:bg-emerald-800 text-white text-xs font-semibold transition"
                      >
                        <Handshake className="w-3.5 h-3.5" />
                        Đề xuất kết nối
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Connection History */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-[#102F59]">
            Lịch sử kết nối đã xác nhận ({myConnections.length})
          </h2>
        </div>

        {myConnections.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Chưa có khoản kết nối nào hoàn tất xác nhận hai bên.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FFFAF0] text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <th className="py-3 px-4 font-semibold">Mã vay</th>
                  <th className="py-3 px-4 font-semibold">Sinh viên</th>
                  <th className="py-3 px-4 font-semibold">Số tiền gốc</th>
                  <th className="py-3 px-4 font-semibold">Đã thu hồi</th>
                  <th className="py-3 px-4 font-semibold">Ngày kết nối</th>
                  <th className="py-3 px-4 font-semibold">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {myConnections.map((conn) => (
                  <tr key={conn.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-bold text-[#102F59]">{conn.loanCode}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#102F59]">{conn.borrowerName}</p>
                      <p className="text-xs text-slate-500">{conn.university}</p>
                    </td>
                    <td className="py-3.5 px-4 font-semibold">{formatVND(conn.amount)}</td>
                    <td className="py-3.5 px-4 font-semibold text-[#15803D]">
                      {formatVND(conn.paidAmount)} / {formatVND(conn.totalRepayable)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{formatDate(conn.connectedAt)}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          conn.status === 'Đã hoàn thành'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}
                      >
                        {conn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Loan Detail Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-[#102F59]">{selectedLoan.code}</h3>
                  <CreditBadge grade={selectedLoan.creditGrade} score={selectedLoan.creditScore} />
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedLoan.borrowerName} • {selectedLoan.university}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLoan(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#FFFAF0] p-3.5 border border-[#EBE6DC]">
                <div>
                  <p className="text-xs text-slate-500">Số tiền cần vay</p>
                  <p className="text-base font-extrabold text-[#15803D]">
                    {formatVND(selectedLoan.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tổng dự kiến hoàn trả</p>
                  <p className="text-base font-extrabold text-[#102F59]">
                    {formatVND(
                      calculateTotalRepayable(
                        selectedLoan.amount,
                        selectedLoan.termMonths,
                        selectedLoan.simulatedMonthlyRate
                      )
                    )}
                  </p>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Mục đích:</span>
                <span className="font-semibold">{selectedLoan.purpose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời hạn:</span>
                <span className="font-semibold">{selectedLoan.termMonths} tháng</span>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Nguồn thu nhập / khả năng trả nợ:</p>
                <p className="text-xs font-semibold text-slate-800">{selectedLoan.incomeSource}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Mô tả nhu cầu:</p>
                <p className="text-xs text-slate-700 leading-relaxed">{selectedLoan.description}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setSelectedLoan(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700"
              >
                Đóng
              </button>
              {(selectedLoan.status === 'Đang tìm người kết nối' ||
                selectedLoan.status === 'Chờ đánh giá') && (
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedLoan;
                    setSelectedLoan(null);
                    openProposeModal(target);
                  }}
                  className="px-5 py-2 rounded-xl bg-[#15803D] hover:bg-emerald-800 text-white text-sm font-semibold"
                >
                  Đề xuất kết nối
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Propose Connection Modal with CapitalOffer selector */}
      <ConfirmModal
        open={Boolean(connectTarget)}
        title={`Gửi đề xuất kết nối ${connectTarget?.code}?`}
        description={`Đề xuất kết nối ${connectTarget ? formatVND(connectTarget.amount) : ''} tới sinh viên ${connectTarget?.borrowerName}. Sau khi gửi, sinh viên cần xác nhận đồng ý trước khi tạo hợp đồng dự thảo.`}
        confirmLabel="Gửi đề xuất kết nối"
        variant="success"
        onConfirm={() => {
          if (connectTarget) {
            proposeConnection(connectTarget.id, selectedOfferId || undefined, conditionsNote);
          }
          setConnectTarget(null);
        }}
        onCancel={() => setConnectTarget(null)}
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-semibold text-[#102F59] mb-1">
              Chọn nguồn vốn sử dụng
            </label>
            {myActiveOffers.length === 0 ? (
              <p className="text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                Bạn chưa có nguồn vốn khả dụng nào. Hãy vào mục{' '}
                <Link to="/app/capital" className="underline font-bold">
                  Nguồn vốn của tôi
                </Link>{' '}
                để đăng ký trước.
              </p>
            ) : (
              <select
                value={selectedOfferId}
                onChange={(e) => setSelectedOfferId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
              >
                {myActiveOffers.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.code} (Khả dụng: {formatVND(o.totalCapital - o.allocatedCapital)})
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block font-semibold text-[#102F59] mb-1">
              Điều kiện đề xuất mô phỏng
            </label>
            <textarea
              rows={2}
              value={conditionsNote}
              onChange={(e) => setConditionsNote(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>
        </div>
      </ConfirmModal>

      {/* Final Lender Confirmation Modal */}
      <ConfirmModal
        open={Boolean(confirmFinalProp)}
        title={`Xác nhận bước cuối ${confirmFinalProp?.code}?`}
        description={`Sinh viên ${confirmFinalProp?.borrowerName} đã đồng ý đề xuất. Khi bạn xác nhận, hệ thống sẽ phân bổ ${confirmFinalProp ? formatVND(confirmFinalProp.amount) : ''} từ ${confirmFinalProp?.capitalCode}, tạo Hợp đồng dự thảo và Lịch thanh toán.`}
        confirmLabel="Xác nhận & Tạo hợp đồng"
        variant="success"
        onConfirm={() => {
          if (confirmFinalProp) lenderConfirmProposal(confirmFinalProp.id);
          setConfirmFinalProp(null);
        }}
        onCancel={() => setConfirmFinalProp(null)}
      />

      {/* Withdraw Proposal Modal */}
      <ConfirmModal
        open={Boolean(withdrawTarget)}
        title={`Rút đề xuất ${withdrawTarget?.code}?`}
        description="Đề xuất sẽ được hủy bỏ và không gửi tới sinh viên nữa."
        confirmLabel="Rút đề xuất"
        variant="danger"
        onConfirm={() => {
          if (withdrawTarget) lenderWithdrawProposal(withdrawTarget.id);
          setWithdrawTarget(null);
        }}
        onCancel={() => setWithdrawTarget(null)}
      />
    </AppLayout>
  );
};
