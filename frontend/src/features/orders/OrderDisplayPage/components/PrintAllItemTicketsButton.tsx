import React from 'react';
import { PrinterIcon } from '@heroicons/react/24/outline';
import type { OrderTracking } from '@/types/display';
import type { CartItem } from '@/types/cart';

interface PrintAllItemTicketsButtonProps {
  order: OrderTracking;
}

const PrintAllItemTicketsButton: React.FC<PrintAllItemTicketsButtonProps> = ({ order }) => {
  const printItemTicket = (item: CartItem, index: number) => {
    setTimeout(() => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const orderDate = new Date(order.timestamp);
      const dateStr = orderDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
      const timeStr = orderDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
      const orderNumber = order.orderId || order.id.substring(0, 8).toUpperCase();
      const storeName = 'OCHA VIỆT POS';

      const itemDetails: string[] = [];
      if (item.selectedSize) {
        itemDetails.push(`Size: ${item.selectedSize.name}`);
      }
      if (item.selectedToppings && item.selectedToppings.length > 0) {
        itemDetails.push(`Topping: ${item.selectedToppings.map(t => t.name).join(', ')}`);
      }
      if (item.note) {
        itemDetails.push(`Ghi chú: ${item.note}`);
      }

      const ticketHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Thông tin món ${orderNumber}</title>
            <meta charset="UTF-8">
            <style>
              @media print {
                @page {
                  size: 50mm 30mm;
                  margin: 0;
                }
                body {
                  margin: 0;
                  padding: 3mm;
                  font-family: 'Courier New', monospace;
                  font-size: 9px;
                  -webkit-print-color-adjust: exact;
                  print-color-adjust: exact;
                }
              }
              body {
                font-family: 'Courier New', monospace;
                font-size: 9px;
                padding: 5px;
                max-width: 50mm;
                margin: 0 auto;
                background: white;
                border: 1px dashed #000;
              }
              .header {
                text-align: center;
                border-bottom: 1px dashed #000;
                padding-bottom: 3px;
                margin-bottom: 3px;
              }
              .header h1 {
                margin: 0;
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 0.5px;
              }
              .order-info {
                margin: 3px 0;
                font-size: 8px;
              }
              .order-info-row {
                display: flex;
                justify-content: space-between;
                margin: 1px 0;
              }
              .item-name {
                font-weight: bold;
                font-size: 10px;
                text-align: center;
                margin: 3px 0;
                text-transform: uppercase;
              }
              .item-quantity {
                text-align: center;
                font-size: 12px;
                font-weight: bold;
                margin: 2px 0;
                border: 1px solid #000;
                padding: 2px;
                display: inline-block;
                width: 100%;
              }
              .item-details {
                font-size: 7px;
                margin: 2px 0;
                padding-left: 2px;
              }
              .item-details div {
                margin: 1px 0;
              }
              .footer {
                text-align: center;
                margin-top: 3px;
                padding-top: 3px;
                border-top: 1px dashed #000;
                font-size: 7px;
              }
              .divider {
                border-top: 1px dashed #000;
                margin: 2px 0;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${storeName}</h1>
            </div>
            
            <div class="order-info">
              <div class="order-info-row">
                <span>Mã đơn:</span>
                <span><strong>${orderNumber}</strong></span>
              </div>
              ${order.customerInfo?.table ? `
              <div class="order-info-row">
                <span>Bàn:</span>
                <span><strong>${order.customerInfo.table}</strong></span>
              </div>
              ` : ''}
              <div class="order-info-row">
                <span>${dateStr} ${timeStr}</span>
              </div>
            </div>

            <div class="divider"></div>

            <div class="item-name">
              ${item.name}
            </div>

            <div class="item-quantity">
              SỐ LƯỢNG: ${item.quantity}x
            </div>

            ${itemDetails.length > 0 ? `
            <div class="item-details">
              ${itemDetails.map(detail => `<div>${detail}</div>`).join('')}
            </div>
            ` : ''}

            <div class="footer">
              <div style="font-weight: bold;">THÔNG TIN MÓN</div>
            </div>
          </body>
        </html>
      `;

      printWindow.document.write(ticketHTML);
      printWindow.document.close();
      printWindow.focus();
      
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }, index * 500); // Delay each print by 500ms to avoid browser blocking
  };

  const handlePrintAll = () => {
    if (order.items.length === 0) return;
    
    // Print each item info sequentially
    order.items.forEach((item, index) => {
      // For items with quantity > 1, print multiple tickets
      const quantity = Math.floor(item.quantity);
      for (let i = 0; i < quantity; i++) {
        printItemTicket(item, index * 10 + i);
      }
    });
  };

  return (
    <button
      onClick={handlePrintAll}
      className="flex items-center space-x-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-colors text-sm"
      title="In tất cả thông tin món"
    >
      <PrinterIcon className="w-4 h-4" />
      <span>In tất cả thông tin món</span>
    </button>
  );
};

export default PrintAllItemTicketsButton;
