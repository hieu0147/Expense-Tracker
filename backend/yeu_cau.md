Functional Design Specification (FDS)
Ứng dụng Theo dõi Chi tiêu & Ngân sách (Expense Tracker)
________________________________________
1. Tổng quan
1.1 Mục tiêu
Ứng dụng Theo dõi Chi tiêu & Ngân sách là hệ thống hỗ trợ người dùng cá nhân quản lý tài chính hiệu quả thông qua việc ghi nhận thu nhập, chi tiêu và theo dõi ngân sách.
Hệ thống cung cấp:
•	Quản lý giao dịch thu/chi theo danh mục 
•	Theo dõi ngân sách theo tháng 
•	Dashboard trực quan (biểu đồ) 
•	Báo cáo theo ngày/tháng/năm 
•	Nhắc nhở vượt ngân sách 
•	Xác thực bảo mật bằng JWT 
•	Swagger để viết API Document 
________________________________________
1.2 Phạm vi
Tính năng chính
•	Quản lý tài khoản người dùng 
•	Quản lý danh mục (categories) 
•	Quản lý giao dịch (transactions) 
•	Quản lý ngân sách (budgets) 
•	Báo cáo & thống kê 
•	Xác thực OTP và JWT 
Cơ sở dữ liệu
•	users: Quản lý tài khoản 
•	categories: Danh mục thu/chi 
•	transactions: Giao dịch 
•	budgets: Ngân sách 
•	otpTokens: Xác thực OTP 
Đối tượng sử dụng
•	User (người dùng cá nhân) 
•	Admin (quản lý hệ thống – tùy chọn mở rộng) 
________________________________________
1.3 Vai trò người dùng
•	User: Quản lý chi tiêu cá nhân 
•	Admin: Quản lý hệ thống (nếu mở rộng) 
________________________________________
2. Yêu cầu chức năng
________________________________________
2.1 Quản lý tài khoản và xác thực
Mô tả
Cho phép người dùng đăng ký, đăng nhập, xác thực OTP và quản lý tài khoản.
________________________________________
Frontend (FE)
•	Trang đăng ký: 
o	Nhập email, password, name 
o	Gửi OTP xác thực 
•	Trang đăng nhập: 
o	Email + password 
o	Lưu token 
•	Trang profile: 
o	Hiển thị name, email, avatar 
o	Cho phép cập nhật thông tin 
•	Trạng thái: 
o	status: PENDING / ACTIVE / BANNED 
________________________________________
Backend (BE)
API
•	POST /auth/register 
•	POST /auth/login 
•	POST /auth/verify-otp 
•	POST /auth/resend-otp 
•	GET /users/me 
•	PUT /users/me 
Xác thực
•	JWT cho tất cả API 
•	Middleware kiểm tra token 
________________________________________
Database
users
•	_id, email, password, name, avatar 
•	role, status 
•	created_at, updated_at 
otpTokens
•	_id, userId, otp
•	expiresAt
________________________________________
2.2 Quản lý danh mục (Categories)
Mô tả
Cho phép người dùng tạo danh mục thu/chi.
________________________________________
Frontend (FE)
•	Trang danh mục: 
o	Hiển thị list category 
o	Phân loại: 
	Income 
	Expense 
•	Form tạo: 
o	name, icon, color 
o	type (income/expense) 
•	Hỗ trợ: 
o	chỉnh sửa 
o	xóa 
________________________________________
Backend (BE)
API
•	POST /categories 
•	GET /categories 
•	PUT /categories/:id 
•	DELETE /categories/:id 
________________________________________
Database
categories
•	_id, userId 
•	name, type 
•	icon, color 
•	isDefault 
•	created_at 
________________________________________
2.3 Quản lý giao dịch (Transactions)
Mô tả
Quản lý các khoản thu/chi hàng ngày.
________________________________________
Frontend (FE)
•	Trang giao dịch: 
o	Danh sách giao dịch 
o	Lọc theo: 
	ngày 
	tháng 
	category 
•	Form tạo: 
o	amount 
o	category 
o	type (income/expense) 
o	note 
o	image (optional) 
o	date 
________________________________________
Backend (BE)
API
•	POST /transactions 
•	GET /transactions 
•	PUT /transactions/:id 
•	DELETE /transactions/:id 
•	Query: 
o	filter theo date, category, type 
________________________________________
Database
transactions
•	_id, userId, categoryId 
•	amount, type 
•	note, imageUrl 
•	date 
•	created_at, updated_at 
________________________________________
2.4 Quản lý ngân sách (Budgets)
Mô tả
Thiết lập ngân sách theo danh mục và theo tháng.
________________________________________
Frontend (FE)
•	Trang ngân sách: 
o	Hiển thị limit vs spent 
o	Thanh progress 
•	Form: 
o	chọn category 
o	nhập limitAmount 
o	chọn tháng/năm 
•	Cảnh báo: 
o	khi vượt ngân sách 
________________________________________
Backend (BE)
API
•	POST /budgets 
•	GET /budgets 
•	PUT /budgets/:id 
•	DELETE /budgets/:id 
•	Logic: 
o	Tự động tính spentAmount từ transactions 
o	Trigger cảnh báo khi vượt limit 
________________________________________
Database
budgets
•	_id, userId, categoryId 
•	limitAmount, spentAmount 
•	month, year 
•	isAlerted 
•	created_at, updated_at 
________________________________________
2.5 Dashboard & Báo cáo
Mô tả
Hiển thị dữ liệu tài chính trực quan.
________________________________________
Frontend (FE)
•	Dashboard: 
o	Tổng thu / chi 
o	Balance 
o	Biểu đồ: 
	Pie chart (theo category) 
	Line chart (theo thời gian) 
•	Bộ lọc: 
o	ngày / tháng / năm 
________________________________________
Backend (BE)
API
•	GET /reports/summary 
•	GET /reports/by-category 
•	GET /reports/trend 
________________________________________
Xử lý
•	Aggregate MongoDB 
•	Tính toán: 
o	tổng income 
o	tổng expense 
o	balance 
________________________________________
2.6 Thông báo & cảnh báo
Mô tả
Thông báo khi:
•	vượt ngân sách 
•	nhận email cảnh báo
________________________________________
Backend (BE)
•	Gửi email cảnh báo khi vượt budget 
________________________________________
3. Yêu cầu phi chức năng
________________________________________
3.1 Hiệu suất
•	Index MongoDB: 
o	userId 
o	categoryId 
o	date 
•	Pagination cho transactions 
________________________________________
3.2 Bảo mật
•	JWT authentication 
•	bcrypt hash password 
•	OTP expiration 
________________________________________
3.3 Khả năng mở rộng
•	Có thể tích hợp: 
o	Mobile App 
________________________________________
3.4 Giao diện
•	Responsive (mobile + desktop) 
•	UI dashboard trực quan 
________________________________________
4. Ưu tiên triển khai
Cơ bản
•	Auth (JWT + OTP) 
•	Transactions 
•	Categories 
Nâng cao
•	Budgets 
•	Dashboard 
Bổ sung
•	Notification
________________________________________
5. Lưu ý kỹ thuật
•	Frontend: React / Vue + Tailwind 
•	Backend: Node.js + Express 
•	Database: MongoDB 
•	Auth: JWT + OTP 
________________________________________
6. Giả định
•	Người dùng cá nhân 
•	Không cần multi-tenant phức tạp 
•	Timeline: 2–4 tháng 
________________________________________
7. Phụ lục: Database Schema
users
•	_id, email, password, name, avatar 
•	role, status 
•	created_at, updated_at 
categories
•	_id, userId 
•	name, type, icon, color 
•	isDefault 
•	created_at 
transactions
•	_id, userId, categoryId 
•	amount, type 
•	note, imageUrl 
•	date 
•	created_at, updated_at 
budgets
•	_id, userId, categoryId 
•	limitAmount, spentAmount 
•	month, year 
•	isAlerted 
otpTokens
•	_id, userId 
•	otp
•	expiresAt

