'use client';

import { useRouter } from 'next/navigation';
import { useMerchant, useMerchantOrders } from '@/lib/hooks';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';

const formatNaira = (amount?: number) => `₦${(amount || 0).toLocaleString()}`;

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const STATUS_LABEL: Record<string, string> = {
  pending_merchant: 'Needs Response', // legacy — new orders skip straight to 'accepted'
  accepted: 'Preparing',
  preparing: 'Preparing',
  ready_for_pickup: 'Rider Sent',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'accepted':
    case 'preparing':
      return 'bg-blue-100 text-blue-800';
    case 'ready_for_pickup':
      return 'bg-green-100 text-green-800';
    case 'rejected':
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// A merchant landing page -- fleet managers get one (app/dashboard, backed
// by admin-scoped stats aggregation), but a merchant previously landed
// straight on Orders with no summary anywhere. This rolls up today's
// activity client-side from the merchant's own order list
// (useMerchantOrders, GET /merchant-orders/merchant -- already scoped to
// this merchant, no separate stats endpoint needed) rather than adding a
// new backend aggregation for what's currently a single-restaurant-sized
// dataset. Worth revisiting with a real backend rollup if a merchant's
// order history grows large enough that fetching it all client-side stops
// being cheap.
export default function MerchantOverviewPage() {
  const router = useRouter();
  const { data: merchant, isLoading: merchantLoading } = useMerchant();
  const { data: orders, isLoading: ordersLoading } = useMerchantOrders();

  if (merchantLoading || ordersLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Loading your overview..." size="lg" />
      </DashboardLayout>
    );
  }

  const allOrders: any[] = orders || [];
  const today = new Date();
  const todaysOrders = allOrders.filter((o) => isSameDay(new Date(o.createdAt), today));
  const todaysSales = todaysOrders
    .filter((o) => o.status !== 'rejected' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.itemsSubtotal || 0), 0);
  const preparingCount = allOrders.filter((o) => o.status === 'accepted' || o.status === 'preparing').length;
  const recentOrders = allOrders.slice(0, 8);

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto bg-gray-50">
        <header className="bg-white shadow">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
            <p className="text-sm text-gray-600">How {merchant?.name || 'your restaurant'} is doing today</p>
          </div>
        </header>

        <main className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">🧾</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Orders Today</dt>
                      <dd className="text-lg font-medium text-gray-900">{todaysOrders.length}</dd>
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
                      <span className="text-white text-sm font-bold">₦</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Sales Today</dt>
                      <dd className="text-lg font-medium text-gray-900">{formatNaira(todaysSales)}</dd>
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
                      <span className="text-white text-sm font-bold">🍳</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Preparing Now</dt>
                      <dd className="text-lg font-medium text-gray-900">{preparingCount}</dd>
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
                      <span className="text-white text-sm font-bold">∑</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">All-Time Orders</dt>
                      <dd className="text-lg font-medium text-gray-900">{merchant?.totalOrders || 0}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
              <button
                onClick={() => router.push('/dashboard/orders')}
                className="text-sm font-medium text-green-600 hover:text-green-700"
              >
                View all
              </button>
            </div>
            {recentOrders.length === 0 ? (
              <div className="p-6 text-sm text-gray-500">No orders yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placed</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentOrders.map((order: any) => (
                      <tr
                        key={order._id}
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => router.push(`/dashboard/orders/${order._id}`)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order._id?.slice(-6)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatNaira(order.itemsSubtotal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {STATUS_LABEL[order.status] || order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
