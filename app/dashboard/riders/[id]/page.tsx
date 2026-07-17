'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useRiderDetail, useSuspendRider, useActivateRider, useApproveRider, useRejectRider, useUpdateRider } from '@/lib/hooks';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function RiderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDocForm, setShowDocForm] = useState(false);
  const [docForm, setDocForm] = useState({
    nin: '',
    profileImage: '',
    licenseImage: '',
    guarantorName: '',
    guarantorPhone: '',
    guarantorRelationship: '',
  });

  const { data, isLoading } = useRiderDetail(id as string);
  const suspendMutation = useSuspendRider();
  const activateMutation = useActivateRider();
  const approveMutation = useApproveRider();
  const rejectMutation = useRejectRider();
  const updateMutation = useUpdateRider();

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Loading rider details..." />
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Rider not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const { rider, stats, recentDeliveries, ratings } = data;

  const openDocForm = () => {
    setDocForm({
      nin: rider.nin || '',
      profileImage: rider.profileImage || '',
      licenseImage: rider.licenseImage || '',
      guarantorName: rider.guarantor?.name || '',
      guarantorPhone: rider.guarantor?.phoneNumber || '',
      guarantorRelationship: rider.guarantor?.relationship || '',
    });
    setShowDocForm(true);
  };

  const handleDocSubmit = () => {
    updateMutation.mutate(
      { riderId: id as string, data: docForm },
      { onSuccess: () => setShowDocForm(false) }
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-blue-100 text-blue-800';
      case 'picked-up': return 'bg-purple-100 text-purple-800';
      case 'in-transit': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
                <h1 className="text-2xl font-bold text-gray-900">{rider.name}</h1>
                <p className="text-sm text-gray-600">{rider.phone} • {rider.email || 'No email'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {rider.onboardingStatus === 'pending_review' && (
                <>
                  <button
                    onClick={() => approveMutation.mutate(id as string)}
                    disabled={approveMutation.isPending}
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    ✓ Approve
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                  >
                    ✕ Reject
                  </button>
                </>
              )}
              {rider.isActive ? (
                <button
                  onClick={() => suspendMutation.mutate(id as string)}
                  disabled={suspendMutation.isPending}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-md text-sm hover:bg-red-200 disabled:opacity-50"
                >
                  Suspend Rider
                </button>
              ) : (
                <button
                  onClick={() => activateMutation.mutate(id as string)}
                  disabled={activateMutation.isPending}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 disabled:opacity-50"
                >
                  Activate Rider
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* Status Badges */}
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${rider.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {rider.isActive ? 'Active' : 'Suspended'}
            </span>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${rider.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
              {rider.isOnline ? 'Online' : 'Offline'}
            </span>
            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
              rider.onboardingStatus === 'approved' ? 'bg-green-100 text-green-800' :
              rider.onboardingStatus === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
              rider.onboardingStatus === 'rejected' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              Onboarding: {rider.onboardingStatus}
            </span>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">Deliveries</div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalDeliveries}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">Earnings</div>
              <div className="text-2xl font-bold text-green-600">₦{stats.totalEarnings.toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">Avg/Delivery</div>
              <div className="text-2xl font-bold text-gray-900">₦{stats.avgEarningPerDelivery.toLocaleString()}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">Completion Rate</div>
              <div className="text-2xl font-bold text-blue-600">{stats.completionRate}%</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">Rating</div>
              <div className="text-2xl font-bold text-yellow-600">⭐ {rider.rating?.toFixed(1)}</div>
            </div>
          </div>

          {/* Rider Info + Vehicle */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Vehicle Information</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Type</dt>
                  <dd className="text-sm font-medium">{rider.vehicleType || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Color</dt>
                  <dd className="text-sm font-medium">{rider.vehicleColor || 'N/A'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">License Plate</dt>
                  <dd className="text-sm font-medium">{rider.licensePlate || 'N/A'}</dd>
                </div>
              </dl>
            </div>

            {/* Documents & Verification Card */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Documents & Verification</h3>
                <button
                  onClick={openDocForm}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  {rider.nin || rider.guarantor ? 'Edit' : '+ Add'}
                </button>
              </div>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">NIN</dt>
                  <dd className="text-sm font-medium">{rider.nin || <span className="text-gray-400">Not provided</span>}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">Profile Image</dt>
                  <dd className="text-sm font-medium">
                    {rider.profileImage ? <a href={rider.profileImage} target="_blank" className="text-green-600 underline">View</a> : <span className="text-gray-400">Not uploaded</span>}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-gray-500">License Image</dt>
                  <dd className="text-sm font-medium">
                    {rider.licenseImage ? <a href={rider.licenseImage} target="_blank" className="text-green-600 underline">View</a> : <span className="text-gray-400">Not uploaded</span>}
                  </dd>
                </div>
                <div className="border-t border-gray-100 pt-3">
                  <div className="text-xs font-semibold text-gray-400 uppercase mb-2">Guarantor</div>
                  {rider.guarantor ? (
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Name</span>
                        <span className="text-sm font-medium">{rider.guarantor.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Phone</span>
                        <span className="text-sm font-medium">{rider.guarantor.phoneNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Relationship</span>
                        <span className="text-sm font-medium">{rider.guarantor.relationship}</span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">Not provided</p>
                  )}
                </div>
              </dl>
            </div>
          </div>

          {/* Recent Deliveries */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Deliveries</h3>
            </div>
            <div className="overflow-x-auto">
              {recentDeliveries.length > 0 ? (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Package</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {recentDeliveries.map((d: any) => (
                      <tr key={d.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/dashboard/deliveries/${d.id}`)}>
                        <td className="px-6 py-4 text-sm text-gray-900">{d.clientName}</td>
                        <td className="px-6 py-4 text-sm text-gray-500">{d.packageType}</td>
                        <td className="px-6 py-4 text-sm font-medium">₦{d.price?.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(d.status)}`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-gray-500">No deliveries yet</div>
              )}
            </div>
          </div>

          {/* Ratings */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Customer Reviews ({ratings.length})</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {ratings.length > 0 ? ratings.map((r: any, i: number) => (
                <div key={i} className="px-6 py-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{r.customerName}</div>
                      <div className="text-yellow-500 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
                      {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
                    </div>
                    <span className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )) : (
                <div className="p-6 text-center text-gray-500">No reviews yet</div>
              )}
            </div>
          </div>
        </main>

        {/* Reject Modal */}
        {showRejectModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Reject Onboarding</h3>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Reason for rejection..."
                className="w-full border border-gray-300 rounded-md p-3 text-sm mb-4"
                rows={3}
              />
              <div className="flex justify-end space-x-3">
                <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-sm">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    rejectMutation.mutate({ riderId: id as string, reason: rejectReason });
                    setShowRejectModal(false);
                  }}
                  disabled={!rejectReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Documents Slide-over */}
        {showDocForm && (
          <>
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setShowDocForm(false)} />
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md shadow-2xl">
              <div className="h-full flex flex-col bg-white">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Documents & Verification</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Update rider records and documents</p>
                  </div>
                  <button onClick={() => setShowDocForm(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600">
                    ✕
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIN (National ID Number)</label>
                    <input
                      type="text"
                      placeholder="e.g. 12345678901"
                      value={docForm.nin}
                      onChange={(e) => setDocForm({ ...docForm, nin: e.target.value })}
                      className="block w-full px-4 py-2.5 border border-gray-200 bg-gray-50 focus:bg-white rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={docForm.profileImage}
                      onChange={(e) => setDocForm({ ...docForm, profileImage: e.target.value })}
                      className="block w-full px-4 py-2.5 border border-gray-200 bg-gray-50 focus:bg-white rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Driver&apos;s License Image URL</label>
                    <input
                      type="text"
                      placeholder="https://..."
                      value={docForm.licenseImage}
                      onChange={(e) => setDocForm({ ...docForm, licenseImage: e.target.value })}
                      className="block w-full px-4 py-2.5 border border-gray-200 bg-gray-50 focus:bg-white rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                    />
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Guarantor Information</div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          placeholder="Guarantor name"
                          value={docForm.guarantorName}
                          onChange={(e) => setDocForm({ ...docForm, guarantorName: e.target.value })}
                          className="block w-full px-4 py-2.5 border border-gray-200 bg-gray-50 focus:bg-white rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            type="tel"
                            placeholder="08012345678"
                            value={docForm.guarantorPhone}
                            onChange={(e) => setDocForm({ ...docForm, guarantorPhone: e.target.value })}
                            className="block w-full px-4 py-2.5 border border-gray-200 bg-gray-50 focus:bg-white rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                          <select
                            value={docForm.guarantorRelationship}
                            onChange={(e) => setDocForm({ ...docForm, guarantorRelationship: e.target.value })}
                            className="block w-full px-4 py-2.5 border border-gray-200 bg-gray-50 focus:bg-white rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                          >
                            <option value="">Select...</option>
                            <option value="parent">Parent</option>
                            <option value="sibling">Sibling</option>
                            <option value="spouse">Spouse</option>
                            <option value="friend">Friend</option>
                            <option value="employer">Employer</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {updateMutation.error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {updateMutation.error.message}
                    </div>
                  )}
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end space-x-3 bg-gray-50">
                  <button
                    type="button"
                    onClick={() => setShowDocForm(false)}
                    className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDocSubmit}
                    disabled={updateMutation.isPending}
                    className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center"
                  >
                    {updateMutation.isPending && (
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    )}
                    {updateMutation.isPending ? 'Saving...' : 'Save Documents'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
