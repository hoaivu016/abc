import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';
import { ENV } from '../../utils/environment';
import { logError } from '../../utils/errorHandler';

// Kiểm tra các biến môi trường bắt buộc
if (!ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY) {
  throw new Error('Thiếu biến môi trường SUPABASE_URL hoặc SUPABASE_ANON_KEY');
}

// Khởi tạo Supabase client với cấu hình mới
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
    },
    transport: {
      retries: 3
    }
  }
});

// Thêm xử lý lỗi message port
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    if (event.message.includes('message port closed')) {
      console.warn('Message port closed, attempting to reconnect...');
      // Ngăn chặn hiển thị lỗi trên console
      event.preventDefault();
      // Thử kết nối lại với Realtime
      supabase.realtime.connect();
    }
  });

  // Xử lý các lỗi tài nguyên không tìm thấy
  window.addEventListener('error', (event) => {
    if (event.target && (event.target as any).tagName === 'LINK' || (event.target as any).tagName === 'SCRIPT') {
      console.warn('Failed to load resource:', (event.target as any).src || (event.target as any).href);
      // Ngăn lỗi hiển thị trên console
      event.preventDefault();
    }
  }, true);
}

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

// Hàm kiểm tra kết nối Supabase
export const checkSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('vehicles').select('count').limit(1);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Lỗi kết nối Supabase:', error);
    return false;
  }
};

// Hàm thực hiện query an toàn với retry
export const safeQuery = async <T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  maxRetries = 3
): Promise<T | null> => {
  let attempts = 0;
  
  const attemptQuery = async (): Promise<T | null> => {
    try {
      const { data, error } = await queryFn();
      if (error) throw error;
      return data;
    } catch (error) {
      attempts++;
      if (attempts >= maxRetries) {
        console.error('Đã đạt số lần thử tối đa:', error);
        return null;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      return attemptQuery();
    }
  };
  
  return attemptQuery();
};

export default supabase; 