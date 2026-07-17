'use client';

import { useState, useRef, useEffect } from 'react';
import { useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { useCompanyRiders, useCreateRider, useUpdateRider, useSuspendRider, useActivateRider, useApproveRider } from '@/lib/hooks';
import { riderCreateSchema } from '@/lib/validations';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function RidersPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingRider, setEditingRider] = useState<any>(null);
  const [docForm, setDocForm] = useState({ nin: '', profileImage: '', licenseImage: '', guarantorName: '', guarantorPhone: '', guarantorRelationship: '' });
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: riders, isLoading } = useCompanyRiders();
  const createRiderMutation = useCreateRider();
  const updateMutation = useUpdateRider();
  const suspendMutation = useSuspendRider();
  const activateMutation = useActivateRider();
  const approveMutation = useApproveRider();

  const formik = useFormik({
    initialValues: { name: '', email: '', phoneNumber: '', password: '', vehicleType: '', vehicleColor: '', licensePlate: '' },
    validationSchema: riderCreateSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await createRiderMutation.mutateAsync(values);
        resetForm();
        setShowAddForm(false);
      } catch (err: any) {}
    },
  });

  // Close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setActiveMenu(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const openDocPanel = (rider: any) => {
    setEditingRider(rider);
    setDocForm({
      nin: rider.nin || '',
      profileImage: rider.profileImage || '',
      licenseImage: rider.licenseImage || '',
      guarantorName: rider.guarantor?.name || '',
      guarantorPhone: rider.guarantor?.phoneNumber || '',
      guarantorRelationship: rider.guarantor?.relationship || '',
    });
    setActiveMenu(null);
  };

  const handleDocSubmit = () => {
    updateMutation.mutate(
      { riderId: editingRider._id, data: docForm },
      { onSuccess: () => setEditingRider(null) }
    );
  };

  const openForm = () => { setShowAddForm(true); createRiderMutation.reset(); };
  const closeForm = () => { setShowAddForm(false); formik.resetForm(); };

  if (isLoading) {
    return <DashboardLayout><LoadingSpinner message="Loading riders data..." /></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto bg-gray-50">
        <header className="bg-white shadow">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Riders Management</h1>
                <p className="text-sm text-gray-600">Manage your company riders</p>
              </div>
              <button onClick={openForm} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                Add New Rider
              </button>
            </div>
          </div>
        </header>

        <main className="p-6">
        {/* Add Rider Slide-over */}
        {showAddForm && (
          <>
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={closeForm} />
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md shadow-2xl">
              <div className="h-full flex flex-col bg-white">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Add New Rider</h3>
                    <p className="text-sm text-gray-500 mt-0.5">Documents &amp; verification can be added later.</p>
                  </div>
                  <button onClick={closeForm} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <form id="create-rider-form" onSubmit={formik.handleSubmit} className="space-y-5">
                    <div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Personal Information</div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                          <input type="text" placeholder="e.g. John Doe" className={`block w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${formik.touched.name && formik.errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`} {...formik.getFieldProps('name')} />
                          {formik.touched.name && formik.errors.name && <p className="text-red-500 text-xs mt-1">{formik.errors.name}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number(Whatsapp)</label>
                            <input type="tel" placeholder="08012345678" className={`block w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${formik.touched.phoneNumber && formik.errors.phoneNumber ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`} {...formik.getFieldProps('phoneNumber')} />
                            {formik.touched.phoneNumber && formik.errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{formik.errors.phoneNumber}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-400">(optional)</span></label>
                            <input type="email" placeholder="rider@email.com" className={`block w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${formik.touched.email && formik.errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`} {...formik.getFieldProps('email')} />
                            {formik.touched.email && formik.errors.email && <p className="text-red-500 text-xs mt-1">{formik.errors.email}</p>}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Login Password {!formik.values.email && <span className="text-gray-400">(optional)</span>}
                          </label>
                          <input type="password" placeholder="Min 6 characters" className={`block w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${formik.touched.password && formik.errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`} {...formik.getFieldProps('password')} />
                          {formik.touched.password && formik.errors.password && <p className="text-red-500 text-xs mt-1">{formik.errors.password}</p>}
                          <p className="text-xs text-gray-400 mt-1">{formik.values.email ? 'Required — rider will use this to log in' : 'Optional if no email is provided'}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Vehicle Details</div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
                          <div className="grid grid-cols-4 gap-2">
                            {[
                              { value: 'motorcycle', label: 'Bike', icon: '🏍️' },
                              { value: 'bicycle', label: 'Bicycle', icon: '🚲' },
                              { value: 'car', label: 'Car', icon: '🚗' },
                              { value: 'smallTruck', label: 'Truck', icon: '🚛' },
                            ].map((opt) => (
                              <button key={opt.value} type="button" onClick={() => formik.setFieldValue('vehicleType', opt.value)} className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${formik.values.vehicleType === opt.value ? 'border-green-500 bg-green-50 shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-gray-50'}`}>
                                <span className="text-xl">{opt.icon}</span>
                                <span className="text-xs font-medium mt-1 text-gray-700">{opt.label}</span>
                              </button>
                            ))}
                          </div>
                          {formik.touched.vehicleType && formik.errors.vehicleType && <p className="text-red-500 text-xs mt-1">{formik.errors.vehicleType}</p>}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                            <input type="text" placeholder="e.g. Black" className={`block w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${formik.touched.vehicleColor && formik.errors.vehicleColor ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`} {...formik.getFieldProps('vehicleColor')} />
                            {formik.touched.vehicleColor && formik.errors.vehicleColor && <p className="text-red-500 text-xs mt-1">{formik.errors.vehicleColor}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Plate No. {formik.values.vehicleType === 'bicycle' && <span className="text-gray-400">(optional)</span>}</label>
                            <input type="text" placeholder="ABC-123-XY" className={`block w-full px-4 py-2.5 border rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${formik.touched.licensePlate && formik.errors.licensePlate ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'}`} {...formik.getFieldProps('licensePlate')} />
                            {formik.touched.licensePlate && formik.errors.licensePlate && <p className="text-red-500 text-xs mt-1">{formik.errors.licensePlate}</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                    {createRiderMutation.error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{createRiderMutation.error.message}</div>
                    )}
                  </form>
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end space-x-3 bg-gray-50">
                  <button type="button" onClick={closeForm} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white">Cancel</button>
                  <button type="submit" form="create-rider-form" disabled={createRiderMutation.isPending} className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center">
                    {createRiderMutation.isPending && <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />}
                    {createRiderMutation.isPending ? 'Adding...' : 'Add Rider'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Edit Documents Slide-over */}
        {editingRider && (
          <>
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setEditingRider(null)} />
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md shadow-2xl">
              <div className="h-full flex flex-col bg-white">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Documents & Verification</h3>
                    <p className="text-sm text-gray-500 mt-0.5">{editingRider.userId?.name || 'Rider'}</p>
                  </div>
                  <button onClick={() => setEditingRider(null)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIN (National ID Number)</label>
                    <input type="text" placeholder="e.g. 12345678901" value={docForm.nin} onChange={(e) => setDocForm({ ...docForm, nin: e.target.value })} className="block w-full px-4 py-2.5 border border-gray-200 bg-gray-50 focus:bg-white rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
                    <input type="text" placeholder="https://..." value={docForm.profileImage} onChange={(e) => setDocForm({ ...docForm, profileImage: e.target.value })} className="block w-full px-4 py-2.5 border border-gray-200 bg-gray-50 focus:bg-white rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Driver&apos;s License Image URL</label>
                    <input type="text" placeholder="https://..." value={docForm.licenseImage} onChange={(e) => setDocForm({ ...docForm, licenseImage: e.target.value })} className="block w-full px-4 py-2.5 border border-gray-200 bg-gray-50 focus:bg-white rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
                  </div>
                  <div className="border-t border-gray-100 pt-4">
                    <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Guarantor Information</div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input type="text" placeholder="Guarantor name" value={docForm.guarantorName} onChange={(e) => setDocForm({ ...docForm, guarantorName: e.target.value })} className="block w-full px-4 py-2.5 border border-gray-200 bg-gray-50 focus:bg-white rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input type="tel" placeholder="08012345678" value={docForm.guarantorPhone} onChange={(e) => setDocForm({ ...docForm, guarantorPhone: e.target.value })} className="block w-full px-4 py-2.5 border border-gray-200 bg-gray-50 focus:bg-white rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                          <select value={docForm.guarantorRelationship} onChange={(e) => setDocForm({ ...docForm, guarantorRelationship: e.target.value })} className="block w-full px-4 py-2.5 border border-gray-200 bg-gray-50 focus:bg-white rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none">
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
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{updateMutation.error.message}</div>
                  )}
                </div>
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end space-x-3 bg-gray-50">
                  <button type="button" onClick={() => setEditingRider(null)} className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-white">Cancel</button>
                  <button onClick={handleDocSubmit} disabled={updateMutation.isPending} className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 flex items-center">
                    {updateMutation.isPending && <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />}
                    {updateMutation.isPending ? 'Saving...' : 'Save Documents'}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Riders List */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Company Riders ({riders?.length || 0})
            </h3>
            
            {riders && riders.length > 0 ? (
              <div className="overflow-visible">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Onboarding</th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-12">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {riders.map((rider: any) => (
                      <tr key={rider._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => router.push(`/dashboard/riders/${rider._id}`)}>
                          <div className="text-sm font-medium text-gray-900">{rider.userId?.name || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => router.push(`/dashboard/riders/${rider._id}`)}>
                          <div className="text-sm text-gray-500">{rider.userId?.email || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{rider.userId?.phoneNumber || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap cursor-pointer" onClick={() => router.push(`/dashboard/riders/${rider._id}`)}>
                          <div className="text-sm text-gray-900">{rider.vehicleType} - {rider.vehicleColor}</div>
                          <div className="text-sm text-gray-500">{rider.licensePlate}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${rider.isOnline ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {rider.isOnline ? 'Online' : 'Offline'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ⭐ {rider.rating?.toFixed(1) || '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            rider.onboardingStatus === 'approved' ? 'bg-green-100 text-green-800' :
                            rider.onboardingStatus === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                            rider.onboardingStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {rider.onboardingStatus || 'incomplete'}
                          </span>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-right w-12">
                          <div className="relative inline-block">
                          <button
                            onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === rider._id ? null : rider._id); }}
                            className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <circle cx="12" cy="5" r="2" />
                              <circle cx="12" cy="12" r="2" />
                              <circle cx="12" cy="19" r="2" />
                            </svg>
                          </button>
                          {activeMenu === rider._id && (
                            <div ref={menuRef} className="absolute right-0 top-8 z-30 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 flex flex-col">
                              <button
                                onClick={() => { router.push(`/dashboard/riders/${rider._id}`); setActiveMenu(null); }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => openDocPanel(rider)}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                              >
                                Add/Edit Documents
                              </button>
                              {rider.onboardingStatus !== 'approved' && (
                                <button
                                  onClick={() => { approveMutation.mutate(rider._id); setActiveMenu(null); }}
                                  className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                >
                                  ✓ Approve Rider
                                </button>
                              )}
                              {rider.userId?.isActive !== false ? (
                                <button
                                  onClick={() => { suspendMutation.mutate(rider._id); setActiveMenu(null); }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
                                >
                                  Suspend Rider
                                </button>
                              ) : (
                                <button
                                  onClick={() => { activateMutation.mutate(rider._id); setActiveMenu(null); }}
                                  className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
                                >
                                  Activate Rider
                                </button>
                              )}
                            </div>
                          )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-500">No riders found</div>
                <button onClick={openForm} className="mt-2 text-green-600 hover:text-green-500">Add your first rider</button>
              </div>
            )}
          </div>
        </div>
        </main>
      </div>
    </DashboardLayout>
  );
}
