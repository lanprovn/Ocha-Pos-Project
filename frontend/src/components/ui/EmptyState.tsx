import React from 'react';

interface EmptyStateProps {
  icon?: string;
  title?: string;
  description?: string;
  message?: string; // Alias for description for backward compatibility
  showClearButton?: boolean;
  showClearFilters?: boolean; // Alias for showClearButton
  onClear?: () => void;
  onClearFilters?: () => void; // Alias for onClear
  className?: string;
}

/**
 * Unified EmptyState component - can be used across the entire application
 * Supports both description and message props for backward compatibility
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  message,
  showClearButton = false,
  showClearFilters = false,
  onClear,
  onClearFilters,
  className = '',
}) => {
  // Use description or message (message takes precedence for backward compatibility)
  const displayText = message || description || '';
  const showButton = showClearButton || showClearFilters;
  const handleClear = onClear || onClearFilters;

  // If no props provided, show default order display state
  if (!icon && !title && !displayText) {
    return (
      <div className={`bg-white rounded-2xl shadow-lg p-12 text-center ${className}`}>
        <div className="text-6xl mb-4">📭</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          Chưa có đơn hàng nào
        </h3>
        <p className="text-gray-500">
          Chưa có đơn hàng nào đang được tạo hoặc xử lý
        </p>
      </div>
    );
  }

  return (
    <div className={`text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-300 ${className}`}>
      {icon && <div className="text-6xl mb-4">{icon}</div>}
      {title && <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>}
      {displayText && <p className="text-gray-500 mb-4">{displayText}</p>}
      {showButton && handleClear && (
        <button
          onClick={handleClear}
          className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
        >
          Xóa bộ lọc
        </button>
      )}
    </div>
  );
};

export default EmptyState;

