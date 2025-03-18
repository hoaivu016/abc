import { useState } from 'react';

type Severity = 'success' | 'error' | 'info' | 'warning';

interface NotificationState {
  open: boolean;
  message: string;
  severity: Severity;
}

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'success'
  });

  const showNotification = (message: string, severity: Severity) => {
    setNotification({
      open: true,
      message,
      severity
    });
  };

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return {
    notification,
    showNotification,
    hideNotification
  };
}; 