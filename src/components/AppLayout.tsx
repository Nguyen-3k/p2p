import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Award,
  Bell,
  BookOpen,
  FileSpreadsheet,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  RotateCcw,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useApp } from '../context/AppContext';
import { ConfirmModal } from './ConfirmModal';

interface AppLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children, title, subtitle }) => {
  const { currentUser, notifications, logout, resetDemoData } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  const unreadCount = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id && !n.isRead).length
    : 0;

  const roleLabel =
    currentUser?.role === 'borrower'
      ? 'Sinh viên (Người vay)'
      : currentUser?.role === 'lender'
      ? 'Người có vốn'
      : currentUser?.role === 'admin'
      ? 'Quản trị viên'
      : 'Khách tham quan';

  const navItems = [
    ...(currentUser?.role === 'borrower'
      ? [{ to: '/app/borrower', label: 'Dashboard Người vay', icon: LayoutDashboard }]
      : []),
    ...(currentUser?.role === 'lender'
      ? [{ to: '/app/lender', label: 'Dashboard Người có vốn', icon: LayoutDashboard }]
      : []),
    ...(currentUser?.role === 'admin'
      ? [{ to: '/app/admin', label: 'Quản trị Admin', icon: ShieldCheck }]
      : []),
    ...(currentUser
      ? [
          { to: '/app/loans', label: 'Quản lý khoản vay', icon: FileSpreadsheet },
          ...(currentUser.role === 'borrower'
            ? [{ to: '/app/credit-score', label: 'Điểm tín nhiệm A–D', icon: Award }]
            : []),
        ]
      : []),
    { to: '/app/education', label: 'Giáo dục tài chính', icon: BookOpen },
    ...(currentUser
      ? [{ to: '/app/notifications', label: 'Thông báo', icon: Bell, badge: unreadCount }]
      : []),
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#0F2544] text-slate-200">
      <div className="p-5 border-b border-white/10">
        <BrandLogo size="sm" darkText={false} to="/" />
      </div>

      <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-white/15 text-white shadow-xs'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{item.label}</span>
              </span>
              {typeof item.badge === 'number' && item.badge > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-[#0F2544]">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}

        <div className="pt-4 mt-4 border-t border-white/10 space-y-1">
          <Link
            to="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition"
          >
            <Home className="w-4 h-4 text-emerald-400" />
            <span>Trang giới thiệu dự án</span>
          </Link>

          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white transition text-left"
          >
            <RotateCcw className="w-4 h-4 text-sky-400" />
            <span>Khôi phục dữ liệu demo</span>
          </button>
        </div>
      </nav>

      <div className="p-4 border-t border-white/10">
        {currentUser ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {currentUser.fullName
                  .split(' ')
                  .slice(-2)
                  .map((w) => w[0])
                  .join('')
                  .toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">{currentUser.fullName}</p>
                <p className="text-[11px] text-amber-300 truncate">{roleLabel}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              Đăng xuất
            </button>
          </div>
        ) : (
          <Link
            to="/auth"
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-amber-400 text-[#0F2544] text-xs font-bold hover:bg-amber-300 transition"
          >
            <Users className="w-4 h-4" />
            Đăng nhập tài khoản
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-[#0F2544] flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10">
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-white p-1 rounded-lg hover:bg-white/10"
              aria-label="Đóng menu"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E7E2D8] px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#0F2544] hover:bg-slate-100"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-lg font-extrabold text-[#0F2544] truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs text-slate-500 truncate hidden sm:block">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {currentUser && (
              <Link
                to="/app/notifications"
                className="relative p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
                aria-label="Thông báo"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Link>
            )}
            <Link
              to="/"
              className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Trang chủ dự án
            </Link>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>

      <ConfirmModal
        open={resetModalOpen}
        title="Khôi phục dữ liệu demo ban đầu?"
        description="Toàn bộ yêu cầu vay, kết nối, lịch sử thanh toán mô phỏng và thông báo bạn vừa thao tác sẽ được đưa về dữ liệu mẫu ban đầu."
        confirmLabel="Khôi phục ngay"
        onConfirm={() => {
          resetDemoData();
          setResetModalOpen(false);
        }}
        onCancel={() => setResetModalOpen(false)}
      />
    </div>
  );
};
