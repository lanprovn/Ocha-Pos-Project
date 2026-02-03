import React, { useState, useEffect } from 'react';
import { useReportingData } from '@features/reporting/ReportingPage/hooks/useReportingData';
import { ReportingHeader } from '@features/reporting/ReportingPage/components/ReportingHeader';
import { ReportFiltersComponent } from '@features/reporting/ReportingPage/components/ReportFilters';
import { SummaryCards } from '@features/reporting/ReportingPage/components/SummaryCards';
import { ReportTable } from '@features/reporting/ReportingPage/components/ReportTable';
import { PeakHoursChart } from '@features/reporting/ReportingPage/components/PeakHoursChart';
import { BestSellersChart } from '@features/reporting/ReportingPage/components/BestSellersChart';

const ReportsTab: React.FC = () => {
  const {
    reportData,
    isLoading,
    filters,
    updateFilters,
    exportToExcel,
  } = useReportingData();

  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!reportData && isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-slate-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu báo cáo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <ReportingHeader currentTime={currentTime} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ReportFiltersComponent
          filters={filters}
          onFiltersChange={updateFilters}
          onExport={exportToExcel}
          isLoading={isLoading}
        />

        {reportData && (
          <>
            <SummaryCards summary={reportData.summary} isLoading={isLoading} />

            <div className="mt-8">
              <ReportTable
                dailyData={reportData.dailyData}
                summary={reportData.summary}
                isLoading={isLoading}
              />
            </div>

            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PeakHoursChart peakHours={reportData.peakHours} isLoading={isLoading} />
              <BestSellersChart bestSellers={reportData.bestSellers} isLoading={isLoading} />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsTab;

