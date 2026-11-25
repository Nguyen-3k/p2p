import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  CalendarClock,
  CheckCircle2,
  Clock,
  Edit3,
  Eye,
  Plus,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import { CreditBadge, StatusBadge } from '../components/Badges';
import { ConfirmModal } from '../components/ConfirmModal';
import { useApp } from '../context/AppContext';
import type { LoanPackageType, LoanPurpose, LoanRequest } from '../types';
import {
  calculateTotalRepayable,
  formatDate,
  formatVND,
  LOAN_PACKAGES,
} from '../utils/formatters';

const PURPOSES: LoanPurpose[] = [
  'Học phí',
  'Thiết bị học tập',
  'Sinh hoạt',
  'Chi phí khẩn cấp',
  'Khác',
];

export const BorrowerDashboard: React.FC = () => {
  const {
    currentUser,
    loanRequests,
    connections,
    installments,
    creditScores,
    createLoanRequest,
    updateLoanRequest,
    cancelLoanRequest,
    simulateRepayment,
  } = useApp();

  const [createOpen, setCreateOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<LoanRequest | null>(null);
  const [detailLoan, setDetailLoan] = useState<LoanRequest | null>(null);
  const [cancelTarget, setCancelTarget] = useState<LoanRequest | null>(null);
  const [payTargetId, setPayTargetId] = useState<string | null>(null);

  // Form state
  const [packageType, setPackageType] = useState<LoanPackageType>('tuition_equipment');
  const [purpose, setPurpose] = useState<LoanPurpose>('Học phí');
  const [amount, setAmount] = useState('4000000');
  const [termMonths, setTermMonths] = useState('6');
  const [description, setDescription] = useState('');
  const [incomeSource, setIncomeSource] = useState('');
  const [university, setUniversity] = useState(currentUser?.university ?? '');
  const [formError, setFormError] = useState('');

  if (!currentUser) return null;

  const myLoans = loanRequests.filter((l) => l.borrowerId === currentUser.id);
  const myConnections = connections.filter((c) => c.borrowerId === currentUser.id);
  const myScore = creditScores[currentUser.id];

  const activeLoans = myLoans.filter(
    (l) => l.status === 'Đang hoàn trả' || l.status === 'Đã tìm được kết nối'
  );
  const pendingLoans = myLoans.filter(
    (l) => l.status === 'Đang tìm người kết nối' || l.status === 'Chờ đánh giá'
  );
  const completedLoans = myLoans.filter((l) => l.status === 'Đã hoàn thành');
  const totalPaid = myConnections.reduce((sum, c) => sum + c.paidAmount, 0);

  const upcomingInstallment = installments
    .filter(
      (i) =>
        i.status === 'Chưa thanh toán' &&
        myConnections.some((c) => c.id === i.connectionId)
    )
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  const openCreateModal = () => {
    setEditingLoan(null);
    setPackageType('tuition_equipment');
    setPurpose('Học phí');
    setAmount('4000000');
    setTermMonths('6');
    setDescription('');
    setIncomeSource(
      currentUser.monthlyIncome
        ? `Thu nhập / trợ cấp ${formatVND(currentUser.monthlyIncome)}/tháng`
        : ''
    );
    setUniversity(currentUser.university);
    setFormError('');
    setCreateOpen(true);
  };

  const openEditModal = (loan: LoanRequest) => {
    setEditingLoan(loan);
    setPackageType(loan.packageType);
    setPurpose(loan.purpose);
    setAmount(String(loan.amount));
    setTermMonths(String(loan.termMonths));
    setDescription(loan.description);
    setIncomeSource(loan.incomeSource);
    setUniversity(loan.university);
    setFormError('');
    setCreateOpen(true);
  };

  const handlePackageChange = (pkg: LoanPackageType) => {
    setPackageType(pkg);
    if (pkg === 'tuition_equipment') {
      setAmount('4000000');
      setTermMonths('6');
    } else {
      setAmount('1500000');
      setTermMonths('3');
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const numAmount = Number(amount);
    const numTerm = Number(termMonths);
    if (!numAmount || numAmount <= 0) {
      setFormError('Vui lòng nhập số tiền vay hợp lệ.');
      return;
    }
    if (!description.trim() || !incomeSource.trim()) {
      setFormError('Vui lòng nhập mô tả nhu cầu và nguồn thu nhập/khả năng hoàn trả.');
      return;
    }

    if (editingLoan) {
      const res = updateLoanRequest(editingLoan.id, {
        amount: numAmount,
        termMonths: numTerm,
        purpose,
        description,
        incomeSource,
      });
      if (!res.ok) {
        setFormError(res.error ?? 'Không thể cập nhật yêu cầu.');
        return;
      }
      setCreateOpen(false);
    } else {
      const res = createLoanRequest({
        packageType,
        purpose,
        amount: numAmount,
        termMonths: numTerm,
        description,
        incomeSource,
        university,
      });
      if (!res.ok) {
        setFormError(res.error ?? 'Không thể tạo yêu cầu.');
        return;
      }
      setCreateOpen(false);
    }
  };

  const pkgInfo = LOAN_PACKAGES[packageType];

  return (
    <AppLayout
      title="Dashboard Sinh viên (Người vay)"
      subtitle={`Xin chào ${currentUser.fullName} • ${currentUser.university}`}
    >
      {/* Top Actions & Credit Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-[#E7E2D8] p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#0F2544] text-amber-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-[#0F2544]">Điểm tín nhiệm mô phỏng:</span>
              {myScore && <CreditBadge grade={myScore.grade} score={myScore.score} />}
            </div>
            <Link
              to="/app/credit-score"
              className="text-xs font-semibold text-[#15803D] hover:underline mt-1 inline-block"
            >
              Xem phân tích 5 tiêu chí & cải thiện hồ sơ →
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F2544] hover:bg-[#16335B] text-white text-sm font-semibold transition shadow-xs"
        >
          <Plus className="w-4 h-4" />
          Tạo yêu cầu vay vốn
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Khoản vay đang hoàn trả</span>
            <Wallet className="w-4 h-4 text-[#0F2544]" />
          </div>
          <p className="text-2xl font-extrabold text-[#0F2544]">{activeLoans.length}</p>
          <p className="text-xs text-slate-500">
            Tổng giá trị: {formatVND(activeLoans.reduce((s, l) => s + l.amount, 0))}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Tổng đã hoàn trả (mô phỏng)</span>
            <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
          </div>
          <p className="text-2xl font-extrabold text-[#15803D]">{formatVND(totalPaid)}</p>
          <p className="text-xs text-slate-500">Đã hoàn thành: {completedLoans.length} khoản</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Đang chờ kết nối</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600">{pendingLoans.length}</p>
          <p className="text-xs text-slate-500">Đang hiển thị tới người có vốn</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Lịch thanh toán sắp tới</span>
            <CalendarClock className="w-4 h-4 text-indigo-600" />
          </div>
          {upcomingInstallment ? (
            <>
              <p className="text-xl font-extrabold text-[#0F2544]">
                {formatVND(upcomingInstallment.amount)}
              </p>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500">
                  Hạn: {formatDate(upcomingInstallment.dueDate)}
                </span>
                <button
                  type="button"
                  onClick={() => setPayTargetId(upcomingInstallment.loanRequestId)}
                  className="text-xs font-bold text-[#15803D] hover:underline"
                >
                  Thanh toán →
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-lg font-bold text-slate-400">Không có kỳ hạn</p>
              <p className="text-xs text-slate-400">Chưa có lịch thanh toán sắp tới</p>
            </>
          )}
        </div>
      </div>

      {/* Loan Requests List */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-[#0F2544]">
            Danh sách yêu cầu vay của tôi ({myLoans.length})
          </h2>
          <Link to="/app/loans" className="text-xs font-semibold text-[#15803D] hover:underline">
            Xem lịch thanh toán chi tiết →
          </Link>
        </div>

        {myLoans.length === 0 ? (
          <div className="p-10 text-center space-y-3">
            <p className="text-sm text-slate-500">Bạn chưa có yêu cầu vay vốn mô phỏng nào.</p>
            <button
              type="button"
              onClick={openCreateModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F2544] text-white text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              Tạo yêu cầu đầu tiên
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F3] text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <th className="py-3 px-4 font-semibold">Mã yêu cầu</th>
                  <th className="py-3 px-4 font-semibold">Mục đích</th>
                  <th className="py-3 px-4 font-semibold">Số tiền</th>
                  <th className="py-3 px-4 font-semibold">Thời hạn</th>
                  <th className="py-3 px-4 font-semibold">Trạng thái</th>
                  <th className="py-3 px-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {myLoans.map((loan) => {
                  const canModify =
                    loan.status === 'Chờ đánh giá' || loan.status === 'Đang tìm người kết nối';
                  const isRepaying = loan.status === 'Đang hoàn trả';
                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 font-bold text-[#0F2544]">{loan.code}</td>
                      <td className="py-3.5 px-4 text-slate-700">{loan.purpose}</td>
                      <td className="py-3.5 px-4 font-semibold text-[#0F2544]">
                        {formatVND(loan.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{loan.termMonths} tháng</td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={loan.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setDetailLoan(loan)}
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {canModify && (
                            <>
                              <button
                                type="button"
                                onClick={() => openEditModal(loan)}
                                className="p-1.5 rounded-lg border border-slate-200 text-sky-700 hover:bg-sky-50"
                                title="Chỉnh sửa yêu cầu"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setCancelTarget(loan)}
                                className="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50"
                                title="Hủy yêu cầu"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {isRepaying && (
                            <button
                              type="button"
                              onClick={() => setPayTargetId(loan.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-[#15803D] hover:bg-emerald-800 text-white text-xs font-semibold transition"
                            >
                              Mô phỏng thanh toán
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#0F2544]">
                {editingLoan ? `Chỉnh sửa ${editingLoan.code}` : 'Tạo yêu cầu vay vốn (Mô phỏng)'}
              </h3>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="mt-4 space-y-4">
              {formError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs text-rose-800">
                  {formError}
                </div>
              )}

              {!editingLoan && (
                <div>
                  <label className="block text-xs font-semibold text-[#0F2544] mb-1.5">
                    Chọn gói hỗ trợ dự kiến
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {Object.values(LOAN_PACKAGES).map((pkg) => (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => handlePackageChange(pkg.id)}
                        className={`p-3 rounded-xl border text-left transition ${
                          packageType === pkg.id
                            ? 'border-[#0F2544] bg-[#0F2544]/5'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <p className="text-xs font-bold text-[#0F2544]">{pkg.shortName}</p>
                        <p className="text-[11px] text-[#15803D] font-semibold mt-0.5">
                          {formatVND(pkg.minAmount)} – {formatVND(pkg.maxAmount)}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#0F2544] mb-1">
                    Số tiền muốn vay (đ)
                  </label>
                  <input
                    type="number"
                    step="100000"
                    min={pkgInfo.minAmount}
                    max={pkgInfo.maxAmount}
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Giới hạn: {formatVND(pkgInfo.minAmount)} – {formatVND(pkgInfo.maxAmount)}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F2544] mb-1">
                    Thời hạn dự kiến
                  </label>
                  <select
                    value={termMonths}
                    onChange={(e) => setTermMonths(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    {pkgInfo.defaultTerms.map((t) => (
                      <option key={t} value={t}>
                        {t} tháng
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#0F2544] mb-1">
                    Mục đích vay
                  </label>
                  <select
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value as LoanPurpose)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                  >
                    {PURPOSES.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#0F2544] mb-1">
                    Trường học
                  </label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2544] mb-1">
                  Nguồn thu nhập / khả năng hoàn trả *
                </label>
                <input
                  type="text"
                  value={incomeSource}
                  onChange={(e) => setIncomeSource(e.target.value)}
                  placeholder="VD: Gia sư part-time 3.500.000 đ/tháng + trợ cấp gia đình"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#0F2544] mb-1">
                  Mô tả nhu cầu chi tiết *
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Trình bày ngắn gọn lý do và kế hoạch hoàn trả..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="rounded-xl bg-[#FAF8F3] border border-[#EBE6DC] p-3 text-xs text-slate-700 flex items-center justify-between">
                <span>Tổng hoàn trả dự kiến (mô phỏng {(pkgInfo.simulatedMonthlyRate * 100).toFixed(1)}%/tháng):</span>
                <strong className="text-[#0F2544] text-sm">
                  {formatVND(
                    calculateTotalRepayable(
                      Number(amount) || 0,
                      Number(termMonths) || 1,
                      pkgInfo.simulatedMonthlyRate
                    )
                  )}
                </strong>
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0F2544] hover:bg-[#16335B] text-white text-sm font-semibold"
                >
                  {editingLoan ? 'Lưu thay đổi' : 'Gửi yêu cầu mô phỏng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#0F2544]">{detailLoan.code}</h3>
                <p className="text-xs text-slate-500">Ngày tạo: {formatDate(detailLoan.createdAt)}</p>
              </div>
              <StatusBadge status={detailLoan.status} />
            </div>

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Số tiền vay:</span>
                <strong className="text-[#0F2544]">{formatVND(detailLoan.amount)}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Mục đích:</span>
                <span className="font-medium">{detailLoan.purpose}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Thời hạn:</span>
                <span className="font-medium">{detailLoan.termMonths} tháng</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tín nhiệm mô phỏng:</span>
                <CreditBadge grade={detailLoan.creditGrade} score={detailLoan.creditScore} />
              </div>
              <div className="pt-2 border-t border-slate-100">
                <p className="text-xs text-slate-500 mb-1">Nguồn thu nhập:</p>
                <p className="text-xs font-medium text-slate-800">{detailLoan.incomeSource}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Mô tả nhu cầu:</p>
                <p className="text-xs text-slate-700 leading-relaxed">{detailLoan.description}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setDetailLoan(null)}
                className="px-4 py-2 rounded-xl bg-[#0F2544] text-white text-sm font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirm */}
      <ConfirmModal
        open={Boolean(cancelTarget)}
        title={`Hủy yêu cầu ${cancelTarget?.code}?`}
        description="Yêu cầu sẽ chuyển sang trạng thái Đã hủy và không còn hiển thị cho người có vốn."
        confirmLabel="Xác nhận hủy"
        variant="danger"
        onConfirm={() => {
          if (cancelTarget) cancelLoanRequest(cancelTarget.id);
          setCancelTarget(null);
        }}
        onCancel={() => setCancelTarget(null)}
      />

      {/* Simulate Payment Confirm */}
      <ConfirmModal
        open={Boolean(payTargetId)}
        title="Xác nhận mô phỏng thanh toán kỳ hạn"
        description="Hệ thống sẽ ghi nhận thanh toán mô phỏng cho kỳ tiếp theo, cập nhật số dư còn lại và gửi thông báo tới cả hai phía (không phát sinh giao dịch tiền thật)."
        confirmLabel="Mô phỏng thanh toán"
        variant="success"
        onConfirm={() => {
          if (payTargetId) simulateRepayment(payTargetId);
          setPayTargetId(null);
        }}
        onCancel={() => setPayTargetId(null)}
      />
    </AppLayout>
  );
};
