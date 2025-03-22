/**
 * Utility để quản lý biến môi trường và đảm bảo tính nhất quán
 * giữa môi trường development và production.
 */

// Các giá trị mặc định an toàn cho production
const DEFAULT_SUPABASE_URL = 'https://ndfvjjwhfyvltjvdafym.supabase.co';
const DEFAULT_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kZnZqandoZnl2bHRqdmRhZnltIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MTYyMzg0NzIsImV4cCI6MTkzMTgxNDQ3Mn0.uVP9rvFJ2kxCzTHllR1RfqkGmIU5rx1H0sLroCj3o4Y';

// Lấy các biến môi trường với kiểm tra và giá trị mặc định
export const ENV = {
  // Supabase - Sử dụng giá trị mặc định nếu biến môi trường không tồn tại
  SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL || DEFAULT_SUPABASE_URL,
  SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_KEY,
  
  // Default Admin Account
  DEFAULT_EMAIL: process.env.REACT_APP_DEFAULT_EMAIL || 'admin@example.com',
  DEFAULT_PASSWORD: process.env.REACT_APP_DEFAULT_PASSWORD || 'password123',
  
  // Application Settings
  VERSION: process.env.REACT_APP_VERSION || '1.0.0',
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Derived properties
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_VERCEL: typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')
};

/**
 * Kiểm tra các biến môi trường bắt buộc
 * @returns {boolean} true nếu tất cả các biến môi trường bắt buộc đều tồn tại
 */
export const validateEnvironment = (): boolean => {
  const requiredVars = [
    { key: 'SUPABASE_URL', value: ENV.SUPABASE_URL },
    { key: 'SUPABASE_ANON_KEY', value: ENV.SUPABASE_ANON_KEY },
    { key: 'DEFAULT_EMAIL', value: ENV.DEFAULT_EMAIL },
    { key: 'DEFAULT_PASSWORD', value: ENV.DEFAULT_PASSWORD }
  ];
  
  // Chỉ kiểm tra nếu biến môi trường là rỗng (không dùng giá trị mặc định)
  const missingVars = requiredVars.filter(v => !v.value);
  
  if (missingVars.length > 0) {
    console.warn('Thiếu biến môi trường, sử dụng giá trị mặc định:');
    missingVars.forEach(v => console.warn(`- ${v.key}`));
    
    // Không throw exception trong production
    if (!ENV.IS_PRODUCTION) {
      console.info(`Hãy thiết lập các biến môi trường sau trong file .env:\n${missingVars.map(v => `REACT_APP_${v.key}`).join('\n')}`);
    }
  }
  
  return true;
};

/**
 * Kiểm tra xem môi trường có sẵn sàng cho kết nối Supabase không
 * @returns {boolean} true nếu có thể kết nối với Supabase
 */
export const canConnectToSupabase = (): boolean => {
  return !!ENV.SUPABASE_URL && !!ENV.SUPABASE_ANON_KEY;
};

// Log thông tin môi trường khi import module này (chỉ trong development)
if (ENV.IS_DEVELOPMENT) {
  console.log('Environment:', {
    NODE_ENV: ENV.NODE_ENV,
    IS_PRODUCTION: ENV.IS_PRODUCTION,
    IS_DEVELOPMENT: ENV.IS_DEVELOPMENT,
    IS_VERCEL: ENV.IS_VERCEL,
    // Không log mật khẩu
    SUPABASE_URL: ENV.SUPABASE_URL,
    DEFAULT_EMAIL: ENV.DEFAULT_EMAIL,
    VERSION: ENV.VERSION
  });
}

// Export hàm kiểm tra môi trường
export { canConnectToSupabase as isSupabaseAvailable }; 