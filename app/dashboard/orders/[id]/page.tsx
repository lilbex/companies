'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import {
  useMerchantOrder,
  useRejectMerchantOrder,
  useOrderRiders,
  useSendOrderToRider,
} from '@/lib/hooks';

const STATUS_LABEL: Record<string, string> = {
  pending_merchant: 'Needs Response',
  accepted: 'Preparing',
  preparing: 'Preparing',
  ready_for_pickup: 'Rider Sent',
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

export default function MerchantOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params?.id as string;
  const { data: order, isLoading } = useMerchantOrder(orderId);
  const rejectOrder = useRejectMerchantOrder();
  const sendToRider = useSendOrderToRider();

  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [actionError, setActionError] = useState('');
  const [showRiderPicker, setShowRiderPicker] = useState(false);
  const [sendingToRiderId, setSendingToRiderId] = useState<string | null>(null);
  const { data: riders, isLoading: ridersLoading, error: ridersError } = useOrderRiders(orderId, { enabled: showRiderPicker });

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex-1 overflow-auto bg-gray-50 p-6">
          <p className="text-sm text-gray-500">Loading order...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout>
        <div className="flex-1 overflow-auto bg-gray-50 p-6">
          <p className="text-sm text-gray-500">Order not found.</p>
        </div>
      </DashboardLayout>
    );
  }

  const total = (order.itemsSubtotal || 0) + (order.deliveryFee || 0);

  const handleReject = async () => {
    setActionError('');
    try {
      await rejectOrder.mutateAsync({ orderId, reason: rejectReason.trim() || undefined });
      setShowRejectForm(false);
    } catch (err: any) {
      setActionError(err?.message || 'Could not cancel this order.');
    }
  };

  const handleSendToRider = async (riderId: string) => {
    setActionError('');
    setSendingToRiderId(riderId);
    try {
      await sendToRider.mutateAsync({ orderId, riderId });
      setShowRiderPicker(false);
    } catch (err: any) {
      setActionError(err?.message || 'Could not send this order to that rider.');
    } finally {
      setSendingToRiderId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto bg-gray-50">
        <header className="bg-white shadow">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <button
                onClick={() => router.push('/dashboard/orders')}
                className="text-sm text-gray-500 hover:text-gray-700 mb-1"
              >
                ← Back to Orders
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Order Detail</h1>
            </div>
            <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(order.status)}`}>
              {STATUS_LABEL[order.status] || order.status}
            </span>
          </div>
        </header>

        <main className="p-6 max-w-3xl space-y-6">
          {actionError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">{actionError}</div>
          )}

          {/* pending_merchant is a legacy state from before checkout skipped
              straight to 'accepted' -- new orders never land here, but an
              old stuck order still needs a way out. */}
          {order.status === 'pending_merchant' && (
            <div className="bg-white shadow rounded-lg p-6 flex flex-wrap gap-3 items-center">
              <p className="text-sm text-gray-600 mr-auto">This order is from before orders went straight to preparing. You can still cancel it if needed.</p>
              <button
                onClick={() => setShowRejectForm((v) => !v)}
                className="border border-red-300 text-red-600 hover:bg-red-50 px-4 py-2 rounded-md text-sm font-medium"
              >
                Cancel Order
              </button>
            </div>
          )}

          {showRejectForm && (
            <div className="bg-white shadow rounded-lg p-6 space-y-3">
              <label className="block text-sm font-medium text-gray-700">Reason (optional, shown to the customer)</label>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="block w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                placeholder="e.g. We're out of an ingredient right now"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleReject}
                  disabled={rejectOrder.isPending}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                  {rejectOrder.isPending ? 'Cancelling...' : 'Confirm Cancel'}
                </button>
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="text-gray-600 px-4 py-2 text-sm"
                >
                  Never mind
                </button>
              </div>
            </div>
          )}

          {(order.status === 'accepted' || order.status === 'preparing') && !showRiderPicker && (
            <div className="bg-white shadow rounded-lg p-6 flex flex-wrap gap-3 items-center">
              <p className="text-sm text-gray-600 mr-auto">
                When the food is ready, search for a nearby rider and send it out with them — just like a customer sends their own delivery to a rider.
              </p>
              <button
                onClick={() => { setShowRejectForm(false); setShowRiderPicker(true); }}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md text-sm font-medium"
              >
                Find a Rider
              </button>
              <button
                onClick={() => setShowRejectForm((v) => !v)}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Cancel order
              </button>
            </div>
          )}

          {(order.status === 'accepted' || order.status === 'preparing') && showRiderPicker && (
            <div className="bg-white shadow rounded-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900">Choose a rider to send this order to</h3>
                <button onClick={() => setShowRiderPicker(false)} className="text-sm text-gray-500 hover:text-gray-700">Close</button>
              </div>

              {ridersLoading ? (
                <p className="text-sm text-gray-500">Looking for nearby riders...</p>
              ) : ridersError ? (
                <p className="text-sm text-red-600">Couldn't load nearby riders. Try again.</p>
              ) : !riders || riders.length === 0 ? (
                <p className="text-sm text-gray-500">No riders are online near you right now. Try again in a moment.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {riders.map((rider: any) => {
                    const id = rider.id || rider._id;
                    const isSending = sendingToRiderId === id;
                    return (
                      <li key={id} className="flex items-center justify-between py-3 gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {rider.name}
                            {rider.recommended && (
                              <span className="ml-2 inline-flex px-2 py-0.5 text-[11px] font-semibold rounded-full bg-green-100 text-green-700">Recommended</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {rider.vehicleType}{rider.vehicleColor ? ` · ${rider.vehicleColor}` : ''} · {rider.distanceFromPickupKm}km away · ETA {rider.eta}
                            {typeof rider.rating === 'number' && ` · ★ ${rider.rating.toFixed(1)}`}
                          </p>
                        </div>
                        <button
                          onClick={() => handleSendToRider(id)}
                          disabled={sendToRider.isPending}
                          className="shrink-0 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md text-sm font-medium disabled:opacity-50"
                        >
                          {isSending ? 'Sending...' : 'Send'}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {order.status === 'ready_for_pickup' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <p className="text-sm text-green-800 font-medium">
                🛵 This order has been sent to a rider.
              </p>
              <p className="text-xs text-green-700 mt-1">
                The customer can track the rider from the CityWheels app. This order stays here for your records.
              </p>
            </div>
          )}

          {order.status === 'rejected' && order.rejectionReason && (
            <div className="bg-white shadow rounded-lg p-6">
              <p className="text-sm text-gray-600">
                <span className="font-medium text-gray-900">Rejection reason: </span>
                {order.rejectionReason}
              </p>
            </div>
          )}

          {/* Order items */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
            <div className="divide-y divide-gray-200">
              {(order.items || []).map((item: any, idx: number) => (
                <div key={idx} className="flex justify-between py-2 text-sm">
                  <span className="text-gray-800">
                    {item.quantity} × {item.name}
                  </span>
                  <span className="text-gray-600">₦{(item.unitPrice * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 mt-3 pt-3 space-y-1">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>₦{(order.itemsSubtotal || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Delivery Fee</span>
                <span>₦{(order.deliveryFee || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-gray-900">
                <span>Total Paid</span>
                <span>₦{total.toLocaleString()}</span>
              </div>
            </div>
            {order.specialInstructions && (
              <div className="mt-4 bg-gray-50 rounded-md p-3 text-sm text-gray-700">
                <span className="font-medium">Special instructions: </span>
                {order.specialInstructions}
              </div>
            )}
          </div>

          {/* Delivery info */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery To</h3>
            <p className="text-sm text-gray-900 font-medium">{order.recipientName}</p>
            <p className="text-sm text-gray-600">{order.recipientPhone}</p>
            <p className="text-sm text-gray-600 mt-2">{order.deliveryLocation?.addressLine1}</p>
          </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
