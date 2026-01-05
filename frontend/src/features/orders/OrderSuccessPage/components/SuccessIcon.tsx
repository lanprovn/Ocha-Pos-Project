import React from 'react';

export const SuccessIcon: React.FC = () => {
  return (
    <div className="flex justify-center mb-6">
      <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center shadow-sm">
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
    </div>
  );
};

