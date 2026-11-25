import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, Phone } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

export const PublicFooter: React.FC = () => {
  return (
    <footer className="bg-[#0F2544] text-slate-200 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 pb-10 border-b border-white/10">
          <div className="space-y-4">
            <BrandLogo size="md" showSlogan darkText={false} to="/" />
            <p className="text-sm text-slate-300 leading-relaxed">
              Đề án khởi nghiệp FinTech của nhóm sinh viên ngành Kinh tế – Tài chính – Ngân hàng. Hướng tới giải pháp kết nối tài chính ngang hàng minh bạch, an toàn và có trách nhiệm dành cho sinh viên Việt Nam.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4">
              Điều hướng nhanh
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li>
                <a href="#gioi-thieu" className="hover:text-white transition">
                  Giới thiệu dự án
                </a>
              </li>
              <li>
                <a href="#giai-phap" className="hover:text-white transition">
                  Giải pháp Student P2P
                </a>
              </li>
              <li>
                <a href="#goi-ho-tro" className="hover:text-white transition">
                  Các gói hỗ trợ dự kiến
                </a>
              </li>
              <li>
                <a href="#quy-trinh" className="hover:text-white transition">
                  Quy trình hoạt động
                </a>
              </li>
              <li>
                <Link to="/auth" className="hover:text-white transition font-medium text-emerald-300">
                  Trải nghiệm nền tảng →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-amber-400 mb-4">
              Thông tin liên hệ
            </h4>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Văn phòng Đề án Sinh viên – Hà Nội</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>contact@studentp2p.vn</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>1900 0000</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 STUDENT P2P – Kết nối tài chính ngang hàng dành cho sinh viên.</p>
          <p>Kết nối tài chính – Đồng hành cùng sinh viên</p>
        </div>
      </div>
    </footer>
  );
};
