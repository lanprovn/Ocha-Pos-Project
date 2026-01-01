import React from 'react';
import { ClockIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useShiftStatus } from '../../hooks/useShiftStatus';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';

/**
 * ShiftStatusAlert - Displays alert when no shift is open
 * Only shows for STAFF users
 */
const ShiftStatusAlert: React.FC = () => {
  const { user } = useAuth();
  const { hasOpenShift, isLoading, hasChecked } = useShiftStatus();
  const navigate = useNavigate();

  // Only show for STAFF users
  if (user?.role !== 'STAFF') {
    return null;
  }

  // Don't show while loading or if shift is open
  if (isLoading || !hasChecked || hasOpenShift) {
    return null;
  }

  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-500 p-4 mb-4 shadow-sm">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-semibold text-orange-800">
            Chưa có ca làm việc đang mở
          </h3>
          <div className="mt-2 text-sm text-orange-700">
            <p>
              Vui lòng liên hệ Quản trị viên để mở ca làm việc trước khi bắt đầu làm việc.
            </p>
          </div>
          <div className="mt-3">
            <div className="flex items-center space-x-2">
              <ClockIcon className="h-4 w-4 text-orange-600" />
              <span className="text-xs text-orange-600 font-medium">
                Ca làm việc cần được mở để theo dõi doanh thu và giao dịch
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftStatusAlert;



