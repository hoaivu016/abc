import { createClient } from '@supabase/supabase-js';

// Lấy thông tin kết nối từ biến môi trường
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Kiểm tra xem các biến môi trường có tồn tại không
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Thiếu biến môi trường Supabase');
}

// Tạo client Supabase với cấu hình nâng cao
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    storageKey: 'supabase-auth-token'
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Hàm đăng nhập ẩn danh
export const signInAnonymously = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'anonymous@example.com',
      password: 'anonymousPassword123!'
    });

    if (error) {
      console.error('Lỗi đăng nhập ẩn danh:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Lỗi không xác định khi đăng nhập:', error);
    throw error;
  }
};

// Hàm kiểm tra và khôi phục phiên làm việc
export const checkAndRestoreSession = async () => {
  try {
    // Thử lấy phiên hiện tại
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      console.error('Lỗi lấy phiên:', error);
      
      // Nếu không có phiên, thử đăng nhập ẩn danh
      if (error.message.includes('No session')) {
        await signInAnonymously();
      }
    }

    return session;
  } catch (error) {
    console.error('Lỗi khôi phục phiên:', error);
    throw error;
  }
};

// Hàm kiểm tra kết nối Supabase
export const checkSupabaseConnection = async () => {
  try {
    await checkAndRestoreSession();
    
    // Thử truy vấn một bảng để kiểm tra kết nối
    const { data, error } = await supabase
      .from('staff')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('Lỗi kết nối Supabase:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Lỗi không xác định khi kiểm tra kết nối:', error);
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