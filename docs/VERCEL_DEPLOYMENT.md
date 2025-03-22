# Hướng dẫn triển khai ứng dụng lên Vercel

Tài liệu này cung cấp các bước chi tiết để triển khai ứng dụng Vehicle Management lên Vercel và đảm bảo ứng dụng hoạt động nhất quán giữa môi trường local và production.

## 1. Chuẩn bị

### 1.1. Tạo file .env.local cho môi trường local

Tạo file `.env.local` trong thư mục `frontend` với nội dung sau:

```
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://your-project-id.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key

# Default Admin Account
REACT_APP_DEFAULT_EMAIL=admin@example.com
REACT_APP_DEFAULT_PASSWORD=your-admin-password

# Application Settings
REACT_APP_VERSION=1.0.0
```

### 1.2. Kiểm tra ứng dụng trên môi trường local

```bash
cd frontend
npm start
```

Đảm bảo ứng dụng hoạt động bình thường trước khi triển khai lên Vercel.

## 2. Triển khai lên Vercel

### 2.1. Đăng ký và đăng nhập vào Vercel

Đăng ký tài khoản tại [Vercel](https://vercel.com) và đăng nhập.

### 2.2. Tạo dự án mới

1. Nhấn "Add New" > "Project"
2. Import repository từ GitHub
3. Cấu hình dự án:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

### 2.3. Cấu hình biến môi trường

1. Trong cài đặt dự án, chọn tab "Environment Variables"
2. Thêm tất cả các biến môi trường từ file `.env.local`:

| Name                         | Value                           | Environments         |
|------------------------------|--------------------------------|----------------------|
| REACT_APP_SUPABASE_URL       | https://your-project-id.supabase.co | Production, Preview, Development |
| REACT_APP_SUPABASE_ANON_KEY  | your-supabase-anon-key          | Production, Preview, Development |
| REACT_APP_DEFAULT_EMAIL      | admin@example.com               | Production, Preview, Development |
| REACT_APP_DEFAULT_PASSWORD   | your-admin-password             | Production, Preview, Development |
| REACT_APP_VERSION            | 1.0.0                           | Production, Preview, Development |

3. Nhấn "Save" để lưu các biến môi trường

### 2.4. Triển khai

1. Nhấn "Deploy" để bắt đầu quá trình triển khai
2. Đợi quá trình build và triển khai hoàn tất

### 2.5. Kiểm tra ứng dụng trên Vercel

1. Truy cập URL của ứng dụng được cung cấp bởi Vercel
2. Kiểm tra tất cả các chức năng để đảm bảo hoạt động bình thường

## 3. Giải quyết vấn đề khác biệt giữa môi trường local và Vercel

### 3.1. Thiếu biến môi trường

Nếu gặp lỗi "Thiếu biến môi trường" trên Vercel:

1. Kiểm tra lại các biến môi trường trong cài đặt dự án
2. Redeploy ứng dụng sau khi cập nhật biến môi trường

### 3.2. Lỗi xác thực Supabase

Nếu gặp lỗi xác thực Supabase:

1. Kiểm tra URL và Anon Key Supabase
2. Đảm bảo tài khoản mặc định đã được tạo trong Supabase Auth
3. Kiểm tra RLS (Row Level Security) trong Supabase

### 3.3. Lỗi đường dẫn

Nếu gặp lỗi 404 khi truy cập các route:

1. Kiểm tra cấu hình `vercel.json` trong thư mục gốc của dự án:

```json
{
  "version": 2,
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 3.4. Redeploy sau khi sửa lỗi

Sau khi sửa lỗi, redeploy ứng dụng từ dashboard Vercel:

1. Truy cập dự án trong Vercel dashboard
2. Chọn tab "Deployments"
3. Nhấn "Redeploy" trên deployment mới nhất

## 4. Kiểm tra console logs

### 4.1. Xem logs trên Vercel

1. Truy cập dự án trong Vercel dashboard
2. Chọn tab "Deployments" > Chọn deployment gần nhất
3. Chọn tab "Functions" để xem logs

### 4.2. Xem logs trong trình duyệt

1. Mở Developer Tools (F12) trong trình duyệt
2. Chọn tab "Console"
3. Kiểm tra các thông báo lỗi

## 5. Best Practices

1. **Sử dụng utility environment**: Luôn sử dụng `utils/environment.ts` để quản lý biến môi trường
2. **Kiểm tra lỗi cụ thể**: Log đầy đủ thông tin lỗi để dễ dàng debug
3. **Theo dõi trạng thái kết nối**: Luôn kiểm tra kết nối Supabase trước khi thực hiện các thao tác
4. **Fallback cho offline**: Cung cấp tùy chọn fallback khi không có kết nối internet

## 6. Môi trường Preview

Vercel tự động tạo preview cho mỗi pull request. Đảm bảo biến môi trường được cấu hình cho môi trường Preview để test các tính năng mới trước khi merge vào production. 