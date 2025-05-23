// resources/js/Pages/Map/Index.tsx
import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
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

// Komponen untuk menangani klik pada peta
const MapClickHandler = ({
  isAddingMarker,
  onMapClick
}: {
  isAddingMarker: boolean;
  onMapClick: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click: (e) => {
      if (isAddingMarker) {
        onMapClick(e.latlng.lat, e.latlng.lng);
      }
    },
  });

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

interface NewMarkerData {
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

  // State untuk menambah marker baru
  const [isAddingMarker, setIsAddingMarker] = useState<boolean>(false);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [newMarkerPosition, setNewMarkerPosition] = useState<[number, number] | null>(null);
  const [newMarkerData, setNewMarkerData] = useState<NewMarkerData>({
    no_kk: '',
    nama_kepala_keluarga: '',
    alamat: '',
    status_ekonomi: 'miskin',
    latitude: 0,
    longitude: 0
  });
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    fetchKeluarga();

    // Set CSRF token untuk semua request axios
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) {
      axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
      console.log('CSRF token set:', token.substring(0, 10) + '...'); // Debug log
    } else {
      console.error('CSRF token not found');
    }
  }, []);

  const fetchKeluarga = () => {
    setLoading(true);
    axios.get('/api/keluarga')
      .then(response => {
        setKeluarga(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  };

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

  // Icon untuk marker sementara (sedang ditambahkan)
  const getTempMarkerIcon = () => {
    return new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png`,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  // Handler untuk memulai mode menambah marker
  const handleStartAddMarker = () => {
    setIsAddingMarker(true);
    setShowAddForm(false);
    setNewMarkerPosition(null);
  };

  // Handler untuk membatalkan penambahan marker
  const handleCancelAddMarker = () => {
    setIsAddingMarker(false);
    setShowAddForm(false);
    setNewMarkerPosition(null);
    setNewMarkerData({
      no_kk: '',
      nama_kepala_keluarga: '',
      alamat: '',
      status_ekonomi: 'miskin',
      latitude: 0,
      longitude: 0
    });
  };

  // Handler untuk klik pada peta (menambah marker)
  const handleMapClick = (lat: number, lng: number) => {
    setNewMarkerPosition([lat, lng]);
    setNewMarkerData(prev => ({
      ...prev,
      latitude: lat,
      longitude: lng
    }));
    setShowAddForm(true);
    setIsAddingMarker(false);
  };

  // Handler untuk menyimpan data keluarga baru
  const handleSaveNewMarker = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMarkerData.no_kk || !newMarkerData.nama_kepala_keluarga || !newMarkerData.alamat) {
      alert('Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    setIsSaving(true);

    try {
      console.log('Data yang akan dikirim:', newMarkerData);

      // Pastikan CSRF token ada sebelum mengirim request
      const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      if (!token) {
        throw new Error('CSRF token not found');
      }

      const response = await axios.post('/api/keluarga', newMarkerData, {
        headers: {
          'X-CSRF-TOKEN': token,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.status === 201) {
        // Tambahkan data baru ke state
        setKeluarga(prev => [...prev, response.data]);

        // Reset form dan state
        handleCancelAddMarker();

        alert('Data keluarga berhasil ditambahkan!');
      }
    } catch (error: any) {
      console.error('Error saving data:', error);

      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const data = error.response.data;

        console.error('Response status:', status);
        console.error('Response data:', data);

        switch (status) {
          case 422:
            // Validation error
            const errors = data.errors || {};
            const errorMessages = Object.values(errors).flat().join('\n');
            alert('Validasi gagal:\n' + errorMessages);
            break;
          case 419:
            // CSRF Token Mismatch
            alert('Session expired. Silakan refresh halaman dan coba lagi.');
            window.location.reload();
            break;
          case 401:
            // Unauthorized
            alert('Anda perlu login untuk menambah data.');
            window.location.href = '/login';
            break;
          case 500:
            // Server error
            alert(data.message || 'Terjadi kesalahan server. Silakan coba lagi.');
            break;
          default:
            alert(`Error ${status}: ${data.message || 'Terjadi kesalahan. Silakan coba lagi.'}`);
        }
      } else if (error.request) {
        // Request was made but no response received
        console.error('No response received:', error.request);
        alert('Tidak ada respon dari server. Periksa koneksi internet Anda.');
      } else {
        // Something else happened
        console.error('Error:', error.message);
        alert('Terjadi kesalahan: ' + error.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handler untuk mengubah input form
  const handleInputChange = (field: keyof NewMarkerData, value: string) => {
    setNewMarkerData(prev => ({
      ...prev,
      [field]: value
    }));
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
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold">Peta Sebaran Penduduk Miskin</h3>
                  <p className="text-sm text-gray-600">
                    Klik pada marker untuk melihat detail keluarga.
                  </p>
                </div>

                <div className="flex space-x-2">
                  {!isAddingMarker && !showAddForm && (
                    <button
                      onClick={handleStartAddMarker}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Tambah Marker
                    </button>
                  )}

                  {(isAddingMarker || showAddForm) && (
                    <button
                      onClick={handleCancelAddMarker}
                      className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </div>

              {isAddingMarker && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-blue-800 font-medium">
                    Mode Tambah Marker Aktif - Klik pada peta untuk menambah lokasi baru
                  </p>
                </div>
              )}

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
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                  <span>Marker Baru</span>
                </div>
              </div>

              <div className="flex gap-6">
                <div className={`${showAddForm ? 'w-2/3' : 'w-full'} transition-all duration-300`}>
                  <div style={{ height: '600px', width: '100%' }}>
                    <MapContainer
                      center={center}
                      zoom={zoom}
                      style={{ height: '100%', width: '100%' }}
                    >
                      <MapResizer />
                      <MapClickHandler
                        isAddingMarker={isAddingMarker}
                        onMapClick={handleMapClick}
                      />

                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      />

                      {/* Marker keluarga yang sudah ada */}
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

                      {/* Marker sementara untuk lokasi baru */}
                      {newMarkerPosition && (
                        <Marker
                          position={newMarkerPosition}
                          icon={getTempMarkerIcon()}
                        >
                          <Popup>
                            <div>
                              <p className="font-semibold text-green-600">Lokasi Baru</p>
                              <p>Lat: {newMarkerPosition[0].toFixed(6)}</p>
                              <p>Lng: {newMarkerPosition[1].toFixed(6)}</p>
                            </div>
                          </Popup>
                        </Marker>
                      )}
                    </MapContainer>
                  </div>
                </div>

                {/* Form untuk menambah data keluarga baru */}
                {showAddForm && (
                  <div className="w-1/3 bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-lg font-semibold mb-4">Tambah Data Keluarga</h4>

                    <form onSubmit={handleSaveNewMarker} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          No. Kartu Keluarga *
                        </label>
                        <input
                          type="text"
                          value={newMarkerData.no_kk}
                          onChange={(e) => handleInputChange('no_kk', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nama Kepala Keluarga *
                        </label>
                        <input
                          type="text"
                          value={newMarkerData.nama_kepala_keluarga}
                          onChange={(e) => handleInputChange('nama_kepala_keluarga', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Alamat *
                        </label>
                        <textarea
                          value={newMarkerData.alamat}
                          onChange={(e) => handleInputChange('alamat', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={3}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status Ekonomi *
                        </label>
                        <select
                          value={newMarkerData.status_ekonomi}
                          onChange={(e) => handleInputChange('status_ekonomi', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="miskin">Miskin</option>
                          <option value="sangat_miskin">Sangat Miskin</option>
                          <option value="rentan_miskin">Rentan Miskin</option>
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Latitude
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={newMarkerData.latitude}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Longitude
                          </label>
                          <input
                            type="number"
                            step="any"
                            value={newMarkerData.longitude}
                            readOnly
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100"
                          />
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className={`flex-1 py-2 px-4 rounded-md text-white font-medium ${
                            isSaving
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-green-500 hover:bg-green-600'
                          }`}
                        >
                          {isSaving ? 'Menyimpan...' : 'Simpan'}
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelAddMarker}
                          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-md"
                        >
                          Batal
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
