"use client";
import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import reportingService from '@features/reporting/services/reporting.service';
import type { ReportData, ReportFilters } from '@features/reporting/services/reporting.service';

export const useReportingData = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<ReportFilters>(() => {
    // Default to last 30 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      reportType: 'custom',
    };
  });

  const fetchReportData = useCallback(async (reportFilters: ReportFilters) => {
    setIsLoading(true);
    try {
      const data = await reportingService.getReport(reportFilters);
      setReportData(data);
    } catch (error: any) {
      console.error('Error loading report data:', error);
      toast.error('Không thể tải dữ liệu báo cáo. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReportData(filters);
  }, [filters, fetchReportData]);

  const updateFilters = (newFilters: Partial<ReportFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const exportToExcel = async () => {
    try {
      setIsLoading(true);
      const blob = await reportingService.exportReport(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `BaoCaoDoanhThu_${filters.startDate}_${filters.endDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Đã xuất báo cáo Excel thành công!');
    } catch (error: any) {
      console.error('Error exporting report:', error);
      toast.error('Không thể xuất báo cáo. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    reportData,
    isLoading,
    filters,
    updateFilters,
    exportToExcel,
    reloadData: () => fetchReportData(filters),
  };
};

