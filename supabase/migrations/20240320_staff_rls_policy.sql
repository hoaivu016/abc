-- Tạo chính sách RLS cho bảng staff
CREATE POLICY "Allow all operations for authenticated users" 
ON staff 
FOR ALL 
USING (auth.uid() IS NOT NULL); 