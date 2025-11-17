import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { formatPrice } from '../../../utils/formatPrice';

export interface QRPaymentData {
  qrUrl: string; // URL để generate QR code (backup)
  qrImageUrl?: string; // URL image từ VietQR API (QR code thật - dùng chính)
  qrData: {
    bankCode: string;
    accountNumber: string;
    accountName: string;
    amount: number;
    description: string;
    orderNumber: string;
  };
  orderId: string;
  orderNumber: string;
  totalAmount: number;
}

interface QRPaymentModalProps {
  isOpen: boolean;
  qrData: QRPaymentData | null;
  onClose: () => void;
  onVerifyPayment: () => void;
  isVerifying?: boolean;
}

const QRPaymentModal: React.FC<QRPaymentModalProps> = ({
  isOpen,
  qrData,
  onClose,
  onVerifyPayment,
  isVerifying = false,
}) => {
  const [countdown, setCountdown] = useState(300); // 5 phút
  const [qrSize, setQrSize] = useState(260);

  useEffect(() => {
    if (!isOpen || !qrData) return;

    // Reset countdown khi mở modal
    setCountdown(300);

    // Tính toán kích thước QR code dựa trên màn hình
    const updateQrSize = () => {
      if (window.innerWidth < 640) {
        setQrSize(220);
      } else {
        setQrSize(260);
      }
    };

    updateQrSize();
    window.addEventListener('resize', updateQrSize);

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', updateQrSize);
    };
  }, [isOpen, qrData]);

  if (!isOpen || !qrData) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-3 sm:p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[95vh] max-h-[900px] mx-auto border border-white/50 transform animate-scale-in flex flex-col overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900">Thanh toán qua QR Code</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              aria-label="Close"
            >
              ×
            </button>
          </div>

          {/* Content - Horizontal Layout - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 h-full">
              {/* Left Side - QR Code */}
              <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4">
                <div className="bg-white p-3 sm:p-4 rounded-lg border-2 border-gray-200 shadow-lg">
                  {qrData.qrImageUrl ? (
                    // Sử dụng QR code image từ VietQR API (QR code thật)
                    <img
                      src={qrData.qrImageUrl}
                      alt="QR Code Thanh Toán"
                      className="w-full h-auto max-w-[280px] max-h-[280px]"
                      onError={(e) => {
                        // Fallback: nếu image không load được, dùng QR code generator
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'block';
                      }}
                    />
                  ) : null}
                  {/* Fallback: Generate QR code từ URL nếu image không có */}
                  <div style={{ display: qrData.qrImageUrl ? 'none' : 'block' }}>
                    <QRCodeSVG
                      value={qrData.qrUrl}
                      size={qrSize}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                </div>
                
                {/* Countdown */}
                {countdown > 0 && (
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-600">
                      Mã QR sẽ hết hạn sau:{' '}
                      <span className="font-bold text-orange-500 text-base sm:text-lg">
                        {minutes}:{seconds.toString().padStart(2, '0')}
                      </span>
                    </p>
                  </div>
                )}

                {countdown === 0 && (
                  <div className="bg-red-50 rounded-lg p-3 sm:p-4 border border-red-200 text-center w-full">
                    <p className="text-xs sm:text-sm text-red-600 font-semibold">
                      Mã QR đã hết hạn. Vui lòng tạo lại.
                    </p>
                  </div>
                )}
              </div>

              {/* Right Side - Information */}
              <div className="space-y-3 sm:space-y-4 flex flex-col justify-center">
                {/* Order Info */}
                <div className="bg-gray-50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
                  <h4 className="font-semibold text-gray-900 text-base sm:text-lg border-b border-gray-200 pb-2">
                    Thông tin đơn hàng
                  </h4>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">Mã đơn hàng:</span>
                    <span className="font-semibold text-gray-900 text-base sm:text-lg">{qrData.orderNumber}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">Số tiền:</span>
                    <span className="font-bold text-orange-500 text-lg sm:text-xl">
                      {formatPrice(qrData.totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Bank Info */}
                <div className="bg-blue-50 rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3 border border-blue-200">
                  <h4 className="font-semibold text-gray-900 text-base sm:text-lg border-b border-blue-200 pb-2">
                    Thông tin chuyển khoản
                  </h4>
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">Ngân hàng:</span>
                      <span className="font-semibold text-gray-900 text-sm sm:text-base">{qrData.qrData.bankCode}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm sm:text-base">Số tài khoản:</span>
                      <span className="font-semibold text-gray-900 font-mono text-sm sm:text-base lg:text-lg">
                        {qrData.qrData.accountNumber}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600 text-sm sm:text-base">Tên tài khoản:</span>
                      <span className="font-semibold text-gray-900 text-right max-w-[200px] sm:max-w-[250px] text-xs sm:text-sm">
                        {qrData.qrData.accountName}
                      </span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-gray-600 text-sm sm:text-base">Nội dung:</span>
                      <span className="font-semibold text-gray-900 text-right max-w-[200px] sm:max-w-[250px] break-words text-xs sm:text-sm">
                        {qrData.qrData.description}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-yellow-50 rounded-lg p-3 sm:p-4 border border-yellow-200">
                  <p className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">
                    Hướng dẫn:
                  </p>
                  <ol className="text-xs sm:text-sm text-gray-700 space-y-1 sm:space-y-1.5 list-decimal list-inside">
                    <li>Mở ứng dụng ngân hàng trên điện thoại</li>
                    <li>Quét mã QR code ở bên trái</li>
                    <li>Kiểm tra thông tin và xác nhận thanh toán</li>
                    <li>Nhấn "Đã thanh toán" sau khi chuyển khoản thành công</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2 sm:gap-3 flex-shrink-0">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 sm:py-2.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold text-sm sm:text-base"
            >
              Hủy
            </button>
            <button
              onClick={onVerifyPayment}
              disabled={isVerifying || countdown === 0}
              className="flex-1 px-4 py-2 sm:py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl hover:from-orange-600 hover:to-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none text-sm sm:text-base"
            >
              {isVerifying ? 'Đang xác nhận...' : 'Đã thanh toán'}
            </button>
          </div>

          <style>{`
            @keyframes scale-in {
              from {
                transform: scale(0.95);
                opacity: 0;
              }
              to {
                transform: scale(1);
                opacity: 1;
              }
            }
            .animate-scale-in {
              animation: scale-in 0.2s ease-out;
            }
          `}</style>
        </div>
      </div>
    </>
  );
};

export default QRPaymentModal;

