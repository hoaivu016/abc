import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Cập nhật state để hiển thị UI lỗi
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Ghi log lỗi
    console.error('Lỗi ứng dụng:', error);
    console.error('Thông tin chi tiết:', errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReload = (): void => {
    window.location.reload();
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // Hiển thị UI lỗi
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
                {this.state.error?.toString() || 'Không có thông tin chi tiết'}
              </Typography>
              
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                Stack trace:
              </Typography>
              <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                {this.state.error?.stack || 'Không có stack trace'}
              </Typography>
              
              {this.state.errorInfo && (
                <>
                  <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 2 }}>
                    Component stack:
                  </Typography>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
                    {this.state.errorInfo.componentStack}
                  </Typography>
                </>
              )}
            </Paper>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="contained"
                color="primary"
                onClick={this.handleReload}
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
    }

    // Nếu không có lỗi, hiển thị children bình thường
    return this.props.children;
  }
}

export default ErrorBoundary; 