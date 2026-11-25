import React, { useMemo, useState } from 'react';
import { Calendar, CheckCircle2, CreditCard, History } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import { ConfirmModal } from '../components/ConfirmModal';
import { useApp } from '../context/AppContext';
import { formatDate, formatDateTime, formatVND } from '../utils/formatters';

export const LoansManagementPage: React.FC = () => {
  const { currentUser, connections, installments, repayments, simulateRepayment } = useApp();
  const [selectedConnId, setSelectedConnId] = useState<string | null>(null);
  const [payModal, setPayModal] = useState<{ loanRequestId: string; installmentId: string; label: string } | null>(null);

  const visibleConnections = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return connections;
    if (currentUser.role === 'lender')
      return connections.filter((c) => c.lenderId === currentUser.id);
    return connections.filter((c) => c.borrowerId === currentUser.id);
  }, [connections, currentUser]);

  const activeConn =
    visibleConnections.find((c) => c.id === selectedConnId) ?? visibleConnections[0] ?? null;

  const connInstallments = activeConn
    ? installments
        .filter((i) => i.connectionId === activeConn.id)
        .sort((a, b) => a.installmentNumber - b.installmentNumber)
    : [];

  const connRepayments = activeConn
    ? repayments.filter((r) => r.connectionId === activeConn.id)
    : [];

  return (
    <AppLayout
      title="Quản lý khoản vay & Lịch hoàn trả"
      subtitle="Theo dõi tiến độ thanh toán và lịch sử giao dịch"
    >
      {visibleConnections.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-10 text-center space-y-2">
          <p className="text-base font-bold text-[#0F2544]">Chưa có khoản vay nào được kết nối</p>
          <p className="text-sm text-slate-500">
            Khi một yêu cầu vay được người có vốn đề xuất kết nối, lịch thanh toán và tiến độ hoàn trả sẽ hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left list of connected loans */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 px-1">
              Danh sách khoản kết nối ({visibleConnections.length})
            </h2>
            {visibleConnections.map((conn) => {
              const pct = Math.min(
                100,
                Math.round((conn.paidAmount / conn.totalRepayable) * 100)
              );
              const isSelected = activeConn?.id === conn.id;
              return (
                <button
                  key={conn.id}
                  type="button"
                  onClick={() => setSelectedConnId(conn.id)}
                  className={`w-full text-left rounded-2xl border p-4 transition space-y-3 ${
                    isSelected
                      ? 'bg-white border-[#0F2544] shadow-sm'
                      : 'bg-white/80 border-[#E7E2D8] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#0F2544]">{conn.loanCode}</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        conn.status === 'Đã hoàn thành'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-indigo-50 text-indigo-700'
                      }`}
                    >
                      {conn.status}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-[#0F2544]">
                      {conn.borrowerName} ↔ {conn.lenderName}
                    </p>
                    <p className="text-xs text-slate-500">
                      {conn.purpose} • {conn.termMonths} tháng
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Tiến độ hoàn trả</span>
                      <span className="text-[#15803D]">{pct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#15803D] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>Đã trả: {formatVND(conn.paidAmount)}</span>
                      <span>Tổng: {formatVND(conn.totalRepayable)}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right detail view */}
          {activeConn && (
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-2xl border border-[#E7E2D8] p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#0F2544]">
                      Chi tiết khoản vay {activeConn.loanCode}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Kết nối ngày {formatDate(activeConn.connectedAt)} • {activeConn.university}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Số tiền còn lại</p>
                    <p className="text-lg font-extrabold text-[#0F2544]">
                      {formatVND(Math.max(0, activeConn.totalRepayable - activeConn.paidAmount))}
                    </p>
                  </div>
                </div>

                {/* Summary bar */}
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-[#FAF8F3] p-3 border border-[#EBE6DC]">
                    <p className="text-[11px] text-slate-500">Gốc kết nối</p>
                    <p className="text-sm font-bold text-[#0F2544] mt-0.5">
                      {formatVND(activeConn.amount)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#FAF8F3] p-3 border border-[#EBE6DC]">
                    <p className="text-[11px] text-slate-500">Tổng phải trả</p>
                    <p className="text-sm font-bold text-[#0F2544] mt-0.5">
                      {formatVND(activeConn.totalRepayable)}
                    </p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-3 border border-emerald-200">
                    <p className="text-[11px] text-emerald-700">Đã hoàn trả</p>
                    <p className="text-sm font-bold text-[#15803D] mt-0.5">
                      {formatVND(activeConn.paidAmount)}
                    </p>
                  </div>
                </div>

                {/* Installment Schedule */}
                <div className="space-y-2.5 pt-2">
                  <h4 className="text-sm font-bold text-[#0F2544] flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#15803D]" />
                    Lịch thanh toán theo kỳ
                  </h4>

                  {connInstallments.length === 0 ? (
                    <p className="text-xs text-slate-500 py-2">
                      Khoản vay đã hoàn thành trước khi tạo lịch kỳ chi tiết.
                    </p>
                  ) : (
                    <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl overflow-hidden">
                      {connInstallments.map((inst) => (
                        <div
                          key={inst.id}
                          className="flex items-center justify-between gap-3 px-4 py-3 bg-white text-xs sm:text-sm"
                        >
                          <div>
                            <p className="font-bold text-[#0F2544]">
                              Kỳ {inst.installmentNumber}/{activeConn.termMonths}
                            </p>
                            <p className="text-xs text-slate-500">
                              Hạn dự kiến: {formatDate(inst.dueDate)}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-bold text-[#0F2544]">
                              {formatVND(inst.amount)}
                            </span>
                            {inst.status === 'Đã thanh toán' ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Đã trả
                              </span>
                            ) : currentUser?.role === 'borrower' || currentUser?.role === 'admin' ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setPayModal({
                                    loanRequestId: activeConn.loanRequestId,
                                    installmentId: inst.id,
                                    label: `Kỳ ${inst.installmentNumber}/${activeConn.termMonths} (${formatVND(inst.amount)})`,
                                  })
                                }
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#15803D] hover:bg-emerald-800 text-white text-xs font-semibold transition"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                Mô phỏng thanh toán
                              </button>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-medium">
                                Chưa đến hạn / Chờ trả
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Repayment History */}
              <div className="bg-white rounded-2xl border border-[#E7E2D8] p-6 space-y-3">
                <h4 className="text-sm font-bold text-[#0F2544] flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-500" />
                  Lịch sử thanh toán mô phỏng ({connRepayments.length})
                </h4>
                {connRepayments.length === 0 ? (
                  <p className="text-xs text-slate-500">Chưa có giao dịch thanh toán mô phỏng nào.</p>
                ) : (
                  <div className="space-y-2">
                    {connRepayments.map((rep) => (
                      <div
                        key={rep.id}
                        className="flex items-center justify-between rounded-xl bg-[#FAF8F3] px-4 py-2.5 border border-[#EBE6DC] text-xs"
                      >
                        <div>
                          <p className="font-semibold text-[#0F2544]">{rep.note}</p>
                          <p className="text-slate-500">{formatDateTime(rep.paidAt)}</p>
                        </div>
                        <span className="font-bold text-[#15803D]">{formatVND(rep.amount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <ConfirmModal
        open={Boolean(payModal)}
        title="Xác nhận mô phỏng thanh toán"
        description={`Bạn đang mô phỏng thanh toán ${payModal?.label}. Số dư đã trả và còn lại sẽ được cập nhật ngay lập tức (không phát sinh giao dịch tiền thật).`}
        confirmLabel="Xác nhận thanh toán mô phỏng"
        variant="success"
        onConfirm={() => {
          if (payModal) simulateRepayment(payModal.loanRequestId, payModal.installmentId);
          setPayModal(null);
        }}
        onCancel={() => setPayModal(null)}
      />
    </AppLayout>
  );
};
