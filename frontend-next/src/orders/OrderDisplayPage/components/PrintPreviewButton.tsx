"use client";
import React from 'react';
import { PrinterIcon } from '@heroicons/react/24/outline';
import type { OrderTracking } from '@/types/display';
import { formatPrice } from '@/utils/formatPrice';

interface PrintPreviewButtonProps {
  order: OrderTracking;
}

const PrintPreviewButton: React.FC<PrintPreviewButtonProps> = ({ order }) => {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Calculate totals
    const subtotal = order.items.reduce((sum, item) => sum + item.totalPrice, 0);
    const vatRate = 0.1; // 10% VAT
    const priceWithoutVAT = subtotal / (1 + vatRate);
    const vatAmount = subtotal - priceWithoutVAT;
    const totalAmount = subtotal;
    
    // Get order date/time
    const orderDate = new Date(order.timestamp);
    const dateStr = orderDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = orderDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    
    // Format order number
    const orderNumber = order.orderId || order.id.substring(0, 8).toUpperCase();

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Phiếu Tạm Tính</title>
          <meta charset="UTF-8">
          <style>
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 10mm;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                line-height: 1.4;
              }
            }
            body {
              margin: 0;
              padding: 20px;
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              max-width: 80mm;
              margin: 0 auto;
            }
            .header {
              text-align: center;
              border-bottom: 2px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .store-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .watermark {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 48px;
              color: rgba(0, 0, 0, 0.1);
              font-weight: bold;
              z-index: -1;
              pointer-events: none;
            }
            .order-info {
              margin: 10px 0;
            }
            .order-info div {
              margin: 3px 0;
            }
            .items {
              margin: 15px 0;
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
              padding: 10px 0;
            }
            .item {
              margin: 8px 0;
            }
            .item-name {
              font-weight: bold;
            }
            .item-details {
              font-size: 10px;
              color: #666;
              margin-left: 10px;
            }
            .summary {
              margin: 15px 0;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin: 5px 0;
            }
            .total {
              font-size: 16px;
              font-weight: bold;
              border-top: 2px solid #000;
              padding-top: 10px;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              padding-top: 10px;
              border-top: 1px dashed #000;
              font-size: 10px;
            }
          </style>
        </head>
        <body>
          <div class="watermark">PHIẾU TẠM TÍNH</div>
          <div class="header">
            <div class="store-name">OCHA POS</div>
            <div style="font-size: 10px;">Địa chỉ: 123 Đường ABC, Quận XYZ</div>
            <div style="font-size: 10px;">Hotline: 0123 456 789</div>
          </div>
          
          <div class="order-info">
            <div><strong>Mã đơn:</strong> ${orderNumber}</div>
            <div><strong>Ngày:</strong> ${dateStr} ${timeStr}</div>
            ${order.customerInfo?.table ? `<div><strong>Bàn:</strong> ${order.customerInfo.table}</div>` : ''}
            ${order.customerInfo?.name ? `<div><strong>Khách hàng:</strong> ${order.customerInfo.name}</div>` : ''}
          </div>
          
          <div class="items">
            ${order.items.map((item) => `
              <div class="item">
                <div class="item-name">${item.name} x${item.quantity}</div>
                ${item.selectedSize ? `<div class="item-details">Size: ${item.selectedSize.name}</div>` : ''}
                ${item.selectedToppings.length > 0 ? `<div class="item-details">Topping: ${item.selectedToppings.map(t => t.name).join(', ')}</div>` : ''}
                ${item.note ? `<div class="item-details">Ghi chú: ${item.note}</div>` : ''}
                <div style="text-align: right; margin-top: 3px;">${formatPrice(item.totalPrice)}</div>
              </div>
            `).join('')}
          </div>
          
          <div class="summary">
            <div class="summary-row">
              <span>Tạm tính:</span>
              <span>${formatPrice(priceWithoutVAT)}</span>
            </div>
            <div class="summary-row">
              <span>VAT (10%):</span>
              <span>${formatPrice(vatAmount)}</span>
            </div>
            <div class="summary-row total">
              <span>TỔNG CỘNG:</span>
              <span>${formatPrice(totalAmount)}</span>
            </div>
          </div>
          
          <div class="footer">
            <div style="font-weight: bold; margin-bottom: 5px;">PHIẾU TẠM TÍNH</div>
            <div>Cảm ơn quý khách!</div>
            <div style="margin-top: 10px; font-size: 9px;">In lúc: ${new Date().toLocaleString('vi-VN')}</div>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    
    // Wait for content to load, then print
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <button
      onClick={handlePrint}
      className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-semibold transition-colors text-sm flex items-center justify-center space-x-2"
      title="In phiếu tạm tính"
    >
      <PrinterIcon className="w-4 h-4" />
      <span>In tạm tính</span>
    </button>
  );
};

export default PrintPreviewButton;
