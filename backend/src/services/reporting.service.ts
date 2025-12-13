import prisma from '../config/database';
import ExcelJS from 'exceljs';

export interface ReportFilters {
  startDate: string;
  endDate: string;
  reportType?: 'daily' | 'weekly' | 'monthly' | 'custom';
}

export interface DailyReportData {
  date: string;
  orderCount: number;
  revenue: string;
  discount: string;
  netRevenue: string;
}

export interface PeakHourData {
  hour: number;
  revenue: string;
  orderCount: number;
}

export interface BestSellerData {
  productId: string;
  productName: string;
  category?: string;
  quantitySold: number;
  revenue: string;
  percentage: number;
}

export interface ReportData {
  summary: {
    totalOrders: number;
    totalRevenue: string;
    totalDiscount: string;
    netRevenue: string;
    averageOrderValue: string;
  };
  dailyData: DailyReportData[];
  peakHours: PeakHourData[];
  bestSellers: BestSellerData[];
  paymentMethodStats: Record<string, { count: number; revenue: string }>;
}

export class ReportingService {
  /**
   * Get detailed report data for a date range
   */
  async getReport(filters: ReportFilters): Promise<ReportData> {
    const startDate = new Date(filters.startDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(filters.endDate);
    endDate.setHours(23, 59, 59, 999);

    // Get all orders in date range
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Calculate summary
    let totalRevenue = 0;
    let totalDiscount = 0;
    let totalOrders = orders.length;

    orders.forEach((order) => {
      const orderTotal = parseFloat(order.totalAmount.toString());
      totalRevenue += orderTotal;
      
      // Calculate discount if product has discount
      // For now, we'll check if order has any discount applied
      // In future, you can add a discount field to Order model
      const orderDiscount = 0; // Placeholder for discount calculation
      totalDiscount += orderDiscount;
    });

    const netRevenue = totalRevenue - totalDiscount;
    const averageOrderValue = totalOrders > 0 ? netRevenue / totalOrders : 0;

    // Group by date for daily data
    const dailyDataMap: Record<string, DailyReportData> = {};
    
    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split('T')[0];
      
      if (!dailyDataMap[dateKey]) {
        dailyDataMap[dateKey] = {
          date: dateKey,
          orderCount: 0,
          revenue: '0',
          discount: '0',
          netRevenue: '0',
        };
      }

      const orderTotal = parseFloat(order.totalAmount.toString());
      dailyDataMap[dateKey].orderCount += 1;
      dailyDataMap[dateKey].revenue = (
        parseFloat(dailyDataMap[dateKey].revenue) + orderTotal
      ).toString();
      dailyDataMap[dateKey].discount = (
        parseFloat(dailyDataMap[dateKey].discount) + 0
      ).toString();
      dailyDataMap[dateKey].netRevenue = (
        parseFloat(dailyDataMap[dateKey].netRevenue) + orderTotal
      ).toString();
    });

    const dailyData = Object.values(dailyDataMap).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    // Calculate peak hours (hourly revenue)
    const hourlyData: Record<number, { revenue: number; orderCount: number }> = {};
    
    for (let i = 0; i < 24; i++) {
      hourlyData[i] = { revenue: 0, orderCount: 0 };
    }

    orders.forEach((order) => {
      const hour = order.createdAt.getHours();
      const orderTotal = parseFloat(order.totalAmount.toString());
      hourlyData[hour].revenue += orderTotal;
      hourlyData[hour].orderCount += 1;
    });

    const peakHours: PeakHourData[] = Object.entries(hourlyData)
      .map(([hour, data]) => ({
        hour: parseInt(hour),
        revenue: data.revenue.toString(),
        orderCount: data.orderCount,
      }))
      .sort((a, b) => parseFloat(b.revenue) - parseFloat(a.revenue))
      .slice(0, 10); // Top 10 peak hours

    // Calculate best sellers
    const productSalesMap: Record<string, {
      productId: string;
      productName: string;
      category?: string;
      quantitySold: number;
      revenue: number;
    }> = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const productId = item.productId;
        const quantity = item.quantity;
        const subtotal = parseFloat(item.subtotal.toString());

        if (!productSalesMap[productId]) {
          productSalesMap[productId] = {
            productId,
            productName: item.product?.name || 'Unknown',
            category: item.product?.category?.name,
            quantitySold: 0,
            revenue: 0,
          };
        }

        productSalesMap[productId].quantitySold += quantity;
        productSalesMap[productId].revenue += subtotal;
      });
    });

    const totalProductRevenue = Object.values(productSalesMap).reduce(
      (sum, item) => sum + item.revenue,
      0
    );

    const bestSellers: BestSellerData[] = Object.values(productSalesMap)
      .map((item) => ({
        ...item,
        revenue: item.revenue.toString(),
        percentage: totalProductRevenue > 0 
          ? (item.revenue / totalProductRevenue) * 100 
          : 0,
      }))
      .sort((a, b) => parseFloat(b.revenue) - parseFloat(a.revenue))
      .slice(0, 10); // Top 10 best sellers

    // Payment method statistics
    const paymentMethodStats: Record<string, { count: number; revenue: string }> = {};
    
    orders.forEach((order) => {
      const method = order.paymentMethod || 'CASH';
      const orderTotal = parseFloat(order.totalAmount.toString());

      if (!paymentMethodStats[method]) {
        paymentMethodStats[method] = {
          count: 0,
          revenue: '0',
        };
      }

      paymentMethodStats[method].count += 1;
      paymentMethodStats[method].revenue = (
        parseFloat(paymentMethodStats[method].revenue) + orderTotal
      ).toString();
    });

    return {
      summary: {
        totalOrders,
        totalRevenue: totalRevenue.toString(),
        totalDiscount: totalDiscount.toString(),
        netRevenue: netRevenue.toString(),
        averageOrderValue: averageOrderValue.toString(),
      },
      dailyData,
      peakHours,
      bestSellers,
      paymentMethodStats,
    };
  }

  /**
   * Export report data to Excel format
   */
  async exportReport(filters: ReportFilters): Promise<ExcelJS.Buffer> {
    const reportData = await this.getReport(filters);
    
    // Create a new workbook
    const workbook = new ExcelJS.Workbook();
    
    // Add metadata
    workbook.creator = 'OCHA POS System';
    workbook.created = new Date();
    workbook.modified = new Date();
    
    // ===== SHEET 1: TỔNG QUAN (Summary) =====
    const summarySheet = workbook.addWorksheet('Tổng Quan');
    
    // Title
    summarySheet.mergeCells('A1:B1');
    summarySheet.getCell('A1').value = 'BÁO CÁO DOANH THU';
    summarySheet.getCell('A1').font = { size: 16, bold: true };
    summarySheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    
    // Period
    summarySheet.getCell('A2').value = 'Kỳ báo cáo:';
    summarySheet.getCell('B2').value = `${filters.startDate} đến ${filters.endDate}`;
    summarySheet.getCell('A2').font = { bold: true };
    
    // Export date
    summarySheet.getCell('A3').value = 'Ngày xuất:';
    summarySheet.getCell('B3').value = new Date().toLocaleString('vi-VN');
    summarySheet.getCell('A3').font = { bold: true };
    
    // Empty row
    summarySheet.getRow(4).height = 10;
    
    // Summary data
    summarySheet.addRow(['Chỉ tiêu', 'Giá trị']);
    summarySheet.addRow(['Tổng số đơn hàng', reportData.summary.totalOrders]);
    summarySheet.addRow(['Tổng doanh thu', parseFloat(reportData.summary.totalRevenue)]);
    summarySheet.addRow(['Tổng giảm giá', parseFloat(reportData.summary.totalDiscount)]);
    summarySheet.addRow(['Doanh thu thực tế', parseFloat(reportData.summary.netRevenue)]);
    summarySheet.addRow(['Giá trị đơn hàng trung bình', parseFloat(reportData.summary.averageOrderValue)]);
    
    // Style summary table
    summarySheet.getRow(5).font = { bold: true };
    summarySheet.getColumn(1).width = 30;
    summarySheet.getColumn(2).width = 20;
    summarySheet.getColumn(2).numFmt = '#,##0';
    
    // ===== SHEET 2: DOANH THU THEO NGÀY (Daily Revenue) =====
    const dailySheet = workbook.addWorksheet('Doanh Thu Theo Ngày');
    
    dailySheet.addRow(['Ngày', 'Số đơn hàng', 'Doanh thu', 'Giảm giá', 'Thực thu']);
    dailySheet.getRow(1).font = { bold: true };
    
    reportData.dailyData.forEach((day) => {
      dailySheet.addRow([
        this.formatDate(day.date),
        day.orderCount,
        parseFloat(day.revenue),
        parseFloat(day.discount),
        parseFloat(day.netRevenue),
      ]);
    });
    
    // Add total row
    const totalRow = dailySheet.addRow([
      'TỔNG CỘNG',
      reportData.summary.totalOrders,
      parseFloat(reportData.summary.totalRevenue),
      parseFloat(reportData.summary.totalDiscount),
      parseFloat(reportData.summary.netRevenue),
    ]);
    totalRow.font = { bold: true };
    
    // Style daily sheet
    dailySheet.getColumn(1).width = 15;
    dailySheet.getColumn(2).width = 15;
    dailySheet.getColumn(3).width = 18;
    dailySheet.getColumn(4).width = 18;
    dailySheet.getColumn(5).width = 18;
    dailySheet.getColumn(3).numFmt = '#,##0';
    dailySheet.getColumn(4).numFmt = '#,##0';
    dailySheet.getColumn(5).numFmt = '#,##0';
    
    // ===== SHEET 3: TOP SẢN PHẨM BÁN CHẠY (Best Sellers) =====
    const bestSellersSheet = workbook.addWorksheet('Sản Phẩm Bán Chạy');
    
    bestSellersSheet.addRow(['STT', 'Tên sản phẩm', 'Danh mục', 'Số lượng', 'Doanh thu', 'Tỷ lệ (%)']);
    bestSellersSheet.getRow(1).font = { bold: true };
    
    reportData.bestSellers.forEach((item, index) => {
      bestSellersSheet.addRow([
        index + 1,
        item.productName,
        item.category || 'N/A',
        item.quantitySold,
        parseFloat(item.revenue),
        item.percentage.toFixed(2),
      ]);
    });
    
    // Style best sellers sheet
    bestSellersSheet.getColumn(1).width = 8;
    bestSellersSheet.getColumn(2).width = 30;
    bestSellersSheet.getColumn(3).width = 20;
    bestSellersSheet.getColumn(4).width = 15;
    bestSellersSheet.getColumn(5).width = 18;
    bestSellersSheet.getColumn(6).width = 15;
    bestSellersSheet.getColumn(5).numFmt = '#,##0';
    bestSellersSheet.getColumn(6).numFmt = '0.00';
    
    // ===== SHEET 4: GIỜ CAO ĐIỂM (Peak Hours) =====
    const peakHoursSheet = workbook.addWorksheet('Giờ Cao Điểm');
    
    peakHoursSheet.addRow(['Giờ', 'Số đơn hàng', 'Doanh thu']);
    peakHoursSheet.getRow(1).font = { bold: true };
    
    reportData.peakHours.forEach((hour) => {
      peakHoursSheet.addRow([
        `${hour.hour}:00 - ${hour.hour + 1}:00`,
        hour.orderCount,
        parseFloat(hour.revenue),
      ]);
    });
    
    // Style peak hours sheet
    peakHoursSheet.getColumn(1).width = 20;
    peakHoursSheet.getColumn(2).width = 15;
    peakHoursSheet.getColumn(3).width = 18;
    peakHoursSheet.getColumn(3).numFmt = '#,##0';
    
    // ===== SHEET 5: PHƯƠNG THỨC THANH TOÁN (Payment Methods) =====
    const paymentSheet = workbook.addWorksheet('Phương Thức Thanh Toán');
    
    paymentSheet.addRow(['Phương thức', 'Số đơn', 'Doanh thu']);
    paymentSheet.getRow(1).font = { bold: true };
    
    Object.entries(reportData.paymentMethodStats).forEach(([method, stats]) => {
      const methodName = this.getPaymentMethodName(method);
      paymentSheet.addRow([
        methodName,
        stats.count,
        parseFloat(stats.revenue),
      ]);
    });
    
    // Style payment sheet
    paymentSheet.getColumn(1).width = 25;
    paymentSheet.getColumn(2).width = 15;
    paymentSheet.getColumn(3).width = 18;
    paymentSheet.getColumn(3).numFmt = '#,##0';
    
    // ===== SHEET 6: CHI TIẾT ĐƠN HÀNG (Order Details) =====
    const ordersSheet = workbook.addWorksheet('Chi Tiết Đơn Hàng');
    
    // Get detailed orders data
    const startDate = new Date(filters.startDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(filters.endDate);
    endDate.setHours(23, 59, 59, 999);
    
    const orders = await prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: {
          not: 'CANCELLED',
        },
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Get all products map for quick lookup
    const productIds = new Set<string>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        productIds.add(item.productId);
      });
    });
    
    const products = await prisma.product.findMany({
      where: {
        id: { in: Array.from(productIds) },
      },
      include: {
        category: true,
      },
    });
    
    const productMap = new Map(products.map((p) => [p.id, p]));
    
    let currentRow = 1;
    
    // Header for order summary
    ordersSheet.mergeCells(`A${currentRow}:K${currentRow}`);
    ordersSheet.getCell(`A${currentRow}`).value = 'CHI TIẾT ĐƠN HÀNG';
    ordersSheet.getCell(`A${currentRow}`).font = { size: 14, bold: true };
    ordersSheet.getCell(`A${currentRow}`).alignment = { horizontal: 'center', vertical: 'middle' };
    currentRow++;
    
    // Empty row
    currentRow++;
    
    // Process each order with detailed items
    orders.forEach((order, orderIndex) => {
      // Order header row
      ordersSheet.mergeCells(`A${currentRow}:K${currentRow}`);
      ordersSheet.getCell(`A${currentRow}`).value = `ĐƠN HÀNG #${orderIndex + 1}: ${order.orderNumber}`;
      ordersSheet.getCell(`A${currentRow}`).font = { size: 12, bold: true, color: { argb: 'FFFFFFFF' } };
      ordersSheet.getCell(`A${currentRow}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };
      ordersSheet.getCell(`A${currentRow}`).alignment = { horizontal: 'left', vertical: 'middle' };
      currentRow++;
      
      // Order information
      ordersSheet.addRow(['Mã đơn:', order.orderNumber, '', 'Ngày giờ:', this.formatDateTime(order.createdAt)]);
      ordersSheet.addRow(['Khách hàng:', order.customerName || 'Khách vãng lai', '', 'SĐT:', order.customerPhone || '-']);
      ordersSheet.addRow(['Bàn:', order.customerTable || '-', '', 'Phương thức TT:', this.getPaymentMethodName(order.paymentMethod || 'CASH')]);
      ordersSheet.addRow(['Trạng thái:', this.getOrderStatusName(order.status), '', 'Người tạo:', order.orderCreatorName || (order.orderCreator === 'STAFF' ? 'Nhân viên' : 'Khách hàng')]);
      if (order.notes) {
        ordersSheet.addRow(['Ghi chú:', order.notes]);
      }
      
      // Style order info rows
      for (let i = 0; i < 5; i++) {
        const row = ordersSheet.getRow(currentRow + i);
        row.getCell(1).font = { bold: true };
        row.getCell(4).font = { bold: true };
      }
      currentRow += 5;
      
      // Empty row
      currentRow++;
      
      // Items header
      ordersSheet.addRow([
        'STT',
        'Tên sản phẩm',
        'Danh mục',
        'Size',
        'Topping',
        'Số lượng',
        'Đơn giá',
        'Thành tiền',
        'Ghi chú',
      ]);
      const itemsHeaderRow = ordersSheet.getRow(currentRow);
      itemsHeaderRow.font = { bold: true };
      itemsHeaderRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE7E6E6' },
      };
      currentRow++;
      
      // Order items
      order.items.forEach((item, itemIndex) => {
        const product = productMap.get(item.productId);
        ordersSheet.addRow([
          itemIndex + 1,
          product?.name || 'Unknown',
          product?.category?.name || '-',
          item.selectedSize || '-',
          item.selectedToppings.length > 0 ? item.selectedToppings.join(', ') : '-',
          item.quantity,
          parseFloat(item.price.toString()),
          parseFloat(item.subtotal.toString()),
          item.note || '-',
        ]);
        
        // Style item row
        const itemRow = ordersSheet.getRow(currentRow);
        itemRow.getCell(7).numFmt = '#,##0'; // Đơn giá
        itemRow.getCell(8).numFmt = '#,##0'; // Thành tiền
        
        // Alternate row colors for better readability
        if (itemIndex % 2 === 0) {
          itemRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF9F9F9' },
          };
        }
        
        currentRow++;
      });
      
      // Order total row
      ordersSheet.mergeCells(`A${currentRow}:E${currentRow}`);
      ordersSheet.getCell(`A${currentRow}`).value = 'TỔNG CỘNG ĐƠN HÀNG:';
      ordersSheet.getCell(`A${currentRow}`).font = { bold: true };
      ordersSheet.getCell(`A${currentRow}`).alignment = { horizontal: 'right' };
      ordersSheet.getCell(`F${currentRow}`).value = order.items.reduce((sum, item) => sum + item.quantity, 0);
      ordersSheet.getCell(`F${currentRow}`).font = { bold: true };
      ordersSheet.getCell(`G${currentRow}`).value = '-';
      ordersSheet.getCell(`H${currentRow}`).value = parseFloat(order.totalAmount.toString());
      ordersSheet.getCell(`H${currentRow}`).font = { bold: true };
      ordersSheet.getCell(`H${currentRow}`).numFmt = '#,##0';
      ordersSheet.getCell(`I${currentRow}`).value = '-';
      
      // Style total row
      const totalRow = ordersSheet.getRow(currentRow);
      totalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFE699' },
      };
      currentRow++;
      
      // Empty row between orders
      currentRow++;
    });
    
    // Style orders sheet columns
    ordersSheet.getColumn(1).width = 12; // STT / Mã đơn
    ordersSheet.getColumn(2).width = 30; // Tên sản phẩm / Khách hàng
    ordersSheet.getColumn(3).width = 20; // Danh mục
    ordersSheet.getColumn(4).width = 15; // Size / Bàn
    ordersSheet.getColumn(5).width = 25; // Topping
    ordersSheet.getColumn(6).width = 12; // Số lượng
    ordersSheet.getColumn(7).width = 15; // Đơn giá
    ordersSheet.getColumn(8).width = 15; // Thành tiền
    ordersSheet.getColumn(9).width = 25; // Ghi chú
    
    // ===== SHEET 7: CHI TIẾT SẢN PHẨM TRONG ĐƠN (Order Items) =====
    const orderItemsSheet = workbook.addWorksheet('Chi Tiết Sản Phẩm');
    
    orderItemsSheet.addRow([
      'Mã đơn',
      'Ngày',
      'Tên sản phẩm',
      'Danh mục',
      'Size',
      'Topping',
      'Số lượng',
      'Đơn giá',
      'Thành tiền',
      'Ghi chú',
    ]);
    orderItemsSheet.getRow(1).font = { bold: true };
    
    // Get all product IDs from order items
    const productIds = new Set<string>();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        productIds.add(item.productId);
      });
    });
    
    // Load all products at once
    const products = await prisma.product.findMany({
      where: {
        id: { in: Array.from(productIds) },
      },
      include: {
        category: true,
      },
    });
    
    const productMap = new Map(products.map((p) => [p.id, p]));
    
    for (const order of orders) {
      for (const item of order.items) {
        const product = productMap.get(item.productId);
        
        orderItemsSheet.addRow([
          order.orderNumber,
          this.formatDate(order.createdAt.toISOString().split('T')[0]),
          product?.name || 'Unknown',
          product?.category?.name || '-',
          item.selectedSize || '-',
          item.selectedToppings.length > 0 ? item.selectedToppings.join(', ') : '-',
          item.quantity,
          parseFloat(item.price.toString()),
          parseFloat(item.subtotal.toString()),
          item.note || '-',
        ]);
      }
    }
    
    // Style order items sheet
    orderItemsSheet.getColumn(1).width = 15; // Mã đơn
    orderItemsSheet.getColumn(2).width = 12; // Ngày
    orderItemsSheet.getColumn(3).width = 30; // Tên sản phẩm
    orderItemsSheet.getColumn(4).width = 20; // Danh mục
    orderItemsSheet.getColumn(5).width = 15; // Size
    orderItemsSheet.getColumn(6).width = 25; // Topping
    orderItemsSheet.getColumn(7).width = 12; // Số lượng
    orderItemsSheet.getColumn(8).width = 15; // Đơn giá
    orderItemsSheet.getColumn(9).width = 15; // Thành tiền
    orderItemsSheet.getColumn(10).width = 25; // Ghi chú
    orderItemsSheet.getColumn(8).numFmt = '#,##0';
    orderItemsSheet.getColumn(9).numFmt = '#,##0';
    
    // ===== SHEET 8: DANH SÁCH SẢN PHẨM ĐÃ BÁN (All Products Sold) =====
    const allProductsSheet = workbook.addWorksheet('Danh Sách Sản Phẩm');
    
    allProductsSheet.addRow([
      'STT',
      'Tên sản phẩm',
      'Danh mục',
      'Số lượng đã bán',
      'Tổng doanh thu',
      'Đơn giá TB',
      'Số đơn có SP này',
    ]);
    allProductsSheet.getRow(1).font = { bold: true };
    
    // Calculate product sales statistics
    const productSalesStats: Record<string, {
      productName: string;
      category: string;
      totalQuantity: number;
      totalRevenue: number;
      orderCount: Set<string>;
    }> = {};
    
    for (const order of orders) {
      for (const item of order.items) {
        const product = productMap.get(item.productId);
        const productId = item.productId;
        
        if (!productSalesStats[productId]) {
          productSalesStats[productId] = {
            productName: product?.name || 'Unknown',
            category: product?.category?.name || 'Không phân loại',
            totalQuantity: 0,
            totalRevenue: 0,
            orderCount: new Set(),
          };
        }
        
        productSalesStats[productId].totalQuantity += item.quantity;
        productSalesStats[productId].totalRevenue += parseFloat(item.subtotal.toString());
        productSalesStats[productId].orderCount.add(order.id);
      }
    }
    
    // Convert to array and sort by revenue
    const productSalesArray = Object.values(productSalesStats)
      .map((stat) => ({
        ...stat,
        averagePrice: stat.totalQuantity > 0 ? stat.totalRevenue / stat.totalQuantity : 0,
        orderCount: stat.orderCount.size,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue);
    
    // Add rows
    productSalesArray.forEach((stat, index) => {
      allProductsSheet.addRow([
        index + 1,
        stat.productName,
        stat.category,
        stat.totalQuantity,
        stat.totalRevenue,
        stat.averagePrice,
        stat.orderCount,
      ]);
    });
    
    // Add total row
    const allProductsTotalRow = allProductsSheet.addRow([
      'TỔNG',
      `${productSalesArray.length} sản phẩm`,
      '-',
      productSalesArray.reduce((sum, stat) => sum + stat.totalQuantity, 0),
      productSalesArray.reduce((sum, stat) => sum + stat.totalRevenue, 0),
      '-',
      orders.length,
    ]);
    allProductsTotalRow.font = { bold: true };
    
    // Style all products sheet
    allProductsSheet.getColumn(1).width = 8; // STT
    allProductsSheet.getColumn(2).width = 35; // Tên sản phẩm
    allProductsSheet.getColumn(3).width = 20; // Danh mục
    allProductsSheet.getColumn(4).width = 18; // Số lượng
    allProductsSheet.getColumn(5).width = 18; // Tổng doanh thu
    allProductsSheet.getColumn(6).width = 15; // Đơn giá TB
    allProductsSheet.getColumn(7).width = 18; // Số đơn
    allProductsSheet.getColumn(4).numFmt = '#,##0';
    allProductsSheet.getColumn(5).numFmt = '#,##0';
    allProductsSheet.getColumn(6).numFmt = '#,##0';
    
    // ===== SHEET 9: BÁO CÁO THEO DANH MỤC (Category Report) =====
    const categorySheet = workbook.addWorksheet('Báo Cáo Theo Danh Mục');
    
    categorySheet.addRow(['Danh mục', 'Số đơn', 'Số lượng SP', 'Doanh thu', 'Tỷ lệ (%)']);
    categorySheet.getRow(1).font = { bold: true };
    
    const categoryStats: Record<string, {
      orderCount: number;
      quantity: number;
      revenue: number;
    }> = {};
    
    // Count unique orders per category
    const categoryOrderMap: Record<string, Set<string>> = {};
    
    for (const order of orders) {
      for (const item of order.items) {
        const product = productMap.get(item.productId);
        const categoryName = product?.category?.name || 'Không phân loại';
        
        if (!categoryStats[categoryName]) {
          categoryStats[categoryName] = {
            orderCount: 0,
            quantity: 0,
            revenue: 0,
          };
        }
        
        if (!categoryOrderMap[categoryName]) {
          categoryOrderMap[categoryName] = new Set();
        }
        
        categoryStats[categoryName].quantity += item.quantity;
        categoryStats[categoryName].revenue += parseFloat(item.subtotal.toString());
        categoryOrderMap[categoryName].add(order.id);
      }
    }
    
    const totalCategoryRevenue = Object.values(categoryStats).reduce(
      (sum, stat) => sum + stat.revenue,
      0
    );
    
    Object.entries(categoryStats).forEach(([categoryName, stats]) => {
      const orderCount = categoryOrderMap[categoryName]?.size || 0;
      const percentage = totalCategoryRevenue > 0
        ? (stats.revenue / totalCategoryRevenue) * 100
        : 0;
      
      categorySheet.addRow([
        categoryName,
        orderCount,
        stats.quantity,
        stats.revenue,
        percentage.toFixed(2),
      ]);
    });
    
    // Add total row
    const categoryTotalRow = categorySheet.addRow([
      'TỔNG CỘNG',
      orders.length,
      Object.values(categoryStats).reduce((sum, stat) => sum + stat.quantity, 0),
      totalCategoryRevenue,
      '100.00',
    ]);
    categoryTotalRow.font = { bold: true };
    
    // Style category sheet
    categorySheet.getColumn(1).width = 25; // Danh mục
    categorySheet.getColumn(2).width = 12; // Số đơn
    categorySheet.getColumn(3).width = 15; // Số lượng SP
    categorySheet.getColumn(4).width = 18; // Doanh thu
    categorySheet.getColumn(5).width = 15; // Tỷ lệ
    categorySheet.getColumn(4).numFmt = '#,##0';
    categorySheet.getColumn(5).numFmt = '0.00';
    
    // Apply borders and styling to all sheets
    const sheets = [
      summarySheet,
      dailySheet,
      bestSellersSheet,
      peakHoursSheet,
      paymentSheet,
      ordersSheet,
      orderItemsSheet,
      allProductsSheet,
      categorySheet,
    ];
    
    sheets.forEach((sheet) => {
      // Add borders to header row
      const headerRow = sheet.getRow(1);
      headerRow.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' },
        };
      });
      
      // Add borders to data rows
      sheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.eachCell((cell) => {
            cell.border = {
              top: { style: 'thin' },
              left: { style: 'thin' },
              bottom: { style: 'thin' },
              right: { style: 'thin' },
            };
          });
        }
      });
    });
    
    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer as ExcelJS.Buffer;
  }
  
  /**
   * Format date for display
   */
  private formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  }
  
  /**
   * Get payment method name in Vietnamese
   */
  private getPaymentMethodName(method: string): string {
    const methodMap: Record<string, string> = {
      'CASH': 'Tiền mặt',
      'CARD': 'Thẻ',
      'QR': 'QR Code',
      'BANK_TRANSFER': 'Chuyển khoản',
    };
    return methodMap[method] || method;
  }
  
  /**
   * Get order status name in Vietnamese
   */
  private getOrderStatusName(status: string): string {
    const statusMap: Record<string, string> = {
      'CREATING': 'Đang tạo',
      'PENDING': 'Chờ xử lý',
      'CONFIRMED': 'Đã xác nhận',
      'PREPARING': 'Đang chuẩn bị',
      'READY': 'Sẵn sàng',
      'COMPLETED': 'Hoàn thành',
      'CANCELLED': 'Đã hủy',
    };
    return statusMap[status] || status;
  }
  
  /**
   * Format date and time for display
   */
  private formatDateTime(date: Date): string {
    return date.toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

export default new ReportingService();

