# Cấu trúc Cơ sở dữ liệu Hệ thống Quản lý Xe

Tài liệu này mô tả cấu trúc của các bảng trong cơ sở dữ liệu Supabase được sử dụng cho ứng dụng Quản lý Xe.

## 1. Bảng `kpi_targets`

Bảng này lưu trữ các mục tiêu KPI cho nhân viên.

| Cột | Kiểu dữ liệu | Null | Mặc định |
|-----|--------------|------|----------|
| id | text | NOT NULL | DEFAULT auth.uid() |
| staff_id | text | NOT NULL | DEFAULT gen_random_uuid() |
| target_month | date | NULL | |
| sales_target | numeric | NULL | |
| profit_target | numeric | NULL | |
| actual_sales | numeric | NULL | |
| actual_profit | numeric | NULL | |
| achievement_rate | numeric | NULL | |
| created_at | timestamp with time zone | NULL | DEFAULT now() |
| updated_at | timestamp with time zone | NULL | DEFAULT now() |

## 2. Bảng `staff`

Bảng này lưu trữ thông tin về nhân viên.

| Cột | Kiểu dữ liệu | Null | Mặc định |
|-----|--------------|------|----------|
| id | text | NOT NULL | DEFAULT auth.uid() |
| name | text | NOT NULL | |
| phone | text | NULL | |
| email | text | NULL | |
| team | text | NULL | |
| role | text | NULL | |
| status | text | NULL | |
| join_date | timestamp with time zone | NULL | DEFAULT now() |
| leave_date | timestamp with time zone | NULL | |
| commission_rate | numeric | NULL | |
| base_salary | numeric | NULL | |
| created_at | timestamp with time zone | NULL | DEFAULT now() |
| updated_at | timestamp with time zone | NULL | DEFAULT now() |

## 3. Bảng `support_bonuses`

Bảng này lưu trữ thông tin về tiền thưởng cho các phòng ban hỗ trợ.

| Cột | Kiểu dữ liệu | Null | Mặc định |
|-----|--------------|------|----------|
| department | text | NOT NULL | |
| bonus_month | date | NULL | |
| bonus_amount | numeric | NULL | |
| achievement_rate | numeric | NULL | |
| notes | text | NULL | |
| created_at | timestamp with time zone | NULL | DEFAULT now() |
| updated_at | timestamp with time zone | NULL | DEFAULT now() |
| id | text | NULL | DEFAULT auth.uid() |

## 4. Bảng `vehicle_costs`

Bảng này lưu trữ thông tin về các chi phí liên quan đến xe.

| Cột | Kiểu dữ liệu | Null | Mặc định |
|-----|--------------|------|----------|
| vehicle_id | text | NOT NULL | |
| amount | numeric | NULL | |
| cost_date | timestamp with time zone | NULL | DEFAULT now() |
| description | text | NULL | |
| created_at | timestamp with time zone | NULL | DEFAULT now() |
| updated_at | timestamp with time zone | NULL | DEFAULT now() |
| id | text | NULL | DEFAULT auth.uid() |

## 5. Bảng `vehicle_payments`

Bảng này lưu trữ thông tin về các khoản thanh toán cho xe.

| Cột | Kiểu dữ liệu | Null | Mặc định |
|-----|--------------|------|----------|
| id | text | NOT NULL | |
| vehicle_id | text | NOT NULL | |
| amount | numeric | NULL | |
| payment_date | timestamp with time zone | NULL | DEFAULT now() |
| payment_type | text | NULL | |
| notes | text | NULL | |
| created_at | timestamp with time zone | NULL | DEFAULT now() |
| updated_at | timestamp with time zone | NULL | DEFAULT now() |

## 6. Bảng `vehicles`

Bảng này lưu trữ thông tin chính về các xe.

| Cột | Kiểu dữ liệu | Null | Mặc định |
|-----|--------------|------|----------|
| name | text | NULL | |
| color | text | NULL | |
| manufacturing_year | smallint | NULL | |
| odo | integer | NULL | DEFAULT 0 |
| status | text | NULL | |
| import_date | timestamp with time zone | NULL | DEFAULT now() |
| export_date | timestamp with time zone | NULL | |
| purchase_price | numeric | NULL | DEFAULT 0 |
| sell_price | numeric | NULL | DEFAULT 0 |
| profit | numeric | NULL | DEFAULT 0 |
| debt | numeric | NULL | DEFAULT 0 |
| cost | numeric | NULL | DEFAULT 0 |
| storage_time | integer | NULL | DEFAULT 0 |
| notes | text | NULL | |
| created_at | timestamp with time zone | NULL | DEFAULT now() |
| updated_at | timestamp with time zone | NULL | DEFAULT now() |
| id | text | NOT NULL | DEFAULT auth.uid() |
| sales_staff_id | text | NULL | |

## Ghi chú quan trọng

1. **Khóa ngoại**:
   - `staff_id` trong bảng `kpi_targets` liên kết với `id` trong bảng `staff`
   - `vehicle_id` trong bảng `vehicle_costs` và `vehicle_payments` liên kết với `id` trong bảng `vehicles`
   - `sales_staff_id` trong bảng `vehicles` liên kết với `id` trong bảng `staff`

2. **Các giá trị enum**:
   - `status` trong bảng `vehicles` có thể là: IN_STOCK, DEPOSITED, BANK_DEPOSITED, OFFSET, SOLD
   - `payment_type` trong bảng `vehicle_payments` có thể là: DEPOSIT, BANK_DEPOSIT, OFFSET, FULL_PAYMENT
   - `team` trong bảng `staff` có thể là: SALES_1, SALES_2, SALES_3, ACCOUNTING, MARKETING, MANAGEMENT, OTHER
   - `role` trong bảng `staff` có thể là: MANAGER, TEAM_LEADER, STAFF, INTERN
   - `status` trong bảng `staff` có thể là: ACTIVE, INACTIVE, ON_LEAVE, SUSPENDED, TERMINATED 