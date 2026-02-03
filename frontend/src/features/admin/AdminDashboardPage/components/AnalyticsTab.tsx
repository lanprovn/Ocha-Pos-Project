import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardTab from '@features/analytics/AnalyticsPage/components/DashboardTab';
import ReportsTab from '@features/analytics/AnalyticsPage/components/ReportsTab';

// Shadcn UI
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  PieChart,
  FileText,
  TrendingUp,
  History,
  Info
} from 'lucide-react';

const AnalyticsTab: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const subtabFromUrl = searchParams.get('subtab') as 'dashboard' | 'reports' | null;

  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'reports'>(() => {
    return (subtabFromUrl && ['dashboard', 'reports'].includes(subtabFromUrl))
      ? subtabFromUrl
      : 'dashboard';
  });

  const isUpdatingFromUrlRef = useRef(false);
  const lastSubtabFromUrlRef = useRef(subtabFromUrl);

  useEffect(() => {
    if (subtabFromUrl === lastSubtabFromUrlRef.current) return;
    lastSubtabFromUrlRef.current = subtabFromUrl;

    if (subtabFromUrl && ['dashboard', 'reports'].includes(subtabFromUrl)) {
      isUpdatingFromUrlRef.current = true;
      setActiveSubTab(subtabFromUrl);
      requestAnimationFrame(() => {
        isUpdatingFromUrlRef.current = false;
      });
    }
  }, [subtabFromUrl]);

  useEffect(() => {
    if (isUpdatingFromUrlRef.current) return;
    if (subtabFromUrl !== activeSubTab) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('subtab', activeSubTab);
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [activeSubTab, subtabFromUrl, searchParams, setSearchParams]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-primary" /> Phân Tích & Báo Cáo
          </h2>
          <p className="text-slate-500 text-sm mt-1">Theo dõi doanh thu, hiệu suất bán hàng và hành vi khách hàng</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100/80 px-3 py-1 font-bold">
            <TrendingUp className="w-3.5 h-3.5 mr-1" /> LIVE DATA
          </Badge>
          <Badge variant="outline" className="border-slate-200 text-slate-400 font-normal">
            Cập nhật: {new Date().toLocaleTimeString()}
          </Badge>
        </div>
      </div>

      {/* Modern Tabs UI */}
      <Card className="border-none shadow-xl bg-white overflow-hidden">
        <Tabs
          value={activeSubTab}
          onValueChange={(v) => setActiveSubTab(v as any)}
          className="w-full"
        >
          <div className="px-6 pt-6 bg-slate-50/30 border-b border-slate-100">
            <TabsList className="bg-transparent h-auto p-0 gap-8">
              <TabsTrigger
                value="dashboard"
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-4 font-bold text-sm text-slate-400 transition-all flex gap-2 items-center"
              >
                <BarChart3 className="w-4 h-4" /> Tổng Quan Biz
              </TabsTrigger>
              <TabsTrigger
                value="reports"
                className="data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 py-4 font-bold text-sm text-slate-400 transition-all flex gap-2 items-center"
              >
                <FileText className="w-4 h-4" /> Báo Cáo Chi Tiết
              </TabsTrigger>
            </TabsList>
          </div>

          <CardContent className="p-0">
            <TabsContent value="dashboard" className="mt-0 focus-visible:ring-0">
              <div className="p-6">
                <DashboardTab />
              </div>
            </TabsContent>
            <TabsContent value="reports" className="mt-0 focus-visible:ring-0">
              <div className="p-0"> {/* ReportsTab has its own layout/padding */}
                <ReportsTab />
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Intelligence Banner */}
      <div className="bg-indigo-900 rounded-2xl p-6 text-white flex items-center justify-between relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[80px] -mr-48 -mt-48" />
        <div className="flex items-center gap-6 z-10">
          <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md">
            <PieChart className="w-8 h-8 text-blue-300" />
          </div>
          <div>
            <h4 className="text-lg font-bold">Ocha AI Insights</h4>
            <p className="text-slate-300 text-sm max-w-lg">Phân tích cho thấy giờ cao điểm của quán là từ 11:30 - 13:00. Hãy cân nhắc thêm nhân viên vào khung giờ này để tối ưu vận hành.</p>
          </div>
        </div>
        <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 text-white font-bold z-10 transition-all active:scale-95 group">
          Khám phá thêm <History className="w-4 h-4 ml-2 group-hover:rotate-12 transition-transform" />
        </Button>
      </div>
    </div>
  );
};

export default React.memo(AnalyticsTab);
