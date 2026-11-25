import React, { useState } from 'react';
import { Award, CheckCircle2, Lightbulb, RefreshCw } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import { CreditBadge } from '../components/Badges';
import { useApp } from '../context/AppContext';
import { formatVND } from '../utils/formatters';

export const CreditScorePage: React.FC = () => {
  const { currentUser, creditScores, updateBorrowerProfileForScore } = useApp();

  const scoreData = currentUser ? creditScores[currentUser.id] : undefined;
  const [gpa, setGpa] = useState(String(currentUser?.gpa ?? 3.2));
  const [income, setIncome] = useState(String(currentUser?.monthlyIncome ?? 3000000));

  if (!currentUser || !scoreData) {
    return (
      <AppLayout title="Hệ thống đánh giá tín nhiệm A–D">
        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-8 text-center">
          <p className="text-slate-600 text-sm">
            Vui lòng đăng nhập bằng tài khoản sinh viên để xem chi tiết điểm tín nhiệm mô phỏng.
          </p>
        </div>
      </AppLayout>
    );
  }

  const factors = [
    { label: 'Hoàn thiện hồ sơ sinh viên', value: scoreData.factors.profileScore, max: 20 },
    { label: 'Kết quả học tập (GPA)', value: scoreData.factors.gpaScore, max: 20 },
    { label: 'Khả năng tài chính & Thu nhập', value: scoreData.factors.financialCapacityScore, max: 25 },
    { label: 'Cân đối mức vay / Thu nhập', value: scoreData.factors.incomeStabilityScore, max: 20 },
    { label: 'Lịch sử hoàn trả mô phỏng', value: scoreData.factors.repaymentHistoryScore, max: 15 },
  ];

  const handleRecalculate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedGpa = Math.min(4, Math.max(0, Number(gpa) || 0));
    const parsedIncome = Math.max(0, Number(income) || 0);
    updateBorrowerProfileForScore(parsedGpa, parsedIncome);
  };

  return (
    <AppLayout
      title="Đánh giá tín nhiệm (A–D)"
      subtitle="Thuật toán quy tắc minh bạch, đa tiêu chí dành cho sinh viên"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Score Summary */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#E7E2D8] p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-[#0F2544] text-amber-400 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0F2544]">Kết quả xếp hạng</h2>
                <p className="text-xs text-slate-500">{currentUser.fullName}</p>
              </div>
            </div>
            <CreditBadge grade={scoreData.grade} score={scoreData.score} />
          </div>

          <div className="rounded-2xl bg-[#FAF8F3] border border-[#EBE6DC] p-6 text-center space-y-2">
            <div className="text-4xl font-extrabold text-[#0F2544]">
              {scoreData.score}
              <span className="text-lg text-slate-400 font-semibold"> / 100</span>
            </div>
            <p className="text-sm font-semibold text-[#15803D]">
              {scoreData.grade === 'A'
                ? 'Hạng A: Mức tín nhiệm mô phỏng tốt'
                : scoreData.grade === 'B'
                ? 'Hạng B: Mức tín nhiệm khá'
                : scoreData.grade === 'C'
                ? 'Hạng C: Cần xem xét thêm'
                : 'Hạng D: Mức rủi ro mô phỏng cao'}
            </p>
          </div>

          {/* Interactive simulator */}
          <form onSubmit={handleRecalculate} className="pt-2 border-t border-slate-100 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Thử nghiệm thay đổi thông số hồ sơ
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GPA (0–4.0)</label>
                <input
                  type="number"
                  step="0.05"
                  min="0"
                  max="4"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Thu nhập/tháng (đ)
                </label>
                <input
                  type="number"
                  step="100000"
                  min="0"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Thu nhập hiện tại: {formatVND(Number(income) || 0)}
            </p>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#0F2544] hover:bg-[#16335B] text-white text-xs font-semibold transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Tính lại điểm tín nhiệm mô phỏng
            </button>
          </form>
        </div>

        {/* Breakdown & Explanations */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E7E2D8] p-6 space-y-4">
            <h3 className="text-base font-bold text-[#0F2544]">Chi tiết 5 tiêu chí đánh giá</h3>
            <div className="space-y-4">
              {factors.map((f) => {
                const pct = Math.round((f.value / f.max) * 100);
                return (
                  <div key={f.label} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-slate-700">{f.label}</span>
                      <span className="text-[#0F2544]">
                        {f.value} / {f.max} điểm
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#15803D] transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-3">
              <h4 className="text-sm font-bold text-[#0F2544] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                Giải thích kết quả
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                {scoreData.reasons.map((r) => (
                  <li key={r} className="flex items-start gap-2">
                    <span className="text-[#15803D] font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-3">
              <h4 className="text-sm font-bold text-[#0F2544] flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                Gợi ý cải thiện hồ sơ
              </h4>
              <ul className="space-y-2 text-xs text-slate-600 leading-relaxed">
                {scoreData.recommendations.map((rec) => (
                  <li key={rec} className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};
