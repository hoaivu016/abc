-- Cấu trúc Cơ sở dữ liệu Hệ thống Quản lý Xe
-- Tập tin này chứa cấu trúc SQL của các bảng trong cơ sở dữ liệu Supabase

-- 1. Bảng kpi_targets
CREATE TABLE kpi_targets (
    id text PRIMARY KEY DEFAULT auth.uid() NOT NULL,
    staff_id text NOT NULL DEFAULT gen_random_uuid(),
    target_month date NULL,
    sales_target numeric NULL,
    profit_target numeric NULL,
    actual_sales numeric NULL,
    actual_profit numeric NULL,
    achievement_rate numeric NULL,
    created_at timestamp with time zone NULL DEFAULT now(),
    updated_at timestamp with time zone NULL DEFAULT now()
);

-- 2. Bảng staff
CREATE TABLE staff (
    id text PRIMARY KEY DEFAULT auth.uid() NOT NULL,
    name text NOT NULL,
    phone text NULL,
    email text NULL,
    team text NULL,
    role text NULL,
    status text NULL,
    join_date timestamp with time zone NULL DEFAULT now(),
    leave_date timestamp with time zone NULL,
    commission_rate numeric NULL,
    base_salary numeric NULL,
    created_at timestamp with time zone NULL DEFAULT now(),
    updated_at timestamp with time zone NULL DEFAULT now()
);

-- 3. Bảng support_bonuses
CREATE TABLE support_bonuses (
    id text NULL DEFAULT auth.uid(),
    department text NOT NULL,
    bonus_month date NULL,
    bonus_amount numeric NULL,
    achievement_rate numeric NULL,
    notes text NULL,
    created_at timestamp with time zone NULL DEFAULT now(),
    updated_at timestamp with time zone NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- 4. Bảng vehicle_costs
CREATE TABLE vehicle_costs (
    id text NULL DEFAULT auth.uid(),
    vehicle_id text NOT NULL,
    amount numeric NULL,
    cost_date timestamp with time zone NULL DEFAULT now(),
    description text NULL,
    created_at timestamp with time zone NULL DEFAULT now(),
    updated_at timestamp with time zone NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- 5. Bảng vehicle_payments
CREATE TABLE vehicle_payments (
    id text NOT NULL,
    vehicle_id text NOT NULL,
    amount numeric NULL,
    payment_date timestamp with time zone NULL DEFAULT now(),
    payment_type text NULL,
    notes text NULL,
    created_at timestamp with time zone NULL DEFAULT now(),
    updated_at timestamp with time zone NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- 6. Bảng vehicles
CREATE TABLE vehicles (
    id text PRIMARY KEY DEFAULT auth.uid() NOT NULL,
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
    sales_staff_id text NULL
);

-- Khóa ngoại
ALTER TABLE kpi_targets ADD CONSTRAINT fk_kpi_staff 
    FOREIGN KEY (staff_id) REFERENCES staff(id);

ALTER TABLE vehicle_costs ADD CONSTRAINT fk_vehicle_costs_vehicle 
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id);

ALTER TABLE vehicle_payments ADD CONSTRAINT fk_vehicle_payments_vehicle 
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id);

ALTER TABLE vehicles ADD CONSTRAINT fk_vehicles_staff 
    FOREIGN KEY (sales_staff_id) REFERENCES staff(id);

-- Chú thích:
-- 1. Các giá trị enum được sử dụng:
--    - status trong bảng vehicles: IN_STOCK, DEPOSITED, BANK_DEPOSITED, OFFSET, SOLD
--    - payment_type trong bảng vehicle_payments: DEPOSIT, BANK_DEPOSIT, OFFSET, FULL_PAYMENT
--    - team trong bảng staff: SALES_1, SALES_2, SALES_3, ACCOUNTING, MARKETING, MANAGEMENT, OTHER
--    - role trong bảng staff: MANAGER, TEAM_LEADER, STAFF, INTERN
--    - status trong bảng staff: ACTIVE, INACTIVE, ON_LEAVE, SUSPENDED, TERMINATED 