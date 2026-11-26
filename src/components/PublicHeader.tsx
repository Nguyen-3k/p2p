import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { useApp } from '../context/AppContext';

export const PublicHeader: React.FC = () => {
  const { currentUser } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { label: 'Trang chủ', href: '#top' },
    { label: 'Giới thiệu', href: '#gioi-thieu' },
    { label: 'Hướng dẫn', href: '#quy-trinh' },
    { label: 'Tin tức', href: '#tin-tuc' },
    { label: 'Liên hệ', href: '#lien-he' },
  ];

  const dashboardPath =
    currentUser?.role === 'lender'
      ? '/app/lender'
      : currentUser?.role === 'admin'
      ? '/app/admin'
      : '/app/borrower';

  return (
    <header className="sticky top-0 z-40 bg-[#FFFAF0]/95 backdrop-blur-md border-b border-[#E7E2D8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <BrandLogo size="sm" />

        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-700 hover:text-[#102F59] transition"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {currentUser ? (
            <Link
              to={dashboardPath}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#102F59] text-white text-sm font-semibold hover:bg-[#18427a] transition shadow-xs"
            >
              Vào Dashboard ({currentUser.fullName.split(' ').pop()})
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/auth"
                className="px-4 py-2 rounded-xl text-sm font-semibold text-[#102F59] hover:bg-slate-200/60 transition"
              >
                Đăng nhập
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#102F59] text-white text-sm font-semibold hover:bg-[#18427a] transition shadow-xs"
              >
                Đăng ký
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="lg:hidden p-2 rounded-xl text-[#102F59] hover:bg-slate-200/60"
          aria-label="Mở menu"
        >
          {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-[#E7E2D8] bg-[#FFFAF0] px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-white"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="pt-2 border-t border-[#E7E2D8] flex flex-col gap-2">
            <Link
              to={currentUser ? dashboardPath : '/auth'}
              onClick={() => setMobileOpen(false)}
              className="w-full text-center px-4 py-2.5 rounded-xl bg-[#102F59] text-white text-sm font-semibold"
            >
              {currentUser ? 'Vào Dashboard' : 'Đăng nhập / Đăng ký'}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
