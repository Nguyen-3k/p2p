import React, { useMemo, useState } from 'react';
import { FileCheck2, Info, Printer } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import { ContractStatusBadge } from '../components/Badges';
import { useApp } from '../context/AppContext';
import { formatDate, formatDateTime, formatVND } from '../utils/formatters';

export const ContractsPage: React.FC = () => {
  const { currentUser, contracts, installments } = useApp();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const visibleContracts = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'admin') return contracts;
    if (currentUser.role === 'lender')
      return contracts.filter((c) => c.lenderId === currentUser.id);
    return contracts.filter((c) => c.borrowerId === currentUser.id);
  }, [contracts, currentUser]);

  const activeContract =
    visibleContracts.find((c) => c.id === selectedId) ?? visibleContracts[0] ?? null;

  const contractInstallments = activeContract
    ? installments
        .filter((i) => i.connectionId === activeContract.connectionId)
        .sort((a, b) => a.installmentNumber - b.installmentNumber)
    : [];

  return (
    <AppLayout
      title="Hợp đồng dự thảo (Minh họa)"
      subtitle="Tài liệu thỏa thuận kết nối mô phỏng được tạo sau khi hai bên xác nhận"
    >
      <div className="rounded-xl border border-amber-200 bg-amber-50/90 text-amber-950 px-4 py-3 text-xs sm:text-sm flex items-start gap-2.5 no-print">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          Hợp đồng này chỉ là bản dự thảo minh họa phục vụ mục đích học tập và trình diễn mô hình Student P2P, không có giá trị pháp lý và không làm phát sinh nghĩa vụ giao dịch tiền thật.
        </p>
      </div>

      {visibleContracts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-10 text-center space-y-2">
          <FileCheck2 className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-base font-bold text-[#102F59]">Chưa có hợp đồng dự thảo nào</p>
          <p className="text-sm text-slate-500">
            Hợp đồng dự thảo sẽ tự động được tạo sau khi người có vốn và sinh viên hoàn tất xác nhận kết nối hai chiều.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left list */}
          <div className="lg:col-span-4 space-y-3 no-print">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Danh sách hợp đồng ({visibleContracts.length})
            </h2>
            {visibleContracts.map((ctr) => {
              const isSelected = activeContract?.id === ctr.id;
              return (
                <button
                  key={ctr.id}
                  type="button"
                  onClick={() => setSelectedId(ctr.id)}
                  className={`w-full text-left rounded-2xl border p-4 transition space-y-2 ${
                    isSelected
                      ? 'bg-white border-[#102F59] shadow-sm'
                      : 'bg-white/80 border-[#E7E2D8] hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-[#102F59]">{ctr.code}</span>
                    <ContractStatusBadge status={ctr.status} />
                  </div>
                  <p className="text-sm font-bold text-[#102F59]">
                    {ctr.borrowerName} ↔ {ctr.lenderName}
                  </p>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Mã vay: {ctr.loanCode}</span>
                    <strong className="text-[#15803D]">{formatVND(ctr.amount)}</strong>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Document View */}
          {activeContract && (
            <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E7E2D8] shadow-xs p-6 sm:p-10 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 no-print">
                <div className="flex items-center gap-2">
                  <ContractStatusBadge status={activeContract.status} />
                  <span className="text-xs text-slate-500">
                    Ngày tạo dự thảo: {formatDate(activeContract.createdAt)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#102F59] hover:bg-[#18427a] text-white text-xs font-semibold transition"
                >
                  <Printer className="w-4 h-4" />
                  In / Lưu PDF
                </button>
              </div>

              {/* Document Header */}
              <div className="text-center space-y-1.5 border-b border-slate-100 pb-5">
                <p className="text-xs font-bold uppercase tracking-widest text-[#15803D]">
                  STUDENT P2P • BẢN DỰ THẢO MINH HỌA
                </p>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#102F59]">
                  THỎA THUẬN KẾT NỐI TÀI CHÍNH NGANG HÀNG (DỰ THẢO)
                </h2>
                <p className="text-xs text-slate-500">
                  Mã hợp đồng: <strong>{activeContract.code}</strong> • Mã yêu cầu:{' '}
                  <strong>{activeContract.loanCode}</strong>
                </p>
              </div>

              {/* Two Parties */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="rounded-xl bg-[#FFFAF0] border border-[#EBE6DC] p-4 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                    BÊN A – SINH VIÊN (NGƯỜI VAY MÔ PHỎNG)
                  </p>
                  <p className="font-bold text-[#102F59]">{activeContract.borrowerName}</p>
                  <p className="text-slate-600">{activeContract.borrowerUniversity}</p>
                  {activeContract.borrowerStudentId && (
                    <p className="text-slate-500">Mã SV: {activeContract.borrowerStudentId}</p>
                  )}
                </div>

                <div className="rounded-xl bg-[#FFFAF0] border border-[#EBE6DC] p-4 space-y-1.5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#15803D]">
                    BÊN B – NGƯỜI CÓ VỐN (MÔ PHỎNG)
                  </p>
                  <p className="font-bold text-[#102F59]">{activeContract.lenderName}</p>
                  <p className="text-slate-600">Thành viên tham gia kết nối Student P2P</p>
                </div>
              </div>

              {/* Loan Terms Table */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#102F59]">1. Thông tin khoản kết nối mô phỏng</h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden text-xs sm:text-sm">
                  <div className="grid grid-cols-2 border-b border-slate-100 px-4 py-2.5">
                    <span className="text-slate-500">Số tiền kết nối</span>
                    <strong className="text-right text-[#102F59]">
                      {formatVND(activeContract.amount)}
                    </strong>
                  </div>
                  <div className="grid grid-cols-2 border-b border-slate-100 px-4 py-2.5 bg-slate-50/50">
                    <span className="text-slate-500">Kỳ hạn hoàn trả</span>
                    <strong className="text-right">{activeContract.termMonths} tháng</strong>
                  </div>
                  <div className="grid grid-cols-2 border-b border-slate-100 px-4 py-2.5">
                    <span className="text-slate-500">Mức phí/lãi suất mô phỏng</span>
                    <strong className="text-right">
                      {(activeContract.simulatedMonthlyRate * 100).toFixed(1)}%/tháng
                    </strong>
                  </div>
                  <div className="grid grid-cols-2 border-b border-slate-100 px-4 py-2.5 bg-slate-50/50">
                    <span className="text-slate-500">Số tiền dự kiến mỗi kỳ</span>
                    <strong className="text-right">
                      {formatVND(activeContract.installmentAmount)}
                    </strong>
                  </div>
                  <div className="grid grid-cols-2 px-4 py-2.5">
                    <span className="text-slate-500">Tổng số tiền dự kiến hoàn trả</span>
                    <strong className="text-right text-[#15803D]">
                      {formatVND(activeContract.totalRepayable)}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Schedule */}
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-[#102F59]">2. Lịch thanh toán dự kiến</h3>
                {contractInstallments.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <div className="grid grid-cols-3 bg-[#FFFAF0] font-bold text-slate-600 px-4 py-2 border-b border-slate-200">
                      <span>Kỳ</span>
                      <span>Ngày dự kiến</span>
                      <span className="text-right">Số tiền</span>
                    </div>
                    {contractInstallments.map((inst) => (
                      <div
                        key={inst.id}
                        className="grid grid-cols-3 px-4 py-2 border-b last:border-b-0 border-slate-100"
                      >
                        <span>Kỳ {inst.installmentNumber}</span>
                        <span>{formatDate(inst.dueDate)}</span>
                        <span className="text-right font-semibold">{formatVND(inst.amount)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Ngày dự kiến thanh toán kỳ đầu: {formatDate(activeContract.firstDueDate)}.
                  </p>
                )}
              </div>

              {/* Confirmation Signatures */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200 text-xs">
                <div className="rounded-xl border border-slate-200 p-4 space-y-1 text-center">
                  <p className="font-bold text-[#102F59]">XÁC NHẬN CỦA BÊN A (SINH VIÊN)</p>
                  <p className="text-[#15803D] font-semibold">Đã đồng ý điều kiện mô phỏng</p>
                  {activeContract.borrowerConfirmedAt && (
                    <p className="text-slate-400">
                      {formatDateTime(activeContract.borrowerConfirmedAt)}
                    </p>
                  )}
                </div>
                <div className="rounded-xl border border-slate-200 p-4 space-y-1 text-center">
                  <p className="font-bold text-[#102F59]">XÁC NHẬN CỦA BÊN B (NGƯỜI CÓ VỐN)</p>
                  <p className="text-[#15803D] font-semibold">Đã xác nhận kết nối mô phỏng</p>
                  {activeContract.lenderConfirmedAt && (
                    <p className="text-slate-400">
                      {formatDateTime(activeContract.lenderConfirmedAt)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </AppLayout>
  );
};
