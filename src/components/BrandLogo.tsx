import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSlogan?: boolean;
  darkText?: boolean;
  to?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showSlogan = false,
  darkText = true,
  to = '/',
}) => {
  const imgSize =
    size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-14 w-14' : 'h-10 w-10';
  const titleSize =
    size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-lg';

  const content = (
    <div className="inline-flex items-center gap-2.5 group">
      <div
        className={`${imgSize} rounded-xl overflow-hidden bg-[#FAF8F3] border border-[#E5E0D5] shadow-xs shrink-0 flex items-center justify-center`}
      >
        <img
          src="/logo.jpeg"
          alt="Student P2P Logo"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-col leading-tight">
        <span
          className={`${titleSize} font-extrabold tracking-tight ${
            darkText ? 'text-[#0F2544]' : 'text-white'
          }`}
        >
          STUDENT <span className="text-[#15803D]">P2P</span>
        </span>
        {showSlogan && (
          <span
            className={`text-xs font-medium ${
              darkText ? 'text-slate-500' : 'text-slate-300'
            }`}
          >
            Kết nối tài chính – Đồng hành cùng sinh viên
          </span>
        )}
      </div>
    </div>
  );

  if (!to) return content;
  return (
    <Link to={to} className="focus:outline-none">
      {content}
    </Link>
  );
};
