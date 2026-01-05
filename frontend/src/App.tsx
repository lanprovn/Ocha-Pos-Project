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
      <div id="app-wrapper" className="w-screen min-h-screen bg-white">
        <AppRouter />
      </div>
    </ErrorBoundary>
  );
}

export default App;
