import { Request, Response } from 'express';
import reportsService from '../services/reports.service';

export class ReportsController {
  async getRevenueSummary(req: Request, res: Response) {
    try {
      const period = (req.query.period as 'day' | 'week' | 'month') || 'day';
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      
      const summary = await reportsService.getRevenueSummary(period, startDate, endDate);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async exportOrders(req: Request, res: Response) {
    try {
      const filters: any = {};

      if (req.query.status) filters.status = req.query.status;
      if (req.query.startDate) filters.startDate = req.query.startDate;
      if (req.query.endDate) filters.endDate = req.query.endDate;
      if (req.query.paymentMethod) filters.paymentMethod = req.query.paymentMethod;
      if (req.query.paymentStatus) filters.paymentStatus = req.query.paymentStatus;

      const exportData = await reportsService.exportOrders(filters);

      // Set headers for CSV download with UTF-8 encoding
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''orders_${encodeURIComponent(new Date().toISOString().split('T')[0])}.csv`);

      // Helper function to escape CSV fields
      const escapeCSV = (field: string | number | null | undefined): string => {
        if (field === null || field === undefined) return '';
        const str = String(field);
        // If contains comma, quote, or newline, wrap in quotes and escape quotes
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      // Format date to readable format (YYYY-MM-DD)
      const formatDate = (isoDate: string): string => {
        return isoDate.split('T')[0];
      };

      // Format phone number as text to prevent scientific notation in Excel
      const formatPhone = (phone: string | null | undefined): string => {
        if (!phone) return '';
        // Add single quote at the beginning to force Excel to treat as text
        // This prevents Excel from converting long numbers to scientific notation
        return `'${phone}`;
      };

      // Convert to CSV with UTF-8 BOM for Excel compatibility
      const headers = ['Order Number', 'Date', 'Status', 'Customer Name', 'Phone', 'Table', 'Total Amount', 'Payment Method', 'Payment Status', 'Items Count', 'Items'];
      const csvRows = [
        headers.map(escapeCSV).join(','),
        ...exportData.map((row) => [
          escapeCSV(row.orderNumber),
          escapeCSV(formatDate(row.date)),
          escapeCSV(row.status),
          escapeCSV(row.customerName),
          formatPhone(row.customerPhone), // Format as text
          escapeCSV(row.customerTable),
          escapeCSV(row.totalAmount),
          escapeCSV(row.paymentMethod),
          escapeCSV(row.paymentStatus),
          escapeCSV(row.itemsCount),
          escapeCSV(row.items),
        ].join(',')),
      ];

      // Add UTF-8 BOM for Excel to recognize encoding correctly
      const BOM = '\uFEFF';
      const csvContent = BOM + csvRows.join('\n');

      res.send(csvContent);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new ReportsController();

