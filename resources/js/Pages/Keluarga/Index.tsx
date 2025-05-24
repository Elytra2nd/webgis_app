// resources/js/Pages/Keluarga/Index.tsx
import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import { PageProps } from '@/types';

interface Keluarga {
  id: number;
  no_kk: string;
  nama_kepala_keluarga: string;
  alamat: string;
  rt?: string;
  rw?: string;
  kelurahan?: string;
  kecamatan?: string;
  kota?: string;
  provinsi?: string;
  kode_pos?: string;
  status_ekonomi: string;
  penghasilan_bulanan?: string;
  keterangan?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
  lokasi?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface PaginatedKeluarga {
  data: Keluarga[];
  links: Array<{
    url: string | null;
    label: string;
    active: boolean;
  }>;
  meta: {
    current_page: number;
    from: number;
    last_page: number;
    per_page: number;
    to: number;
    total: number;
  };
}

interface IndexProps extends PageProps {
  keluarga?: PaginatedKeluarga;
  filters?: {
    search?: string;
    status?: string;
  };
  stats?: {
    total: number;
    sangat_miskin: number;
    miskin: number;
    rentan_miskin: number;
  };
}

export default function Index({ auth, keluarga, filters = {}, stats }: IndexProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');

  const breadcrumbs = [
    { label: 'Dashboard', href: route('dashboard') },
    { label: 'Data Keluarga', active: true }
  ];

  // PERBAIKAN: Utility functions untuk validasi data yang lebih fleksibel
  const isValidCoordinate = (value: any): value is number => {
    if (typeof value === 'number') {
      return !isNaN(value) && isFinite(value);
    }
    if (typeof value === 'string') {
      const num = parseFloat(value);
      return !isNaN(num) && isFinite(num);
    }
    return false;
  };

  const isValidLokasiString = (value: any): value is string => {
    return typeof value === 'string' &&
           value.trim().length > 0 &&
           value.includes(',') &&
           value.split(',').length === 2;
  };

  const parseLokasiString = (lokasi: string): { lat: number; lng: number } | null => {
    try {
      const coords = lokasi.split(',');
      if (coords.length === 2) {
        const lat = parseFloat(coords[0].trim());
        const lng = parseFloat(coords[1].trim());

        if (isValidCoordinate(lat) && isValidCoordinate(lng)) {
          return { lat, lng };
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  // Debug logging untuk troubleshooting
  useEffect(() => {
    console.log('Keluarga data received:', keluarga);
    if (keluarga?.data) {
      keluarga.data.forEach((item, index) => {
        if (index < 3) { // Log 3 item pertama saja
          console.log(`Item ${index}:`, {
            no_kk: item.no_kk,
            latitude: item.latitude,
            longitude: item.longitude,
            lokasi: item.lokasi,
            hasCoordinates: hasValidCoordinates(item)
          });
        }
      });
    }
  }, [keluarga]);

  // Early return jika data tidak tersedia
  if (!keluarga || !keluarga.data || !keluarga.meta) {
    return (
      <AuthenticatedLayout
        user={auth.user}
        breadcrumbs={breadcrumbs}
        header={
          <div className="flex items-center space-x-3">
            <div className="w-2 h-8 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-full animate-pulse"></div>
            <h2 className="font-light text-2xl text-gray-900">Data Keluarga</h2>
          </div>
        }
      >
        <Head title="Data Keluarga" />

        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-gray-100/50 p-8 shadow-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium mb-2">Memuat data keluarga...</p>
              <p className="text-gray-400 text-sm">Mohon tunggu sebentar</p>
              <Link
                href={route('keluarga.create')}
                className="inline-flex items-center mt-4 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-green-600 transition-all duration-200"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                Tambah Keluarga
              </Link>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  const formatStatusEkonomi = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'sangat_miskin': 'Sangat Miskin',
      'miskin': 'Miskin',
      'rentan_miskin': 'Rentan Miskin'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sangat_miskin':
        return 'bg-red-50 text-red-700 border border-red-200';
      case 'miskin':
        return 'bg-amber-50 text-amber-700 border border-amber-200';
      case 'rentan_miskin':
        return 'bg-cyan-50 text-cyan-700 border border-cyan-200';
      default:
        return 'bg-gray-50 text-gray-700 border border-gray-200';
    }
  };

  // PERBAIKAN: formatCoordinates dengan debugging dan type safety yang ketat
  const formatCoordinates = (lat?: number | string | null, lng?: number | string | null, lokasi?: string | null) => {
    console.log('formatCoordinates called with:', { lat, lng, lokasi }); // Debug log

    // Prioritas 1: Gunakan latitude dan longitude jika valid
    if (isValidCoordinate(lat) && isValidCoordinate(lng)) {
      const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
      const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;
      return `${latNum.toFixed(6)}, ${lngNum.toFixed(6)}`;
    }

    // Prioritas 2: Gunakan lokasi string jika valid
    if (isValidLokasiString(lokasi)) {
      const parsed = parseLokasiString(lokasi);
      if (parsed) {
        return `${parsed.lat.toFixed(6)}, ${parsed.lng.toFixed(6)}`;
      }
      return lokasi; // Return as-is jika tidak bisa di-parse
    }

    return 'Belum diatur';
  };

  // PERBAIKAN: openGoogleMaps dengan type safety yang ketat
  const openGoogleMaps = (lat?: number | string | null, lng?: number | string | null, lokasi?: string | null) => {
    // Prioritas 1: Gunakan koordinat langsung
    if (isValidCoordinate(lat) && isValidCoordinate(lng)) {
      const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
      const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;
      window.open(`https://www.google.com/maps?q=${latNum},${lngNum}`, '_blank');
      return;
    }

    // Prioritas 2: Parse dari lokasi string
    if (isValidLokasiString(lokasi)) {
      const coords = parseLokasiString(lokasi);
      if (coords) {
        window.open(`https://www.google.com/maps?q=${coords.lat},${coords.lng}`, '_blank');
      }
    }
  };

  // PERBAIKAN: Function untuk check apakah ada koordinat valid dengan debugging
  const hasValidCoordinates = (item: Keluarga): boolean => {
    const hasLatLng = isValidCoordinate(item.latitude) && isValidCoordinate(item.longitude);
    const hasLokasi = isValidLokasiString(item.lokasi);

    console.log(`hasValidCoordinates for ${item.no_kk}:`, {
      latitude: item.latitude,
      longitude: item.longitude,
      lokasi: item.lokasi,
      hasLatLng,
      hasLokasi,
      result: hasLatLng || hasLokasi
    }); // Debug log

    return hasLatLng || hasLokasi;
  };

  // Handle search and filter
  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    router.get(route('keluarga.index'), {
      search: searchTerm,
      status: newStatus
    }, {
      preserveState: true,
      replace: true
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      router.get(route('keluarga.index'), {
        search: searchTerm,
        status: statusFilter
      }, {
        preserveState: true,
        replace: true
      });
    }
  };

  // Safe statistics calculation
  const getStatusStats = () => {
    // Gunakan stats dari backend jika tersedia
    if (stats) {
      return stats;
    }

    // Fallback calculation dengan safe access
    const safeData = keluarga?.data || [];
    const safeTotal = keluarga?.meta?.total || 0;

    return {
      total: safeTotal,
      sangat_miskin: safeData.filter(k => k?.status_ekonomi === 'sangat_miskin').length,
      miskin: safeData.filter(k => k?.status_ekonomi === 'miskin').length,
      rentan_miskin: safeData.filter(k => k?.status_ekonomi === 'rentan_miskin').length,
    };
  };

  const statsData = getStatusStats();

  return (
    <AuthenticatedLayout
      user={auth.user}
      breadcrumbs={breadcrumbs}
      header={
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-full animate-pulse"></div>
          <h2 className="font-light text-2xl text-gray-900">Data Keluarga</h2>
        </div>
      }
    >
      <Head title="Data Keluarga" />

      <div className="space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100/50 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Keluarga</p>
                <p className="text-3xl font-semibold text-gray-900">{statsData.total.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-cyan-100 to-teal-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100/50 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Sangat Miskin</p>
                <p className="text-3xl font-semibold text-red-700">{statsData.sangat_miskin.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100/50 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Miskin</p>
                <p className="text-3xl font-semibold text-amber-700">{statsData.miskin.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100/50 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-600">Rentan Miskin</p>
                <p className="text-3xl font-semibold text-cyan-700">{statsData.rentan_miskin.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl border border-gray-100/50 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="p-8 border-b border-gray-100/50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Daftar Keluarga</h3>
                <p className="text-sm text-gray-600">
                  Menampilkan {keluarga.meta?.from || 0} - {keluarga.meta?.to || 0} dari {keluarga.meta?.total || 0} keluarga terdaftar
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Cari keluarga... (tekan Enter)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200"
                  />
                </div>

                {/* Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200"
                >
                  <option value="all">Semua Status</option>
                  <option value="sangat_miskin">Sangat Miskin</option>
                  <option value="miskin">Miskin</option>
                  <option value="rentan_miskin">Rentan Miskin</option>
                </select>

                {/* Add Button */}
                <Link
                  href={route('keluarga.create')}
                  className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-green-600 focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                  </svg>
                  Tambah Keluarga
                </Link>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    No. KK
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kepala Keluarga
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Alamat
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status Ekonomi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Koordinat
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {keluarga.data && keluarga.data.length > 0 ? keluarga.data.map((item, index) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50/50 transition-colors duration-200 animate-fadeIn"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-mono text-gray-900">{item.no_kk}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{item.nama_kepala_keluarga}</div>
                        {item.rt && item.rw && (
                          <div className="text-xs text-gray-500">RT {item.rt} / RW {item.rw}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <div className="text-sm text-gray-900 truncate">{item.alamat}</div>
                        {item.kelurahan && (
                          <div className="text-xs text-gray-500 truncate">
                            {item.kelurahan}, {item.kecamatan}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status_ekonomi)}`}>
                        {formatStatusEkonomi(item.status_ekonomi)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono text-gray-600">
                          {formatCoordinates(item.latitude, item.longitude, item.lokasi)}
                        </span>
                        {hasValidCoordinates(item) && (
                          <button
                            onClick={() => openGoogleMaps(item.latitude, item.longitude, item.lokasi)}
                            className="text-cyan-600 hover:text-cyan-800 transition-colors duration-200 hover:scale-110 transform"
                            title="Lihat di Google Maps"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end space-x-2">
                        <Link
                          href={route('keluarga.show', item.id)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-all duration-200 transform hover:scale-105"
                        >
                          Detail
                        </Link>
                        <Link
                          href={route('keluarga.edit', item.id)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all duration-200 transform hover:scale-105"
                        >
                          Edit
                        </Link>
                        <Link
                          href={route('keluarga.destroy', item.id)}
                          method="delete"
                          as="button"
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-all duration-200 transform hover:scale-105"
                          onBefore={() => confirm('Apakah Anda yakin ingin menghapus data keluarga ini?')}
                        >
                          Hapus
                        </Link>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center animate-fadeIn">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 715.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 text-lg font-medium mb-2">
                          {searchTerm || statusFilter !== 'all' ? 'Tidak ada data yang sesuai' : 'Belum ada data keluarga'}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {searchTerm || statusFilter !== 'all'
                            ? 'Coba ubah filter pencarian Anda'
                            : 'Klik tombol "Tambah Keluarga" untuk menambahkan data baru'
                          }
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {keluarga.data && keluarga.data.length > 0 && keluarga.links && (
            <div className="px-8 py-6 border-t border-gray-100/50 bg-gray-50/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Menampilkan <span className="font-medium">{keluarga.meta?.from || 0}</span> sampai{' '}
                  <span className="font-medium">{keluarga.meta?.to || 0}</span> dari{' '}
                  <span className="font-medium">{keluarga.meta?.total || 0}</span> hasil
                </div>

                <Pagination
                  links={keluarga.links}
                  className="animate-fadeIn"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Custom CSS untuk animasi */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </AuthenticatedLayout>
  );
}
