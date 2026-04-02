# Expense Tracker - Hệ thống Quản lý Chi tiêu & Ngân sách

Một ứng dụng web toàn diện giúp người dùng cá nhân quản lý tài chính hiệu quả thông qua việc ghi nhận thu nhập, kiểm soát chi tiêu và theo dõi ngân sách vượt mức. Hệ thống được xây dựng theo kiến trúc Client-Server với Frontend hiện đại và Backend mạnh mẽ.

## Mô tả dự án
Dự án cung cấp một bộ công cụ trực quan để quản lý các khoản tài chính hàng ngày. Người dùng có thể dễ dàng tạo các danh mục thu chi, ghi chép nhanh chóng các giao dịch, thiết lập hạn mức ngân sách và nhận thông báo khi chi tiêu vượt giới hạn. Dashboard cung cấp các báo cáo sinh động qua biểu đồ giúp cái nhìn toàn cảnh về sức khỏe tài chính. Ứng dụng hỗ trợ phân quyền User (người dùng) và Admin (quản lý hệ thống).

## Chức năng chính
- **Xác thực & Bảo mật**: Đăng ký, đăng nhập bằng tài khoản và bảo mật bằng mã OTP (gửi qua email) cùng JWT.
- **Tổng quan (Dashboard)**: Tóm tắt số dư, tổng thu, tổng chi và biểu đồ xu hướng tài chính biểu diễn trong thời gian thực.
- **Quản lý Giao dịch**: Theo dõi dòng tiền chi tiết, hỗ trợ thêm/sửa/xóa và tìm kiếm, lọc giao dịch theo ngày tháng hoặc quy mô hạng mục.
- **Quản lý Hạng mục**: Tùy chỉnh hạng mục thu/chi với đa dạng icon và màu sắc cá nhân hóa, sử dụng song song với những hạng mục hệ thống mặc định.
- **Quản lý Ngân sách**: Thiết lập hạn mức chi tiêu cho từng hạng mục trong tháng, hiển thị thanh tiến độ sử dụng. Cảnh báo tự động gửi qua email khi vượt ngân sách.
- **Báo cáo & Thống kê**: Báo cáo thu chi hàng tháng, hàng năm qua biểu đồ Line/Pie và hỗ trợ tính năng xuất file.
- **Phân quyền Admin**: Quản trị viên dễ dàng theo dõi hệ thống người dùng, cấu hình quy chuẩn cho các hạng mục hệ thống và chặn tài khoản vi phạm (Banned).

## Công nghệ sử dụng (Tech Stack)

### Frontend (Client)
- **Framework**: React 18, TypeScript, Vite
- **Thiết kế giao diện (UI)**: Tailwind CSS, radix-ui, shadcn/ui, lucide-react (Icons)
- **Quản lý trạng thái & API Flow**: React Query (TanStack Query v5), Zustand, Axios
- **Form & Validation**: React Hook Form, Zod
- **Biểu đồ hiển thị**: Recharts

### Backend (Server)
- **Runtime & Web Framework**: Node.js, Express (TypeScript)
- **Database**: MongoDB (kết nối qua Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens), bcryptjs
- **Tiện ích**: Nodemailer (gửi email OTP/Cảnh báo), Zod (Xác thực dữ liệu Payload đầu vào)
- **Tài liệu API**: Swagger UI (`swagger-jsdoc`, `swagger-ui-express`)

---

## Hướng dẫn cài đặt

Để chạy ứng dụng, bạn cần máy tính cài sẵn **Node.js (version 18+)** và cấu hình một cơ sở dữ liệu **MongoDB** (có thể cài đặt qua MongoDB Compass cục bộ hoặc tạo cluster trên MongoDB Atlas). Định dạng chạy ứng dụng chia thành 2 thư mục riêng biệt.

### 1. Cài đặt và khởi chạy Backend

1. **Mở terminal, di chuyển vào thư mục `backend`:**
   ```bash
   cd backend
   ```
2. **Cài đặt toàn bộ các thư viện gói bằng lệnh:**
   ```bash
   npm install
   ```
3. **Hướng dẫn cấu hình Email gửi OTP và tạo biến môi trường (`.env`)**

   **Bước 1: Bật Xác thực 2 bước (2-Factor Authentication)**
   1. Truy cập *Google Account Settings*.
   2. Chuyển đến mục **Security** (Bảo mật).
   3. Bật **2-Step Verification** (Xác minh 2 bước).

   **Bước 2: Tạo App Password (Mật khẩu ứng dụng)**
   1. Sau khi bật xác thực 2 bước, tìm kiếm và truy cập **App Passwords**.
   2. Đặt tên ứng dụng là: `Expense Tracker`.
   3. Nhấn **Create** (Tạo).
   4. Sao chép khối mật khẩu gồm 16 ký tự vừa được tạo ra.

   **Bước 3: Thiết lập file `.env`**
   Tại thư mục `backend`, tạo file `.env` mới và dán mẫu cấu hình dưới đây (nhớ thay đổi các giá trị bằng thông tin thực tế của bạn):

   ```env
   # Server Configuration
   PORT=5000

   # MongoDB Configuration
   MONGODB_URI=mongodb+srv://mydb_user:mydb_password@cluster0.abcd123.mongodb.net/my_database?retryWrites=true&w=majority

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_secure
   JWT_EXPIRES_IN=1d

   # Email Configuration (Gmail)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_16_character_app_password_here
   ```
4. **Khởi chạy máy chủ ở chế độ Development:**
   ```bash
   npm run dev
   ```
   *Terminal sẽ thông báo Server đang cùng lúc lắng nghe. Nếu chạy tại host `5000`, tài liệu hệ thống API (Swagger) có thể theo dõi mở rộng qua đường dẫn `http://localhost:5000/api-docs`.*

### 2. Cài đặt và khởi chạy Frontend

1. **Cùng lúc đó, mở một terminal session mới và rẽ nhánh di chuyển vào thư mục `frontend`:**
   ```bash
   cd frontend
   ```
2. **Cài đặt tiếp các thư viện giao diện:**
   ```bash
   npm install
   ```
3. **Khởi chạy giao diện người dùng ở chế độ Development:**
   ```bash
   npm run dev
   ```
   *Trình quản lý Vite sẽ báo thành công và cung cấp cho bạn một đường dẫn URL Server tĩnh (thường sẽ nằm ở dạng `http://localhost:5173`). Bạn chỉ cần copy địa chỉ này và mở trên các trình duyệt Web để có thể trải nghiệm trực tiếp hệ thống.*
