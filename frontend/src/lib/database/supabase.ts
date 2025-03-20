import { createClient } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';

// Lấy thông tin kết nối từ biến môi trường
const supabaseUrl = 
  process.env.REACT_APP_SUPABASE_URL || 
  process.env.NEXT_PUBLIC_SUPABASE_URL || 
  '';

const supabaseAnonKey = 
  process.env.REACT_APP_SUPABASE_ANON_KEY || 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
  '';

// Kiểm tra xem các biến môi trường có tồn tại không
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Thiếu biến môi trường Supabase', {
    supabaseUrl,
    supabaseAnonKey: supabaseAnonKey ? 'Đã cung cấp' : 'Chưa cung cấp'
  });
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
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    }
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Hàm đăng nhập ẩn danh an toàn
export const signInAnonymously = async (): Promise<Session | null> => {
  try {
    // Kiểm tra phiên hiện tại
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) return sessionData.session;

    // Nếu không có phiên, thực hiện đăng nhập ẩn danh
    const { data, error } = await supabase.auth.signInAnonymously();
    
    if (error) {
      console.error('Lỗi đăng nhập ẩn danh:', error);
      throw error;
    }

    return data.session;
  } catch (error) {
    console.error('Lỗi xác thực:', error);
    return null;
  }
};

// Kiểm tra và khôi phục phiên
export const checkAndRestoreSession = async (): Promise<Session | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      // Thử đăng nhập ẩn danh nếu không có phiên
      return await signInAnonymously();
    }
    
    return session;
  } catch (error) {
    console.error('Lỗi kiểm tra phiên:', error);
    return null;
  }
};

// Kiểm tra kết nối Supabase
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Đảm bảo có phiên trước khi kiểm tra
    const session = await checkAndRestoreSession();
    
    if (!session) {
      console.error('Không thể tạo phiên');
      return false;
    }
    
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
    console.error('Lỗi không xác định:', error);
    return false;
  }
};

// Làm mới token
export const refreshSupabaseToken = async (): Promise<Session | null> => {
  try {
    const { data: { session } } = await supabase.auth.refreshSession();
    return session;
  } catch (error) {
    console.error('Lỗi làm mới token:', error);
    return null;
  }
};

// Hàm kiểm tra và xử lý lỗi xác thực
export const handleAuthError = async (error: any): Promise<boolean> => {
  if (error.code === '42501' || error.status === 401) {
    try {
      // Thử đăng nhập lại
      await signInAnonymously();
      return true;
    } catch (authError) {
      console.error('Lỗi xác thực:', authError);
      return false;
    }
  }
  return false;
}; 