# Hệ Thống Quản Lý Kho Xe

## Giới Thiệu
Ứng dụng quản lý kho xe chuyên nghiệp, hỗ trợ quản lý thông tin xe, báo cáo và nhân sự.

## Công Nghệ Chính
- Frontend: React.js + TypeScript
- Backend: Node.js/Express.js
- Database: PostgreSQL (Neon)
- Xác Thực: JWT
- UI Framework: TBD

## Cấu Trúc Dự Án
Xem chi tiết tại [STRUCTURE.md](STRUCTURE.md)

## Yêu Cầu Hệ Thống
- Node.js v16+
- npm v8+
- PostgreSQL

## Cài Đặt

### Bước 1: Clone Dự Án
```bash
git clone https://github.com/username/vehicle-management.git
cd vehicle-management
```

### Bước 2: Cài Đặt Dependencies
```bash
npm install
```

### Bước 3: Cấu Hình Môi Trường
Sao chép `.env.example` thành `.env` và điền thông tin cần thiết

### Bước 4: Chạy Ứng Dụng
```bash
# Chạy development
npm run dev

# Build production
npm run build
npm start
```

## Kiểm Thử
```bash
# Chạy unit tests
npm run test:unit

# Chạy integration tests
npm run test:integration

# Chạy end-to-end tests
npm run test:e2e
```

## Đóng Góp
Vui lòng đọc [DEVELOPMENT.md](DEVELOPMENT.md) trước khi đóng góp

## Giấy Phép
[Chỉ định giấy phép] 


Lưu Ý Quan Trọng
Giữ nguyên chức năng hiện tại
Không thay đổi giao diện người dùng
Kiểm tra kỹ từng thay đổi
Sử dụng TypeScript để đảm bảo type safety