import { createClient, type Session } from '@supabase/supabase-js';

// Lấy thông tin kết nối từ biến môi trường
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://qqxvaaabmnkmlvqehtoz.supabase.co';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const defaultEmail = process.env.REACT_APP_DEFAULT_EMAIL || 'admin@example.com';
const defaultPassword = process.env.REACT_APP_DEFAULT_PASSWORD || 'admin123';

if (!supabaseAnonKey) {
  throw new Error(
    'Thiếu REACT_APP_SUPABASE_ANON_KEY. Vui lòng thêm vào file .env:\n' +
    'REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key'
  );
}

// Tạo client Supabase với cấu hình nâng cao
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Prefer': 'return=minimal'
    },
  },
});

// Hàm đăng nhập với tài khoản mặc định
export const signInWithDefaultAccount = async (): Promise<Session | null> => {
  try {
    // Kiểm tra phiên hiện tại
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session) return sessionData.session;

    // Nếu không có phiên, thực hiện đăng nhập với tài khoản mặc định
    const { data, error } = await supabase.auth.signInWithPassword({
      email: defaultEmail,
      password: defaultPassword
    });
    
    if (error) {
      console.error('Lỗi đăng nhập:', error);
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
      return null;
    }
    
    return session;
  } catch (error) {
    console.error('Lỗi xác thực:', error);
    return null;
  }
};

// Kiểm tra kết nối Supabase
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    // Kiểm tra và khôi phục phiên hiện tại
    let session = await checkAndRestoreSession();
    
    // Nếu chưa có phiên, thử đăng nhập với tài khoản mặc định
    if (!session) {
      session = await signInWithDefaultAccount();
      if (!session) {
        console.error('Không thể đăng nhập');
        return false;
      }
    }
    
    // Danh sách các bảng cần kiểm tra
    const tablesToCheck = [
      'vehicles', 
      'staff', 
      'kpi_targets', 
      'support_bonuses'
    ];

    // Kiểm tra kết nối với từng bảng
    for (const table of tablesToCheck) {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      if (error && error.code !== 'PGRST116') { // Bỏ qua lỗi không có dữ liệu
        console.error(`Lỗi kết nối với bảng ${table}:`, error);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Lỗi không xác định khi kiểm tra kết nối:', error);
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
      // Thử đăng nhập lại với tài khoản mặc định
      await signInWithDefaultAccount();
      return true;
    } catch (authError) {
      console.error('Lỗi xác thực:', authError);
      return false;
    }
  }
  return false;
};

// Hàm truy vấn an toàn cho các bảng
export const safeQuery = async (tableName: string, options: any = {}, retryCount = 0) => {
  try {
    // Đảm bảo xác thực
    let session = await checkAndRestoreSession();
    
    if (!session) {
      session = await signInWithDefaultAccount();
      if (!session) {
        console.error('Không thể xác thực để truy vấn dữ liệu');
        return null;
      }
    }

    // Truy vấn với các tùy chọn mặc định
    const defaultOptions = {
      select: '*',
      order: 'created_at.desc',
      ...options
    };

    // Xây dựng query
    let query = supabase
      .from(tableName)
      .select(defaultOptions.select);

    // Thêm order nếu có
    if (defaultOptions.order) {
      query = query.order(defaultOptions.order);
    }

    // Áp dụng các bộ lọc bổ sung nếu có
    if (defaultOptions.filter) {
      Object.keys(defaultOptions.filter).forEach(key => {
        query = query.filter(key, 'eq', defaultOptions.filter[key]);
      });
    }

    // Thực hiện query
    const { data, error } = await query;

    if (error) {
      console.error(`Lỗi khi truy vấn ${tableName}:`, error);
      
      // Xử lý các loại lỗi cụ thể
      if (error.code === '42501' || error.status === 401) {
        // Lỗi xác thực - thử đăng nhập lại
        if (retryCount < 3) {
          await signInWithDefaultAccount();
          return safeQuery(tableName, options, retryCount + 1);
        }
      } else if (error.code === '42P01') {
        // Bảng không tồn tại
        console.error(`Bảng ${tableName} không tồn tại`);
        if (tableName === 'users') {
          console.error('Bảng users chưa được tạo. Vui lòng chạy migration.');
        }
      } else if (error.code === '500') {
        // Lỗi server - thử lại sau
        if (retryCount < 3) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Đợi 1 giây
          return safeQuery(tableName, options, retryCount + 1);
        }
      } else if (error.code === '23505') {
        // Lỗi unique constraint violation
        console.error(`Lỗi ràng buộc unique cho bảng ${tableName}`);
      }

      return null;
    }

    return data || [];
  } catch (error) {
    console.error(`Lỗi không xác định khi truy vấn ${tableName}:`, error);
    return null;
  }
}; 