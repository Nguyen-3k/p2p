# STUDENT P2P – Nền tảng kết nối tài chính ngang hàng dành cho sinh viên (Demo)

> **Slogan:** Kết nối tài chính – Đồng hành cùng sinh viên  
> **Phạm vi:** Sản phẩm mô phỏng phục vụ đề án khởi nghiệp của nhóm sinh viên ngành Kinh tế – Tài chính – Ngân hàng. Mọi khoản vay, kết nối vốn, điểm tín nhiệm và thanh toán trên hệ thống đều là dữ liệu giả lập, không phát sinh giao dịch tiền thật.

---

## 1. Hướng dẫn chạy dự án

### Yêu cầu môi trường
- Node.js >= 18 (khuyến nghị v20+)
- npm

### Cài đặt & chạy chế độ phát triển
```bash
npm install
npm run dev
```
Sau đó mở trình duyệt tại địa chỉ hiển thị trên terminal (thường là `http://localhost:5173`).

### Kiểm tra build production
```bash
npm run build
```

---

## 2. Cách gắn logo `logo.jpeg` của bạn
- Toàn bộ website (Header, Hero Section, Footer, Sidebar, Favicon) đều đang liên kết trực tiếp tới file:
  ```
  public/logo.jpeg
  ```
- Hiện tại đã có sẵn một ảnh placeholder tại `public/logo.jpeg`. Khi bạn muốn dùng logo gốc của mình, chỉ cần **chép đè file `logo.jpeg` của bạn vào `public/logo.jpeg`** — toàn bộ giao diện sẽ tự động cập nhật ngay lập tức.

---

## 3. Tài khoản Demo trình diễn nhanh

Mật khẩu chung cho tất cả tài khoản demo: **`Student123!`**

| Vai trò | Email | Chức năng chính |
| :--- | :--- | :--- |
| **Sinh viên (Người vay)** | `student@studentp2p.demo` | Tạo/sửa/hủy yêu cầu vay, xem điểm tín nhiệm A–D, mô phỏng thanh toán kỳ hạn |
| **Người có vốn** | `investor@studentp2p.demo` | Lọc/tìm kiếm nhu cầu vay, xem chi tiết hồ sơ, đề xuất kết nối mô phỏng |
| **Quản trị viên (Admin)** | `admin@studentp2p.demo` | Xem thống kê tổng quan, quản lý người dùng (khóa/mở), cập nhật trạng thái khoản vay, xem nhật ký |

*(Bạn có thể bấm nút **"Đăng nhập nhanh"** ngay trên trang `/auth` mà không cần gõ tay).*

---

## 4. Dữ liệu & Lưu trữ
- Dữ liệu được lưu cục bộ trên trình duyệt qua `localStorage` (`sp2p_*`).
- Khi tạo yêu cầu vay mới, đề xuất kết nối, hoặc mô phỏng thanh toán, dữ liệu sẽ đồng bộ ngay lập tức giữa các vai trò.
- Có nút **"Khôi phục dữ liệu demo"** ở thanh điều hướng bên trái để đưa toàn bộ dữ liệu về trạng thái ban đầu trước mỗi buổi trình diễn.
