import LoadingSpinner from './LoadingSpinner';

interface LoadingPageProps {
  text?: string;
}

export default function LoadingPage({ text = 'Đang tải...' }: LoadingPageProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
      <div className="text-center">
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
}

