'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDeliveryDetail, useAssignDelivery, useCompanyRiders } from '@/lib/hooks';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function DeliveryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [showAssignModal, setShowAssignModal] = useState(false);

  const { data: delivery, isLoading } = useDeliveryDetail(id as string);
  const { data: riders } = useCompanyRiders();
  const assignMutation = useAssignDelivery();

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Loading delivery details..." />
      </DashboardLayout>
    );
  }

  if (!delivery) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Delivery not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'accepted': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'picked-up': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'in-transit': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'delivered': return 'bg-green-100 text-green-800 border-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const statusTimeline = ['pending', 'accepted', 'picked-up', 'in-transit', 'delivered'];
  const currentIndex = statusTimeline.indexOf(delivery?.status);

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto bg-gray-50">
        <header className="bg-white shadow">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
                ← Back
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Delivery #{(id as string).slice(-6).toUpperCase()}</h1>
                <p className="text-sm text-gray-600">Created {new Date(delivery.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full border ${getStatusColor(delivery?.status)}`}>
                {delivery?.status?.replace('-', ' ').toUpperCase()}
              </span>
              {delivery?.status === 'pending' && (
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                >
                  Assign Rider
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* Status Timeline */}
          {delivery?.status !== 'cancelled' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-4">Delivery Progress</h3>
              <div className="flex items-center justify-between">
                {statusTimeline.map((step, i) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      i <= currentIndex ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {i <= currentIndex ? '✓' : i + 1}
                    </div>
                    {i < statusTimeline.length - 1 && (
                      <div className={`flex-1 h-1 mx-2 ${i < currentIndex ? 'bg-green-500' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2">
                {statusTimeline.map(step => (
                  <span key={step} className="text-xs text-gray-500 capitalize">{step.replace('-', ' ')}</span>
                ))}
              </div>
            </div>
          )}

          {/* Main Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Locations */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Route</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 mt-1.5 bg-green-500 rounded-full" />
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Pickup</div>
                    <div className="text-sm font-medium">{delivery.pickupLocation?.addressLine1 || 'N/A'}</div>
                  </div>
                </div>
                <div className="ml-1.5 border-l-2 border-dashed border-gray-300 h-6" />
                <div className="flex items-start space-x-3">
                  <div className="w-3 h-3 mt-1.5 bg-red-500 rounded-full" />
                  <div>
                    <div className="text-xs text-gray-500 uppercase">Dropoff</div>
                    <div className="text-sm font-medium">{delivery.deliveryLocation?.addressLine1 || 'N/A'}</div>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between text-sm">
                <span className="text-gray-500">Distance: <strong>{delivery.distance?.toFixed(1)} km</strong></span>
                <span className="text-gray-500">ETA: <strong>{delivery.estimatedDuration}</strong></span>
              </div>
            </div>

            {/* Order Details */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Details</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Package Type</dt>
                  <dd className="text-sm font-medium">{delivery.packageType}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Price</dt>
                  <dd className="text-sm font-bold text-green-600">₦{delivery.price?.toLocaleString()}</dd>
                </div>
                {delivery.isExpress && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Type</dt>
                    <dd className="text-sm font-medium text-orange-600">⚡ Express</dd>
                  </div>
                )}
                {delivery.deliveryCode && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Delivery Code</dt>
                    <dd className="text-sm font-mono font-bold bg-gray-100 px-2 py-1 rounded">{delivery.deliveryCode}</dd>
                  </div>
                )}
                {delivery.itemDescription && (
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">Description</dt>
                    <dd className="text-sm font-medium">{delivery.itemDescription}</dd>
                  </div>
                )}
                {delivery.specialInstructions && (
                  <div>
                    <dt className="text-sm text-gray-500 mb-1">Special Instructions</dt>
                    <dd className="text-sm bg-yellow-50 p-2 rounded">{delivery.specialInstructions}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          {/* People */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Sender</h3>
              <div className="text-lg font-medium text-gray-900">{delivery.clientName}</div>
              <div className="text-sm text-gray-600">{delivery.clientPhone}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Recipient</h3>
              <div className="text-lg font-medium text-gray-900">{delivery.recipientName || 'Same as sender'}</div>
              <div className="text-sm text-gray-600">{delivery.recipientPhone || delivery.clientPhone}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-sm font-medium text-gray-500 mb-3">Rider</h3>
              {delivery.riderName && delivery.riderName !== 'Unassigned' ? (
                <>
                  <div className="text-lg font-medium text-gray-900">{delivery.riderName}</div>
                  <button
                    onClick={() => router.push(`/dashboard/riders/${delivery.riderId}`)}
                    className="text-sm text-green-600 hover:underline"
                  >
                    View rider profile →
                  </button>
                </>
              ) : (
                <div className="text-sm text-gray-500">No rider assigned</div>
              )}
            </div>
          </div>

          {/* Rating */}
          {delivery.rating && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Customer Rating</h3>
              <div className="text-yellow-500 text-lg">{'★'.repeat(delivery.rating.score)}{'☆'.repeat(5 - delivery.rating.score)}</div>
              {delivery.rating.comment && <p className="text-sm text-gray-600 mt-2">{delivery.rating.comment}</p>}
            </div>
          )}

          {/* Timestamps */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Timeline</h3>
            <div className="flex justify-between text-sm">
              <div>
                <span className="text-gray-500">Created:</span>{' '}
                <span className="font-medium">{new Date(delivery.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-500">Last Updated:</span>{' '}
                <span className="font-medium">{new Date(delivery.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </main>

        {/* Assign Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Assign Rider</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {riders?.map((rider: any) => (
                  <button
                    key={rider._id}
                    onClick={() => {
                      assignMutation.mutate({ deliveryId: id as string, riderId: rider._id });
                      setShowAssignModal(false);
                    }}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="text-left">
                      <div className="text-sm font-medium">{rider.userId?.name || 'Unknown'}</div>
                      <div className="text-xs text-gray-500">{rider.vehicleType} • ⭐ {rider.rating?.toFixed(1)}</div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${rider.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                      {rider.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </button>
                ))}
                {(!riders || riders.length === 0) && (
                  <p className="text-sm text-gray-500 text-center py-4">No riders available</p>
                )}
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-md text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
