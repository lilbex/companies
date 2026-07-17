'use client';

import { useState } from 'react';
import { useAdvancedEarnings, usePayoutSummary } from '@/lib/hooks';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function EarningsPage() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'payouts' | 'analytics'>('overview');

  const { data: earnings, isLoading: earningsLoading } = useAdvancedEarnings(
    dateRange.startDate, 
    dateRange.endDate
  );
  const { data: payouts, isLoading: payoutsLoading } = usePayoutSummary();

  if (earningsLoading || payoutsLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Loading earnings data..." size="lg" />
      </DashboardLayout>
    );
  }

  // Chart data
  const dailyRevenueData = {
    labels: earnings?.dailyEarnings?.map((item: any) => item._id) || [],
    datasets: [
      {
        label: 'Total Revenue (₦)',
        data: earnings?.dailyEarnings?.map((item: any) => item.revenue) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.1,
      },
      {
        label: 'Platform Fee (₦)',
        data: earnings?.dailyEarnings?.map((item: any) => item.platformFee) || [],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.1,
      },
    ],
  };

  const hourlyData = {
    labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    datasets: [
      {
        label: 'Hourly Revenue (₦)',
        data: Array.from({ length: 24 }, (_, hour) => {
          const hourData = earnings?.hourlyEarnings?.find((h: any) => h._id === hour);
          return hourData?.revenue || 0;
        }),
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
    ],
  };

  const revenueByTypeData = {
    labels: earnings?.revenueByType?.map((item: any) => item._id || 'Unknown') || [],
    datasets: [
      {
        data: earnings?.revenueByType?.map((item: any) => item.revenue) || [],
        backgroundColor: [
          '#10B981',
          '#3B82F6', 
          '#F59E0B',
          '#EF4444',
          '#8B5CF6',
          '#06B6D4'
        ],
      },
    ],
  };

  const riderPerformanceData = {
    labels: earnings?.riderPerformance?.slice(0, 10).map((rider: any) => rider.riderName) || [],
    datasets: [
      {
        label: 'Earnings (₦)',
        data: earnings?.riderPerformance?.slice(0, 10).map((rider: any) => rider.totalEarnings) || [],
        backgroundColor: 'rgba(34, 197, 94, 0.8)',
      },
    ],
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'payouts', name: 'Payouts', icon: '💰' },
    { id: 'analytics', name: 'Analytics', icon: '📈' },
  ];

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Earnings Dashboard</h1>
                <p className="text-sm text-gray-600">Comprehensive financial analytics and payouts</p>
              </div>
              <div className="flex items-center space-x-4">
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <span className="text-gray-500">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-200">
          <nav className="px-6 flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <main className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-bold">₦</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                          <dd className="text-lg font-medium text-gray-900">
                            ₦{earnings?.summary?.totalRevenue?.toLocaleString() || 0}
                          </dd>
                          <dd className={`text-sm ${earnings?.summary?.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {earnings?.summary?.revenueGrowth >= 0 ? '↗' : '↘'} {Math.abs(earnings?.summary?.revenueGrowth || 0).toFixed(1)}%
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-bold">%</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Platform Fee</dt>
                          <dd className="text-lg font-medium text-gray-900">
                            ₦{earnings?.summary?.platformFee?.toLocaleString() || 0}
                          </dd>
                          <dd className="text-sm text-gray-500">15% of revenue</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-bold">👥</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Rider Earnings</dt>
                          <dd className="text-lg font-medium text-gray-900">
                            ₦{earnings?.summary?.riderEarnings?.toLocaleString() || 0}
                          </dd>
                          <dd className="text-sm text-gray-500">85% of revenue</dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                          <span className="text-white text-sm font-bold">📦</span>
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Orders</dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {earnings?.summary?.totalOrders?.toLocaleString() || 0}
                          </dd>
                          <dd className={`text-sm ${earnings?.summary?.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {earnings?.summary?.orderGrowth >= 0 ? '↗' : '↘'} {Math.abs(earnings?.summary?.orderGrowth || 0).toFixed(1)}%
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Revenue Trend</h3>
                  <div className="h-80">
                    <Line data={dailyRevenueData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue by Package Type</h3>
                  <div className="h-80">
                    <Doughnut data={revenueByTypeData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>
              </div>

              {/* Hourly Performance */}
              <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Today's Hourly Performance</h3>
                <div className="h-80">
                  <Bar data={hourlyData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </>
          )}

          {/* Payouts Tab */}
          {activeTab === 'payouts' && (
            <>
              {/* Payout Summary */}
              <div className="bg-white rounded-lg shadow mb-6">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium text-gray-900">Weekly Payout Summary</h3>
                    <div className="text-sm text-gray-500">
                      {payouts?.weekPeriod && (
                        <>
                          {new Date(payouts.weekPeriod.start).toLocaleDateString()} - {' '}
                          {new Date(payouts.weekPeriod.end).toLocaleDateString()}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        ₦{payouts?.summary?.totalPayouts?.toLocaleString() || 0}
                      </div>
                      <div className="text-sm text-gray-500">Total Payouts</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {payouts?.summary?.totalOrders || 0}
                      </div>
                      <div className="text-sm text-gray-500">Total Orders</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {payouts?.summary?.ridersCount || 0}
                      </div>
                      <div className="text-sm text-gray-500">Active Riders</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payout Details */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Rider Payouts</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rider
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Orders
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Revenue
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Earnings
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payouts?.payouts?.map((payout: any) => (
                        <tr key={payout.riderId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{payout.riderName}</div>
                              <div className="text-sm text-gray-500">{payout.phone}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payout.orders}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₦{payout.totalRevenue?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₦{payout.earnings?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              {payout.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <>
              {/* Top Performers */}
              <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Top Performing Riders</h3>
                <div className="h-80">
                  <Bar data={riderPerformanceData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Key Metrics</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Average Order Value</span>
                      <span className="text-sm font-medium">₦{earnings?.summary?.avgOrderValue?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Revenue Growth</span>
                      <span className={`text-sm font-medium ${earnings?.summary?.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {earnings?.summary?.revenueGrowth?.toFixed(1) || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Order Growth</span>
                      <span className={`text-sm font-medium ${earnings?.summary?.orderGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {earnings?.summary?.orderGrowth?.toFixed(1) || 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Platform Commission</span>
                      <span className="text-sm font-medium">15%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Period Summary</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Period Duration</span>
                      <span className="text-sm font-medium">{earnings?.period?.days || 0} days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Daily Average Revenue</span>
                      <span className="text-sm font-medium">
                        ₦{((earnings?.summary?.totalRevenue || 0) / (earnings?.period?.days || 1)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Daily Average Orders</span>
                      <span className="text-sm font-medium">
                        {Math.round((earnings?.summary?.totalOrders || 0) / (earnings?.period?.days || 1))}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
}