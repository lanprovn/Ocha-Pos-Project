import React, { useState, useEffect, startTransition } from 'react';
import { useReportingData } from './hooks/useReportingData';
import { ReportingHeader } from './components/ReportingHeader';
import { ReportFiltersComponent } from './components/ReportFilters';
import { SummaryCards } from './components/SummaryCards';
import { ReportTable } from './components/ReportTable';
import { PeakHoursChart } from './components/PeakHoursChart';
import { BestSellersChart } from './components/BestSellersChart';

const ReportingPage: React.FC = () => {
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
      startTransition(() => {
        setCurrentTime(new Date());
      });
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
    <div className="min-h-screen bg-gray-50">
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

            <div className="mb-6">
              <ReportTable
                dailyData={reportData.dailyData}
                summary={reportData.summary}
                isLoading={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PeakHoursChart
                peakHours={reportData.peakHours}
                isLoading={isLoading}
              />
              <BestSellersChart
                bestSellers={reportData.bestSellers}
                isLoading={isLoading}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportingPage;

