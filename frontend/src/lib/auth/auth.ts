import supabase from '../database/supabase';
import { logError } from '../../utils/errorHandler';

/**
 * Lấy phiên đăng nhập hiện tại từ Supabase
 * @returns Session object hoặc null nếu không có phiên
 */
export const getCurrentSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    logError(error, { source: 'getCurrentSession' });
    return null;
  }
};

/**
 * Kiểm tra xem người dùng đã đăng nhập hay chưa
 * @returns true nếu đã đăng nhập, false nếu chưa
 */
export const isAuthenticated = async () => {
  try {
    const session = await getCurrentSession();
    return !!session;
  } catch (error) {
    logError(error, { source: 'isAuthenticated' });
    return false;
  }
};

/**
 * Kiểm tra xem người dùng đã đăng nhập hay chưa (phiên bản đồng bộ sử dụng localStorage)
 * @returns true nếu có token đăng nhập trong localStorage, false nếu không
 */
export const isAuthenticatedSync = () => {
  try {
    const token = localStorage.getItem('supabase.auth.token');
    return !!token;
  } catch (error) {
    return false;
  }
};

/**
 * Chuyển hướng người dùng đến trang đăng nhập
 */
export const redirectToLogin = () => {
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
  }
};

/**
 * Chuyển hướng người dùng đến trang danh sách xe
 */
export const redirectToVehicleList = () => {
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

/**
 * Xử lý các lỗi xác thực từ Supabase
 * @param error Lỗi từ Supabase
 * @returns true nếu lỗi đã được xử lý, false nếu không
 */
export const handleAuthError = async (error: any) => {
  // Log lỗi cho mục đích debug
  console.error('Auth error:', error);
  
  if (!error) return false;
  
  // Kiểm tra lỗi hết hạn token
  if (
    error.code === '401' || 
    error.message?.includes('JWT expired') || 
    error.message?.includes('invalid token') ||
    error.message?.includes('not authenticated')
  ) {
    try {
      // Thử refresh token
      const { data } = await supabase.auth.refreshSession();
      
      if (data.session) {
        console.log('Token đã được làm mới thành công');
        return true;
      }
      
      // Nếu không refresh được, đăng xuất
      await supabase.auth.signOut();
      
      // Redirect về trang login nếu đang ở client-side
      redirectToLogin();
      
      return true;
    } catch (refreshError) {
      logError(refreshError, { source: 'handleAuthError:refresh' });
      return false;
    }
  }
  
  return false;
}; 