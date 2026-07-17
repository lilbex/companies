'use client';

import { useCompanyStats, useBusinessAlerts } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import SkeletonLoader from '@/components/SkeletonLoader';

export default function DashboardPage() {
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = useCompanyStats();
  const { data: alerts, isLoading: alertsLoading } = useBusinessAlerts();

  if (statsLoading) {
    return (
      <DashboardLayout>
        <div className="flex-1 overflow-auto bg-gray-50">
          <header className="bg-white shadow">
            <div className="px-6 py-4">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
              <p className="text-sm text-gray-600">Monitor your company performance</p>
            </div>
          </header>
          <main className="p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonLoader key={i} type="card" />
              ))}
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonLoader key={i} type="card" />
              ))}
            </div>
            <SkeletonLoader type="table" rows={5} />
          </main>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="px-4 sm:px-6 py-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-sm text-gray-600">Monitor your company performance</p>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {/* Business Alerts */}
          {alerts && alerts.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-3">Business Alerts</h2>
              <div className="space-y-3">
                {alerts.map((alert: any, index: number) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border-l-4 ${
                      alert.type === 'error'
                        ? 'bg-red-50 border-red-400'
                        : alert.type === 'warning'
                        ? 'bg-yellow-50 border-yellow-400'
                        : 'bg-blue-50 border-blue-400'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className={`text-sm font-medium ${
                          alert.type === 'error'
                            ? 'text-red-800'
                            : alert.type === 'warning'
                            ? 'text-yellow-800'
                            : 'text-blue-800'
                        }`}>
                          {alert.title}
                        </h3>
                        <p className={`text-sm mt-1 ${
                          alert.type === 'error'
                            ? 'text-red-700'
                            : alert.type === 'warning'
                            ? 'text-yellow-700'
                            : 'text-blue-700'
                        }`}>
                          {alert.message}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-bold">👥</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Riders
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.totalRiders || 0}
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
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-bold">🟢</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Online Riders
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.onlineRiders || 0}
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
                  <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-bold">📦</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Deliveries
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats?.totalDeliveries || 0}
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
                  <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                    <span className="text-white text-sm font-bold">₦</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Earnings
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      ₦{stats?.totalEarnings?.toLocaleString() || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-6">
          <button
            onClick={() => router.push('/dashboard/riders')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="text-2xl mr-4">👨‍💼</div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Manage Riders</h3>
                <p className="text-sm text-gray-500">Add, view, and manage your riders</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/dashboard/deliveries')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="text-2xl mr-4">🚚</div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">View Deliveries</h3>
                <p className="text-sm text-gray-500">Track all company deliveries</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => router.push('/dashboard/earnings')}
            className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="text-2xl mr-4">💰</div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Earnings Report</h3>
                <p className="text-sm text-gray-500">View detailed earnings analytics</p>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Deliveries */}
        {stats?.recentDeliveries && stats.recentDeliveries.length > 0 && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Deliveries
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {stats.recentDeliveries.slice(0, 5).map((delivery: any) => (
                      <tr key={delivery.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {delivery.clientName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₦{delivery.price?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(delivery.completedAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        </main>
      </div>
    </DashboardLayout>
  );
}