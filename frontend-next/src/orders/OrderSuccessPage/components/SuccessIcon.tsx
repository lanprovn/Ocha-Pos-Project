"use client";
import React from 'react';

export const SuccessIcon: React.FC = () => {
  return (
    <div className="flex justify-center mb-2">
      <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center shadow-sm">
        <svg
          className="w-8 h-8 text-white"
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

