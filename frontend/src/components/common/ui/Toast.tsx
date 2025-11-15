// Toast component placeholder
import toast from 'react-hot-toast';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

export const showToast = ({ message, type = 'info', duration = 3000 }: ToastProps) => {
  const toastOptions = {
    duration,
    style: {
      background: type === 'error' ? '#ef4444' : type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#3b82f6',
      color: '#fff',
      fontWeight: '500',
    },
  };

  switch (type) {
    case 'success':
      return toast.success(message, toastOptions);
    case 'error':
      return toast.error(message, toastOptions);
    case 'warning':
      return toast(message, { ...toastOptions, icon: '⚠️' });
    default:
      return toast(message, toastOptions);
  }
};

// Convenience functions
export const showSuccessToast = (message: string, duration?: number) => {
  showToast({ message, type: 'success', duration });
};

export const showErrorToast = (message: string, duration?: number) => {
  showToast({ message, type: 'error', duration });
};

export const showInfoToast = (message: string, duration?: number) => {
  showToast({ message, type: 'info', duration });
};

export const showWarningToast = (message: string, duration?: number) => {
  showToast({ message, type: 'warning', duration });
};
