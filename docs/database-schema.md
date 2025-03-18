# Tài liệu Cấu trúc Database Supabase

## 1. Cấu trúc Schema
```
public/
├── vehicles
├── vehicle_costs
├── vehicle_payments
├── staff
├── capitals
├── capital_shareholders
├── kpi_targets
├── support_bonuses
└── sync_logs
```

## 2. Chi tiết các bảng

### 2.1 Bảng `vehicles`
```sql
CREATE TABLE public.vehicles (
  id text NOT NULL DEFAULT auth.uid(),
  name text NULL,
  color text NULL,
  manufacturing_year smallint NULL,
  odo integer NULL DEFAULT 0,
  status text NULL,
  import_date timestamp with time zone NULL DEFAULT now(),
  export_date timestamp with time zone NULL,
  purchase_price numeric NULL DEFAULT 0,
  sell_price numeric NULL DEFAULT 0,
  profit numeric NULL DEFAULT 0,
  debt numeric NULL DEFAULT 0,
  cost numeric NULL DEFAULT 0,
  storage_time integer NULL DEFAULT 0,
  notes text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  sales_staff_id text NULL,
  CONSTRAINT vehicles_pkey PRIMARY KEY (id),
  CONSTRAINT fk_sales_staff FOREIGN KEY (sales_staff_id) 
    REFERENCES staff(id) ON DELETE SET NULL
);
```

### 2.2 Bảng `vehicle_costs`
```sql
CREATE TABLE public.vehicle_costs (
  id text NOT NULL DEFAULT auth.uid(),
  vehicle_id text NOT NULL,
  amount numeric NULL,
  cost_date timestamp with time zone NULL DEFAULT now(),
  description text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT vehicle_costs_pkey PRIMARY KEY (id),
  CONSTRAINT fk_vehicle_costs FOREIGN KEY (vehicle_id) 
    REFERENCES vehicles(id) ON DELETE CASCADE
);
```

### 2.3 Bảng `vehicle_payments`
```sql
CREATE TABLE public.vehicle_payments (
  id text NOT NULL DEFAULT auth.uid(),
  vehicle_id text NOT NULL,
  amount numeric NULL,
  payment_date timestamp with time zone NULL DEFAULT now(),
  payment_type text NULL,
  notes text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT vehicle_payments_pkey PRIMARY KEY (id),
  CONSTRAINT fk_vehicle_payments_vehicle FOREIGN KEY (vehicle_id) 
    REFERENCES vehicles(id) ON DELETE CASCADE
);
```

## 3. Quan hệ giữa các bảng

### 3.1 Quan hệ 1-N
- `vehicles` ←→ `vehicle_costs`
- `vehicles` ←→ `vehicle_payments`
- `capitals` ←→ `capital_shareholders`

### 3.2 Quan hệ N-1
- `vehicles` → `staff` (qua sales_staff_id)

## 4. Ràng buộc và Khóa

### 4.1 Khóa chính
- `vehicles`: id (text, DEFAULT auth.uid())
- `vehicle_costs`: id (text, DEFAULT auth.uid())
- `vehicle_payments`: id (text, DEFAULT auth.uid())
- `staff`: id (text, DEFAULT auth.uid())
- `capitals`: id (uuid, DEFAULT uuid_generate_v4())
- `capital_shareholders`: id (uuid, DEFAULT uuid_generate_v4())
- `kpi_targets`: id (text, DEFAULT auth.uid())
- `support_bonuses`: department (text)
- `sync_logs`: id (uuid, DEFAULT uuid_generate_v4())

### 4.2 Khóa ngoại
- `vehicles.sales_staff_id` → `staff.id` (ON DELETE SET NULL)
- `vehicle_costs.vehicle_id` → `vehicles.id` (ON DELETE CASCADE)
- `vehicle_payments.vehicle_id` → `vehicles.id` (ON DELETE CASCADE)
- `capital_shareholders.capital_id` → `capitals.id` (ON DELETE CASCADE)

## 5. Kiểu dữ liệu

### 5.1 Kiểu cơ bản
- `text`: cho các trường chuỗi
- `numeric`: cho các trường tiền tệ
- `integer/smallint`: cho các trường số
- `timestamp with time zone`: cho các trường thời gian
- `uuid`: cho các trường ID đặc biệt

### 5.2 Giá trị mặc định
- `now()`: cho các trường thời gian
- `0`: cho các trường số
- `auth.uid()`: cho các trường ID người dùng
- `uuid_generate_v4()`: cho các trường UUID

## 6. Lưu ý quan trọng

1. Xóa dữ liệu:
   - Khi xóa xe, các chi phí và thanh toán liên quan sẽ tự động xóa (CASCADE)
   - Khi xóa nhân viên, sales_staff_id trong vehicles sẽ được set NULL

2. Đồng bộ thời gian:
   - Tất cả các bảng đều có created_at và updated_at
   - Sử dụng timestamp with time zone để lưu thời gian

3. Bảo mật:
   - Sử dụng auth.uid() cho các trường ID người dùng
   - Cần cấu hình RLS policies phù hợp 