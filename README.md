# Expense Tracker - Ứng dụng Theo dõi Chi tiêu & Ngân sách

Ứng dụng web hiện đại giúp cá nhân quản lý thu nhập, chi tiêu, ngân sách và xem báo cáo tài chính trực quan.

## Tính năng chính

- **Dashboard**: Tổng quan thu nhập, chi tiêu, số dư với biểu đồ phân bổ
- **Quản lý giao dịch**: Thêm, sửa, xóa giao dịch với bộ lọc và tìm kiếm
- **Quản lý hạng mục**: Hạng mục thu nhập và chi tiêu có sẵn
- **Ngân sách**: Đặt và theo dõi ngân sách theo hạng mục
- **Báo cáo**: Biểu đồ và phân tích chi tiết 6 tháng gần nhất
- **Dark/Light mode**: Chuyển đổi giao diện tối/sáng
- **Responsive**: Tối ưu cho cả mobile và desktop

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: Tailwind CSS + shadcn/ui + Radix UI
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query) v5
- **Forms**: React Hook Form + Zod
- **Charts**: Recharts
- **Router**: React Router DOM v6

## Cài đặt

### Yêu cầu

- Node.js 18+ và npm/yarn

### Bước 1: Clone và cài đặt dependencies

\`\`\`bash
# Clone repository (nếu có)
git clone <repository-url>
cd expense-tracker-app

# Cài đặt dependencies
npm install
\`\`\`

### Bước 2: Chạy ứng dụng

\`\`\`bash
# Development mode
npm run dev

# Build cho production
npm run build

# Preview production build
npm run preview
\`\`\`

Ứng dụng sẽ chạy tại: `http://localhost:5173`

## Cấu trúc thư mục

\`\`\`
src/
├── components/          # React components
│   ├── ui/             # UI components (shadcn/ui)
│   ├── layout/         # Layout components
│   └── ...
├── contexts/           # React contexts (Auth)
├── hooks/              # Custom React hooks
├── lib/                # Utilities & configs
├── pages/              # Page components
└── main.tsx           # Entry point
\`\`\`

## Hướng dẫn sử dụng

### 1. Đăng ký/Đăng nhập

- Truy cập `/register` để tạo tài khoản mới
- Hoặc `/login` để đăng nhập

### 2. Thêm giao dịch

- Vào trang **Giao dịch**
- Click nút **Thêm giao dịch**
- Chọn loại (Thu nhập/Chi tiêu), hạng mục, số tiền, ngày
- Thêm ghi chú nếu cần

### 3. Xem Dashboard

- Dashboard hiển thị tổng quan tháng hiện tại
- Biểu đồ tròn phân bổ chi tiêu
- 5 giao dịch gần nhất
- Cảnh báo ngân sách vượt mức

### 4. Theo dõi Ngân sách

- Vào trang **Ngân sách**
- Xem tiến độ sử dụng ngân sách theo hạng mục
- Nhận cảnh báo khi sắp vượt/đã vượt ngân sách

### 5. Xem Báo cáo

- Vào trang **Báo cáo**
- Xem biểu đồ cột thu chi 6 tháng
- Xuất báo cáo PDF/CSV (nếu cần)

## Scripts

\`\`\`bash
npm run dev          # Chạy development server
npm run build        # Build production
npm run preview      # Preview production build
npm run lint         # Lint code
npm run typecheck    # TypeScript type checking
\`\`\`

## Công nghệ sử dụng

- **React 18**: UI library
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Tailwind CSS**: Utility-first CSS
- **shadcn/ui**: Component library
- **Radix UI**: Accessible components
- **TanStack Query**: Server state management
- **React Hook Form**: Form handling
- **Zod**: Schema validation
- **Recharts**: Data visualization
- **Supabase**: Backend & Database
- **date-fns**: Date utilities

## License

MIT

---

Phát triển bởi Expense Tracker Team
