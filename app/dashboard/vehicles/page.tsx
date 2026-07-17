'use client';

import { useState } from 'react';
import { useVehicles, useCreateVehicle, useAssignVehicle, useUpdateVehicleStatus, useDeleteVehicle, useCompanyRiders } from '@/lib/hooks';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function VehiclesPage() {
  const [showAddForm, setShowAddForm] = useState(false);
  const [assignModal, setAssignModal] = useState<{ vehicleId: string; currentRiderId: string | null } | null>(null);
  const [statusModal, setStatusModal] = useState<{ vehicleId: string; currentStatus: string } | null>(null);
  const [maintenanceNotes, setMaintenanceNotes] = useState('');
  const [newVehicle, setNewVehicle] = useState({ type: 'motorcycle', color: '', licensePlate: '', make: '', vehicleModel: '', year: '' });

  const { data: vehicles, isLoading } = useVehicles();
  const { data: riders } = useCompanyRiders();
  const createMutation = useCreateVehicle();
  const assignMutation = useAssignVehicle();
  const statusMutation = useUpdateVehicleStatus();
  const deleteMutation = useDeleteVehicle();

  if (isLoading) {
    return <DashboardLayout><LoadingSpinner message="Loading vehicles..." /></DashboardLayout>;
  }

  const vehicleIcon = (type: string) => {
    switch (type) {
      case 'motorcycle': return '🏍️';
      case 'bicycle': return '🚲';
      case 'car': return '🚗';
      case 'smallTruck': return '🚛';
      default: return '🚗';
    }
  };

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'retired': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activeCount = vehicles?.filter((v: any) => v.status === 'active').length || 0;
  const maintenanceCount = vehicles?.filter((v: any) => v.status === 'maintenance').length || 0;
  const assignedCount = vehicles?.filter((v: any) => v.assignedRiderId).length || 0;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createMutation.mutateAsync({
      ...newVehicle,
      year: newVehicle.year ? parseInt(newVehicle.year) : undefined,
    });
    setNewVehicle({ type: 'motorcycle', color: '', licensePlate: '', make: '', vehicleModel: '', year: '' });
    setShowAddForm(false);
  };

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto bg-gray-50">
        <header className="bg-white shadow">
          <div className="px-6 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fleet Vehicles</h1>
              <p className="text-sm text-gray-600">Manage your company vehicles and assignments</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
            >
              + Add Vehicle
            </button>
          </div>
        </header>

        <main className="p-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">Total Vehicles</div>
              <div className="text-2xl font-bold text-gray-900">{vehicles?.length || 0}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">Active</div>
              <div className="text-2xl font-bold text-green-600">{activeCount}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">In Maintenance</div>
              <div className="text-2xl font-bold text-yellow-600">{maintenanceCount}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="text-sm text-gray-500">Assigned to Riders</div>
              <div className="text-2xl font-bold text-blue-600">{assignedCount}</div>
            </div>
          </div>

          {/* Vehicle Grid */}
          {vehicles && vehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((v: any) => (
                <div key={v.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{vehicleIcon(v.type)}</div>
                        <div>
                          <div className="font-semibold text-gray-900 capitalize">
                            {v.make || v.type} {v.vehicleModel || ''}
                          </div>
                          <div className="text-sm text-gray-500">{v.color} • {v.licensePlate || 'No plate'}</div>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusColor(v.status)}`}>
                        {v.status}
                      </span>
                    </div>

                    {/* Assignment */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      {v.assignedRiderName ? (
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <span className="text-gray-500">Assigned to:</span>{' '}
                            <span className="font-medium text-gray-900">{v.assignedRiderName}</span>
                          </div>
                          <button
                            onClick={() => setAssignModal({ vehicleId: v.id, currentRiderId: v.assignedRiderId })}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            Reassign
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setAssignModal({ vehicleId: v.id, currentRiderId: null })}
                          className="text-sm text-green-600 hover:underline"
                        >
                          + Assign to rider
                        </button>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-3 flex items-center space-x-2">
                      <button
                        onClick={() => setStatusModal({ vehicleId: v.id, currentStatus: v.status })}
                        className="text-xs px-3 py-1.5 border border-gray-200 rounded-md hover:bg-gray-50 text-gray-600"
                      >
                        Change Status
                      </button>
                      {!v.assignedRiderId && (
                        <button
                          onClick={() => { if (confirm('Delete this vehicle?')) deleteMutation.mutate(v.id); }}
                          className="text-xs px-3 py-1.5 border border-red-200 rounded-md hover:bg-red-50 text-red-600"
                        >
                          Delete
                        </button>
                      )}
                    </div>

                    {v.nextMaintenanceDate && (
                      <div className="mt-3 text-xs text-gray-400">
                        Next maintenance: {new Date(v.nextMaintenanceDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <div className="text-4xl mb-3">🚗</div>
              <h3 className="text-lg font-medium text-gray-900">No vehicles yet</h3>
              <p className="text-sm text-gray-500 mt-1">Add your first vehicle to start managing your fleet</p>
              <button onClick={() => setShowAddForm(true)} className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700">
                Add Vehicle
              </button>
            </div>
          )}
        </main>

        {/* Add Vehicle Slide-over */}
        {showAddForm && (
          <>
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={() => setShowAddForm(false)} />
            <div className="fixed inset-y-0 right-0 z-50 w-full max-w-sm shadow-2xl">
              <div className="h-full flex flex-col bg-white">
                <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Add Vehicle</h3>
                  <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <form onSubmit={handleCreate} className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { value: 'motorcycle', icon: '🏍️', label: 'Bike' },
                        { value: 'bicycle', icon: '🚲', label: 'Bicycle' },
                        { value: 'car', icon: '🚗', label: 'Car' },
                        { value: 'smallTruck', icon: '🚛', label: 'Truck' },
                      ].map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setNewVehicle({ ...newVehicle, type: opt.value })}
                          className={`flex flex-col items-center p-2.5 rounded-lg border-2 transition-all ${
                            newVehicle.type === opt.value ? 'border-green-500 bg-green-50' : 'border-gray-200'
                          }`}
                        >
                          <span className="text-lg">{opt.icon}</span>
                          <span className="text-xs mt-1">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                      <input type="text" placeholder="e.g. Honda" value={newVehicle.make} onChange={e => setNewVehicle({ ...newVehicle, make: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                      <input type="text" placeholder="e.g. ACE 125" value={newVehicle.vehicleModel} onChange={e => setNewVehicle({ ...newVehicle, vehicleModel: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                      <input type="text" placeholder="e.g. Black" required value={newVehicle.color} onChange={e => setNewVehicle({ ...newVehicle, color: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                      <input type="number" placeholder="2024" value={newVehicle.year} onChange={e => setNewVehicle({ ...newVehicle, year: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">License Plate</label>
                    <input type="text" placeholder="ABC-123-XY" value={newVehicle.licensePlate} onChange={e => setNewVehicle({ ...newVehicle, licensePlate: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:ring-2 focus:ring-green-500 outline-none" />
                  </div>
                  {createMutation.error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{createMutation.error.message}</div>
                  )}
                  <button type="submit" disabled={createMutation.isPending || !newVehicle.color}
                    className="w-full py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors">
                    {createMutation.isPending ? 'Adding...' : 'Add Vehicle'}
                  </button>
                </form>
              </div>
            </div>
          </>
        )}

        {/* Assign Modal */}
        {assignModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign Vehicle to Rider</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {assignModal.currentRiderId && (
                  <button
                    onClick={() => { assignMutation.mutate({ vehicleId: assignModal.vehicleId, riderId: null }); setAssignModal(null); }}
                    className="w-full p-3 border border-red-200 rounded-lg text-left hover:bg-red-50 text-sm text-red-600"
                  >
                    ✕ Unassign current rider
                  </button>
                )}
                {riders?.map((rider: any) => (
                  <button
                    key={rider._id}
                    onClick={() => { assignMutation.mutate({ vehicleId: assignModal.vehicleId, riderId: rider._id }); setAssignModal(null); }}
                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="text-sm font-medium">{rider.userId?.name || 'Unknown'}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${rider.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {rider.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </button>
                ))}
              </div>
              <button onClick={() => setAssignModal(null)} className="mt-4 w-full py-2 border border-gray-300 rounded-lg text-sm text-gray-600">Cancel</button>
            </div>
          </div>
        )}

        {/* Status Modal */}
        {statusModal && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Vehicle Status</h3>
              <div className="space-y-2">
                {['active', 'maintenance', 'retired'].map(s => (
                  <button
                    key={s}
                    onClick={() => {
                      if (s === 'maintenance' && !maintenanceNotes) {
                        // Show notes input
                        return;
                      }
                      statusMutation.mutate({ vehicleId: statusModal.vehicleId, status: s, maintenanceNotes: s === 'maintenance' ? maintenanceNotes : undefined });
                      setStatusModal(null);
                      setMaintenanceNotes('');
                    }}
                    disabled={statusModal.currentStatus === s}
                    className={`w-full p-3 border rounded-lg text-left text-sm capitalize transition-colors disabled:opacity-40 ${
                      statusModal.currentStatus === s ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span className={`inline-block w-2 h-2 rounded-full mr-2 ${s === 'active' ? 'bg-green-500' : s === 'maintenance' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                    {s} {statusModal.currentStatus === s && '(current)'}
                  </button>
                ))}
              </div>
              <textarea
                value={maintenanceNotes}
                onChange={e => setMaintenanceNotes(e.target.value)}
                placeholder="Maintenance notes (optional)..."
                className="mt-3 w-full border border-gray-200 rounded-lg p-3 text-sm"
                rows={2}
              />
              <div className="mt-3 flex space-x-2">
                <button onClick={() => { setStatusModal(null); setMaintenanceNotes(''); }} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm">Cancel</button>
                <button
                  onClick={() => {
                    const s = statusModal.currentStatus === 'active' ? 'maintenance' : 'active';
                    statusMutation.mutate({ vehicleId: statusModal.vehicleId, status: s, maintenanceNotes });
                    setStatusModal(null);
                    setMaintenanceNotes('');
                  }}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
