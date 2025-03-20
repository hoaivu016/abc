import { createClient } from '@supabase/supabase-js';

// Lấy thông tin kết nối từ biến môi trường
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Kiểm tra xem các biến môi trường có tồn tại không
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Thiếu biến môi trường REACT_APP_SUPABASE_URL hoặc REACT_APP_SUPABASE_ANON_KEY');
  // Thêm cảnh báo chi tiết
  if (!supabaseUrl) {
    console.warn('URL Supabase không được cung cấp. Vui lòng kiểm tra biến môi trường REACT_APP_SUPABASE_URL');
  }
  if (!supabaseAnonKey) {
    console.warn('Khóa ẩn danh Supabase không được cung cấp. Vui lòng kiểm tra biến môi trường REACT_APP_SUPABASE_ANON_KEY');
  }
}

// Tạo client Supabase với cấu hình headers và xử lý lỗi
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
  },
  // Thêm cấu hình retry và timeout
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Hàm kiểm tra kết nối nâng cao
export const checkSupabaseConnection = async () => {
  try {
    console.log('===== KIỂM TRA KẾT NỐI SUPABASE =====');
    console.log('URL:', supabaseUrl);
    console.log('Anon Key:', supabaseAnonKey ? 'Đã cung cấp' : 'CHƯA CUNG CẤP');
    
    // Thử lấy phiên làm việc
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Lỗi kết nối Supabase:', error);
      
      // Xử lý các loại lỗi cụ thể
      if (error.message.includes('Invalid token')) {
        console.warn('Token không hợp lệ. Vui lòng đăng nhập lại.');
      }
      
      if (error.message.includes('Network')) {
        console.warn('Lỗi mạng. Vui lòng kiểm tra kết nối internet.');
      }
      
      return false;
    }
    
    // Thử truy vấn một bảng để kiểm tra kết nối
    const { data: testData, error: queryError } = await supabase
      .from('vehicles')
      .select('id')
      .limit(1);
    
    if (queryError) {
      console.error('Lỗi truy vấn thử nghiệm:', queryError);
      return false;
    }
    
    console.log('Kết nối Supabase thành công');
    console.log('===== KẾT THÚC KIỂM TRA KẾT NỐI =====');
    
    return true;
  } catch (error) {
    console.error('Lỗi không xác định khi kiểm tra kết nối Supabase:', error);
    return false;
  }
};

// Hàm làm mới token
export const refreshSupabaseToken = async () => {
  try {
    const { error } = await supabase.auth.refreshSession();
    
    if (error) {
      console.error('Lỗi làm mới token:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Lỗi không xác định khi làm mới token:', error);
    return false;
  }
}; 