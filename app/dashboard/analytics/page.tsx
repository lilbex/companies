'use client';

import { useState } from 'react';
import { useAnalytics } from '@/lib/hooks';
import DashboardLayout from '@/components/DashboardLayout';
import SkeletonLoader from '@/components/SkeletonLoader';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const { data: analytics, isLoading } = useAnalytics(period);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex-1 overflow-auto bg-gray-50">
          <header className="bg-white border-b border-gray-200">
            <div className="px-6 py-5">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                  <p className="text-sm text-gray-500 mt-0.5">Business performance insights</p>
                </div>
              </div>
            </div>
          </header>
          <main className="p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonLoader key={i} type="card" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkeletonLoader type="chart" />
              <SkeletonLoader type="chart" />
            </div>
          </main>
        </div>
      </DashboardLayout>
    );
  }

  const availabilityRate = analytics?.totalRiders
    ? ((analytics.onlineRiders / analytics.totalRiders) * 100).toFixed(0)
    : '0';

  // Chart: Delivery Trends (area chart)
  const trendLabels = analytics?.deliveryTrends?.map((item: any) => {
    const id = item._id;
    if (id?.includes('-') && id.length === 10) return id.slice(5); // "MM-DD"
    return id;
  }) || [];

  const deliveryTrendData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Deliveries',
        data: analytics?.deliveryTrends?.map((item: any) => item.count) || [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.08)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const revenueTrendData = {
    labels: trendLabels,
    datasets: [
      {
        label: 'Revenue (₦)',
        data: analytics?.deliveryTrends?.map((item: any) => item.revenue) || [],
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.08)',
        tension: 0.4,
        fill: true,
        pointRadius: 4,
        pointBackgroundColor: '#6366F1',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
      },
    ],
  };

  const riderPerformanceData = {
    labels: analytics?.riderPerformance?.map((_: any, i: number) => `Rider ${i + 1}`) || [],
    datasets: [
      {
        label: 'Deliveries',
        data: analytics?.riderPerformance?.map((item: any) => item.deliveries) || [],
        backgroundColor: analytics?.riderPerformance?.map((_: any, i: number) => {
          const colors = ['#10B981', '#6366F1', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#14B8A6', '#F97316', '#84CC16'];
          return colors[i % colors.length];
        }) || [],
        borderRadius: 6,
        barThickness: 28,
      },
    ],
  };

  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1F2937',
        titleFont: { size: 12 },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#9CA3AF', font: { size: 11 } },
      },
      y: {
        grid: { color: '#F3F4F6' },
        ticks: { color: '#9CA3AF', font: { size: 11 } },
        beginAtZero: true,
      },
    },
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1F2937',
        padding: 12,
        cornerRadius: 8,
      },
    },
    scales: {
      x: {
        grid: { color: '#F3F4F6' },
        ticks: { color: '#9CA3AF', font: { size: 11 } },
        beginAtZero: true,
      },
      y: {
        grid: { display: false },
        ticks: { color: '#374151', font: { size: 12 } },
      },
    },
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200">
          <div className="px-6 py-5">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
                <p className="text-sm text-gray-500 mt-0.5">Business performance insights</p>
              </div>
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all capitalize ${
                      period === p
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Riders */}
            <div className="relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 text-white shadow-lg shadow-blue-500/20">
              <div className="relative z-10">
                <div className="text-blue-100 text-sm font-medium">Total Riders</div>
                <div className="text-3xl font-bold mt-1">{analytics?.totalRiders || 0}</div>
                <div className="text-blue-200 text-xs mt-2">{analytics?.onlineRiders || 0} online now</div>
              </div>
              <div className="absolute -right-3 -bottom-3 text-6xl opacity-20">👥</div>
            </div>

            {/* Online Rate */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white shadow-lg shadow-emerald-500/20">
              <div className="relative z-10">
                <div className="text-emerald-100 text-sm font-medium">Availability Rate</div>
                <div className="text-3xl font-bold mt-1">{availabilityRate}%</div>
                <div className="text-emerald-200 text-xs mt-2">{analytics?.onlineRiders || 0} of {analytics?.totalRiders || 0} riders</div>
              </div>
              <div className="absolute -right-3 -bottom-3 text-6xl opacity-20">📡</div>
            </div>

            {/* Avg Delivery Time */}
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl p-5 text-white shadow-lg shadow-amber-500/20">
              <div className="relative z-10">
                <div className="text-amber-100 text-sm font-medium">Avg Delivery Time</div>
                <div className="text-3xl font-bold mt-1">{analytics?.avgDeliveryTime || 0}<span className="text-lg font-normal ml-1">min</span></div>
                <div className="text-amber-200 text-xs mt-2">From pickup to dropoff</div>
              </div>
              <div className="absolute -right-3 -bottom-3 text-6xl opacity-20">⚡</div>
            </div>

            {/* Customer Rating */}
            <div className="relative overflow-hidden bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl p-5 text-white shadow-lg shadow-violet-500/20">
              <div className="relative z-10">
                <div className="text-violet-100 text-sm font-medium">Customer Rating</div>
                <div className="text-3xl font-bold mt-1">{analytics?.customerSatisfaction || 0}<span className="text-lg font-normal ml-1">/ 5</span></div>
                <div className="text-violet-200 text-xs mt-2">{analytics?.totalRatings || 0} total reviews</div>
              </div>
              <div className="absolute -right-3 -bottom-3 text-6xl opacity-20">⭐</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Delivery Trends */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Delivery Volume</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Orders over time</p>
                </div>
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <div className="h-64">
                <Line data={deliveryTrendData} options={lineChartOptions} />
              </div>
            </div>

            {/* Revenue Trends */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Revenue Trend</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Earnings over time (₦)</p>
                </div>
                <div className="w-3 h-3 rounded-full bg-indigo-500" />
              </div>
              <div className="h-64">
                <Line data={revenueTrendData} options={lineChartOptions} />
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Top Riders */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">Top Performing Riders</h3>
                  <p className="text-xs text-gray-500 mt-0.5">By completed deliveries</p>
                </div>
              </div>
              <div className="h-72">
                <Bar data={riderPerformanceData} options={barChartOptions} />
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-base font-semibold text-gray-900 mb-6">Performance Summary</h3>
              <div className="space-y-5">
                {/* Availability */}
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600">Rider Availability</span>
                    <span className="font-semibold text-gray-900">{availabilityRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(Number(availabilityRate), 100)}%` }}
                    />
                  </div>
                </div>

                {/* Delivery Speed */}
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600">Delivery Speed</span>
                    <span className="font-semibold text-gray-900">{analytics?.avgDeliveryTime || 0} min</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(100 - (analytics?.avgDeliveryTime || 0), 10)}%` }}
                    />
                  </div>
                </div>

                {/* Customer Satisfaction */}
                <div>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-600">Customer Satisfaction</span>
                    <span className="font-semibold text-gray-900">{analytics?.customerSatisfaction || 0}/5</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-400 to-purple-500 rounded-full transition-all duration-500"
                      style={{ width: `${((analytics?.customerSatisfaction || 0) / 5) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100 pt-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {analytics?.deliveryTrends?.reduce((sum: number, t: any) => sum + t.count, 0) || 0}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Total Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        ₦{((analytics?.deliveryTrends?.reduce((sum: number, t: any) => sum + t.revenue, 0) || 0) / 1000).toFixed(0)}k
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Total Revenue</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
