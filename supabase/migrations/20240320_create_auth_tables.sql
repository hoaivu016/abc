-- Tạo schema auth nếu chưa tồn tại
CREATE SCHEMA IF NOT EXISTS auth;

-- Tạo bảng users trong schema public
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT UNIQUE NOT NULL,
  role TEXT CHECK (role IN ('admin', 'manager', 'staff')) NOT NULL DEFAULT 'staff',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tạo hàm trigger cập nhật updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Tạo trigger cho bảng users
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Bật Row Level Security cho bảng users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Chính sách cho quản trị viên
CREATE POLICY "Quản trị viên có toàn quyền" 
ON public.users FOR ALL 
USING (
  auth.role() = 'authenticated' AND 
  EXISTS (
    SELECT 1 FROM public.users u 
    WHERE u.id = auth.uid() AND u.role = 'admin'
  )
);

-- Chính sách cho người dùng xem thông tin của chính mình
CREATE POLICY "Người dùng xem thông tin của mình" 
ON public.users FOR SELECT 
USING (auth.uid() = id);

-- Tạo function để tự động thêm user vào bảng users khi đăng ký
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, 'staff');
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Tạo trigger cho function handle_new_user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user(); 