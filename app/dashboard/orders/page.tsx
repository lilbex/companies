'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMerchantOrders } from '@/lib/hooks';
import DashboardLayout from '@/components/DashboardLayout';

const STATUS_OPTIONS = [
  { value: '', label: 'All Orders' },
  { value: 'pending_merchant', label: 'Needs Response' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'preparing', label: 'Preparing' },
  { value: 'ready_for_pickup', label: 'Ready / Rider Sent' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

const STATUS_LABEL: Record<string, string> = {
  pending_merchant: 'Needs Response',
  accepted: 'Accepted',
  preparing: 'Preparing',
  ready_for_pickup: 'Ready — Rider Sent',
  rejected: 'Rejected',
  cancelled: 'Cancelled',
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pending_merchant':
      return 'bg-yellow-100 text-yellow-800';
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

export default function MerchantOrdersPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const router = useRouter();
  const { data: orders, isLoading } = useMerchantOrders(statusFilter || undefined);

  const list = orders || [];
  const needsResponseCount = (orders || []).filter((o: any) => o.status === 'pending_merchant').length;

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto bg-gray-50">
        <header className="bg-white shadow">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
              <p className="text-sm text-gray-600">
                {needsResponseCount > 0
                  ? `${needsResponseCount} order${needsResponseCount === 1 ? '' : 's'} waiting on you`
                  : 'New orders refresh automatically every few seconds'}
              </p>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </header>

        <main className="p-6">
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              {isLoading ? (
                <p className="text-sm text-gray-500">Loading orders...</p>
              ) : list.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Placed</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {list.map((order: any) => {
                        const id = order.id || order._id;
                        const total = (order.itemsSubtotal || 0) + (order.deliveryFee || 0);
                        return (
                          <tr
                            key={id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => router.push(`/dashboard/orders/${id}`)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{order.recipientName}</div>
                              <div className="text-xs text-gray-500">{order.recipientPhone}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {(order.items || []).length} item{(order.items || []).length === 1 ? '' : 's'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              ₦{total.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                {STATUS_LABEL[order.status] || order.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>{new Date(order.createdAt).toLocaleDateString()}</div>
                              <div className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleTimeString()}</div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-500">
                    {statusFilter ? `No ${STATUS_LABEL[statusFilter] || statusFilter} orders found` : 'No orders yet'}
                  </div>
                  <p className="text-sm text-gray-400 mt-2">
                    Orders will appear here once customers pay for food from your menu
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
