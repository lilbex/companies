'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface RiderMarker {
  id: string;
  name: string;
  coords: [number, number]; // [lat, lng]
  isAvailable: boolean;
  phone?: string;
  rating?: number;
}

interface LiveMapProps {
  riders: RiderMarker[];
  selectedRiderId?: string;
  onRiderSelect: (id: string) => void;
}

export default function LiveMap({ riders, selectedRiderId, onRiderSelect }: LiveMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const initialFitDone = useRef(false);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Start with a temporary center, then move to user's location
    const fallback: [number, number] = [6.3350, 5.6037]; // Benin City fallback
    const center = riders.length > 0 ? riders[0].coords : fallback;

    const map = L.map(containerRef.current, {
      center,
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    // Get user's current location and center map there
    if (riders.length === 0 && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 13);
        },
        () => { /* keep fallback center */ },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }

    return () => {
      map.remove();
      mapRef.current = null;
      initialFitDone.current = false;
    };
  }, []);

  // Update markers when riders change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const currentIds = new Set(riders.map(r => r.id));

    // Remove markers for riders no longer present
    markersRef.current.forEach((marker, id) => {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add/update markers
    riders.forEach(rider => {
      const existing = markersRef.current.get(rider.id);

      const icon = L.divIcon({
        className: 'custom-rider-marker',
        html: `<div style="
          width: 32px; height: 32px;
          background: ${rider.isAvailable ? '#10B981' : '#F59E0B'};
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 14px;
          ${selectedRiderId === rider.id ? 'transform: scale(1.4); border-color: #3B82F6;' : ''}
        ">🏍️</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      if (existing) {
        existing.setLatLng(rider.coords);
        existing.setIcon(icon);
      } else {
        const marker = L.marker(rider.coords, { icon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width: 150px;">
              <strong>${rider.name}</strong><br/>
              <span style="color: ${rider.isAvailable ? 'green' : 'orange'};">
                ${rider.isAvailable ? '● Available' : '● Busy'}
              </span><br/>
              ${rider.phone ? `📞 ${rider.phone}<br/>` : ''}
              ⭐ ${rider.rating?.toFixed(1) || '-'}
            </div>
          `);

        marker.on('click', () => onRiderSelect(rider.id));
        markersRef.current.set(rider.id, marker);
      }
    });

    // Fit bounds if we have riders (only on first load or new riders appearing)
    if (riders.length > 0) {
      const bounds = L.latLngBounds(riders.map(r => r.coords));
      if (!initialFitDone.current) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
        initialFitDone.current = true;
      }
    }
  }, [riders, selectedRiderId, onRiderSelect]);

  // Pan to selected rider
  useEffect(() => {
    if (!selectedRiderId || !mapRef.current) return;
    const rider = riders.find(r => r.id === selectedRiderId);
    if (rider) {
      mapRef.current.setView(rider.coords, 15, { animate: true });
      const marker = markersRef.current.get(rider.id);
      if (marker) marker.openPopup();
    }
  }, [selectedRiderId, riders]);

  return (
    <div
      ref={containerRef}
      style={{ height: '500px', width: '100%' }}
      className="rounded-lg"
    />
  );
}
