'use client';

import { useLiveTracking, useCompany } from '@/lib/hooks';
import DashboardLayout from '@/components/DashboardLayout';
import LoadingSpinner from '@/components/LoadingSpinner';
import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import dynamic from 'next/dynamic';

const API_URL = process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://city-wheels-617494bca04d.herokuapp.com'
    : 'http://192.168.1.47:4000');

// Dynamically import map to avoid SSR issues with Leaflet
const LiveMap = dynamic(() => import('@/components/LiveMap'), { ssr: false });

export default function TrackingPage() {
  const { data: riders, isLoading, refetch } = useLiveTracking();
  const { data: company } = useCompany();
  const [selectedRider, setSelectedRider] = useState<any>(null);
  const [liveLocations, setLiveLocations] = useState<Record<string, { lat: number; lng: number; timestamp: number }>>({});
  const socketRef = useRef<Socket | null>(null);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('managerToken') : null;
    if (!token || !company?._id) return;

    const socket = io(`${API_URL}/tracking`, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      console.log('✅ Connected to tracking WebSocket');
      socket.emit('company:subscribe', { companyId: company._id });
    });

    socket.on('rider:location', (data: { riderId?: string; latitude: number; longitude: number; timestamp: number }) => {
      if (data.riderId) {
        setLiveLocations(prev => ({
          ...prev,
          [data.riderId!]: { lat: data.latitude, lng: data.longitude, timestamp: data.timestamp },
        }));
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from tracking WebSocket');
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [company?._id]);

  // Auto-refresh rider list every 10s
  useEffect(() => {
    const interval = setInterval(() => refetch(), 10000);
    return () => clearInterval(interval);
  }, [refetch]);

  // Merge REST data with live WebSocket locations
  const ridersWithLiveLocation = riders?.map((rider: any) => {
    const live = liveLocations[rider.id];
    if (live) {
      return { ...rider, location: { coordinates: [live.lng, live.lat] }, lastUpdate: live.timestamp };
    }
    return rider;
  }) || [];

  const getCoords = useCallback((rider: any): [number, number] | null => {
    if (rider.location?.coordinates && rider.location.coordinates.length === 2) {
      const [lng, lat] = rider.location.coordinates;
      if (lat && lng && lat !== 0 && lng !== 0) return [lat, lng];
    }
    return null;
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Loading live tracking data..." size="lg" />
      </DashboardLayout>
    );
  }

  const ridersWithCoords = ridersWithLiveLocation.filter((r: any) => getCoords(r) !== null);
  const ridersWithoutCoords = ridersWithLiveLocation.filter((r: any) => getCoords(r) === null);

  return (
    <DashboardLayout>
      <div className="flex-1 overflow-auto bg-gray-50">
        <header className="bg-white shadow">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Live Fleet Tracking</h1>
                <p className="text-sm text-gray-600">Real-time rider locations on map</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-sm text-gray-600">
                    <span className="font-medium text-green-600">{ridersWithCoords.length}</span> on map
                  </span>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-yellow-600">{ridersWithoutCoords.length}</span> no GPS
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium text-blue-600">{ridersWithLiveLocation.length}</span> total online
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Map */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <LiveMap
                  riders={ridersWithCoords.map((r: any) => ({
                    id: r.id,
                    name: r.name,
                    coords: getCoords(r)!,
                    isAvailable: r.isAvailable,
                    phone: r.phone,
                    rating: r.rating,
                  }))}
                  selectedRiderId={selectedRider?.id}
                  onRiderSelect={(id) => {
                    const r = ridersWithLiveLocation.find((rider: any) => rider.id === id);
                    setSelectedRider(r || null);
                  }}
                />
              </div>
            </div>

            {/* Rider List */}
            <div className="bg-white rounded-lg shadow flex flex-col max-h-[calc(100vh-220px)]">
              <div className="px-4 py-3 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Online Riders</h3>
              </div>
              <div className="flex-1 overflow-y-auto">
                {ridersWithLiveLocation.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {ridersWithLiveLocation.map((rider: any) => {
                      const coords = getCoords(rider);
                      return (
                        <div
                          key={rider.id}
                          className={`p-4 cursor-pointer hover:bg-gray-50 ${
                            selectedRider?.id === rider.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                          }`}
                          onClick={() => setSelectedRider(rider)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{rider.name}</div>
                              <div className="text-xs text-gray-500">{rider.phone}</div>
                              {coords && (
                                <div className="text-xs text-green-600 mt-0.5">
                                  📍 {coords[0].toFixed(4)}, {coords[1].toFixed(4)}
                                </div>
                              )}
                              {!coords && (
                                <div className="text-xs text-red-400 mt-0.5">⚠️ No GPS signal</div>
                              )}
                            </div>
                            <div className="text-right">
                              <div className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                rider.isAvailable
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {rider.isAvailable ? 'Available' : 'Busy'}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                ⭐ {rider.rating?.toFixed(1) || '4.0'}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <div className="text-3xl mb-2">🏍️</div>
                    No riders are currently online
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Selected Rider Details */}
          {selectedRider && (
            <div className="mt-6 bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Rider Details</h3>
                <button onClick={() => setSelectedRider(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Personal Info</h4>
                    <div className="mt-2">
                      <div className="text-lg font-medium text-gray-900">{selectedRider.name}</div>
                      <div className="text-sm text-gray-600">{selectedRider.phone}</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Performance</h4>
                    <div className="mt-2">
                      <div className="text-lg font-medium text-gray-900">⭐ {selectedRider.rating?.toFixed(1) || '-'}</div>
                      <div className="text-sm text-gray-600">{selectedRider.totalDeliveries || 0} deliveries</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Status</h4>
                    <div className="mt-2">
                      <div className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                        selectedRider.isAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedRider.isAvailable ? 'Available' : 'Busy'}
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Location</h4>
                    <div className="mt-2">
                      {getCoords(selectedRider) ? (
                        <div className="text-sm text-gray-900 font-mono">
                          {getCoords(selectedRider)![0].toFixed(5)}, {getCoords(selectedRider)![1].toFixed(5)}
                        </div>
                      ) : (
                        <div className="text-sm text-red-500">No GPS data</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </DashboardLayout>
  );
}
