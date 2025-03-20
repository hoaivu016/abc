-- Tạo bảng users
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'manager', 'staff')) NOT NULL DEFAULT 'staff',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tạo hàm trigger cập nhật updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Tạo trigger cho bảng users
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Chính sách Row Level Security (RLS) cho bảng users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Chính sách cho quản trị viên
CREATE POLICY "Quản trị viên có toàn quyền" 
ON users FOR ALL 
USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Chính sách cho người dùng xem thông tin của chính mình
CREATE POLICY "Người dùng xem thông tin của mình" 
ON users FOR SELECT 
USING (auth.uid() = id); 