// resources/js/Pages/Map/Index.tsx
import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { PageProps } from '@/types';

// Fix icon issues
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Komponen untuk memastikan peta di-resize dengan benar
const MapResizer = () => {
  const map = useMap();

  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 100);
  }, [map]);

  return null;
};

interface Keluarga {
  id: number;
  no_kk: string;
  nama_kepala_keluarga: string;
  alamat: string;
  status_ekonomi: string;
  latitude: number;
  longitude: number;
}

export default function MapIndex({ auth }: PageProps) {
  const [keluarga, setKeluarga] = useState<Keluarga[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [center] = useState<[number, number]>([-2.5489, 118.0149]); // Koordinat tengah Indonesia
  const [zoom] = useState<number>(5);

  useEffect(() => {
    axios.get('/api/keluarga')
      .then(response => {
        setKeluarga(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  // Custom marker icon berdasarkan status ekonomi
  const getMarkerIcon = (status: string) => {
    let color = 'blue';

    switch (status) {
      case 'sangat_miskin':
        color = 'red';
        break;
      case 'miskin':
        color = 'orange';
        break;
      case 'rentan_miskin':
        color = 'yellow';
        break;
    }

    return new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Peta Penduduk Miskin</h2>}
    >
      <Head title="Peta Penduduk Miskin" />

      <div className="py-12">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
            <div className="p-6 bg-white border-b border-gray-200">
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Peta Sebaran Penduduk Miskin</h3>
                <p className="text-sm text-gray-600">
                  Klik pada marker untuk melihat detail keluarga.
                </p>
              </div>

              <div className="mb-4 flex space-x-4">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                  <span>Sangat Miskin</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-500 rounded-full mr-2"></div>
                  <span>Miskin</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
                  <span>Rentan Miskin</span>
                </div>
              </div>

              <div style={{ height: '600px', width: '100%' }}>
                <MapContainer
                  center={center}
                  zoom={zoom}
                  style={{ height: '100%', width: '100%' }}
                >
                  <MapResizer />
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />

                  {!loading && keluarga.map(item => (
                    item.latitude && item.longitude ? (
                      <Marker
                        key={item.id}
                        position={[item.latitude, item.longitude]}
                        icon={getMarkerIcon(item.status_ekonomi)}
                      >
                        <Popup>
                          <div>
                            <h3 className="font-semibold">{item.nama_kepala_keluarga}</h3>
                            <p>No. KK: {item.no_kk}</p>
                            <p>Alamat: {item.alamat}</p>
                            <p>Status: {item.status_ekonomi.replace('_', ' ')}</p>
                            <div className="mt-2">
                              <a
                                href={`/keluarga/${item.id}`}
                                className="text-blue-500 hover:underline"
                                target="_blank"
                              >
                                Lihat Detail
                              </a>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ) : null
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
