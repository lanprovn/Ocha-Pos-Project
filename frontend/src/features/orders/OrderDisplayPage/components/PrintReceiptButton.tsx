import React from 'react';
import { PrinterIcon } from '@heroicons/react/24/outline';
import type { OrderTracking } from '@/types/display';

interface PrintReceiptButtonProps {
  order: OrderTracking;
}

// Helper function to convert number to Vietnamese text
const numberToVietnameseText = (num: number): string => {
  const ones = ['', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
  const tens = ['', 'mười', 'hai mươi', 'ba mươi', 'bốn mươi', 'năm mươi', 'sáu mươi', 'bảy mươi', 'tám mươi', 'chín mươi'];
  const hundreds = ['', 'một trăm', 'hai trăm', 'ba trăm', 'bốn trăm', 'năm trăm', 'sáu trăm', 'bảy trăm', 'tám trăm', 'chín trăm'];

  if (num === 0) return 'không';
  if (num < 10) return ones[num];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    if (one === 0) return tens[ten];
    if (one === 5) return `${tens[ten]} lăm`;
    if (one === 1 && ten > 1) return `${tens[ten]} mốt`;
    return `${tens[ten]} ${ones[one]}`;
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    if (remainder === 0) return hundreds[hundred];
    return `${hundreds[hundred]} ${numberToVietnameseText(remainder)}`;
  }
  if (num < 1000000) {
    const thousand = Math.floor(num / 1000);
    const remainder = num % 1000;
    let result = '';
    if (thousand < 10) {
      result = ones[thousand];
    } else if (thousand < 100) {
      result = numberToVietnameseText(thousand);
    } else {
      result = numberToVietnameseText(thousand);
    }
    result += ' nghìn';
    if (remainder > 0) {
      if (remainder < 100) result += ' không trăm';
      result += ' ' + numberToVietnameseText(remainder);
    }
    return result;
  }
  if (num < 1000000000) {
    const million = Math.floor(num / 1000000);
    const remainder = num % 1000000;
    let result = numberToVietnameseText(million) + ' triệu';
    if (remainder > 0) {
      if (remainder < 1000) result += ' không trăm';
      result += ' ' + numberToVietnameseText(remainder);
    }
    return result;
  }
  return num.toString();
};

const PrintReceiptButton: React.FC<PrintReceiptButtonProps> = ({ order }) => {
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
    const timeStr = orderDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // Format order number (pad with zeros)
    const orderNumber = order.orderId || order.id.substring(0, 8).toUpperCase();
    const paddedOrderNumber = orderNumber.padStart(4, '0');
    
    // Calculate payment info (if cash payment)
    const isCashPayment = order.paymentMethod === 'cash';
    const amountPaid = isCashPayment ? Math.ceil(totalAmount / 1000) * 1000 : totalAmount; // Round up to nearest 1000
    const changeAmount = isCashPayment ? amountPaid - totalAmount : 0;
    
    // Vietnamese text for total amount
    const formatVietnameseMoney = (amount: number): string => {
      const millions = Math.floor(amount / 1000000);
      const thousands = Math.floor((amount % 1000000) / 1000);
      const remainder = amount % 1000;
      
      let result = '';
      if (millions > 0) {
        result += numberToVietnameseText(millions) + ' triệu';
      }
      if (thousands > 0) {
        if (result) result += ' ';
        if (thousands < 10 && millions > 0) {
          result += 'không trăm';
        }
        result += ' ' + numberToVietnameseText(thousands) + ' nghìn';
      }
      if (remainder > 0) {
        if (result) result += ' ';
        if (remainder < 100 && (thousands > 0 || millions > 0)) {
          result += 'không trăm';
        }
        result += ' ' + numberToVietnameseText(remainder);
      }
      result += ' đồng';
      return result.trim().replace(/\s+/g, ' ');
    };
    
    const totalInWords = formatVietnameseMoney(Math.round(totalAmount));
    
    // Store info (can be configured)
    const storeName = 'OCHA VIỆT POS';
    const storeAddress = 'Hệ thống quản lý bán hàng';
    const storePhone = 'Hotline: 0768562386';

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hóa đơn ${paddedOrderNumber}</title>
          <meta charset="UTF-8">
          <style>
            @media print {
              @page {
                size: 80mm auto;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 5mm;
                font-family: 'Courier New', monospace;
                font-size: 11px;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 11px;
              padding: 10px;
              max-width: 300px;
              margin: 0 auto;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 1px dashed #000;
              padding-bottom: 8px;
              margin-bottom: 8px;
            }
            .header h1 {
              margin: 0;
              font-size: 16px;
              font-weight: bold;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .header p {
              margin: 2px 0;
              font-size: 10px;
            }
            .order-info {
              margin: 8px 0;
              font-size: 10px;
            }
            .order-info-row {
              display: flex;
              justify-content: space-between;
              margin: 2px 0;
            }
            .order-info-row strong {
              font-weight: bold;
            }
            .items-table {
              width: 100%;
              margin: 8px 0;
              border-collapse: collapse;
              font-size: 10px;
            }
            .items-table thead {
              border-top: 1px dashed #000;
              border-bottom: 1px dashed #000;
            }
            .items-table th {
              text-align: left;
              padding: 4px 2px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .items-table td {
              padding: 3px 2px;
              vertical-align: top;
            }
            .items-table .item-name {
              width: 40%;
            }
            .items-table .item-qty {
              width: 10%;
              text-align: center;
            }
            .items-table .item-price {
              width: 25%;
              text-align: right;
            }
            .items-table .item-total {
              width: 25%;
              text-align: right;
              font-weight: bold;
            }
            .item-details {
              font-size: 9px;
              color: #555;
              font-style: italic;
              padding-left: 5px;
            }
            .discount-row {
              color: #d32f2f;
              font-size: 9px;
            }
            .summary {
              margin-top: 8px;
              border-top: 1px dashed #000;
              padding-top: 8px;
              font-size: 10px;
            }
            .summary-row {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
            }
            .summary-row.total-items {
              font-size: 9px;
              color: #666;
            }
            .summary-row.final {
              font-weight: bold;
              font-size: 12px;
              margin-top: 5px;
              padding-top: 5px;
              border-top: 1px dashed #000;
            }
            .payment-info {
              margin-top: 8px;
              padding-top: 8px;
              border-top: 1px dashed #000;
              font-size: 10px;
            }
            .payment-row {
              display: flex;
              justify-content: space-between;
              margin: 3px 0;
            }
            .payment-row.method {
              font-weight: bold;
            }
            .payment-row.change {
              color: #1976d2;
              font-weight: bold;
            }
            .total-in-words {
              margin-top: 5px;
              font-size: 9px;
              font-style: italic;
              text-align: center;
              color: #555;
            }
            .footer {
              text-align: center;
              margin-top: 15px;
              padding-top: 10px;
              border-top: 1px dashed #000;
              font-size: 10px;
              font-weight: bold;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${storeName}</h1>
            <p>${storeAddress}</p>
            <p>${storePhone}</p>
            <p style="margin-top: 5px; font-weight: bold;">HÓA ĐƠN THANH TOÁN</p>
          </div>
          
          <div class="order-info">
            <div class="order-info-row">
              <span>SỐ TT:</span>
              <span><strong>${paddedOrderNumber}</strong></span>
            </div>
            <div class="order-info-row">
              <span>Ngày vào:</span>
              <span>${dateStr}</span>
            </div>
            <div class="order-info-row">
              <span>Giờ vào:</span>
              <span>${timeStr}</span>
            </div>
            <div class="order-info-row">
              <span>Ngày:</span>
              <span>${dateStr}</span>
            </div>
            <div class="order-info-row">
              <span>Giờ:</span>
              <span>${timeStr}</span>
            </div>
            ${order.customerInfo?.table ? `
            <div class="order-info-row">
              <span>Bàn:</span>
              <span><strong>${order.customerInfo.table}</strong></span>
            </div>
            ` : ''}
            ${order.customerInfo?.name ? `
            <div class="order-info-row">
              <span>Khách hàng:</span>
              <span>${order.customerInfo.name}</span>
            </div>
            ` : ''}
            ${order.customerInfo?.phone ? `
            <div class="order-info-row">
              <span>SĐT:</span>
              <span>${order.customerInfo.phone}</span>
            </div>
            ` : ''}
          </div>

          <table class="items-table">
            <thead>
              <tr>
                <th class="item-name">TÊN HÀNG</th>
                <th class="item-qty">SL</th>
                <th class="item-price">ĐG</th>
                <th class="item-total">T.TIỀN</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => {
                const unitPrice = item.totalPrice / item.quantity;
                const itemDiscount = item.basePrice && item.basePrice > 0 
                  ? ((item.basePrice - unitPrice) / item.basePrice * 100) 
                  : 0;
                
                return `
                  <tr>
                    <td class="item-name">
                      <div>${item.name}</div>
                      ${item.selectedSize ? `<div class="item-details">Size: ${item.selectedSize.name}</div>` : ''}
                      ${item.selectedToppings && item.selectedToppings.length > 0 ? `
                        <div class="item-details">Topping: ${item.selectedToppings.map(t => t.name).join(', ')}</div>
                      ` : ''}
                      ${item.note ? `<div class="item-details">Ghi chú: ${item.note}</div>` : ''}
                    </td>
                    <td class="item-qty">${item.quantity.toFixed(1)}</td>
                    <td class="item-price">${unitPrice.toLocaleString('vi-VN')}</td>
                    <td class="item-total">${item.totalPrice.toLocaleString('vi-VN')}</td>
                  </tr>
                  ${itemDiscount > 0 ? `
                  <tr class="discount-row">
                    <td colspan="3" class="item-name">GIAM % MON</td>
                    <td class="item-total">-${(item.totalPrice * itemDiscount / 100).toLocaleString('vi-VN')}</td>
                  </tr>
                  ` : ''}
                `;
              }).join('')}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-row total-items">
              <span>T.CỘNG</span>
              <span>${order.items.reduce((sum, item) => sum + item.quantity, 0).toFixed(1)}</span>
              <span>${priceWithoutVAT.toLocaleString('vi-VN')}</span>
            </div>
            <div class="summary-row">
              <span>VAT (10%):</span>
              <span>${Math.round(vatAmount).toLocaleString('vi-VN')}</span>
            </div>
            <div class="summary-row final">
              <span>TIỀN MẶT:</span>
              <span>${totalAmount.toLocaleString('vi-VN')}</span>
            </div>
          </div>

          ${isCashPayment ? `
          <div class="payment-info">
            <div class="payment-row method">
              <span>Phương thức:</span>
              <span>Tiền mặt</span>
            </div>
            <div class="payment-row">
              <span>SỐ TIỀN KHÁCH ĐƯA:</span>
              <span>${amountPaid.toLocaleString('vi-VN')}</span>
            </div>
            <div class="payment-row change">
              <span>SỐ TIỀN THỐI LẠI:</span>
              <span>${changeAmount.toLocaleString('vi-VN')}</span>
            </div>
          </div>
          ` : `
          <div class="payment-info">
            <div class="payment-row method">
              <span>Phương thức:</span>
              <span>${order.paymentMethod === 'qr' ? 'QR Code' : order.paymentMethod === 'cash' ? 'Tiền mặt' : 'Khác'}</span>
            </div>
            <div class="payment-row">
              <span>Đã thanh toán:</span>
              <span>${totalAmount.toLocaleString('vi-VN')}</span>
            </div>
          </div>
          `}

          <div class="total-in-words">
            (Bằng chữ: ${totalInWords})
          </div>

          <div class="footer">
            <p>XIN CÁM ƠN - HẸN GẶP LẠI!</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    printWindow.focus();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  return (
    <button
      onClick={handlePrint}
      className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm"
      title="In hóa đơn"
    >
      <PrinterIcon className="w-4 h-4" />
      <span>In hóa đơn</span>
    </button>
  );
};

export default PrintReceiptButton;

