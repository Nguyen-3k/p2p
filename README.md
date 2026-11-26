# STUDENT P2P – Nền tảng kết nối tài chính ngang hàng dành cho sinh viên (MVP Demo)

> **Slogan:** Kết nối nguồn vốn – Đồng hành cùng sinh viên  
> **Phạm vi:** Sản phẩm mô phỏng phục vụ đề án khởi nghiệp của nhóm sinh viên ngành Kinh tế – Tài chính – Ngân hàng. Mọi khoản vay, kết nối vốn, điểm tín nhiệm, hợp đồng và thanh toán trên hệ thống đều là dữ liệu giả lập, không phát sinh giao dịch tiền thật.

---

## 1. Giới thiệu dự án
**STUDENT P2P** là nền tảng kết nối tài chính ngang hàng (Peer-to-Peer Lending) hướng đến sinh viên đại học tại Việt Nam, giúp kết nối minh bạch giữa sinh viên có nhu cầu vốn ngắn hạn (học phí, thiết bị học tập, sinh hoạt khẩn cấp) và cá nhân có nguồn vốn nhàn rỗi muốn đồng hành.

---

## 2. Công nghệ sử dụng
- **Frontend:** React 19, TypeScript, Vite 8
- **Styling & Icons:** Tailwind CSS v4, Lucide React
- **Routing:** React Router v7
- **Lưu trữ dữ liệu MVP:** `localStorage` (`sp2p_*`, có schema version `v2` & migration tương thích dữ liệu cũ)

---

## 3. Hướng dẫn cài đặt
Yêu cầu Node.js >= 18 và npm:
```bash
npm install
```

---

## 4. Hướng dẫn chạy
```bash
# Chạy môi trường phát triển
npm run dev

# Kiểm tra TypeScript & build production
npm run build

# Kiểm tra lint
npm run lint
```

---

## 5. Danh sách tài khoản Demo
Mật khẩu chung cho tất cả tài khoản demo: **`Student123!`**

| Vai trò | Email | Quyền & Chức năng chính |
| :--- | :--- | :--- |
| **Sinh viên (Người vay)** | `student@studentp2p.demo` | Quản lý hồ sơ & xác minh, tạo/sửa/hủy yêu cầu vay, đồng ý/từ chối đề xuất kết nối, xem hợp đồng dự thảo, thanh toán mô phỏng, xem điểm tín nhiệm A–D |
| **Người có vốn** | `investor@studentp2p.demo` | Quản lý hồ sơ & xác minh, đăng ký & quản lý nguồn vốn, lọc & ghép nối thông minh, gửi đề xuất kết nối, xác nhận bước cuối tạo hợp đồng dự thảo |
| **Quản trị viên (Admin)** | `admin@studentp2p.demo` | Dashboard thống kê thực tế, quản lý người dùng (khóa/mở), duyệt/từ chối xác minh, quản lý yêu cầu vay, nguồn vốn, đề xuất, hợp đồng, nội dung & nhật ký |

---

## 6. Các chức năng hiện có
- **Website Public (`/`):** Trang chủ giới thiệu đề án, vấn đề sinh viên, giải pháp, gói hỗ trợ, hướng dẫn 8 bước, công nghệ định hướng, tin tức & liên hệ.
- **Hồ sơ & Xác minh mô phỏng (`/app/profile`):** Cập nhật thông tin sinh viên/người có vốn (không cho tự đổi vai trò) và gửi yêu cầu xác minh mô phỏng (không thu thập CCCD thật).
- **Đăng ký & Quản lý nguồn vốn (`/app/capital`):** Người có vốn đăng ký vốn khả dụng, hạn mức min/max, kỳ hạn, tạm ngừng/kích hoạt lại và kiểm soát chặt không phân bổ vượt quá vốn khả dụng.
- **Ghép nối P2P xác nhận hai chiều:** Người có vốn gửi đề xuất → Sinh viên đồng ý/từ chối → Người có vốn xác nhận bước cuối → Tự động tạo Kết nối, Hợp đồng dự thảo và Lịch thanh toán.
- **Hợp đồng dự thảo (`/app/contracts`):** Tài liệu hợp đồng minh họa đầy đủ thông tin hai bên, lịch thanh toán, hỗ trợ in/lưu PDF.
- **Quản lý khoản vay (`/app/loans`):** Theo dõi tiến độ hoàn trả, thanh toán mô phỏng từng kỳ (chống thanh toán trùng kỳ).
- **Điểm tín nhiệm A–D (`/app/credit-score`):** Chấm điểm mô phỏng 5 tiêu chí, không dùng GPA làm căn cứ duy nhất.
- **Giáo dục tài chính (`/app/education`):** Thư viện bài viết và công cụ mô phỏng ngân sách cá nhân.
- **Thông báo (`/app/notifications`) & Quản trị Admin (`/app/admin`).**

---

## 7. Quy trình hoạt động (8 bước)
1. Đăng ký tài khoản (Sinh viên hoặc Người có vốn).
2. Hoàn thiện hồ sơ cá nhân.
3. Gửi yêu cầu xác minh mô phỏng và được Admin duyệt.
4. Sinh viên tạo yêu cầu vay vốn; Người có vốn đăng ký nguồn vốn khả dụng.
5. Người có vốn tìm kiếm & ghép nối thông minh, gửi đề xuất kết nối.
6. Sinh viên xem xét và đồng ý (hoặc từ chối) đề xuất; Người có vốn xác nhận bước cuối.
7. Hệ thống tự động tạo Hợp đồng dự thảo và Lịch thanh toán từng kỳ.
8. Hai bên theo dõi khoản vay và thực hiện thanh toán mô phỏng.

---

## 8. Cách khôi phục dữ liệu demo
Nhấn nút **"Khôi phục dữ liệu mẫu"** ở thanh điều hướng bên trái (Sidebar) trong ứng dụng và xác nhận để đưa toàn bộ dữ liệu `localStorage` về trạng thái mẫu ban đầu.

---

## 9. Giới hạn của phiên bản MVP
- Dữ liệu lưu cục bộ trên `localStorage` của trình duyệt, chưa có backend/database tập trung và chưa phải hệ thống bảo mật thực tế.
- Không tích hợp ngân hàng, ví điện tử, cổng thanh toán, giải ngân thật, eKYC thật hay chữ ký số có giá trị pháp lý.

---

## 10. Hướng phát triển trong tương lai
- Xây dựng Backend API & cơ sở dữ liệu quan hệ (PostgreSQL) với xác thực JWT và phân quyền máy chủ.
- Tích hợp đối tác eKYC, cổng thanh toán/ngân hàng được cấp phép và quy trình ký kết điện tử tuân thủ pháp luật Việt Nam.
- Liên kết trực tiếp với phòng Công tác Sinh viên và Quỹ hỗ trợ của các trường đại học.
