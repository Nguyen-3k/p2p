import React, { useState } from 'react';
import { BookOpen, Calculator, CheckCircle2, Clock, Sparkles, X } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import { useApp } from '../context/AppContext';
import type { FinancialArticle } from '../types';
import { formatVND } from '../utils/formatters';

export const FinancialEducationPage: React.FC = () => {
  const { articles } = useApp();
  const [selectedArticle, setSelectedArticle] = useState<FinancialArticle | null>(null);

  // Budget Simulator State
  const [monthlyIncome, setMonthlyIncome] = useState('4000000');
  const [livingExpenses, setLivingExpenses] = useState('2200000');
  const [studyCosts, setStudyCosts] = useState('800000');

  const incomeNum = Math.max(0, Number(monthlyIncome) || 0);
  const livingNum = Math.max(0, Number(livingExpenses) || 0);
  const studyNum = Math.max(0, Number(studyCosts) || 0);
  const totalExpenses = livingNum + studyNum;
  const remaining = incomeNum - totalExpenses;
  const savingsRate = incomeNum > 0 ? Math.round((remaining / incomeNum) * 100) : 0;

  let budgetAdvice = '';
  let budgetStatusColor = 'text-[#15803D] bg-emerald-50 border-emerald-200';
  if (incomeNum === 0) {
    budgetAdvice = 'Hãy nhập tổng thu nhập hoặc trợ cấp hàng tháng để bắt đầu phân tích ngân sách.';
    budgetStatusColor = 'text-slate-700 bg-slate-50 border-slate-200';
  } else if (remaining < 0) {
    budgetAdvice =
      'Cảnh báo thâm hụt: Chi tiêu dự kiến đang vượt thu nhập. Bạn nên rà soát lại các khoản chi sinh hoạt không thiết yếu hoặc tìm thêm nguồn hỗ trợ học bổng/làm thêm hợp lý trước khi cân nhắc vay vốn.';
    budgetStatusColor = 'text-rose-800 bg-rose-50 border-rose-200';
  } else if (savingsRate < 15) {
    budgetAdvice =
      'Ngân sách ở mức sát nút (dư dưới 15%). Nếu có nhu cầu vay ngắn hạn, hãy chỉ chọn khoản trả góp nhỏ hơn 50% số tiền dư hàng tháng để tránh áp lực tài chính.';
    budgetStatusColor = 'text-amber-900 bg-amber-50 border-amber-200';
  } else {
    budgetAdvice =
      'Cân đối ngân sách tốt! Bạn đang duy trì được tỷ lệ tích lũy an toàn (≥ 15%). Hãy trích khoản dư này vào quỹ dự phòng khẩn cấp cho học tập.';
  }

  return (
    <AppLayout
      title="Giáo dục tài chính cá nhân"
      subtitle="Trang bị kiến thức quản lý chi tiêu, tiết kiệm và phòng tránh tín dụng đen"
    >
      {/* Budget Simulator */}
      <section className="bg-white rounded-2xl border border-[#E7E2D8] p-6 space-y-5">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="w-10 h-10 rounded-xl bg-[#0F2544] text-amber-400 flex items-center justify-center shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#0F2544]">
              Công cụ mô phỏng ngân sách cá nhân sinh viên
            </h2>
            <p className="text-xs text-slate-500">
              Nhập thu nhập và chi phí dự kiến hàng tháng để kiểm tra mức độ an toàn tài chính
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#0F2544] mb-1">
                Thu nhập hàng tháng (Trợ cấp + Làm thêm + Học bổng)
              </label>
              <input
                type="number"
                step="100000"
                min="0"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F2544] mb-1">
                  Chi phí sinh hoạt (Trọ, ăn uống, đi lại)
                </label>
                <input
                  type="number"
                  step="100000"
                  min="0"
                  value={livingExpenses}
                  onChange={(e) => setLivingExpenses(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#0F2544] mb-1">
                  Học phí & Chi phí học tập (chia bình quân/tháng)
                </label>
                <input
                  type="number"
                  step="100000"
                  min="0"
                  value={studyCosts}
                  onChange={(e) => setStudyCosts(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 rounded-2xl bg-[#FAF8F3] border border-[#EBE6DC] p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white rounded-xl p-3 border border-slate-100">
                <p className="text-[11px] text-slate-500">Tổng thu</p>
                <p className="text-sm font-extrabold text-[#0F2544] mt-0.5">
                  {formatVND(incomeNum)}
                </p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-100">
                <p className="text-[11px] text-slate-500">Tổng chi</p>
                <p className="text-sm font-extrabold text-amber-700 mt-0.5">
                  {formatVND(totalExpenses)}
                </p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-slate-100">
                <p className="text-[11px] text-slate-500">Còn lại</p>
                <p
                  className={`text-sm font-extrabold mt-0.5 ${
                    remaining >= 0 ? 'text-[#15803D]' : 'text-rose-600'
                  }`}
                >
                  {formatVND(remaining)}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600">Tỷ lệ tích lũy dự kiến</span>
                <span className={remaining >= 0 ? 'text-[#15803D]' : 'text-rose-600'}>
                  {savingsRate}%
                </span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    remaining >= 0 ? 'bg-[#15803D]' : 'bg-rose-500'
                  }`}
                  style={{ width: `${Math.min(100, Math.max(5, Math.abs(savingsRate)))}%` }}
                />
              </div>
            </div>

            <div className={`rounded-xl border p-3.5 text-xs leading-relaxed flex items-start gap-2 ${budgetStatusColor}`}>
              <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{budgetAdvice}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-[#0F2544] flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#15803D]" />
            Thư viện kiến thức tài chính sinh viên ({articles.length} bài viết)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((art) => (
            <article
              key={art.id}
              className="bg-white rounded-2xl border border-[#E7E2D8] p-5 flex flex-col justify-between space-y-4 hover:border-[#0F2544]/30 transition"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#15803D] font-semibold border border-emerald-200">
                    {art.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    {art.readTime}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#0F2544] leading-snug">{art.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{art.summary}</p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedArticle(art)}
                className="w-full py-2.5 rounded-xl bg-[#FAF8F3] hover:bg-[#0F2544] hover:text-white text-[#0F2544] border border-[#E7E2D8] text-xs font-bold transition"
              >
                Đọc bài viết →
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* Article Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-[2px]">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[88vh] overflow-y-auto p-6 sm:p-8 space-y-5">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1.5">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-[#15803D] text-xs font-semibold">
                  {selectedArticle.category} • {selectedArticle.readTime}
                </span>
                <h3 className="text-xl font-extrabold text-[#0F2544]">
                  {selectedArticle.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
              {selectedArticle.content.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="rounded-xl bg-[#FAF8F3] border border-[#EBE6DC] p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-[#0F2544]">
                Điểm chính cần ghi nhớ
              </p>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {selectedArticle.keyTakeaways.map((tip) => (
                  <li key={tip} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedArticle(null)}
                className="px-5 py-2 rounded-xl bg-[#0F2544] text-white text-sm font-semibold"
              >
                Đóng bài viết
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};
