import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';
import { ENV, isSupabaseAvailable } from '../../utils/environment';
import { logError } from '../../utils/errorHandler';

/**
 * Khởi tạo Supabase client khi biến môi trường hợp lệ
 */
let supabase: SupabaseClient<Database>;

// Biến theo dõi trạng thái kết nối
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;
const CONNECTION_RETRY_DELAY = 2000;

// Hàm khởi tạo Supabase client
const initializeSupabase = (): SupabaseClient<Database> | null => {
  try {
    // Kiểm tra biến môi trường
    if (!isSupabaseAvailable()) {
      console.warn('Supabase không khả dụng: thiếu biến môi trường.');
      return null;
    }

    // Tạo client mới
    const client = createClient<Database>(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          'x-application-name': 'vehicle-management',
        },
      },
      db: {
        schema: 'public',
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });

    console.info('Supabase đã khởi tạo thành công!');
    return client;
  } catch (error) {
    logError(error, { source: 'supabase-init' });
    console.error('Không thể khởi tạo Supabase:', error);
    return null;
  }
};

// Khởi tạo client
const initializedClient = initializeSupabase();
supabase = initializedClient || createMockSupabaseClient();

/**
 * Tạo client giả khi không thể khởi tạo Supabase
 */
function createMockSupabaseClient(): SupabaseClient<Database> {
  console.warn('Sử dụng Supabase client giả để tránh lỗi ứng dụng');
  
  // Tạo mock client
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: null } }),
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: new Error('Supabase không khả dụng') }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: () => ({
      select: () => ({
        data: null,
        error: new Error('Supabase không khả dụng'),
        limit: () => ({ data: null, error: new Error('Supabase không khả dụng') }),
        maybeSingle: () => ({ data: null, error: new Error('Supabase không khả dụng') })
      }),
      insert: () => ({ data: null, error: new Error('Supabase không khả dụng') }),
      update: () => ({ data: null, error: new Error('Supabase không khả dụng') }),
      delete: () => ({ data: null, error: new Error('Supabase không khả dụng') }),
    }),
    rpc: () => Promise.resolve({ data: null, error: new Error('Supabase không khả dụng') }),
    realtime: {
      connect: () => {},
      disconnect: () => {},
    },
  } as unknown as SupabaseClient<Database>;
}

// Xử lý lỗi "message port closed"
if (typeof window !== 'undefined') {
  // Ghi đè console.error
  const originalConsoleError = console.error;
  console.error = function(...args) {
    // Lọc ra lỗi "message port closed"
    if (args[0] && typeof args[0] === 'string' && 
        (args[0].includes('message port closed') || 
        args[0].includes('The message port closed before a response was received'))) {
      console.warn('Supabase Realtime: message port đã đóng. Bỏ qua lỗi này.');
      return;
    }
    // Xử lý các lỗi khác như bình thường
    originalConsoleError.apply(console, args);
  };

  // Xử lý lỗi các lỗi chung (trong đó có message port)
  window.addEventListener('error', (event) => {
    if (event.message && 
        (event.message.includes('message port closed') || 
        event.message.includes('The message port closed before a response was received'))) {
      console.warn('Đã bắt lỗi message port:', event.message);
      event.preventDefault();
      
      // Thử kết nối lại nếu supabase đã khởi tạo
      if (supabase?.realtime) {
        try {
          supabase.realtime.disconnect();
          setTimeout(() => {
            supabase.realtime.connect();
          }, 1000);
        } catch (e) {
          // Không làm gì, chỉ ngăn lỗi
        }
      }
      return false;
    }
  }, true);

  // Giám sát trạng thái mạng
  window.addEventListener('offline', () => {
    console.warn('Ứng dụng đang offline. Một số tính năng có thể không hoạt động.');
  });

  window.addEventListener('online', () => {
    console.log('Kết nối mạng đã được khôi phục.');
    if (supabase?.realtime) {
      try {
        supabase.realtime.connect();
      } catch (error) {
        // Không làm gì, tránh lỗi tiếp theo
      }
    }
  });
}

/**
 * Kiểm tra kết nối đến Supabase database
 * @returns {Promise<boolean>} true nếu kết nối thành công, false nếu thất bại
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  if (!supabase) return false;
  
  try {
    const { error } = await supabase.from('health_check').select('count').limit(1).maybeSingle();
    return !error;
  } catch (error) {
    logError(error, { source: 'checkSupabaseConnection' });
    return false;
  }
};

/**
 * Thực hiện truy vấn an toàn với logic thử lại
 * @param queryFn Hàm thực hiện truy vấn
 * @param maxRetries Số lần thử lại tối đa
 * @returns Kết quả truy vấn hoặc null nếu lỗi
 */
export const safeQuery = async <T>(
  queryFn: () => Promise<T>,
  maxRetries = 3
): Promise<T | null> => {
  // Nếu không có supabase, trả về null
  if (!supabase) return null;
  
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      return await queryFn();
    } catch (error) {
      retries++;
      
      if (retries >= maxRetries) {
        logError(error, { source: 'safeQuery', maxRetries });
        return null;
      }
      
      const delay = 1000 * Math.pow(2, retries);
      console.warn(`Lỗi truy vấn, thử lại lần ${retries}/${maxRetries} sau ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  return null;
};

// Export Supabase client
export default supabase; 