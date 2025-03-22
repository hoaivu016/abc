import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../types/supabase';
import { ENV } from '../../utils/environment';
import { logError } from '../../utils/errorHandler';

// Giá trị mặc định cho biến môi trường (chỉ sử dụng trong dev)
const SUPABASE_URL = ENV.SUPABASE_URL;
const SUPABASE_ANON_KEY = ENV.SUPABASE_ANON_KEY;

// Kiểm tra nếu biến môi trường thiếu
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Thiếu biến môi trường Supabase. Vui lòng kiểm tra .env file.');
}

// Tạo client với cấu hình tùy chỉnh
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
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

// Xử lý lỗi "message port closed"
const originalConsoleError = console.error;
console.error = function(...args) {
  // Lọc ra lỗi "message port closed"
  if (args[0] && typeof args[0] === 'string' && 
      (args[0].includes('message port closed') || 
       args[0].includes('The message port closed before a response was received'))) {
    // Không hiển thị lỗi này trong console
    console.warn('Supabase Realtime đã đóng kết nối. Đang thử kết nối lại...');
    
    // Thử kết nối lại với Realtime service
    try {
      supabase.realtime.connect();
    } catch (error) {
      // Ghi log lỗi nếu kết nối lại thất bại
      logError(error, { source: 'supabase-reconnect' });
    }
    return;
  }
  // Xử lý các lỗi khác như bình thường
  originalConsoleError.apply(console, args);
};

// Giám sát trạng thái mạng
window.addEventListener('offline', () => {
  console.warn('Ứng dụng đang offline. Một số tính năng có thể không hoạt động.');
});

window.addEventListener('online', () => {
  console.log('Kết nối mạng đã được khôi phục. Đang thử kết nối lại...');
  // Khi mạng được khôi phục, thử kết nối lại với Supabase
  supabase.realtime.connect();
  // Kiểm tra trạng thái authentication
  supabase.auth.getSession().then(({ data }) => {
    if (data?.session) {
      console.log('Phiên đăng nhập có sẵn, tiếp tục sử dụng.');
    }
  });
});

// Xử lý thay đổi trạng thái authentication
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    localStorage.setItem('supabase.auth.token', JSON.stringify(session));
  } else if (event === 'SIGNED_OUT') {
    localStorage.removeItem('supabase.auth.token');
  }
});

/**
 * Kiểm tra kết nối đến Supabase database
 * @returns {Promise<boolean>} true nếu kết nối thành công, false nếu thất bại
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.from('health_check').select('*').limit(1);
    if (error) {
      logError(error, { source: 'checkSupabaseConnection' });
      return false;
    }
    return true;
  } catch (error) {
    logError(error, { source: 'checkSupabaseConnection' });
    return false;
  }
};

/**
 * Thực hiện truy vấn an toàn với logic thử lại
 * @param queryFn Hàm thực hiện truy vấn
 * @param maxRetries Số lần thử lại tối đa
 * @returns Kết quả truy vấn
 */
export const safeQuery = async <T>(
  queryFn: () => Promise<T>,
  maxRetries = 3
): Promise<T> => {
  let retries = 0;
  let lastError: unknown;

  while (retries < maxRetries) {
    try {
      return await queryFn();
    } catch (error) {
      lastError = error;
      retries++;
      if (retries < maxRetries) {
        // Độ trễ tăng dần giữa các lần thử
        const delay = 1000 * Math.pow(2, retries);
        console.warn(`Lỗi truy vấn, thử lại lần ${retries}/${maxRetries} sau ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Nếu vẫn thất bại sau khi thử lại
  logError(lastError, { source: 'safeQuery', maxRetries });
  throw lastError;
};

// Export Supabase client như là export mặc định
export default supabase; 