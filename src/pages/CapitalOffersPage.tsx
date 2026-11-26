import React, { useState } from 'react';
import { PauseCircle, PlayCircle, Plus, Wallet, X } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import { CapitalStatusBadge } from '../components/Badges';
import { useApp } from '../context/AppContext';
import type { LoanPurpose } from '../types';
import { formatDate, formatVND } from '../utils/formatters';

const ALL_PURPOSES: LoanPurpose[] = [
  'Học phí',
  'Thiết bị học tập',
  'Sinh hoạt',
  'Chi phí khẩn cấp',
  'Khác',
];

const ALL_TERMS = [1, 2, 3, 4, 6, 9, 12];

export const CapitalOffersPage: React.FC = () => {
  const { currentUser, capitalOffers, connections, createCapitalOffer, toggleCapitalOfferStatus } =
    useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [totalCapital, setTotalCapital] = useState('15000000');
  const [minPerLoan, setMinPerLoan] = useState('1000000');
  const [maxPerLoan, setMaxPerLoan] = useState('8000000');
  const [supportedTerms, setSupportedTerms] = useState<number[]>([3, 6, 9]);
  const [expectedRate, setExpectedRate] = useState('0.8');
  const [supportedPurposes, setSupportedPurposes] = useState<LoanPurpose[]>([
    'Học phí',
    'Thiết bị học tập',
  ]);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  if (!currentUser) return null;

  const myOffers = capitalOffers.filter((c) => c.lenderId === currentUser.id);
  const totalRegistered = myOffers.reduce((s, o) => s + o.totalCapital, 0);
  const totalAllocated = myOffers.reduce((s, o) => s + o.allocatedCapital, 0);
  const totalAvailable = Math.max(0, totalRegistered - totalAllocated);

  const toggleTerm = (term: number) => {
    setSupportedTerms((prev) =>
      prev.includes(term) ? prev.filter((t) => t !== term) : [...prev, term].sort((a, b) => a - b)
    );
  };

  const togglePurpose = (p: LoanPurpose) => {
    setSupportedPurposes((prev) =>
      prev.includes(p) ? prev.filter((item) => item !== p) : [...prev, p]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const res = createCapitalOffer({
      totalCapital: Number(totalCapital) || 0,
      minPerLoan: Number(minPerLoan) || 0,
      maxPerLoan: Number(maxPerLoan) || 0,
      supportedTerms,
      expectedMonthlyRate: (Number(expectedRate) || 0.8) / 100,
      supportedPurposes,
      notes,
      publishImmediately: true,
    });
    if (!res.ok) {
      setFormError(res.error ?? 'Không thể tạo nguồn vốn.');
      return;
    }
    setModalOpen(false);
    setNotes('');
  };

  return (
    <AppLayout
      title="Đăng ký & Quản lý nguồn vốn"
      subtitle="Theo dõi vốn đăng ký, vốn đã phân bổ và vốn khả dụng mô phỏng"
    >
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-1">
          <p className="text-xs font-semibold text-slate-500">Tổng vốn đã đăng ký</p>
          <p className="text-2xl font-extrabold text-[#102F59]">{formatVND(totalRegistered)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-1">
          <p className="text-xs font-semibold text-slate-500">Vốn đã phân bổ kết nối</p>
          <p className="text-2xl font-extrabold text-amber-600">{formatVND(totalAllocated)}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-1">
          <p className="text-xs font-semibold text-slate-500">Vốn khả dụng còn lại</p>
          <p className="text-2xl font-extrabold text-[#15803D]">{formatVND(totalAvailable)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-[#102F59] flex items-center gap-2">
          <Wallet className="w-5 h-5 text-[#15803D]" />
          Danh sách nguồn vốn của tôi ({myOffers.length})
        </h2>
        <button
          type="button"
          onClick={() => {
            setFormError('');
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#102F59] hover:bg-[#18427a] text-white text-sm font-semibold transition"
        >
          <Plus className="w-4 h-4" />
          Đăng ký nguồn vốn mới
        </button>
      </div>

      {myOffers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-10 text-center space-y-3">
          <p className="text-sm text-slate-500">Bạn chưa đăng ký nguồn vốn mô phỏng nào.</p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#102F59] text-white text-xs font-semibold"
          >
            <Plus className="w-4 h-4" />
            Tạo nguồn vốn đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {myOffers.map((offer) => {
            const available = Math.max(0, offer.totalCapital - offer.allocatedCapital);
            const pct = Math.min(100, Math.round((offer.allocatedCapital / offer.totalCapital) * 100));
            const linkedCount = connections.filter((c) => c.capitalOfferId === offer.id).length;
            const isPaused = offer.status === 'Đã tạm ngừng' || offer.status === 'Bản nháp';

            return (
              <div
                key={offer.id}
                className="bg-white rounded-2xl border border-[#E7E2D8] p-6 space-y-4"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <span className="text-sm font-extrabold text-[#102F59]">{offer.code}</span>
                    <p className="text-xs text-slate-400">Tạo ngày {formatDate(offer.createdAt)}</p>
                  </div>
                  <CapitalStatusBadge status={offer.status} />
                </div>

                <div className="grid grid-cols-3 gap-2 rounded-xl bg-[#FFFAF0] p-3 border border-[#EBE6DC] text-center">
                  <div>
                    <p className="text-[11px] text-slate-500">Tổng vốn</p>
                    <p className="text-xs sm:text-sm font-bold text-[#102F59]">
                      {formatVND(offer.totalCapital)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Đã phân bổ</p>
                    <p className="text-xs sm:text-sm font-bold text-amber-600">
                      {formatVND(offer.allocatedCapital)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] text-slate-500">Khả dụng</p>
                    <p className="text-xs sm:text-sm font-bold text-[#15803D]">
                      {formatVND(available)}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                    <span>Tỷ lệ đã phân bổ ({linkedCount} kết nối)</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#15803D]"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p>
                    <strong>Hạn mức/khoản:</strong> {formatVND(offer.minPerLoan)} –{' '}
                    {formatVND(offer.maxPerLoan)}
                  </p>
                  <p>
                    <strong>Kỳ hạn hỗ trợ:</strong> {offer.supportedTerms.join(', ')} tháng •{' '}
                    <strong>Mức phí mô phỏng:</strong> {(offer.expectedMonthlyRate * 100).toFixed(1)}%/tháng
                  </p>
                  <p>
                    <strong>Mục đích:</strong> {offer.supportedPurposes.join(', ')}
                  </p>
                  {offer.notes && <p className="text-slate-500 italic">"{offer.notes}"</p>}
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => toggleCapitalOfferStatus(offer.id)}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                      isPaused
                        ? 'border-emerald-200 text-[#15803D] hover:bg-emerald-50'
                        : 'border-amber-200 text-amber-800 hover:bg-amber-50'
                    }`}
                  >
                    {isPaused ? (
                      <>
                        <PlayCircle className="w-4 h-4" /> Kích hoạt lại
                      </>
                    ) : (
                      <>
                        <PauseCircle className="w-4 h-4" /> Tạm ngừng nguồn vốn
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Capital Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#102F59]">Đăng ký nguồn vốn mô phỏng</h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {formError && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs text-rose-800">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#102F59] mb-1">
                    Tổng số vốn đăng ký (đ)
                  </label>
                  <input
                    type="number"
                    step="500000"
                    min="500000"
                    value={totalCapital}
                    onChange={(e) => setTotalCapital(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#102F59] mb-1">
                    Mức phí/lãi mô phỏng (%/tháng)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={expectedRate}
                    onChange={(e) => setExpectedRate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[#102F59] mb-1">
                    Tối thiểu mỗi kết nối (đ)
                  </label>
                  <input
                    type="number"
                    step="500000"
                    min="500000"
                    value={minPerLoan}
                    onChange={(e) => setMinPerLoan(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#102F59] mb-1">
                    Tối đa mỗi kết nối (đ)
                  </label>
                  <input
                    type="number"
                    step="500000"
                    min="500000"
                    value={maxPerLoan}
                    onChange={(e) => setMaxPerLoan(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#102F59] mb-1.5">
                  Kỳ hạn hỗ trợ (tháng)
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_TERMS.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleTerm(t)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        supportedTerms.includes(t)
                          ? 'bg-[#102F59] text-white border-[#102F59]'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {t} tháng
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#102F59] mb-1.5">
                  Mục đích hỗ trợ ưu tiên
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALL_PURPOSES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePurpose(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        supportedPurposes.includes(p)
                          ? 'bg-[#15803D] text-white border-[#15803D]'
                          : 'bg-white text-slate-600 border-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#102F59] mb-1">Ghi chú</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="VD: Ưu tiên sinh viên năm 3–4 có hồ sơ đã xác minh mô phỏng..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#102F59] hover:bg-[#18427a] text-white text-sm font-semibold"
                >
                  Đăng ký nguồn vốn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
