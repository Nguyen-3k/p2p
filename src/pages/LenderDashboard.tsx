import React, { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  Filter,
  Handshake,
  Search,
  TrendingUp,
  Wallet,
  X,
} from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import { CreditBadge, StatusBadge } from '../components/Badges';
import { ConfirmModal } from '../components/ConfirmModal';
import { useApp } from '../context/AppContext';
import type { CreditGrade, LoanPurpose, LoanRequest, LoanStatus } from '../types';
import { calculateTotalRepayable, formatDate, formatVND } from '../utils/formatters';

export const LenderDashboard: React.FC = () => {
  const { currentUser, loanRequests, connections, proposeConnection } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [purposeFilter, setPurposeFilter] = useState<string>('ALL');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('Đang tìm người kết nối');
  const [amountFilter, setAmountFilter] = useState<string>('ALL');

  const [selectedLoan, setSelectedLoan] = useState<LoanRequest | null>(null);
  const [connectTarget, setConnectTarget] = useState<LoanRequest | null>(null);

  const myConnections = useMemo(
    () => connections.filter((c) => c.lenderId === currentUser?.id),
    [connections, currentUser?.id]
  );

  const filteredLoans = useMemo(() => {
    return loanRequests.filter((l) => {
      if (statusFilter !== 'ALL' && l.status !== (statusFilter as LoanStatus)) return false;
      if (purposeFilter !== 'ALL' && l.purpose !== (purposeFilter as LoanPurpose)) return false;
      if (gradeFilter !== 'ALL' && l.creditGrade !== (gradeFilter as CreditGrade)) return false;
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
    });
  }, [loanRequests, statusFilter, purposeFilter, gradeFilter, amountFilter, searchTerm]);

  if (!currentUser) return null;

  const totalSimulatedCapital = currentUser.simulatedCapital ?? 50_000_000;
  const activeConnectedCapital = myConnections
    .filter((c) => c.status === 'Đang hoạt động')
    .reduce((sum, c) => sum + c.amount, 0);
  const expectedRecovery = myConnections.reduce(
    (sum, c) => sum + Math.max(0, c.totalRepayable - c.paidAmount),
    0
  );

  return (
    <AppLayout
      title="Dashboard Người có vốn"
      subtitle={`Xin chào ${currentUser.fullName} • ${currentUser.university}`}
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Tổng vốn mô phỏng</span>
            <Wallet className="w-4 h-4 text-[#0F2544]" />
          </div>
          <p className="text-2xl font-extrabold text-[#0F2544]">
            {formatVND(totalSimulatedCapital)}
          </p>
          <p className="text-xs text-slate-500">Hạn mức giả lập trải nghiệm</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Vốn đang kết nối</span>
            <Handshake className="w-4 h-4 text-[#15803D]" />
          </div>
          <p className="text-2xl font-extrabold text-[#15803D]">
            {formatVND(activeConnectedCapital)}
          </p>
          <p className="text-xs text-slate-500">Không phát sinh chuyển tiền thật</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Số yêu cầu đã kết nối</span>
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-[#0F2544]">{myConnections.length}</p>
          <p className="text-xs text-slate-500">
            Hoàn thành: {myConnections.filter((c) => c.status === 'Đã hoàn thành').length} khoản
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

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-base font-bold text-[#0F2544] flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#15803D]" />
            Danh sách nhu cầu vay vốn sinh viên ({filteredLoans.length})
          </h2>
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              setPurposeFilter('ALL');
              setGradeFilter('ALL');
              setAmountFilter('ALL');
              setStatusFilter('Đang tìm người kết nối');
            }}
            className="text-xs font-semibold text-[#0F2544] hover:underline"
          >
            Đặt lại bộ lọc
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã, tên SV, trường..."
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
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
          >
            <option value="ALL">Mọi mức tín nhiệm</option>
            <option value="A">Hạng A (Tốt)</option>
            <option value="B">Hạng B (Khá)</option>
            <option value="C">Hạng C (Xem xét)</option>
            <option value="D">Hạng D (Rủi ro cao)</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white"
          >
            <option value="Đang tìm người kết nối">Đang tìm người kết nối</option>
            <option value="ALL">Tất cả trạng thái</option>
            <option value="Đang hoàn trả">Đang hoàn trả</option>
            <option value="Đã hoàn thành">Đã hoàn thành</option>
          </select>
        </div>

        {filteredLoans.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">
            Không có yêu cầu vay nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {filteredLoans.map((loan) => {
              const canConnect =
                loan.status === 'Đang tìm người kết nối' || loan.status === 'Chờ đánh giá';
              return (
                <div
                  key={loan.id}
                  className="rounded-2xl border border-[#E7E2D8] bg-[#FAF8F3] p-5 flex flex-col justify-between space-y-4 hover:border-[#0F2544]/30 transition"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#0F2544]">{loan.code}</span>
                      <CreditBadge grade={loan.creditGrade} score={loan.creditScore} />
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#0F2544]">{loan.borrowerName}</h3>
                      <p className="text-xs text-slate-500 truncate">{loan.university}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 rounded-xl bg-white p-3 border border-[#EBE6DC]">
                      <div>
                        <p className="text-[11px] text-slate-500">Số tiền cần vay</p>
                        <p className="text-sm font-extrabold text-[#15803D]">
                          {formatVND(loan.amount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] text-slate-500">Thời hạn</p>
                        <p className="text-sm font-bold text-[#0F2544]">{loan.termMonths} tháng</p>
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
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-[#0F2544] hover:bg-slate-50 transition"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Chi tiết
                    </button>
                    {canConnect && (
                      <button
                        type="button"
                        onClick={() => setConnectTarget(loan)}
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
          <h2 className="text-base font-bold text-[#0F2544]">
            Lịch sử kết nối của tôi ({myConnections.length})
          </h2>
        </div>

        {myConnections.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Bạn chưa thực hiện kết nối mô phỏng nào. Hãy chọn một yêu cầu phía trên để trải nghiệm!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F3] text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
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
                    <td className="py-3.5 px-4 font-bold text-[#0F2544]">{conn.loanCode}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#0F2544]">{conn.borrowerName}</p>
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
                  <h3 className="text-lg font-bold text-[#0F2544]">{selectedLoan.code}</h3>
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
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-[#FAF8F3] p-3.5 border border-[#EBE6DC]">
                <div>
                  <p className="text-xs text-slate-500">Số tiền cần vay</p>
                  <p className="text-base font-extrabold text-[#15803D]">
                    {formatVND(selectedLoan.amount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Tổng dự kiến hoàn trả</p>
                  <p className="text-base font-extrabold text-[#0F2544]">
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
                    setConnectTarget(target);
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

      {/* Propose Connection Confirm */}
      <ConfirmModal
        open={Boolean(connectTarget)}
        title={`Xác nhận đề xuất kết nối ${connectTarget?.code}?`}
        description={`Bạn đang thực hiện kết nối mô phỏng với sinh viên ${connectTarget?.borrowerName} cho khoản vay ${connectTarget ? formatVND(connectTarget.amount) : ''}. Hành động này chỉ mô phỏng kết nối và tạo lịch hoàn trả mẫu, không phát sinh giao dịch tiền thật.`}
        confirmLabel="Xác nhận kết nối mô phỏng"
        variant="success"
        onConfirm={() => {
          if (connectTarget) proposeConnection(connectTarget.id);
          setConnectTarget(null);
        }}
        onCancel={() => setConnectTarget(null)}
      />
    </AppLayout>
  );
};
