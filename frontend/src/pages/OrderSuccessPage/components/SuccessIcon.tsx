import React from 'react';

export const SuccessIcon: React.FC = () => {
  return (
    <div className="flex justify-center mb-6 animate-scale-in">
      <div className="relative">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
          <svg
            className="w-12 h-12 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-20"></div>
      </div>
    </div>
  );
};

