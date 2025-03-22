import { ENV } from './environment';

/**
 * Interface cho cấu trúc thông tin lỗi
 */
interface ErrorDetails {
  message: string;
  stack?: string;
  componentStack?: string;
  context?: Record<string, any>;
  timestamp: string;
}

/**
 * Chuẩn hóa đối tượng lỗi để đảm bảo cấu trúc nhất quán
 */
export const normalizeError = (error: unknown, context: Record<string, any> = {}): ErrorDetails => {
  let errorDetails: ErrorDetails = {
    message: 'Lỗi không xác định',
    context,
    timestamp: new Date().toISOString()
  };

  if (error instanceof Error) {
    errorDetails = {
      ...errorDetails,
      message: error.message,
      stack: error.stack,
    };
  } else if (typeof error === 'string') {
    errorDetails.message = error;
  } else if (error && typeof error === 'object') {
    errorDetails = {
      ...errorDetails,
      ...error as Record<string, any>,
      message: (error as any).message || errorDetails.message
    };
  }

  return errorDetails;
};

/**
 * Ghi log lỗi chi tiết
 */
export const logError = (error: unknown, context: Record<string, any> = {}): void => {
  const errorDetails = normalizeError(error, context);
  
  // Log chi tiết trong development, log cơ bản trong production
  if (ENV.IS_DEVELOPMENT) {
    console.error('🔴 Lỗi ứng dụng:', errorDetails.message);
    console.error('Thông tin chi tiết:', errorDetails);
    if (errorDetails.stack) {
      console.error('Stack trace:', errorDetails.stack);
    }
  } else {
    // Trong production, chỉ log thông tin cơ bản
    console.error('Lỗi ứng dụng:', errorDetails.message);
  }
  
  // Ở đây có thể thêm mã để gửi lỗi đến dịch vụ theo dõi lỗi như Sentry
  // if (ENV.IS_PRODUCTION) {
  //   sendErrorToMonitoringService(errorDetails);
  // }
};

/**
 * Trình bao bọc (wrapper) để bắt lỗi trong các hàm async
 */
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  errorHandler?: (error: unknown) => void
): ((...args: Parameters<T>) => Promise<ReturnType<T>>) => {
  return async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      // Ghi log lỗi
      logError(error, { functionName: fn.name, arguments: args });
      
      // Gọi error handler tùy chỉnh nếu có
      if (errorHandler) {
        errorHandler(error);
      }
      
      throw error;
    }
  };
};

/**
 * Xử lý lỗi khi hiển thị cho người dùng
 * Trả về thông báo lỗi thân thiện thay vì thông tin kỹ thuật
 */
export const getUserFriendlyErrorMessage = (error: unknown): string => {
  // Xác định loại lỗi và trả về thông báo phù hợp
  if (error instanceof Error) {
    // Xử lý các loại lỗi cụ thể
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.';
    }
    
    if (error.message.includes('timeout')) {
      return 'Yêu cầu đã hết thời gian chờ. Vui lòng thử lại sau.';
    }
    
    if (error.message.includes('permission') || error.message.includes('403')) {
      return 'Bạn không có quyền thực hiện hành động này.';
    }
    
    if (error.message.includes('not found') || error.message.includes('404')) {
      return 'Không tìm thấy tài nguyên yêu cầu.';
    }

    if (error.message.includes('auth') || error.message.includes('login') || error.message.includes('401')) {
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    }
    
    // Trường hợp lỗi Supabase
    if (error.message.includes('supabase')) {
      return 'Lỗi kết nối cơ sở dữ liệu. Vui lòng thử lại sau.';
    }
  }
  
  // Thông báo lỗi mặc định
  return 'Đã xảy ra lỗi không mong muốn. Vui lòng thử lại sau.';
}; 