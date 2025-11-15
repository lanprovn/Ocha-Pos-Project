import AppRouter from './router/AppRouter';
import ErrorBoundary from './components/common/feedback/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <div id="app-wrapper" className="w-screen min-h-screen bg-white">
        <AppRouter />
      </div>
    </ErrorBoundary>
  );
}

export default App;
