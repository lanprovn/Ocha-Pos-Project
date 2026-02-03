import { useEffect } from 'react';
import AppRouter from './router/AppRouter';
import ErrorBoundary from './components/common/feedback/ErrorBoundary';
import { getSocket } from '@lib/socket.service';

function App() {
  // Initialize Socket.io early when app starts
  useEffect(() => {
    getSocket();
  }, []);

  return (
    <ErrorBoundary>
      {/* Giải phóng layout: không dùng wrapper có width giới hạn ở đây */}
      <AppRouter />
    </ErrorBoundary>
  );
}

export default App;
