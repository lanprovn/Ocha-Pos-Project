"use client";
import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { formatPrice } from '@/utils/formatPrice';
import {
  X,
  Timer,
  Info,
  ShieldCheck,
  Copy,
  Banknote,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';

// Shadcn UI
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface QRPaymentData {
  qrUrl: string;
  qrImageUrl?: string;
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
    setCountdown(300);

    const updateQrSize = () => {
      setQrSize(window.innerWidth < 640 ? 220 : 260);
    };

    updateQrSize();
    window.addEventListener('resize', updateQrSize);

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

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`Đã sao chép ${label}`);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
      {/* Super Glass Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Luxury QR Content */}
      <div className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-500 max-h-[90vh]">

        {/* Left: QR Display Area */}
        <div className="md:w-[45%] bg-slate-50 p-8 sm:p-12 flex flex-col items-center justify-center border-r border-slate-100">
          <div className="mb-8 text-center space-y-2">
            <Badge className="bg-emerald-500 text-white border-none font-black text-[10px] uppercase tracking-widest px-3 py-1">
              Secure Gateway
            </Badge>
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Quét mã QR</h2>
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <Timer className="w-4 h-4" />
              <span className="text-sm font-bold">{minutes}:{seconds.toString().padStart(2, '0')}</span>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative bg-white p-6 rounded-[32px] shadow-2xl border border-slate-100 transition-transform duration-500 hover:scale-105">
              {qrData.qrImageUrl ? (
                <img
                  src={qrData.qrImageUrl}
                  alt="QR Code"
                  className="w-full max-w-[280px] h-auto rounded-xl"
                />
              ) : (
                <QRCodeSVG value={qrData.qrUrl} size={qrSize} level="H" includeMargin={true} />
              )}
            </div>
          </div>

          {countdown === 0 && (
            <div className="mt-8 p-4 bg-rose-50 rounded-2xl border border-rose-100 text-center animate-bounce">
              <p className="text-xs text-rose-600 font-black uppercase tracking-widest flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Mã QR đã hết hạn
              </p>
            </div>
          )}

          <div className="mt-10 flex items-center gap-4 opacity-40">
            <img src="https://vietqr.net/portal-v2/images/img/vietqr-logo.png" alt="VietQR" className="h-6 object-contain" />
            <div className="h-4 w-px bg-slate-300" />
            <img src="https://napas.com.vn/Styles/img/logo.png" alt="Napas" className="h-4 object-contain" />
          </div>
        </div>

        {/* Right: Payment Details */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          {/* Header */}
          <div className="p-8 pb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Banknote className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight leading-none">Thông tin chuyển khoản</h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Double check before pay</span>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-slate-300">
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Details Scroll */}
          <div className="flex-1 overflow-y-auto px-8 pb-32 space-y-6 no-scrollbar">

            {/* Info Cards */}
            <div className="grid grid-cols-1 gap-4">
              {/* Bank Account Details */}
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tài khoản thụ hưởng</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between group">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Ngân hàng</p>
                      <p className="font-black text-slate-800 tracking-tight">
                        {qrData.qrData.bankCode === 'CTG' ? 'VietinBank' : qrData.qrData.bankCode}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleCopy(qrData.qrData.bankCode, 'Tên ngân hàng')}>
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="flex items-center justify-between group">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Số tài khoản</p>
                      <p className="font-black text-xl text-slate-900 font-mono tracking-widest">
                        {qrData.qrData.accountNumber}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => handleCopy(qrData.qrData.accountNumber, 'Số tài khoản')}>
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Amount & Description */}
              <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest">Nội dung thanh toán</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between group">
                    <div>
                      <p className="text-xs font-bold text-emerald-600/60 uppercase tracking-tight">Số tiền (Amount)</p>
                      <p className="text-3xl font-black text-emerald-700 tracking-tighter">
                        {formatPrice(qrData.totalAmount)}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-white/60 rounded-2xl border-2 border-emerald-200 group flex items-center justify-between border-dashed">
                    <div>
                      <p className="text-[10px] font-black uppercase text-emerald-600/40 mb-1">Nội dung (Memo)</p>
                      <p className="font-black text-slate-800 font-mono text-lg">{qrData.orderNumber}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-emerald-600 hover:bg-emerald-100" onClick={() => handleCopy(qrData.orderNumber, 'Nội dung')}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Simple Guide */}
            <div className="flex items-start gap-4 p-4 bg-amber-50 rounded-2xl">
              <div className="p-2 bg-amber-200 rounded-lg shrink-0">
                <Smartphone className="w-4 h-4 text-amber-700" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-black text-amber-800 uppercase tracking-tight">Hướng dẫn nhanh</p>
                <p className="text-[11px] text-amber-700/80 font-medium leading-relaxed">
                  Mở app Banking, chọn quét QR và hướng camera về phía mã bên trái. Sau khi chuyển hoàn tất, hãy nhấn nút "Đã thanh toán" phía dưới.
                </p>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="absolute bottom-0 inset-x-0 p-8 pt-4 bg-gradient-to-t from-white via-white to-transparent">
            <div className="flex gap-4">
              <Button
                variant="ghost"
                onClick={onClose}
                className="h-16 flex-1 rounded-2xl font-bold uppercase tracking-widest text-xs text-slate-400 hover:bg-slate-50"
              >
                Hủy giao dịch
              </Button>
              <Button
                onClick={onVerifyPayment}
                disabled={isVerifying || countdown === 0}
                className="h-16 flex-[2] bg-slate-900 hover:bg-black text-white rounded-2xl shadow-xl shadow-slate-200 font-black uppercase tracking-[0.2em] transition-all group active:scale-95"
              >
                {isVerifying ? (
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Đang kiểm tra...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-400 group-hover:scale-125 transition-transform" />
                    <span>Đã thanh toán</span>
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRPaymentModal;
