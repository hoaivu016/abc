# Hướng Dẫn Đưa Code Lên Git

Tài liệu này hướng dẫn cách đưa code của dự án Vehicle Management lên GitHub.

## 1. Chuẩn Bị

### 1.1. Cài Đặt Git

- Tải và cài đặt Git từ [trang chủ Git](https://git-scm.com/downloads)
- Kiểm tra cài đặt bằng lệnh: `git --version`

### 1.2. Cấu Hình Git

```bash
git config --global user.name "Tên của bạn"
git config --global user.email "email@example.com"
```

### 1.3. Tạo Repository Trên GitHub

1. Đăng nhập vào GitHub
2. Nhấn nút "New" để tạo repository mới
3. Đặt tên repository (ví dụ: vehicle-management)
4. Chọn visibility (Public hoặc Private)
5. Không khởi tạo repository với README, .gitignore, hoặc license
6. Nhấn "Create repository"

## 2. Khởi Tạo Git Trong Dự Án

### 2.1. Khởi Tạo Git

Mở terminal và di chuyển đến thư mục dự án:

```bash
cd /đường/dẫn/đến/vehicle-management
git init
```

### 2.2. Thêm File .gitignore

Tạo file .gitignore để loại trừ các file không cần theo dõi:

```bash
# Dependencies
/node_modules
/.pnp
.pnp.js

# Testing
/coverage

# Production
/build
/dist

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Supabase
.env
```

## 3. Đưa Code Lên GitHub

### 3.1. Kiểm Tra Trạng Thái

```bash
git status
```

### 3.2. Thêm Files Vào Staging Area

```bash
# Thêm tất cả các file
git add .

# Hoặc thêm từng file cụ thể
git add frontend/src/components/
git add docs/
```

### 3.3. Commit Các Thay Đổi

```bash
git commit -m "Initial commit: Vehicle Management System"
```

### 3.4. Liên Kết Với Repository Trên GitHub

```bash
git remote add origin https://github.com/username/vehicle-management.git
```

Thay `username` bằng tên người dùng GitHub của bạn.

### 3.5. Đẩy Code Lên GitHub

```bash
git push -u origin main
```

Nếu branch của bạn là `master` thay vì `main`, hãy sử dụng:

```bash
git push -u origin master
```

## 4. Quản Lý Branches

### 4.1. Tạo Branch Mới

```bash
git checkout -b feature/login-page
```

### 4.2. Chuyển Đổi Giữa Các Branch

```bash
git checkout main    # Chuyển về branch chính
git checkout feature/login-page    # Chuyển đến branch feature
```

### 4.3. Merge Branch

```bash
git checkout main    # Chuyển về branch chính
git merge feature/login-page    # Merge branch feature vào main
```

### 4.4. Đẩy Branch Lên GitHub

```bash
git push origin feature/login-page
```

## 5. Cập Nhật Repository

### 5.1. Lấy Thay Đổi Từ GitHub

```bash
git pull origin main
```

### 5.2. Xem Lịch Sử Commit

```bash
git log
git log --oneline    # Hiển thị ngắn gọn
```

## 6. Quy Trình Làm Việc Cơ Bản

1. `git pull origin main` - Lấy phiên bản mới nhất
2. Tạo branch mới cho tính năng: `git checkout -b feature/new-feature`
3. Thực hiện các thay đổi và test
4. Thêm files: `git add .`
5. Commit: `git commit -m "Add new feature: XYZ"`
6. Push: `git push origin feature/new-feature`
7. Tạo Pull Request trên GitHub
8. Merge vào main sau khi review

## 7. Một Số Lệnh Git Hữu Ích

- Xem sự khác biệt: `git diff`
- Hủy bỏ thay đổi: `git checkout -- file-name`
- Xem remote repositories: `git remote -v`
- Xem branches: `git branch`
- Xóa branch: `git branch -d branch-name`
- Lưu thay đổi tạm thời: `git stash`
- Áp dụng thay đổi đã lưu: `git stash pop`

## 8. Xử Lý Xung Đột

Khi xuất hiện xung đột (conflict):

1. Mở file có xung đột
2. Tìm các phần được đánh dấu với `<<<<<<< HEAD`, `=======`, và `>>>>>>> branch-name`
3. Chỉnh sửa file để giải quyết xung đột
4. Lưu file
5. Tiếp tục quá trình merge: `git add .` và `git commit`

## 9. Tài Liệu Tham Khảo

- [Git Documentation](https://git-scm.com/doc)
- [GitHub Guides](https://guides.github.com/)
- [Pro Git Book](https://git-scm.com/book/en/v2) 