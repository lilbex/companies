'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerProps {
  value: { latitude: number; longitude: number } | null;
  onChange: (coords: { latitude: number; longitude: number }) => void;
}

// Click-anywhere-to-drop-a-pin location picker for the merchant setup form.
// Mirrors the Leaflet + OpenStreetMap tile pattern already used in
// components/LiveMap.tsx, so it needs no new dependency. Must be loaded via
// next/dynamic({ ssr: false }) wherever it's used — Leaflet touches `window`.
export default function LocationPicker({ value, onChange }: LocationPickerProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const fallback: [number, number] = [6.3350, 5.6037]; // Benin City fallback, matches LiveMap.tsx
    const center: [number, number] = value ? [value.latitude, value.longitude] : fallback;

    const map = L.map(containerRef.current, { center, zoom: 14, zoomControl: true });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    const placeMarker = (lat: number, lng: number) => {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(map);
        markerRef.current.on('dragend', () => {
          const pos = markerRef.current!.getLatLng();
          onChangeRef.current({ latitude: pos.lat, longitude: pos.lng });
        });
      }
    };

    if (value) placeMarker(value.latitude, value.longitude);

    map.on('click', (e: L.LeafletMouseEvent) => {
      placeMarker(e.latlng.lat, e.latlng.lng);
      onChangeRef.current({ latitude: e.latlng.lat, longitude: e.latlng.lng });
    });

    if (!value && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          map.setView([latitude, longitude], 15);
        },
        () => { /* keep fallback center */ },
        { enableHighAccuracy: true, timeout: 5000 },
      );
    }

    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        mapRef.current!.setView([latitude, longitude], 16);
        if (markerRef.current) {
          markerRef.current.setLatLng([latitude, longitude]);
        } else {
          markerRef.current = L.marker([latitude, longitude], { draggable: true }).addTo(mapRef.current!);
          markerRef.current.on('dragend', () => {
            const pos = markerRef.current!.getLatLng();
            onChangeRef.current({ latitude: pos.lat, longitude: pos.lng });
          });
        }
        onChangeRef.current({ latitude, longitude });
      },
      () => alert('Could not get your current location. Please tap the map to place a pin instead.'),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-gray-500">Tap the map (or drag the pin) to set your restaurant&apos;s exact location.</p>
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="text-xs font-medium text-green-600 hover:text-green-700 whitespace-nowrap ml-2"
        >
          📍 Use my location
        </button>
      </div>
      <div ref={containerRef} style={{ height: '280px', width: '100%' }} className="rounded-lg border border-gray-300" />
      {value && (
        <p className="text-xs text-gray-400 mt-1">
          {value.latitude.toFixed(6)}, {value.longitude.toFixed(6)}
        </p>
      )}
    </div>
  );
}
