import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Cloud,
  FileSignature,
  GraduationCap,
  Handshake,
  Layers,
  Lock,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  AlertTriangle,
  Wallet,
} from 'lucide-react';
import { PublicHeader } from '../components/PublicHeader';
import { PublicFooter } from '../components/PublicFooter';

export const HomePage: React.FC = () => {
  const problems = [
    {
      title: 'Thiếu hụt tài chính ngắn hạn',
      desc: 'Nhiều sinh viên gặp khoảng trống dòng tiền tạm thời giữa các kỳ trợ cấp hoặc khi lương làm thêm chưa về.',
    },
    {
      title: 'Áp lực học phí & sinh hoạt phí',
      desc: 'Chi phí học phí, giáo trình, laptop và thuê trọ tăng cao tạo áp lực lớn vào đầu mỗi học kỳ.',
    },
    {
      title: 'Khó tiếp cận nguồn vốn phù hợp',
      desc: 'Sinh viên chưa có lịch sử tín dụng hoặc tài sản đảm bảo nên khó tiếp cận các kênh vay truyền thống.',
    },
    {
      title: 'Nguy cơ tiếp cận tín dụng đen',
      desc: 'Các app vay nóng giải ngân nhanh với lãi suất và phí ẩn cao dễ đẩy sinh viên vào vòng xoáy nợ xấu.',
    },
    {
      title: 'Thiếu kiến thức quản lý tài chính',
      desc: 'Chưa có thói quen lập ngân sách, dự phòng khẩn cấp và tính toán chi phí thực của khoản vay.',
    },
  ];

  const solutions = [
    {
      icon: Handshake,
      title: 'Kết nối vốn ngắn hạn',
      desc: 'Kết nối sinh viên có nhu cầu vốn học tập – sinh hoạt hợp lý với cá nhân có nguồn vốn nhàn rỗi muốn đồng hành.',
      color: 'bg-navy-50 text-[#0F2544] bg-slate-100',
    },
    {
      icon: Award,
      title: 'Đánh giá tín nhiệm sinh viên',
      desc: 'Mô hình chấm điểm mô phỏng A–D đa tiêu chí (hồ sơ, học tập, thu nhập, lịch sử hoàn trả) giúp minh bạch hóa rủi ro.',
      color: 'bg-emerald-50 text-[#15803D]',
    },
    {
      icon: Layers,
      title: 'Theo dõi & quản lý khoản vay',
      desc: 'Hiển thị rõ ràng kỳ hạn, lịch thanh toán, số tiền đã trả và tiến độ hoàn trả trên một giao diện thống nhất.',
      color: 'bg-amber-50 text-amber-700',
    },
    {
      icon: BookOpen,
      title: 'Giáo dục tài chính cá nhân',
      desc: 'Cung cấp cẩm nang lập ngân sách, phòng tránh tín dụng đen và công cụ cân đối thu chi dành riêng cho sinh viên.',
      color: 'bg-sky-50 text-sky-700',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Đăng ký & Xác minh tài khoản',
      desc: 'Sinh viên hoặc người có vốn tạo tài khoản theo vai trò và hoàn thiện thông tin định hướng eKYC.',
    },
    {
      step: '02',
      title: 'Cung cấp nhu cầu hoặc nguồn vốn',
      desc: 'Sinh viên gửi yêu cầu vay theo gói phù hợp; người có vốn duyệt danh sách nhu cầu minh bạch.',
    },
    {
      step: '03',
      title: 'Đánh giá tín nhiệm & Kết nối',
      desc: 'Hệ thống chấm điểm mô phỏng A–D và hỗ trợ hai bên xác nhận đề xuất kết nối.',
    },
    {
      step: '04',
      title: 'Theo dõi khoản vay & Hoàn trả',
      desc: 'Theo dõi lịch thanh toán định kỳ, cập nhật tiến độ hoàn trả và tích lũy điểm tín nhiệm.',
    },
  ];

  const techItems = [
    {
      icon: UserCheck,
      title: 'Định hướng eKYC',
      desc: 'Xác thực danh tính sinh viên kết hợp thẻ sinh viên và thông tin trường đại học (mô phỏng).',
    },
    {
      icon: Cloud,
      title: 'Hạ tầng Cloud',
      desc: 'Kiến trúc lưu trữ đám mây linh hoạt, sẵn sàng mở rộng kết nối nhiều trường đại học.',
    },
    {
      icon: FileSignature,
      title: 'Chữ ký điện tử (Định hướng)',
      desc: 'Xác nhận thỏa thuận kết nối minh bạch giữa các bên tham gia trên môi trường số.',
    },
    {
      icon: Award,
      title: 'Chấm điểm tín nhiệm A–D',
      desc: 'Thuật toán minh bạch, dễ giải thích, không lấy GPA làm căn cứ duy nhất.',
    },
    {
      icon: Lock,
      title: 'Mã hóa & Phân quyền dữ liệu',
      desc: 'Bảo vệ thông tin cá nhân theo vai trò (Sinh viên / Người có vốn / Quản trị).',
    },
    {
      icon: Wallet,
      title: 'Đối tác thanh toán phù hợp',
      desc: 'Định hướng tích hợp cổng thanh toán/ví điện tử được cấp phép khi triển khai thực tế.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F3] text-[#0F2544]">
      <PublicHeader />

      <main className="flex-1">
        {/* 4.1 HERO SECTION */}
        <section className="relative overflow-hidden border-b border-[#E7E2D8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-[#15803D] text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Đề án FinTech Sinh viên • Kinh tế – Tài chính – Ngân hàng
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-[#E5E0D5] bg-white shadow-sm shrink-0">
                    <img
                      src="/logo.jpeg"
                      alt="Logo Student P2P"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0F2544]">
                      STUDENT <span className="text-[#15803D]">P2P</span>
                    </h1>
                    <p className="text-sm sm:text-base font-semibold text-amber-600 mt-1">
                      Kết nối tài chính – Đồng hành cùng sinh viên
                    </p>
                  </div>
                </div>

                <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl">
                  Giải pháp kết nối tài chính ngang hàng minh bạch, an toàn và có trách nhiệm, đồng hành cùng sinh viên trên hành trình học tập.
                </p>

                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <a
                    href="#gioi-thieu"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[#0F2544]/20 bg-white text-[#0F2544] text-sm font-semibold hover:bg-slate-50 transition shadow-xs"
                  >
                    Khám phá Student P2P
                  </a>
                  <Link
                    to="/auth"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F2544] text-white text-sm font-semibold hover:bg-[#16335B] transition shadow-sm"
                  >
                    Trải nghiệm nền tảng
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right FinTech Illustration Card */}
              <div className="lg:col-span-5">
                <div className="bg-white rounded-2xl border border-[#E7E2D8] shadow-md p-6 space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-[#0F2544] text-white flex items-center justify-center">
                        <GraduationCap className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Mô phỏng kết nối P2P</p>
                        <p className="text-sm font-bold text-[#0F2544]">Hệ sinh thái Sinh viên</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Trực tuyến
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-[#FAF8F3] p-4 border border-[#EBE6DC]">
                      <p className="text-xs text-slate-500">Hạn mức học tập</p>
                      <p className="text-lg font-extrabold text-[#0F2544] mt-1">2 – 10 triệu</p>
                      <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Học phí & thiết bị</p>
                    </div>
                    <div className="rounded-xl bg-[#FAF8F3] p-4 border border-[#EBE6DC]">
                      <p className="text-xs text-slate-500">Vay vi mô khẩn cấp</p>
                      <p className="text-lg font-extrabold text-[#0F2544] mt-1">500k – 3 triệu</p>
                      <p className="text-[11px] text-amber-700 font-medium mt-0.5">Sinh hoạt thiết yếu</p>
                    </div>
                  </div>

                  <div className="rounded-xl bg-[#0F2544] text-white p-4 space-y-2.5">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span>Hệ thống tín nhiệm mô phỏng</span>
                      <span className="font-semibold text-amber-400">Hạng A – D</span>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        { g: 'A', label: 'Tốt', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' },
                        { g: 'B', label: 'Khá', cls: 'bg-sky-500/20 text-sky-300 border-sky-400/30' },
                        { g: 'C', label: 'Xem xét', cls: 'bg-amber-500/20 text-amber-300 border-amber-400/30' },
                        { g: 'D', label: 'Rủi ro', cls: 'bg-rose-500/20 text-rose-300 border-rose-400/30' },
                      ].map((item) => (
                        <div key={item.g} className={`rounded-lg border py-2 px-1 ${item.cls}`}>
                          <div className="text-sm font-bold">{item.g}</div>
                          <div className="text-[10px] opacity-90">{item.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Link
                    to="/auth"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[#15803D] hover:bg-emerald-800 text-white text-sm font-semibold transition"
                  >
                    Trải nghiệm nền tảng ngay
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4.2 GIỚI THIỆU DỰ ÁN */}
        <section id="gioi-thieu" className="py-16 sm:py-20 bg-white border-b border-[#E7E2D8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-[#15803D]">
                Về dự án Student P2P
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2544]">
                Cầu nối tài chính nhân văn và minh bạch cho sinh viên
              </h2>
              <p className="text-slate-600 leading-relaxed">
                Student P2P là nền tảng kết nối tài chính ngang hàng (Peer-to-Peer Lending) hướng đến sinh viên đại học, giúp người có nhu cầu vốn ngắn hạn tiếp cận người có nguồn vốn nhàn rỗi một cách an toàn và có trách nhiệm.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                'Định danh người dùng',
                'Đánh giá tín nhiệm A–D',
                'Kết nối người vay & có vốn',
                'Theo dõi khoản vay',
                'Giáo dục tài chính cá nhân',
              ].map((pillar, idx) => (
                <div
                  key={pillar}
                  className="rounded-2xl border border-[#E7E2D8] bg-[#FAF8F3] p-5 flex flex-col justify-between hover:border-[#0F2544]/30 transition"
                >
                  <span className="inline-flex w-8 h-8 rounded-lg bg-[#0F2544] text-amber-400 text-xs font-bold items-center justify-center">
                    0{idx + 1}
                  </span>
                  <p className="mt-4 text-sm font-bold text-[#0F2544] leading-snug">{pillar}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4.3 VẤN ĐỀ SINH VIÊN ĐANG GẶP PHẢI */}
        <section className="py-16 sm:py-20 bg-[#FAF8F3] border-b border-[#E7E2D8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-bold uppercase tracking-widest text-amber-600">
                  Thực trạng & Nỗi đau
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2544] mt-1">
                  Những khó khăn tài chính sinh viên thường gặp
                </h2>
              </div>
              <p className="text-sm text-slate-600 max-w-md">
                Khi thiếu kênh hỗ trợ chính thống phù hợp, sinh viên dễ rơi vào bẫy tín dụng không an toàn.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {problems.map((p) => (
                <div
                  key={p.title}
                  className="bg-white rounded-2xl border border-[#E7E2D8] p-6 space-y-2.5 shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-[#0F2544]">{p.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4.4 GIẢI PHÁP STUDENT P2P */}
        <section id="giai-phap" className="py-16 sm:py-20 bg-white border-b border-[#E7E2D8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-[#15803D]">
                Giải pháp toàn diện
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2544] mt-1">
                4 trụ cột giải pháp của Student P2P
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {solutions.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.title}
                    className="rounded-2xl border border-[#E7E2D8] bg-[#FAF8F3] p-6 flex items-start gap-4 hover:shadow-sm transition"
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#0F2544]">{s.title}</h3>
                      <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4.5 CÁC GÓI HỖ TRỢ VỐN DỰ KIẾN */}
        <section id="goi-ho-tro" className="py-16 sm:py-20 bg-[#FAF8F3] border-b border-[#E7E2D8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-[#15803D]">
                Sản phẩm minh họa trong đề án
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2544] mt-1">
                Các gói hỗ trợ vốn dự kiến
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Hạn mức dưới đây là số liệu minh họa phục vụ trình diễn đề án, không phải cam kết cấp vốn.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl border-2 border-[#0F2544]/15 p-7 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0F2544] text-white">
                    Gói 1
                  </span>
                  <span className="text-xs font-medium text-slate-500">Kỳ hạn gợi ý: 3–12 tháng</span>
                </div>
                <h3 className="text-xl font-extrabold text-[#0F2544]">
                  Học phí và thiết bị học tập
                </h3>
                <div className="text-2xl font-extrabold text-[#15803D]">
                  2 – 10 triệu đồng
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  <strong>Mục đích:</strong> Thanh toán học phí học kỳ, mua máy tính xách tay, giáo trình, tài liệu và trang thiết bị phục vụ học tập – nghiên cứu.
                </p>
                <ul className="space-y-2 text-sm text-slate-700 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                    <span>Minh bạch chi phí và lịch hoàn trả từng tháng</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                    <span>Đánh giá tín nhiệm đa tiêu chí A–D</span>
                  </li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl border-2 border-emerald-600/20 p-7 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#15803D] text-white">
                    Gói 2
                  </span>
                  <span className="text-xs font-medium text-slate-500">Kỳ hạn gợi ý: 1–4 tháng</span>
                </div>
                <h3 className="text-xl font-extrabold text-[#0F2544]">
                  Vay vi mô khẩn cấp
                </h3>
                <div className="text-2xl font-extrabold text-amber-600">
                  500.000 – 3 triệu đồng
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  <strong>Mục đích:</strong> Hỗ trợ sinh hoạt phí, tiền trọ, y tế và các khoản chi thiết yếu phát sinh đột xuất trong tháng.
                </p>
                <ul className="space-y-2 text-sm text-slate-700 pt-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                    <span>Quy trình mô phỏng gọn nhẹ, rõ ràng</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#15803D] shrink-0" />
                    <span>Giúp sinh viên tránh xa tín dụng đen ngắn hạn</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* 4.6 QUY TRÌNH HOẠT ĐỘNG */}
        <section id="quy-trinh" className="py-16 sm:py-20 bg-white border-b border-[#E7E2D8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-[#15803D]">
                Trải nghiệm liền mạch
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2544] mt-1">
                Quy trình hoạt động 4 bước
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((item) => (
                <div
                  key={item.step}
                  className="relative rounded-2xl border border-[#E7E2D8] bg-[#FAF8F3] p-6 space-y-3"
                >
                  <div className="text-3xl font-extrabold text-amber-500/80">{item.step}</div>
                  <h3 className="text-base font-bold text-[#0F2544]">{item.title}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4.7 CÔNG NGHỆ & AN TOÀN */}
        <section id="cong-nghe" className="py-16 sm:py-20 bg-[#FAF8F3] border-b border-[#E7E2D8]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mb-10">
              <span className="text-xs font-bold uppercase tracking-widest text-[#15803D]">
                Định hướng công nghệ
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2544] mt-1">
                Công nghệ dự kiến & An toàn dữ liệu
              </h2>
              <p className="text-sm text-slate-600 mt-2">
                Các công nghệ dưới đây là kiến trúc định hướng và mô phỏng trong đề án khởi nghiệp, chưa kết nối hệ thống ngân hàng hoặc định danh thực tế.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {techItems.map((t) => {
                const Icon = t.icon;
                return (
                  <div
                    key={t.title}
                    className="bg-white rounded-2xl border border-[#E7E2D8] p-6 space-y-2.5"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#0F2544]/5 text-[#0F2544] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-[#0F2544]">{t.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{t.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4.8 TẦM NHÌN & SỨ MỆNH */}
        <section id="tam-nhin" className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="rounded-2xl bg-[#0F2544] text-white p-8 space-y-4">
                <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4" />
                  Sứ mệnh
                </div>
                <h3 className="text-2xl font-extrabold">Đồng hành tài chính văn minh</h3>
                <ul className="space-y-3 text-sm text-slate-200">
                  {[
                    'Hỗ trợ sinh viên tiếp cận nguồn vốn ngắn hạn phù hợp.',
                    'Nâng cao nhận thức và kỹ năng quản lý tài chính cá nhân.',
                    'Xây dựng cộng đồng tài chính ngang hàng văn minh, minh bạch.',
                    'Góp phần hạn chế tín dụng đen học đường.',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-2xl border border-[#E7E2D8] bg-[#FAF8F3] p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 text-[#15803D] text-xs font-bold uppercase tracking-wider">
                    <TrendingUp className="w-4 h-4" />
                    Tầm nhìn 3 – 5 năm
                  </div>
                  <h3 className="text-2xl font-extrabold text-[#0F2544]">
                    Mạng lưới 15–20 trường đại học tại Việt Nam
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Trở thành nền tảng kết nối tài chính ngang hàng chuyên biệt và tin cậy dành cho sinh viên tại Việt Nam, phối hợp cùng các quỹ hỗ trợ sinh viên và đơn vị giáo dục để mở rộng mạng lưới liên kết tới 15–20 trường đại học.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <Link
                    to="/auth"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0F2544] text-white text-sm font-semibold hover:bg-[#16335B] transition"
                  >
                    Trải nghiệm ngay
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/app/education"
                    className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-[#0F2544]/20 bg-white text-[#0F2544] text-sm font-semibold hover:bg-slate-50 transition"
                  >
                    Xem góc Giáo dục tài chính
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
};
