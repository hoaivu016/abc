import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { logError } from '../utils/errorHandler';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 3,
        backgroundColor: '#f5f5f5'
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          maxWidth: 800,
          width: '100%',
          borderRadius: 2
        }}
      >
        <Typography variant="h4" color="error" gutterBottom>
          Ứng dụng gặp lỗi
        </Typography>
        
        <Typography variant="body1" paragraph>
          Đã xảy ra lỗi không mong muốn trong ứng dụng. Vui lòng thử tải lại trang hoặc liên hệ quản trị viên nếu lỗi vẫn tiếp tục.
        </Typography>

        <Paper
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: '#f8f8f8',
            borderRadius: 1,
            overflowX: 'auto'
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            Thông tin lỗi:
          </Typography>
          <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
            {error?.toString() || 'Không có thông tin chi tiết'}
          </Typography>
          
          <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
            Stack trace:
          </Typography>
          <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
            {error?.stack || 'Không có stack trace'}
          </Typography>
        </Paper>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.reload()}
          >
            Tải lại trang
          </Button>
          
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => window.history.back()}
          >
            Quay lại trang trước
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

interface FunctionalErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const FunctionalErrorBoundary: React.FC<FunctionalErrorBoundaryProps> = ({ 
  children, 
  fallback 
}) => {
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // Thiết lập handler để bắt lỗi không xử lý
    const errorHandler = (event: ErrorEvent) => {
      event.preventDefault();
      logError(event.error, { source: 'window.onerror' });
      setError(event.error || new Error('Lỗi không xác định'));
    };

    // Thiết lập handler để bắt promise rejection không xử lý
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      event.preventDefault();
      logError(event.reason, { source: 'window.onunhandledrejection' });
      setError(event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
    };

    // Đăng ký các handler
    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    // Cleanup khi component unmount
    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);

  // Hàm reset error state
  const resetErrorBoundary = () => {
    setError(null);
  };

  // Nếu có lỗi, hiển thị fallback UI
  if (error) {
    // Sử dụng fallback custom nếu được cung cấp
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // Mặc định sử dụng ErrorFallback component
    return <ErrorFallback error={error} resetErrorBoundary={resetErrorBoundary} />;
  }

  // Nếu không có lỗi, hiển thị children
  return <>{children}</>;
};

export default FunctionalErrorBoundary; 