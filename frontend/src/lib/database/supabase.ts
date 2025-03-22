import { createClient } from '@supabase/supabase-js';
import { ENV, validateEnvironment } from '../../utils/environment';
import { logError, withErrorHandling } from '../../utils/errorHandler';

// Kiểm tra các biến môi trường bắt buộc
validateEnvironment();

// Tạo client Supabase với cấu hình nâng cao
export const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    flowType: 'implicit'
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },
});

// Theo dõi lỗi trong Supabase client
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    // Xóa dữ liệu khi đăng xuất
    localStorage.removeItem('supabase.auth.token');
  } else if (event === 'SIGNED_IN') {
    console.log('Đăng nhập thành công:', session?.user?.email);
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('Token đã được làm mới');
  }
});

// Hàm đăng nhập với tài khoản mặc định
export const signInWithDefaultAccount = withErrorHandling(async () => {
  try {
    // Xóa session cũ nếu có
    await supabase.auth.signOut();
    
    console.log('Đang thử đăng nhập với:', ENV.DEFAULT_EMAIL);
    
    // Thực hiện đăng nhập với tài khoản mặc định
    const { data, error } = await supabase.auth.signInWithPassword({
      email: ENV.DEFAULT_EMAIL,
      password: ENV.DEFAULT_PASSWORD
    });
    
    if (error) {
      console.error('Lỗi đăng nhập:', error);
      if (error.message === 'Invalid login credentials') {
        console.error('Thông tin đăng nhập không hợp lệ. Vui lòng kiểm tra email và mật khẩu trong biến môi trường.');
        console.error('REACT_APP_DEFAULT_EMAIL:', ENV.DEFAULT_EMAIL);
        // Không log mật khẩu vì lý do bảo mật
      }
      throw error;
    }

    if (!data?.session) {
      throw new Error('Không nhận được phiên sau khi đăng nhập');
    }

    console.log('Đăng nhập thành công:', data.user?.email);
    return data.session;
  } catch (error) {
    // Thêm thông tin context cho lỗi
    logError(error, { 
      action: 'signInWithDefaultAccount',
      email: ENV.DEFAULT_EMAIL,
      supabaseUrl: ENV.SUPABASE_URL
    });
    throw error;
  }
});

// Kiểm tra và khôi phục phiên
export const checkAndRestoreSession = withErrorHandling(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
});

// Kiểm tra kết nối Supabase
export const checkSupabaseConnection = withErrorHandling(async () => {
  // Kiểm tra và khôi phục phiên hiện tại
  let session = await checkAndRestoreSession();
  
  // Nếu chưa có phiên, thử đăng nhập với tài khoản mặc định
  if (!session) {
    try {
      session = await signInWithDefaultAccount();
      if (!session) {
        console.error('Không thể đăng nhập');
        return false;
      }
    } catch (error) {
      logError(error, { action: 'checkSupabaseConnection - signInWithDefaultAccount' });
      return false;
    }
  }
  
  try {
    // Thực hiện truy vấn đơn giản để kiểm tra kết nối
    const { error } = await supabase.from('users').select('id').limit(1);
    
    if (error && error.code !== 'PGRST116') { // Bỏ qua lỗi không có dữ liệu
      logError(error, { action: 'checkSupabaseConnection - testQuery' });
      return false;
    }
    
    return true;
  } catch (error) {
    logError(error, { action: 'checkSupabaseConnection' });
    return false;
  }
});

// Làm mới token
export const refreshSupabaseToken = withErrorHandling(async () => {
  const { data: { session } } = await supabase.auth.refreshSession();
  return session;
});

// Hàm kiểm tra và xử lý lỗi xác thực
export const handleAuthError = withErrorHandling(async (error: any) => {
  if (error.code === '42501' || error.status === 401) {
    try {
      // Thử đăng nhập lại với tài khoản mặc định
      await signInWithDefaultAccount();
      return true;
    } catch (authError) {
      logError(authError, { action: 'handleAuthError - reauth' });
      return false;
    }
  }
  return false;
});

// Hàm truy vấn an toàn cho các bảng
export const safeQuery = withErrorHandling(async (tableName: string, options: any = {}, retryCount = 0) => {
  // Đảm bảo xác thực
  let session = await checkAndRestoreSession();
  
  if (!session) {
    try {
      session = await signInWithDefaultAccount();
      if (!session) {
        throw new Error('Không thể xác thực để truy vấn dữ liệu');
      }
    } catch (error) {
      logError(error, { action: 'safeQuery - auth', tableName });
      throw error;
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

  try {
    // Thực hiện query
    const { data, error } = await query;

    if (error) {
      // Xử lý các loại lỗi cụ thể
      if (error.code === '42501' || error.status === 401) {
        // Lỗi xác thực - thử đăng nhập lại
        if (retryCount < 2) {
          await signInWithDefaultAccount();
          return safeQuery(tableName, options, retryCount + 1);
        }
        throw new Error(`Lỗi xác thực sau ${retryCount + 1} lần thử: ${error.message}`);
      } else if (error.code === '42P01') {
        // Bảng không tồn tại
        throw new Error(`Bảng ${tableName} không tồn tại`);
      } else if (error.code === '500') {
        // Lỗi server - thử lại sau
        if (retryCount < 2) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Đợi 1 giây
          return safeQuery(tableName, options, retryCount + 1);
        }
        throw new Error(`Lỗi server sau ${retryCount + 1} lần thử: ${error.message}`);
      } else if (error.code === '23505') {
        // Lỗi unique constraint violation
        throw new Error(`Lỗi ràng buộc unique cho bảng ${tableName}: ${error.message}`);
      } else {
        // Lỗi khác
        throw error;
      }
    }

    return data || [];
  } catch (error) {
    // Log lỗi với context đầy đủ
    logError(error, {
      action: 'safeQuery',
      tableName,
      options,
      retryCount
    });
    throw error;
  }
}); 