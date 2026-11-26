import React, { useState } from 'react';
import { CheckCircle2, Save, ShieldCheck, UserCheck } from 'lucide-react';
import { AppLayout } from '../components/AppLayout';
import { VerificationBadge } from '../components/Badges';
import { useApp } from '../context/AppContext';
import { formatDate, formatVND } from '../utils/formatters';

export const ProfilePage: React.FC = () => {
  const { currentUser, updateMyProfile, submitVerification } = useApp();

  const [fullName, setFullName] = useState(currentUser?.fullName ?? '');
  const [phone, setPhone] = useState(currentUser?.phone ?? '');
  const [university, setUniversity] = useState(currentUser?.university ?? '');
  const [studentId, setStudentId] = useState(currentUser?.studentId ?? '');
  const [major, setMajor] = useState(currentUser?.major ?? '');
  const [yearOfStudy, setYearOfStudy] = useState(currentUser?.yearOfStudy ?? 'Năm 3');
  const [gpa, setGpa] = useState(String(currentUser?.gpa ?? 3.1));
  const [monthlyIncome, setMonthlyIncome] = useState(String(currentUser?.monthlyIncome ?? 3000000));
  const [incomeSource, setIncomeSource] = useState(currentUser?.incomeSource ?? '');
  const [capitalPurpose, setCapitalPurpose] = useState(currentUser?.capitalPurpose ?? '');
  const [occupation, setOccupation] = useState(currentUser?.occupation ?? '');
  const [simulatedCapital, setSimulatedCapital] = useState(
    String(currentUser?.simulatedCapital ?? 30000000)
  );
  const [profileError, setProfileError] = useState('');

  const [verifyNote, setVerifyNote] = useState(
    'Tôi xác nhận các thông tin sinh viên/cá nhân cung cấp là dữ liệu mô phỏng phục vụ đề án Student P2P.'
  );
  const [verifyError, setVerifyError] = useState('');

  if (!currentUser) return null;

  const isBorrower = currentUser.role === 'borrower';
  const isLender = currentUser.role === 'lender';

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    const res = updateMyProfile({
      fullName,
      phone,
      university,
      studentId: isBorrower ? studentId : currentUser.studentId,
      major: isBorrower ? major : undefined,
      yearOfStudy: isBorrower ? yearOfStudy : undefined,
      gpa: isBorrower ? Number(gpa) : undefined,
      monthlyIncome: isBorrower ? Number(monthlyIncome) : undefined,
      incomeSource: isBorrower ? incomeSource : undefined,
      capitalPurpose: isBorrower ? capitalPurpose : undefined,
      occupation: isLender ? occupation : undefined,
      simulatedCapital: isLender ? Number(simulatedCapital) : undefined,
    });
    if (!res.ok) {
      setProfileError(res.error ?? 'Không thể cập nhật hồ sơ.');
    }
  };

  const handleVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError('');
    const res = submitVerification(verifyNote);
    if (!res.ok) {
      setVerifyError(res.error ?? 'Không thể gửi yêu cầu xác minh.');
    }
  };

  const initials = currentUser.fullName
    .split(' ')
    .slice(-2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <AppLayout
      title="Hồ sơ cá nhân & Xác minh mô phỏng"
      subtitle="Quản lý thông tin tài khoản và trạng thái xác minh hồ sơ"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Summary Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-[#E7E2D8] p-6 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#102F59] text-[#D9A83F] font-extrabold text-xl flex items-center justify-center shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-extrabold text-[#102F59] truncate">
                  {currentUser.fullName}
                </h2>
                <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                <div className="mt-1.5">
                  <VerificationBadge status={currentUser.verificationStatus} />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Vai trò tài khoản:</span>
                <strong className="text-[#102F59]">
                  {isBorrower ? 'Sinh viên (Người vay)' : isLender ? 'Người có vốn' : 'Quản trị viên'}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Trạng thái tài khoản:</span>
                <span className="font-semibold text-emerald-700">
                  {currentUser.status === 'active' ? 'Đang hoạt động' : 'Bị khóa'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Ngày tạo:</span>
                <span>{formatDate(currentUser.createdAt)}</span>
              </div>
              {isLender && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Nguồn vốn mô phỏng:</span>
                  <strong className="text-[#15803D]">
                    {formatVND(currentUser.simulatedCapital ?? 0)}
                  </strong>
                </div>
              )}
            </div>
          </div>

          {/* Verification Request Card */}
          {currentUser.role !== 'admin' && (
            <div className="bg-white rounded-2xl border border-[#E7E2D8] p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-[#15803D]" />
                <h3 className="text-base font-bold text-[#102F59]">Xác minh danh tính mô phỏng</h3>
              </div>

              <div className="rounded-xl bg-[#FFFAF0] border border-[#EBE6DC] p-3.5 text-xs text-slate-700 space-y-1">
                <p>
                  Trạng thái hiện tại:{' '}
                  <strong className="text-[#102F59]">
                    {currentUser.verificationStatus ?? 'Chưa xác minh'}
                  </strong>
                </p>
                {currentUser.verificationNote && (
                  <p className="text-rose-700">Lý do: {currentUser.verificationNote}</p>
                )}
              </div>

              {currentUser.verificationStatus === 'Đã xác minh mô phỏng' ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Hồ sơ của bạn đã hoàn tất xác minh mô phỏng.</span>
                </div>
              ) : (
                <form onSubmit={handleVerifySubmit} className="space-y-3">
                  {verifyError && (
                    <p className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-2.5">
                      {verifyError}
                    </p>
                  )}
                  <div>
                    <label className="block text-xs font-semibold text-[#102F59] mb-1">
                      Thông tin xác nhận hồ sơ (không cần CCCD thật)
                    </label>
                    <textarea
                      rows={3}
                      value={verifyNote}
                      onChange={(e) => setVerifyNote(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={currentUser.verificationStatus === 'Đang chờ duyệt'}
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#15803D] hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-semibold transition"
                  >
                    <UserCheck className="w-4 h-4" />
                    {currentUser.verificationStatus === 'Đang chờ duyệt'
                      ? 'Đang chờ Admin duyệt'
                      : 'Gửi yêu cầu xác minh mô phỏng'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Right Edit Form */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#E7E2D8] p-6 sm:p-7">
          <h3 className="text-base font-bold text-[#102F59] pb-3 border-b border-slate-100">
            Cập nhật thông tin hồ sơ
          </h3>

          <form onSubmit={handleSaveProfile} className="mt-5 space-y-4">
            {profileError && (
              <div className="rounded-xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-xs text-rose-800">
                {profileError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#102F59] mb-1">Họ và tên *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#102F59] mb-1">
                  Email (không thể thay đổi)
                </label>
                <input
                  type="email"
                  value={currentUser.email}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#102F59] mb-1">
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#102F59] mb-1">
                  Trường đại học / Đơn vị *
                </label>
                <input
                  type="text"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>

            {isBorrower && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#102F59] mb-1">
                      Mã sinh viên
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#102F59] mb-1">
                      Ngành học
                    </label>
                    <input
                      type="text"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      placeholder="VD: Tài chính - Ngân hàng"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#102F59] mb-1">
                      Năm học
                    </label>
                    <select
                      value={yearOfStudy}
                      onChange={(e) => setYearOfStudy(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
                    >
                      <option value="Năm 1">Năm 1</option>
                      <option value="Năm 2">Năm 2</option>
                      <option value="Năm 3">Năm 3</option>
                      <option value="Năm 4">Năm 4</option>
                      <option value="Năm 5+">Năm 5+</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#102F59] mb-1">
                      GPA (thang 4.0)
                    </label>
                    <input
                      type="number"
                      step="0.05"
                      min="0"
                      max="4"
                      value={gpa}
                      onChange={(e) => setGpa(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#102F59] mb-1">
                      Thu nhập / Trợ cấp hàng tháng (đ)
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#102F59] mb-1">
                      Nguồn thu nhập chính
                    </label>
                    <input
                      type="text"
                      value={incomeSource}
                      onChange={(e) => setIncomeSource(e.target.value)}
                      placeholder="VD: Gia sư, thực tập sinh, trợ cấp"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#102F59] mb-1">
                      Mục đích sử dụng vốn thường gặp
                    </label>
                    <input
                      type="text"
                      value={capitalPurpose}
                      onChange={(e) => setCapitalPurpose(e.target.value)}
                      placeholder="VD: Học phí & thiết bị học tập"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            {isLender && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#102F59] mb-1">
                    Nghề nghiệp / Lĩnh vực (tùy chọn)
                  </label>
                  <input
                    type="text"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="VD: Chuyên viên tài chính"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#102F59] mb-1">
                    Tổng nguồn vốn mô phỏng (đ)
                  </label>
                  <input
                    type="number"
                    step="1000000"
                    min="500000"
                    value={simulatedCapital}
                    onChange={(e) => setSimulatedCapital(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>
            )}

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#102F59] hover:bg-[#18427a] text-white text-sm font-semibold transition"
              >
                <Save className="w-4 h-4" />
                Lưu thay đổi hồ sơ
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};
