import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, KeyRound, ShieldAlert, UserPlus, LogIn } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { useApp } from '../context/AppContext';
import type { UserRole } from '../types';

export const AuthPage: React.FC = () => {
  const { login, register } = useApp();
  const navigate = useNavigate();

  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [error, setError] = useState('');

  // Login state
  const [loginEmail, setLoginEmail] = useState('student@studentp2p.demo');
  const [loginPassword, setLoginPassword] = useState('Student123!');

  // Register state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [university, setUniversity] = useState('');
  const [studentId, setStudentId] = useState('');
  const [role, setRole] = useState<Extract<UserRole, 'borrower' | 'lender'>>('borrower');

  const redirectByRole = (userRole: UserRole) => {
    if (userRole === 'lender') navigate('/app/lender');
    else if (userRole === 'admin') navigate('/app/admin');
    else navigate('/app/borrower');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }
    const res = login(loginEmail, loginPassword);
    if (!res.ok || !res.user) {
      setError(res.error ?? 'Đăng nhập thất bại.');
      return;
    }
    redirectByRole(res.user.role);
  };

  const handleQuickDemo = (demoEmail: string) => {
    setError('');
    setLoginEmail(demoEmail);
    setLoginPassword('Student123!');
    const res = login(demoEmail, 'Student123!');
    if (res.ok && res.user) {
      redirectByRole(res.user.role);
    } else {
      setError(res.error ?? 'Không thể đăng nhập tài khoản demo.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password.trim() || !university.trim()) {
      setError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }
    if (!email.includes('@')) {
      setError('Email không đúng định dạng.');
      return;
    }
    if (password.length < 6) {
      setError('Mật khẩu cần tối thiểu 6 ký tự.');
      return;
    }
    if (role === 'borrower' && !studentId.trim()) {
      setError('Sinh viên vui lòng nhập mã sinh viên (dữ liệu mô phỏng).');
      return;
    }

    const res = register({
      fullName,
      email,
      phone,
      password,
      university,
      studentId,
      role,
    });
    if (!res.ok || !res.user) {
      setError(res.error ?? 'Đăng ký thất bại.');
      return;
    }
    redirectByRole(res.user.role);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3] flex flex-col justify-between py-8 px-4 sm:px-6">
      <div className="max-w-5xl w-full mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <BrandLogo size="md" showSlogan />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F2544] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Về trang giới thiệu
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Card */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#E7E2D8] shadow-sm p-6 sm:p-8">
            <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
              <button
                type="button"
                onClick={() => {
                  setTab('login');
                  setError('');
                }}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${
                  tab === 'login' ? 'bg-white text-[#0F2544] shadow-xs' : 'text-slate-600'
                }`}
              >
                <LogIn className="w-4 h-4" />
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('register');
                  setError('');
                }}
                className={`flex-1 inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition ${
                  tab === 'register' ? 'bg-white text-[#0F2544] shadow-xs' : 'text-slate-600'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Đăng ký tài khoản
              </button>
            </div>

            {error && (
              <div className="mb-5 rounded-xl bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0F2544] mb-1.5">
                    Email tài khoản
                  </label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="student@studentp2p.demo"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2544]/20 focus:border-[#0F2544]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#0F2544] mb-1.5">
                    Mật khẩu
                  </label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F2544]/20 focus:border-[#0F2544]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#0F2544] hover:bg-[#16335B] text-white text-sm font-semibold transition shadow-xs"
                >
                  Đăng nhập vào nền tảng
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F2544] mb-1">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Nguyễn Văn A"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0F2544]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0F2544] mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sinhvien@demo.edu.vn"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0F2544]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F2544] mb-1">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912345678"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0F2544]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0F2544] mb-1">
                      Mật khẩu *
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0F2544]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#0F2544] mb-1">
                      Trường đại học / Đơn vị *
                    </label>
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      placeholder="ĐH Kinh tế Quốc dân"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0F2544]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#0F2544] mb-1">
                      Mã sinh viên {role === 'borrower' ? '*' : '(nếu có)'}
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="VD: 11220456"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#0F2544]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#0F2544] mb-1.5">
                    Vai trò trải nghiệm *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('borrower')}
                      className={`p-3 rounded-xl border text-left transition ${
                        role === 'borrower'
                          ? 'border-[#0F2544] bg-[#0F2544]/5'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-sm font-bold text-[#0F2544]">Sinh viên cần vay vốn</p>
                      <p className="text-xs text-slate-500 mt-0.5">Tạo yêu cầu, xem điểm tín nhiệm</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('lender')}
                      className={`p-3 rounded-xl border text-left transition ${
                        role === 'lender'
                          ? 'border-[#15803D] bg-emerald-50/70'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-sm font-bold text-[#15803D]">Người có nguồn vốn</p>
                      <p className="text-xs text-slate-500 mt-0.5">Duyệt yêu cầu & kết nối mô phỏng</p>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-[#15803D] hover:bg-emerald-800 text-white text-sm font-semibold transition shadow-xs"
                >
                  Đăng ký & Vào Dashboard
                </button>
              </form>
            )}
          </div>

          {/* Demo Accounts Quick Access */}
          <div className="lg:col-span-5 bg-[#0F2544] text-white rounded-2xl p-6 sm:p-7 space-y-5 shadow-md">
            <div className="flex items-center gap-2.5 text-amber-400">
              <KeyRound className="w-5 h-5" />
              <h2 className="text-lg font-bold">Tài khoản trải nghiệm nhanh</h2>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Nhấn trực tiếp vào một trong 3 vai trò dưới đây để đăng nhập tức thì (Mật khẩu chung: <code className="px-1.5 py-0.5 rounded bg-white/15 text-amber-300 font-semibold">Student123!</code>).
            </p>

            <div className="space-y-3">
              {[
                {
                  role: 'Sinh viên (Người vay)',
                  email: 'student@studentp2p.demo',
                  desc: 'Tạo yêu cầu vay, xem điểm A–D, mô phỏng thanh toán kỳ hạn.',
                  badge: 'Người vay',
                  btnCls: 'bg-white text-[#0F2544] hover:bg-slate-100',
                },
                {
                  role: 'Người có vốn (Nhà đầu tư)',
                  email: 'investor@studentp2p.demo',
                  desc: 'Lọc danh sách yêu cầu vay, xem chi tiết, đề xuất kết nối.',
                  badge: 'Có vốn',
                  btnCls: 'bg-emerald-500 text-white hover:bg-emerald-600',
                },
                {
                  role: 'Quản trị viên (Admin)',
                  email: 'admin@studentp2p.demo',
                  desc: 'Xem thống kê toàn hệ thống, quản lý người dùng và trạng thái vay.',
                  badge: 'Admin',
                  btnCls: 'bg-amber-400 text-[#0F2544] hover:bg-amber-300',
                },
              ].map((acc) => (
                <div
                  key={acc.email}
                  className="rounded-xl bg-white/10 border border-white/10 p-4 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-white">{acc.role}</span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-white/15 text-amber-300">
                      {acc.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">{acc.desc}</p>
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <code className="text-[11px] text-emerald-300 truncate">{acc.email}</code>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo(acc.email)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${acc.btnCls}`}
                    >
                      Đăng nhập nhanh
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-white/10 flex items-start gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Dữ liệu giữa Người vay, Người có vốn và Admin được đồng bộ thống nhất qua LocalStorage.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
