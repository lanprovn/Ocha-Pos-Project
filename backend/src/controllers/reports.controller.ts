import { Request, Response } from 'express';
import reportsService from '../services/reports.service';
import { BaseController } from './base.controller';
import { z } from 'zod';
import { ValidationSchemas, validateOrThrow } from '../utils/validation';

const revenueSummaryQuerySchema = z.object({
  period: z.enum(['day', 'week', 'month']).optional().default('day'),
  startDate: ValidationSchemas.dateString.optional(),
  endDate: ValidationSchemas.dateString.optional(),
});

export class ReportsController extends BaseController {
  getRevenueSummary = this.asyncHandler(async (req: Request, res: Response) => {
    const query = validateOrThrow(revenueSummaryQuerySchema, req.query);
    
    const summary = await reportsService.getRevenueSummary(
      query.period || 'day',
      query.startDate,
      query.endDate
    );
    
    this.success(res, summary);
  });

  exportOrders = this.asyncHandler(async (req: Request, res: Response) => {
    const filtersSchema = z.object({
      status: z.string().optional(),
      startDate: ValidationSchemas.dateString.optional(),
      endDate: ValidationSchemas.dateString.optional(),
      paymentMethod: z.string().optional(),
      paymentStatus: z.string().optional(),
    });

    const query = validateOrThrow(filtersSchema, req.query);
    const filters: Record<string, string> = {};
    
    if (query.status) filters.status = query.status;
    if (query.startDate) filters.startDate = query.startDate;
    if (query.endDate) filters.endDate = query.endDate;
    if (query.paymentMethod) filters.paymentMethod = query.paymentMethod;
    if (query.paymentStatus) filters.paymentStatus = query.paymentStatus;

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
  });
}

export default new ReportsController();

