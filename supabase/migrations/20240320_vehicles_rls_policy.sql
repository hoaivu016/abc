-- Tạo chính sách RLS cho bảng vehicles
-- Cho phép tất cả các thao tác cho người dùng đã xác thực
CREATE POLICY "Allow all operations for authenticated users" 
ON vehicles 
FOR ALL 
USING (auth.uid() IS NOT NULL);

-- Chính sách bổ sung cho các trường hợp cụ thể
CREATE POLICY "Enable read for authenticated users"
ON vehicles
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable insert for authenticated users"
ON vehicles
FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users"
ON vehicles
FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users"
ON vehicles
FOR DELETE
USING (auth.uid() IS NOT NULL); 