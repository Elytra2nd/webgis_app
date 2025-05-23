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

  // Breadcrumb
  const breadcrumbs = [
    { label: 'Dashboard', href: route('dashboard') },
    { label: 'Peta Penduduk', active: true }
  ];

  useEffect(() => {
    fetchKeluarga();

    // Set CSRF token untuk semua request axios
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (token) {
      axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
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

  // Custom marker icon berdasarkan status ekonomi dengan warna aqua theme
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
        color = 'violet'; // Menggunakan warna yang lebih sesuai dengan tema aqua
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
        setKeluarga(prev => [...prev, response.data]);
        handleCancelAddMarker();
        alert('Data keluarga berhasil ditambahkan!');
      }
    } catch (error: any) {
      console.error('Error saving data:', error);

      if (error.response) {
        const status = error.response.status;
        const data = error.response.data;

        switch (status) {
          case 422:
            const errors = data.errors || {};
            const errorMessages = Object.values(errors).flat().join('\n');
            alert('Validasi gagal:\n' + errorMessages);
            break;
          case 419:
            alert('Session expired. Silakan refresh halaman dan coba lagi.');
            window.location.reload();
            break;
          case 401:
            alert('Anda perlu login untuk menambah data.');
            window.location.href = '/login';
            break;
          case 500:
            alert(data.message || 'Terjadi kesalahan server. Silakan coba lagi.');
            break;
          default:
            alert(`Error ${status}: ${data.message || 'Terjadi kesalahan. Silakan coba lagi.'}`);
        }
      } else if (error.request) {
        alert('Tidak ada respon dari server. Periksa koneksi internet Anda.');
      } else {
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

  // Get statistics
  const getStats = () => {
    return {
      total: keluarga.length,
      sangat_miskin: keluarga.filter(k => k.status_ekonomi === 'sangat_miskin').length,
      miskin: keluarga.filter(k => k.status_ekonomi === 'miskin').length,
      rentan_miskin: keluarga.filter(k => k.status_ekonomi === 'rentan_miskin').length,
    };
  };

  const stats = getStats();

  return (
    <AuthenticatedLayout
      user={auth.user}
      breadcrumbs={breadcrumbs}
      header={
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-full animate-pulse"></div>
          <h2 className="font-light text-2xl text-gray-900">Peta Penduduk Miskin</h2>
        </div>
      }
    >
      <Head title="Peta Penduduk Miskin" />

      <div className="space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100/50 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Marker</p>
                <p className="text-3xl font-light text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-100 to-teal-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100/50 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Sangat Miskin</p>
                <p className="text-3xl font-light text-red-700">{stats.sangat_miskin}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100/50 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Miskin</p>
                <p className="text-3xl font-light text-amber-700">{stats.miskin}</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100/50 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-violet-600">Rentan Miskin</p>
                <p className="text-3xl font-light text-violet-700">{stats.rentan_miskin}</p>
              </div>
              <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center">
                <div className="w-4 h-4 bg-violet-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Map Container */}
        <div className="bg-white rounded-2xl border border-gray-100/50 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="p-8 border-b border-gray-100/50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Peta Sebaran Penduduk Miskin</h3>
                <p className="text-sm text-gray-600">
                  Klik pada marker untuk melihat detail keluarga atau tambah marker baru.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {!isAddingMarker && !showAddForm && (
                  <button
                    onClick={handleStartAddMarker}
                    className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-teal-500 text-white font-medium rounded-lg hover:from-cyan-600 hover:to-teal-600 focus:outline-none focus:ring-4 focus:ring-cyan-200 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Tambah Marker
                  </button>
                )}

                {(isAddingMarker || showAddForm) && (
                  <button
                    onClick={handleCancelAddMarker}
                    className="inline-flex items-center px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-200"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Batal
                  </button>
                )}
              </div>
            </div>

            {/* Mode Indicator */}
            {isAddingMarker && (
              <div className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200 rounded-xl animate-pulse">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mr-3 animate-ping"></div>
                  <p className="text-cyan-800 font-medium">
                    Mode Tambah Marker Aktif - Klik pada peta untuk menambah lokasi baru
                  </p>
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="mt-6 flex flex-wrap gap-6">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-2 shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">Sangat Miskin</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-orange-500 rounded-full mr-2 shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">Miskin</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-violet-500 rounded-full mr-2 shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">Rentan Miskin</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2 shadow-sm"></div>
                <span className="text-sm font-medium text-gray-700">Marker Baru</span>
              </div>
            </div>
          </div>

          {/* Map and Form Container */}
          <div className="flex flex-col lg:flex-row">
            <div className={`${showAddForm ? 'lg:w-2/3' : 'w-full'} transition-all duration-300`}>
              <div className="h-[600px] lg:h-[700px] relative">
                {loading && (
                  <div className="absolute inset-0 bg-gray-50 flex items-center justify-center z-10">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 border-4 border-cyan-200 border-t-cyan-500 rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-600">Memuat peta...</p>
                    </div>
                  </div>
                )}

                <MapContainer
                  center={center}
                  zoom={zoom}
                  style={{ height: '100%', width: '100%' }}
                  className="rounded-b-2xl lg:rounded-br-none lg:rounded-bl-2xl"
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
                        <Popup className="custom-popup">
                          <div className="p-2">
                            <h3 className="font-semibold text-gray-900 mb-2">{item.nama_kepala_keluarga}</h3>
                            <div className="space-y-1 text-sm">
                              <p><span className="font-medium">No. KK:</span> {item.no_kk}</p>
                              <p><span className="font-medium">Alamat:</span> {item.alamat}</p>
                              <p>
                                <span className="font-medium">Status:</span>
                                <span className={`ml-1 px-2 py-0.5 rounded text-xs font-medium ${
                                  item.status_ekonomi === 'sangat_miskin' ? 'bg-red-100 text-red-700' :
                                  item.status_ekonomi === 'miskin' ? 'bg-amber-100 text-amber-700' :
                                  'bg-violet-100 text-violet-700'
                                }`}>
                                  {item.status_ekonomi.replace('_', ' ')}
                                </span>
                              </p>
                            </div>
                            <div className="mt-3 pt-2 border-t border-gray-100">
                              <a
                                href={`/keluarga/${item.id}`}
                                className="inline-flex items-center text-cyan-600 hover:text-cyan-800 text-sm font-medium"
                                target="_blank"
                              >
                                Lihat Detail
                                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
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
                        <div className="p-2">
                          <p className="font-semibold text-green-600 mb-1">Lokasi Baru</p>
                          <p className="text-xs text-gray-600">Lat: {newMarkerPosition[0].toFixed(6)}</p>
                          <p className="text-xs text-gray-600">Lng: {newMarkerPosition[1].toFixed(6)}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            </div>

            {/* Form untuk menambah data keluarga baru */}
            {showAddForm && (
              <div className="lg:w-1/3 bg-gray-50/50 border-t lg:border-t-0 lg:border-l border-gray-100/50">
                <div className="p-8">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-2 h-8 bg-gradient-to-b from-green-400 to-emerald-500 rounded-full"></div>
                    <h4 className="text-lg font-medium text-gray-900">Tambah Data Keluarga</h4>
                  </div>

                  <form onSubmit={handleSaveNewMarker} className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        No. Kartu Keluarga *
                      </label>
                      <input
                        type="text"
                        value={newMarkerData.no_kk}
                        onChange={(e) => handleInputChange('no_kk', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200"
                        placeholder="Masukkan nomor KK"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Kepala Keluarga *
                      </label>
                      <input
                        type="text"
                        value={newMarkerData.nama_kepala_keluarga}
                        onChange={(e) => handleInputChange('nama_kepala_keluarga', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200"
                        placeholder="Masukkan nama kepala keluarga"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Alamat *
                      </label>
                      <textarea
                        value={newMarkerData.alamat}
                        onChange={(e) => handleInputChange('alamat', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200"
                        rows={3}
                        placeholder="Masukkan alamat lengkap"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status Ekonomi *
                      </label>
                      <select
                        value={newMarkerData.status_ekonomi}
                        onChange={(e) => handleInputChange('status_ekonomi', e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200"
                        required
                      >
                        <option value="miskin">Miskin</option>
                        <option value="sangat_miskin">Sangat Miskin</option>
                        <option value="rentan_miskin">Rentan Miskin</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Latitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={newMarkerData.latitude}
                          readOnly
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Longitude
                        </label>
                        <input
                          type="number"
                          step="any"
                          value={newMarkerData.longitude}
                          readOnly
                          className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className={`flex-1 py-2.5 px-4 rounded-lg text-white font-medium transition-all duration-200 ${
                          isSaving
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl'
                        }`}
                      >
                        {isSaving ? (
                          <div className="flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Menyimpan...
                          </div>
                        ) : (
                          'Simpan Data'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelAddMarker}
                        className="flex-1 bg-white border border-gray-300 text-gray-700 font-medium py-2.5 px-4 rounded-lg hover:bg-gray-50 transition-all duration-200"
                      >
                        Batal
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom CSS untuk popup */}
      <style>{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
      `}</style>
    </AuthenticatedLayout>
  );
}
