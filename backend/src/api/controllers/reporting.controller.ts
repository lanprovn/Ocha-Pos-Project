import { Request, Response, NextFunction } from 'express';
import reportingService from '@services/reporting.service';

export class ReportingController {
  /**
   * Get report data
   */
  async getReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, reportType } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({ 
          error: 'startDate and endDate are required',
          errorCode: 'VALIDATION_ERROR',
        });
        return;
      }

      const filters = {
        startDate: startDate as string,
        endDate: endDate as string,
        reportType: reportType as 'daily' | 'weekly' | 'monthly' | 'custom' | undefined,
      };

      const reportData = await reportingService.getReport(filters);
      res.json(reportData);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export report to Excel
   */
  async exportReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, reportType } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({ 
          error: 'startDate and endDate are required',
          errorCode: 'VALIDATION_ERROR',
        });
        return;
      }

      const filters = {
        startDate: startDate as string,
        endDate: endDate as string,
        reportType: reportType as 'daily' | 'weekly' | 'monthly' | 'custom' | undefined,
      };

      const excelBuffer = await reportingService.exportReport(filters);
      
      // Set headers for Excel download
      const fileName = `BaoCaoDoanhThu_${filters.startDate}_${filters.endDate}.xlsx`;
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
      
      res.send(excelBuffer);
    } catch (error) {
      next(error);
    }
  }
}

export default new ReportingController();

