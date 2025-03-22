import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';
import { ENV, isSupabaseAvailable } from '../../utils/environment';
import { logError } from '../../utils/errorHandler';

// Định nghĩa kiểu cho Supabase Client để tránh lỗi TypeScript
type SupabaseClientType = ReturnType<typeof createClient<Database>>;

// Biến để lưu trữ trạng thái connection
let isConnecting = false;
let connectionAttempts = 0;
const MAX_CONNECTION_ATTEMPTS = 3;
let reconnectTimeout: number | null = null;

// Biến lazy loading để chỉ khởi tạo khi cần
let _supabaseInstance: SupabaseClientType | null = null;

/**
 * Khởi tạo client Supabase một cách lazy
 * Chỉ tạo instance khi được gọi lần đầu
 */
function getSupabaseClient(): SupabaseClientType {
  if (_supabaseInstance) {
    return _supabaseInstance;
  }

  try {
    // Kiểm tra môi trường
    if (!isSupabaseAvailable()) {
      console.warn('Supabase không khả dụng: thiếu biến môi trường');
      return createMockClient();
    }

    // Khởi tạo client thật với cấu hình tối ưu
    console.info('Khởi tạo Supabase client...');
    _supabaseInstance = createClient(ENV.SUPABASE_URL, ENV.SUPABASE_ANON_KEY, {
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
          eventsPerSecond: 2, // Giảm tần suất để tránh lỗi
        },
      },
    });

    // Đăng ký listener cho auth state change
    if (_supabaseInstance?.auth) {
      _supabaseInstance.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          // Đảm bảo realtime được ngắt kết nối khi đăng xuất
          _supabaseInstance?.realtime?.disconnect();
        }
      });
    }

    console.info('Supabase đã khởi tạo thành công!');
    return _supabaseInstance;
  } catch (error) {
    logError(error, { source: 'supabase-init' });
    console.error('Không thể khởi tạo Supabase:', error);
    return createMockClient();
  }
}

/**
 * Tạo client giả khi không thể khởi tạo Supabase
 */
function createMockClient(): SupabaseClientType {
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
  } as SupabaseClientType;
}

/**
 * Kết nối lại với Supabase
 */
function reconnectSupabase() {
  if (isConnecting || !_supabaseInstance) return;
  
  isConnecting = true;
  connectionAttempts++;

  try {
    // Disconnect trước để đảm bảo không có kết nối cũ
    _supabaseInstance.realtime.disconnect();
    
    // Thời gian chờ tăng dần giữa các lần thử
    const delay = 1000 * Math.pow(2, Math.min(connectionAttempts, 4));
    
    // Clear timeout cũ nếu có
    if (reconnectTimeout) {
      window.clearTimeout(reconnectTimeout);
    }
    
    reconnectTimeout = window.setTimeout(() => {
      try {
        // Thử kết nối lại
        _supabaseInstance?.realtime.connect();
        console.info(`Đã kết nối lại với Supabase sau ${delay}ms`);
        isConnecting = false;
        
        // Reset counter nếu thành công
        setTimeout(() => {
          connectionAttempts = 0;
        }, 10000);
      } catch (error) {
        console.warn('Không thể kết nối lại với Supabase:', error);
        isConnecting = false;
      }
    }, delay);
  } catch (error) {
    isConnecting = false;
    console.error('Lỗi khi thử kết nối lại:', error);
  }
}

// Xử lý lỗi message port và đảm bảo kết nối liên tục
if (typeof window !== 'undefined') {
  // Theo dõi số lỗi
  let messagePortErrorCount = 0;
  const MAX_ERRORS_BEFORE_RELOAD = 10;
  let lastErrorTime = 0;
  
  // Thời gian reload trang cuối cùng
  let lastReloadTime = 0;
  const MIN_RELOAD_INTERVAL = 5 * 60 * 1000; // 5 phút
  
  // Hàm lọc lỗi và thực hiện hành động
  const handleMessagePortError = (message: string) => {
    const now = Date.now();
    
    // Reset counter nếu lỗi cách nhau hơn 1 phút
    if (now - lastErrorTime > 60000) {
      messagePortErrorCount = 0;
    }
    
    lastErrorTime = now;
    messagePortErrorCount++;
    
    // Thử kết nối lại
    reconnectSupabase();
    
    // Nếu quá nhiều lỗi trong thời gian ngắn, reload trang
    if (messagePortErrorCount > MAX_ERRORS_BEFORE_RELOAD && now - lastReloadTime > MIN_RELOAD_INTERVAL) {
      console.warn(`Quá nhiều lỗi message port (${messagePortErrorCount}), tải lại trang...`);
      lastReloadTime = now;
      
      // Thêm tham số để tránh cache
      window.location.href = window.location.href.split('?')[0] + 
        '?nocache=' + Date.now();
    }
  };
  
  // Override console.error để lọc lỗi message port
  const originalConsoleError = console.error;
  console.error = function(...args) {
    // Kiểm tra nếu có lỗi message port
    if (args[0] && typeof args[0] === 'string' && 
        (args[0].includes('message port closed') || 
         args[0].includes('The message port closed before a response was received'))) {
      // Không hiển thị lỗi, chỉ xử lý
      handleMessagePortError(args[0]);
      return;
    }
    // Xử lý các lỗi khác như bình thường
    originalConsoleError.apply(console, args);
  };

  // Bắt sự kiện lỗi toàn cục
  window.addEventListener('error', (event) => {
    if (event.message && 
        (event.message.includes('message port closed') || 
         event.message.includes('The message port closed before a response was received'))) {
      // Ngăn hiển thị lỗi
      event.preventDefault();
      
      // Xử lý lỗi
      handleMessagePortError(event.message);
      return false;
    }
  }, true);

  // Bắt unhandled promise rejection
  window.addEventListener('unhandledrejection', (event) => {
    const message = event.reason?.message || String(event.reason);
    if (message.includes('message port closed') || 
        message.includes('The message port closed before a response was received')) {
      // Ngăn hiển thị lỗi
      event.preventDefault();
      
      // Xử lý lỗi
      handleMessagePortError(message);
      return false;
    }
  });

  // Giám sát trạng thái mạng
  window.addEventListener('offline', () => {
    console.warn('Ứng dụng đang offline. Một số tính năng có thể không hoạt động.');
  });

  window.addEventListener('online', () => {
    console.log('Kết nối mạng đã được khôi phục.');
    reconnectSupabase();
  });
}

/**
 * Kiểm tra kết nối đến Supabase database
 * @returns {Promise<boolean>} true nếu kết nối thành công, false nếu thất bại
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  const client = getSupabaseClient();
  
  try {
    const { error } = await client.from('health_check').select('count').limit(1).maybeSingle();
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
  let retries = 0;
  let lastError: any = null;
  
  while (retries < maxRetries) {
    try {
      return await queryFn();
    } catch (error) {
      lastError = error;
      retries++;
      
      // Kiểm tra nếu là lỗi message port - thử kết nối lại
      if (error && 
          (String(error).includes('message port closed') || 
           String(error).includes('The message port closed before a response was received'))) {
        reconnectSupabase();
      }
      
      if (retries >= maxRetries) {
        logError(error, { source: 'safeQuery', maxRetries });
        break;
      }
      
      const delay = 1000 * Math.pow(2, retries);
      console.warn(`Lỗi truy vấn, thử lại lần ${retries}/${maxRetries} sau ${delay}ms`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.error('Không thể thực hiện truy vấn sau nhiều lần thử', lastError);
  return null;
};

// Khởi tạo giá trị mặc định cho supabase
const supabase = getSupabaseClient();

// Export Supabase client
export default supabase; 