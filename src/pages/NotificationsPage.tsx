import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCheck, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import { useApp } from '../context/AppContext';
import { formatDateTime } from '../utils/formatters';

export const NotificationsPage: React.FC = () => {
  const { currentUser, notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  if (!currentUser) return null;

  const myNotifs = notifications.filter((n) => n.userId === currentUser.id);
  const filtered = filter === 'unread' ? myNotifs.filter((n) => !n.isRead) : myNotifs;
  const unreadCount = myNotifs.filter((n) => !n.isRead).length;

  return (
    <AppLayout
      title="Trung tâm thông báo"
      subtitle="Cập nhật trạng thái yêu cầu vay, đề xuất kết nối và lịch thanh toán"
    >
      <div className="bg-white rounded-2xl border border-[#E7E2D8] overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                filter === 'all'
                  ? 'bg-[#0F2544] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả ({myNotifs.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                filter === 'unread'
                  ? 'bg-[#0F2544] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Chưa đọc ({unreadCount})
            </button>
          </div>

          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllNotificationsRead}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#15803D] hover:underline"
            >
              <CheckCheck className="w-4 h-4" />
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Bell className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm text-slate-500">Không có thông báo nào trong mục này.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filtered.map((n) => {
              const Icon =
                n.type === 'success'
                  ? CheckCircle2
                  : n.type === 'warning'
                  ? AlertTriangle
                  : Info;
              const iconColor =
                n.type === 'success'
                  ? 'text-emerald-600 bg-emerald-50'
                  : n.type === 'warning'
                  ? 'text-amber-600 bg-amber-50'
                  : 'text-sky-600 bg-sky-50';

              return (
                <div
                  key={n.id}
                  className={`p-5 flex items-start justify-between gap-4 transition ${
                    n.isRead ? 'bg-white' : 'bg-amber-50/40'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-[#0F2544]">{n.title}</h3>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-amber-500" title="Chưa đọc" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                      <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400">
                        <span>{formatDateTime(n.createdAt)}</span>
                        {n.link && (
                          <Link
                            to={n.link}
                            onClick={() => markNotificationRead(n.id)}
                            className="font-semibold text-[#15803D] hover:underline"
                          >
                            Xem chi tiết →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {!n.isRead && (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(n.id)}
                      className="px-3 py-1 rounded-lg border border-slate-200 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 shrink-0"
                    >
                      Đã đọc
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
};
