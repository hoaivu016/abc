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
    detectSessionInUrl: false,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'supabase.auth.token',
    flowType: 'implicit'
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 2
    }
  }
});

// Biến để theo dõi trạng thái retry
let isRetrying = false;
let retryTimeout: NodeJS.Timeout | null = null;

// Theo dõi trạng thái xác thực
supabase.auth.onAuthStateChange(async (event, session) => {
  console.log('Auth state changed:', event);
  
  if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('vehicles');
    localStorage.removeItem('staff');
    localStorage.removeItem('kpis');
    localStorage.removeItem('lastSync');
  } else if (event === 'SIGNED_IN') {
    if (session?.access_token) {
      localStorage.setItem('supabase.auth.token', session.access_token);
      await checkSupabaseConnection();
    }
  } else if (event === 'TOKEN_REFRESHED') {
    if (session?.access_token) {
      localStorage.setItem('supabase.auth.token', session.access_token);
    }
  }
});

// Export supabase instance
export { supabase };

// Hàm kiểm tra và làm mới token với timeout
export const refreshToken = async (timeout = 5000): Promise<boolean> => {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Token refresh timeout')), timeout);
    });

    const refreshPromise = supabase.auth.refreshSession();
    const result = await Promise.race([refreshPromise, timeoutPromise]) as any;

    if (!result.data.session) {
      localStorage.removeItem('supabase.auth.token');
      return false;
    }

    localStorage.setItem('supabase.auth.token', result.data.session.access_token);
    return true;
  } catch (error) {
    console.error('Lỗi khi làm mới token:', error);
    localStorage.removeItem('supabase.auth.token');
    return false;
  }
};

// Hàm kiểm tra session hiện tại với timeout
export const getCurrentSession = async (timeout = 5000) => {
  try {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Get session timeout')), timeout);
    });

    const sessionPromise = supabase.auth.getSession();
    const result = await Promise.race([sessionPromise, timeoutPromise]) as any;

    if (!result.data.session) {
      return null;
    }

    return result.data.session;
  } catch (error) {
    console.error('Lỗi khi lấy session:', error);
    return null;
  }
};

// Hàm xử lý lỗi xác thực
export const handleAuthError = async (error: any): Promise<boolean> => {
  if (error.status === 401 || error.code === '42501') {
    const refreshed = await refreshToken();
    if (refreshed) {
      return true;
    }
  }
  return false;
};

// Hàm đăng nhập với retry mechanism và timeout
export const signInWithRetry = async (email: string, password: string, maxRetries = 3, timeout = 10000) => {
  let retryCount = 0;
  
  const attemptSignIn = async (): Promise<any> => {
    try {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Sign in timeout')), timeout);
      });

      const signInPromise = supabase.auth.signInWithPassword({ email, password });
      const { data, error } = await Promise.race([signInPromise, timeoutPromise]) as any;

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

// Hàm kiểm tra kết nối với retry mechanism và chống trùng lặp
export const checkSupabaseConnection = async (maxRetries = 3): Promise<boolean> => {
  if (isRetrying) return false;

  if (retryTimeout) {
    clearTimeout(retryTimeout);
    retryTimeout = null;
  }

  isRetrying = true;
  let retryCount = 0;

  const attemptConnection = async (): Promise<boolean> => {
    try {
      const session = await getCurrentSession();
      
      if (!session) {
        if (ENV.DEFAULT_EMAIL && ENV.DEFAULT_PASSWORD) {
          await signInWithRetry(ENV.DEFAULT_EMAIL, ENV.DEFAULT_PASSWORD);
        }
      }

      const { error } = await supabase.from('users').select('id').limit(1);
      
      if (error) {
        if (error.status === 401 || error.code === '42501') {
          const refreshed = await refreshToken();
          if (refreshed) {
            isRetrying = false;
            return true;
          }
        }
        
        if (retryCount < maxRetries) {
          retryCount++;
          console.warn(`Đang thử kết nối lại (lần ${retryCount})...`);
          await new Promise(resolve => {
            retryTimeout = setTimeout(resolve, 2000 * retryCount);
          });
          return attemptConnection();
        }
        throw error;
      }

      isRetrying = false;
      return true;
    } catch (error) {
      if (retryCount < maxRetries) {
        retryCount++;
        console.warn(`Đang thử kết nối lại (lần ${retryCount})...`);
        await new Promise(resolve => {
          retryTimeout = setTimeout(resolve, 2000 * retryCount);
        });
        return attemptConnection();
      }
      logError(error, { action: 'checkSupabaseConnection', retryCount });
      isRetrying = false;
      return false;
    }
  };

  return attemptConnection();
};

// Hàm truy vấn an toàn với retry mechanism và timeout
export const safeQuery = async (tableName: string, options: any = {}, maxRetries = 3) => {
  let retryCount = 0;

  const attemptQuery = async () => {
    try {
      const session = await getCurrentSession();
      if (!session) {
        const refreshed = await refreshToken();
        if (!refreshed && ENV.DEFAULT_EMAIL && ENV.DEFAULT_PASSWORD) {
          await signInWithRetry(ENV.DEFAULT_EMAIL, ENV.DEFAULT_PASSWORD);
        }
      }

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout')), 10000);
      });

      const queryPromise = supabase
        .from(tableName)
        .select(options.select || '*')
        .order(options.orderBy || 'created_at', { ascending: false });

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
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
          await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
          return attemptQuery();
        }
        
        throw error;
      }

      return data;
    } catch (error) {
      if (retryCount < maxRetries) {
        retryCount++;
        await new Promise(resolve => setTimeout(resolve, 2000 * retryCount));
        return attemptQuery();
      }
      logError(error, { action: 'safeQuery', tableName, options, retryCount });
      throw error;
    }
  };

  return attemptQuery();
}; 