/**
 * Utility để quản lý biến môi trường và đảm bảo tính nhất quán
 * giữa môi trường development và production.
 */

// Lấy các biến môi trường với kiểm tra và giá trị mặc định
export const ENV = {
  // Supabase
  SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL || '',
  SUPABASE_ANON_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY || '',
  
  // Default Admin Account
  DEFAULT_EMAIL: process.env.REACT_APP_DEFAULT_EMAIL || 'admin@example.com',
  DEFAULT_PASSWORD: process.env.REACT_APP_DEFAULT_PASSWORD || '',
  
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
  
  const missingVars = requiredVars.filter(v => !v.value);
  
  if (missingVars.length > 0) {
    console.error('Missing required environment variables:');
    missingVars.forEach(v => console.error(`- ${v.key}`));
    
    if (ENV.IS_PRODUCTION) {
      // Trong production, log lỗi nhưng không throw exception
      return false;
    } else {
      // Trong development, throw exception để dev biết ngay lập tức
      const errorMessage = 
        'Thiếu biến môi trường. Vui lòng kiểm tra các biến sau trong file .env:\n' +
        missingVars.map(v => `REACT_APP_${v.key}`).join('\n');
      throw new Error(errorMessage);
    }
  }
  
  return true;
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