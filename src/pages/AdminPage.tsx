import React, { useState } from 'react';
import {
  Activity,
  FileText,
  Handshake,
  Lock,
  ShieldCheck,
  Unlock,
  Users,
  Wallet,
} from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import { CreditBadge, StatusBadge } from '../components/Badges';
import { useApp } from '../context/AppContext';
import type { LoanStatus } from '../types';
import { formatDateTime, formatVND } from '../utils/formatters';

const ALL_STATUSES: LoanStatus[] = [
  'Chờ đánh giá',
  'Đang tìm người kết nối',
  'Đã tìm được kết nối',
  'Đang hoàn trả',
  'Đã hoàn thành',
  'Đã hủy',
];

export const AdminPage: React.FC = () => {
  const {
    users,
    loanRequests,
    connections,
    repayments,
    activityLogs,
    adminUpdateLoanStatus,
    adminToggleUserLock,
  } = useApp();

  const [tab, setTab] = useState<'loans' | 'users' | 'repayments' | 'logs'>('loans');

  const totalRequestedAmount = loanRequests.reduce((sum, l) => sum + l.amount, 0);
  const activeConnectionsCount = connections.filter((c) => c.status === 'Đang hoạt động').length;

  return (
    <AppLayout
      title="Trang quản trị Admin"
      subtitle="Giám sát toàn bộ người dùng, yêu cầu vay, kết nối và lịch sử hoạt động"
    >
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Tổng người dùng Demo</span>
            <Users className="w-4 h-4 text-[#0F2544]" />
          </div>
          <p className="text-2xl font-extrabold text-[#0F2544]">{users.length}</p>
          <p className="text-xs text-slate-500">
            SV: {users.filter((u) => u.role === 'borrower').length} • Có vốn:{' '}
            {users.filter((u) => u.role === 'lender').length}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Tổng yêu cầu vay</span>
            <FileText className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-[#0F2544]">{loanRequests.length}</p>
          <p className="text-xs text-slate-500">
            Đang tìm kết nối: {loanRequests.filter((l) => l.status === 'Đang tìm người kết nối').length}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Tổng vốn yêu cầu</span>
            <Wallet className="w-4 h-4 text-[#15803D]" />
          </div>
          <p className="text-2xl font-extrabold text-[#15803D]">
            {formatVND(totalRequestedAmount)}
          </p>
          <p className="text-xs text-slate-500">Số liệu mô phỏng đề án</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#E7E2D8] p-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Kết nối đang diễn ra</span>
            <Handshake className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-extrabold text-indigo-700">{activeConnectionsCount}</p>
          <p className="text-xs text-slate-500">Tổng giao dịch trả: {repayments.length}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-[#E7E2D8] overflow-hidden">
        <div className="px-4 sm:px-6 py-3 border-b border-slate-100 flex flex-wrap gap-2">
          {[
            { id: 'loans', label: `Yêu cầu vay (${loanRequests.length})` },
            { id: 'users', label: `Người dùng (${users.length})` },
            { id: 'repayments', label: `Giao dịch mô phỏng (${repayments.length})` },
            { id: 'logs', label: `Nhật ký thao tác (${activityLogs.length})` },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id as typeof tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                tab === t.id
                  ? 'bg-[#0F2544] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'loans' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F3] text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <th className="py-3 px-4 font-semibold">Mã</th>
                  <th className="py-3 px-4 font-semibold">Sinh viên</th>
                  <th className="py-3 px-4 font-semibold">Số tiền</th>
                  <th className="py-3 px-4 font-semibold">Tín nhiệm</th>
                  <th className="py-3 px-4 font-semibold">Trạng thái</th>
                  <th className="py-3 px-4 font-semibold">Cập nhật trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loanRequests.map((loan) => (
                  <tr key={loan.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-bold text-[#0F2544]">{loan.code}</td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-[#0F2544]">{loan.borrowerName}</p>
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
        )}

        {tab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F3] text-[11px] uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <th className="py-3 px-4 font-semibold">Họ tên</th>
                  <th className="py-3 px-4 font-semibold">Email</th>
                  <th className="py-3 px-4 font-semibold">Vai trò</th>
                  <th className="py-3 px-4 font-semibold">Đơn vị / Trường</th>
                  <th className="py-3 px-4 font-semibold">Trạng thái</th>
                  <th className="py-3 px-4 font-semibold text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-bold text-[#0F2544]">{u.fullName}</td>
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
                    <td className="py-3.5 px-4 text-xs text-slate-600">{u.university}</td>
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
        )}

        {tab === 'repayments' && (
          <div className="divide-y divide-slate-100">
            {repayments.map((r) => (
              <div key={r.id} className="px-6 py-4 flex items-center justify-between text-sm">
                <div>
                  <p className="font-bold text-[#0F2544]">
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

        {tab === 'logs' && (
          <div className="divide-y divide-slate-100">
            {activityLogs.map((log) => (
              <div key={log.id} className="px-6 py-3.5 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <Activity className="w-4 h-4 text-[#15803D] shrink-0" />
                  <div>
                    <p className="font-semibold text-[#0F2544]">
                      {log.actorName} — <span className="text-slate-600">{log.action}</span>
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
    </AppLayout>
  );
};
