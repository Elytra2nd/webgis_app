// resources/js/Components/Map/MapDrawing.tsx
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix untuk icon marker Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapDrawingProps {
  keluargaId: number | null;
  onSave: (point: { lat: number; lng: number }) => void;
  initialLat?: number;
  initialLng?: number;
  existingMarker?: { lat: number; lng: number } | null;
}

export default function MapDrawing({
  keluargaId = null,
  onSave,
  initialLat = -2.548926,
  initialLng = 118.0148634,
  existingMarker = null
}: MapDrawingProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [currentMarker, setCurrentMarker] = useState<{ lat: number; lng: number } | null>(existingMarker);
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
      // Tentukan center peta berdasarkan existing marker atau default
      const centerLat = existingMarker?.lat || initialLat;
      const centerLng = existingMarker?.lng || initialLng;
      const zoomLevel = existingMarker ? 15 : 5; // Zoom lebih dekat jika ada marker existing

      // Inisialisasi peta
      const map = L.map(mapRef.current, {
        center: [centerLat, centerLng],
        zoom: zoomLevel,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        touchZoom: true,
        dragging: true
      });

      // Tambahkan tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;

      // Tambahkan existing marker jika ada
      if (existingMarker) {
        const existingMarkerInstance = L.marker([existingMarker.lat, existingMarker.lng], {
          draggable: true,
          title: 'Lokasi Keluarga (Existing)'
        }).addTo(map);

        existingMarkerInstance.bindPopup(`
          <div class="text-center">
            <strong>Lokasi Keluarga</strong><br>
            <small>Lokasi saat ini</small><br>
            Lat: ${existingMarker.lat.toFixed(6)}<br>
            Lng: ${existingMarker.lng.toFixed(6)}<br>
            <button onclick="window.saveMarkerLocation()" class="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm">
              Update Lokasi
            </button>
          </div>
        `);

        // Event listener untuk drag existing marker
        existingMarkerInstance.on('dragend', (dragEvent: any) => {
          const position = dragEvent.target.getLatLng();
          setCurrentMarker({ lat: position.lat, lng: position.lng });

          existingMarkerInstance.setPopupContent(`
            <div class="text-center">
              <strong>Lokasi Keluarga</strong><br>
              <small>Posisi baru</small><br>
              Lat: ${position.lat.toFixed(6)}<br>
              Lng: ${position.lng.toFixed(6)}<br>
              <button onclick="window.saveMarkerLocation()" class="mt-2 px-3 py-1 bg-green-500 text-white rounded text-sm">
                Simpan Perubahan
              </button>
            </div>
          `);
        });

        markerRef.current = existingMarkerInstance;
      }

      // Event listener untuk klik pada peta (menambah marker baru atau memindahkan existing)
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;

        console.log('Map clicked at:', { lat, lng });

        // Hapus marker sebelumnya jika ada
        if (markerRef.current) {
          map.removeLayer(markerRef.current);
        }

        // Tambah marker baru di posisi klik
        const newMarker = L.marker([lat, lng], {
          draggable: true,
          title: 'Lokasi Keluarga'
        }).addTo(map);

        const isNewLocation = !existingMarker ||
          (Math.abs(existingMarker.lat - lat) > 0.0001 || Math.abs(existingMarker.lng - lng) > 0.0001);

        newMarker.bindPopup(`
          <div class="text-center">
            <strong>Lokasi Keluarga</strong><br>
            <small>${isNewLocation ? 'Lokasi baru' : 'Lokasi diperbarui'}</small><br>
            Lat: ${lat.toFixed(6)}<br>
            Lng: ${lng.toFixed(6)}<br>
            <button onclick="window.saveMarkerLocation()" class="mt-2 px-3 py-1 bg-green-500 text-white rounded text-sm">
              ${isNewLocation ? 'Simpan Lokasi Baru' : 'Update Lokasi'}
            </button>
          </div>
        `).openPopup();

        // Event listener untuk drag marker baru
        newMarker.on('dragend', (dragEvent: any) => {
          const position = dragEvent.target.getLatLng();
          setCurrentMarker({ lat: position.lat, lng: position.lng });

          newMarker.setPopupContent(`
            <div class="text-center">
              <strong>Lokasi Keluarga</strong><br>
              <small>Posisi disesuaikan</small><br>
              Lat: ${position.lat.toFixed(6)}<br>
              Lng: ${position.lng.toFixed(6)}<br>
              <button onclick="window.saveMarkerLocation()" class="mt-2 px-3 py-1 bg-green-500 text-white rounded text-sm">
                Simpan Perubahan
              </button>
            </div>
          `);
        });

        markerRef.current = newMarker;
        setCurrentMarker({ lat, lng });
      });

      // Global function untuk save marker
      (window as any).saveMarkerLocation = () => {
        if (currentMarker) {
          console.log('Saving marker location:', currentMarker);
          onSave(currentMarker);
        }
      };

      setIsMapReady(true);

      // Cleanup function
      return () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
        delete (window as any).saveMarkerLocation;
      };

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [initialLat, initialLng, onSave]);

  // Update currentMarker ketika existingMarker berubah
  useEffect(() => {
    setCurrentMarker(existingMarker);
  }, [existingMarker]);

  const handleSaveLocation = () => {
    if (currentMarker) {
      console.log('Manual save triggered:', currentMarker);
      onSave(currentMarker);
    } else {
      alert('Silakan klik pada peta untuk menentukan lokasi terlebih dahulu');
    }
  };

  const handleClearMarker = () => {
    if (markerRef.current && mapInstanceRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
      setCurrentMarker(null);
    }
  };

  const handleResetToOriginal = () => {
    if (existingMarker && mapInstanceRef.current) {
      // Hapus marker saat ini
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
      }

      // Tambah marker di posisi original
      const originalMarker = L.marker([existingMarker.lat, existingMarker.lng], {
        draggable: true,
        title: 'Lokasi Keluarga (Original)'
      }).addTo(mapInstanceRef.current);

      originalMarker.bindPopup(`
        <div class="text-center">
          <strong>Lokasi Keluarga</strong><br>
          <small>Lokasi original</small><br>
          Lat: ${existingMarker.lat.toFixed(6)}<br>
          Lng: ${existingMarker.lng.toFixed(6)}<br>
        </div>
      `).openPopup();

      markerRef.current = originalMarker;
      setCurrentMarker(existingMarker);

      // Pan ke lokasi original
      mapInstanceRef.current.setView([existingMarker.lat, existingMarker.lng], 15);
    }
  };

  return (
    <div className="w-full h-full relative">
      {/* Map Container */}
      <div
        ref={mapRef}
        className="w-full h-full rounded-lg"
        style={{ minHeight: '400px' }}
      />

      {/* Control Panel */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <div className="space-y-2">
          <div className="text-xs font-medium text-gray-700">
            Kontrol Peta
          </div>

          {currentMarker && (
            <div className="text-xs text-gray-600 mb-2">
              <div>Lat: {currentMarker.lat.toFixed(6)}</div>
              <div>Lng: {currentMarker.lng.toFixed(6)}</div>
              {existingMarker && (
                <div className="text-xs text-blue-600 mt-1">
                  {(Math.abs(existingMarker.lat - currentMarker.lat) > 0.0001 ||
                    Math.abs(existingMarker.lng - currentMarker.lng) > 0.0001)
                    ? '• Posisi berubah'
                    : '• Posisi sama'}
                </div>
              )}
            </div>
          )}

          <div className="space-y-1">
            <button
              onClick={handleSaveLocation}
              disabled={!currentMarker}
              className={`w-full px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                currentMarker
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Simpan Lokasi
            </button>

            {existingMarker && (
              <button
                onClick={handleResetToOriginal}
                className="w-full px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 transition-colors"
              >
                Reset ke Original
              </button>
            )}

            <button
              onClick={handleClearMarker}
              disabled={!currentMarker}
              className={`w-full px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                currentMarker
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Hapus Marker
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000] max-w-xs">
        <div className="text-xs text-gray-700">
          <div className="font-medium mb-1">Cara Penggunaan:</div>
          <ul className="space-y-1 text-xs">
            <li>• Klik pada peta untuk {existingMarker ? 'memindahkan' : 'menambah'} marker</li>
            <li>• Drag marker untuk mengubah posisi</li>
            <li>• Klik "Simpan Lokasi" untuk menyimpan</li>
            {existingMarker && <li>• Klik "Reset" untuk kembali ke posisi original</li>}
          </ul>
        </div>
      </div>

      {/* Loading Indicator */}
      {!isMapReady && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <div className="text-sm text-gray-600">Memuat peta...</div>
          </div>
        </div>
      )}
    </div>
  );
}
