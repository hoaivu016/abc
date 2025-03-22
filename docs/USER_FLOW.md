# User Flow của Vehicle Management App

## 1. Luồng Đăng Nhập

1. **Truy cập ứng dụng**
   - Người dùng truy cập website
   - Hệ thống tự động kiểm tra trạng thái đăng nhập

2. **Màn hình đăng nhập**
   - Hiển thị form đăng nhập với email và mật khẩu
   - Người dùng nhập thông tin đăng nhập
   - Hệ thống xác thực thông qua Supabase Auth

3. **Xử lý đăng nhập**
   - Thành công: Lưu thông tin session, chuyển hướng đến trang chính
   - Thất bại: Hiển thị thông báo lỗi, cho phép thử lại

## 2. Luồng Quản Lý Xe

1. **Xem danh sách xe**
   - Người dùng truy cập tab "Danh Sách Xe"
   - Hệ thống hiển thị danh sách xe với thông tin chi tiết
   - Hỗ trợ lọc, tìm kiếm xe theo các tiêu chí khác nhau

2. **Thêm xe mới**
   - Người dùng nhấn nút "Thêm Xe"
   - Điền thông tin xe (tên, màu sắc, giá mua, giá bán...)
   - Hệ thống tự động tạo ID và lưu thông tin
   - Đồng bộ dữ liệu với Supabase nếu có kết nối

3. **Chỉnh sửa thông tin xe**
   - Chọn xe cần sửa, nhấn "Chỉnh sửa"
   - Cập nhật thông tin
   - Hệ thống cập nhật và đồng bộ dữ liệu

4. **Thay đổi trạng thái xe**
   - Chọn xe cần thay đổi trạng thái
   - Chọn trạng thái mới (Trong kho, Đã đặt cọc, Đã bán...)
   - Nhập thông tin bổ sung nếu cần
   - Hệ thống cập nhật trạng thái và các tính toán liên quan

5. **Thêm chi phí cho xe**
   - Chọn xe cần thêm chi phí
   - Nhập số tiền và mô tả chi phí
   - Hệ thống cập nhật tổng chi phí và lợi nhuận của xe

6. **Xóa xe**
   - Chọn xe cần xóa
   - Xác nhận việc xóa
   - Hệ thống xóa xe khỏi danh sách và đồng bộ với Supabase

## 3. Luồng Quản Lý Nhân Sự

1. **Xem danh sách nhân viên**
   - Truy cập tab "ADMIN" > Phần Nhân sự
   - Hiển thị danh sách nhân viên với thông tin chi tiết

2. **Thêm nhân viên mới**
   - Nhấn nút "Thêm Nhân Viên"
   - Điền thông tin nhân viên (tên, email, vai trò...)
   - Hệ thống tạo ID và lưu thông tin

3. **Chỉnh sửa thông tin nhân viên**
   - Chọn nhân viên cần sửa, nhấn "Chỉnh sửa"
   - Cập nhật thông tin
   - Hệ thống cập nhật và đồng bộ dữ liệu

4. **Xóa nhân viên**
   - Chọn nhân viên cần xóa
   - Xác nhận việc xóa
   - Hệ thống xóa nhân viên khỏi danh sách

## 4. Luồng Báo Cáo và Thống Kê

1. **Xem báo cáo tổng quan**
   - Truy cập tab "Báo Cáo"
   - Hiển thị thông tin thống kê về xe và nhân viên
   - Biểu đồ hiển thị doanh thu, lợi nhuận theo thời gian

2. **Lọc báo cáo theo thời gian**
   - Chọn tháng/năm cần xem báo cáo
   - Hệ thống cập nhật dữ liệu báo cáo theo thời gian đã chọn

3. **Phân tích tài chính**
   - Truy cập tab "Phân tích tài chính"
   - Nhập dữ liệu về vốn, lãi suất
   - Hệ thống tính toán và hiển thị các chỉ số tài chính

## 5. Luồng Quản Lý Tài Khoản

1. **Xem danh sách tài khoản**
   - Truy cập phần "Quản lý tài khoản"
   - Hiển thị danh sách người dùng của hệ thống

2. **Tạo tài khoản mới**
   - Nhấn nút "Tạo Tài Khoản"
   - Điền thông tin (email, mật khẩu, vai trò)
   - Hệ thống tạo tài khoản trong Supabase Auth
   - Tự động thêm người dùng vào bảng users

3. **Phân quyền tài khoản**
   - Chọn tài khoản cần phân quyền
   - Cập nhật vai trò (admin, manager, staff)
   - Hệ thống cập nhật thông tin trong cơ sở dữ liệu

## 6. Luồng Đồng Bộ Dữ Liệu

1. **Kiểm tra kết nối mạng**
   - Hệ thống tự động kiểm tra kết nối đến Supabase
   - Hiển thị trạng thái kết nối (Đã kết nối/Offline)

2. **Đồng bộ dữ liệu thủ công**
   - Nhấn nút "Đồng bộ" khi đang online
   - Hệ thống đồng bộ dữ liệu local lên Supabase
   - Hiển thị thông báo kết quả đồng bộ

3. **Đồng bộ tự động**
   - Các thao tác được lưu vào hàng đợi khi offline
   - Tự động đồng bộ khi có kết nối mạng
   - Xử lý xung đột dữ liệu nếu có

## 7. Luồng Đăng Xuất

1. **Đăng xuất**
   - Nhấn nút "Đăng xuất"
   - Hệ thống xóa thông tin session
   - Chuyển hướng đến trang đăng nhập

2. **Tự động đăng xuất**
   - Sau thời gian không hoạt động
   - Token hết hạn
   - Chuyển hướng đến trang đăng nhập với thông báo 