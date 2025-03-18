import { createClient } from '@supabase/supabase-js';

// Lấy thông tin kết nối từ biến môi trường
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Kiểm tra xem các biến môi trường có tồn tại không
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Thiếu biến môi trường REACT_APP_SUPABASE_URL hoặc REACT_APP_SUPABASE_ANON_KEY');
}

// Tạo client Supabase với cấu hình headers
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  }
});

// Hàm kiểm tra kết nối
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Lỗi kết nối Supabase:', error);
    return false;
  }
}; 