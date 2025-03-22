import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';
import { ENV } from '../../utils/environment';
import { logError } from '../../utils/errorHandler';

// Kiểm tra các biến môi trường bắt buộc
if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
  throw new Error('Thiếu biến môi trường SUPABASE_URL hoặc SUPABASE_ANON_KEY');
}

// Khởi tạo Supabase client
const supabase = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'supabase.auth.token',
    flowType: 'pkce'
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },
  db: {
    schema: 'public'
  }
});

// Theo dõi trạng thái xác thực
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('Auth state changed:', event);
  
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    localStorage.removeItem('supabase.auth.token');
  } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    if (session?.access_token) {
      localStorage.setItem('supabase.auth.token', session.access_token);
    }
  }
});

// Export supabase instance
export { supabase };

// Hàm kiểm tra và làm mới token
export const refreshToken = async (): Promise<boolean> => {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return !!session;
  } catch (error) {
    console.error('Lỗi khi làm mới token:', error);
    return false;
  }
};

// Hàm kiểm tra session hiện tại
export const getCurrentSession = async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    console.error('Lỗi khi lấy session:', error);
    return null;
  }
};

// Hàm đăng nhập với retry mechanism
export const signInWithRetry = async (email: string, password: string, maxRetries = 3) => {
  let retryCount = 0;
  
  const attemptSignIn = async (): Promise<any> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (retryCount < maxRetries && 
            (error.message.includes('network') || error.message.includes('timeout'))) {
          retryCount++;
          console.warn(`Đang thử đăng nhập lại (lần ${retryCount})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          return attemptSignIn();
        }
        throw error;
      }

      return data;
    } catch (error) {
      logError(error, { action: 'signInWithRetry', email, retryCount });
      throw error;
    }
  };

  return attemptSignIn();
};

// Hàm kiểm tra kết nối với retry mechanism
export const checkSupabaseConnection = async (maxRetries = 3): Promise<boolean> => {
  let retryCount = 0;

  const attemptConnection = async (): Promise<boolean> => {
    try {
      // Kiểm tra session hiện tại
      const session = await getCurrentSession();
      
      if (!session) {
        // Thử đăng nhập với tài khoản mặc định nếu có
        if (ENV.DEFAULT_EMAIL && ENV.DEFAULT_PASSWORD) {
          await signInWithRetry(ENV.DEFAULT_EMAIL, ENV.DEFAULT_PASSWORD);
        }
      }

      // Thực hiện truy vấn đơn giản để kiểm tra kết nối
      const { error } = await supabase.from('users').select('id').limit(1);
      
      if (error) {
        // Nếu lỗi là do xác thực, thử làm mới token
        if (error.status === 401 || error.code === '42501') {
          const refreshed = await refreshToken();
          if (refreshed) return true;
        }
        
        if (retryCount < maxRetries) {
          retryCount++;
          console.warn(`Đang thử kết nối lại (lần ${retryCount})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          return attemptConnection();
        }
        throw error;
      }

      return true;
    } catch (error) {
      if (retryCount < maxRetries) {
        retryCount++;
        console.warn(`Đang thử kết nối lại (lần ${retryCount})...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        return attemptConnection();
      }
      logError(error, { action: 'checkSupabaseConnection', retryCount });
      return false;
    }
  };

  return attemptConnection();
};

// Hàm truy vấn an toàn với retry mechanism
export const safeQuery = async (tableName: string, options: any = {}, maxRetries = 3) => {
  let retryCount = 0;

  const attemptQuery = async () => {
    try {
      // Đảm bảo có session hợp lệ
      const session = await getCurrentSession();
      if (!session) {
        const refreshed = await refreshToken();
        if (!refreshed && ENV.DEFAULT_EMAIL && ENV.DEFAULT_PASSWORD) {
          await signInWithRetry(ENV.DEFAULT_EMAIL, ENV.DEFAULT_PASSWORD);
        }
      }

      // Thực hiện truy vấn
      const { data, error } = await supabase
        .from(tableName)
        .select(options.select || '*')
        .order(options.orderBy || 'created_at', { ascending: false });

      if (error) {
        // Xử lý các loại lỗi cụ thể
        if (error.status === 401 || error.code === '42501') {
          const refreshed = await refreshToken();
          if (refreshed && retryCount < maxRetries) {
            retryCount++;
            return attemptQuery();
          }
        }
        
        if (retryCount < maxRetries && 
            (error.message.includes('network') || error.message.includes('timeout'))) {
          retryCount++;
          await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
          return attemptQuery();
        }
        
        throw error;
      }

      return data;
    } catch (error) {
      if (retryCount < maxRetries) {
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
        return attemptQuery();
      }
      logError(error, { action: 'safeQuery', tableName, options, retryCount });
      throw error;
    }
  };

  return attemptQuery();
}; 