-- Tạo chính sách RLS cho bảng vehicles
CREATE POLICY "Allow all operations for authenticated users" 
ON vehicles 
FOR ALL 
USING (auth.uid() IS NOT NULL); 