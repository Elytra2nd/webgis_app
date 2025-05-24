// resources/js/Pages/Reports/Koordinat.tsx
import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import ExportModal from '@/Components/ExportModal';
import { useExportModal } from '@/Hooks/useExportModal';
import { PageProps } from '@/types';

interface Keluarga {
  id: number;
  no_kk: string;
  nama_kepala_keluarga: string;
  alamat: string;
  kelurahan?: string;
  kecamatan?: string;
  kota?: string;
  provinsi?: string;
  status_ekonomi: string;
  latitude?: number | null;
  longitude?: number | null;
  lokasi?: string | null;
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

interface KoordinatProps extends PageProps {
  keluarga?: PaginatedKeluarga;
  statistics?: {
    complete: number;
    incomplete: number;
  };
  filters?: {
    status?: string;
  };
  category?: string;
}

export default function Koordinat({
  auth,
  keluarga,
  statistics,
  filters = {},
  category = 'Koordinat'
}: KoordinatProps) {
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
  const exportModal = useExportModal();

  const breadcrumbs = [
    { label: 'Dashboard', href: route('dashboard') },
    { label: 'Laporan', href: route('reports.index') },
    { label: category, active: true },
  ];

  // Safe data access dengan null checks yang ketat
  const safeKeluarga = keluarga || {
    data: [],
    meta: {
      current_page: 1,
      from: 0,
      last_page: 1,
      per_page: 15,
      to: 0,
      total: 0
    },
    links: []
  };

  const safeMeta = safeKeluarga.meta || {
    current_page: 1,
    from: 0,
    last_page: 1,
    per_page: 15,
    to: 0,
    total: 0
  };

  const safeStatistics = statistics || {
    complete: 0,
    incomplete: 0
  };

  // Utility functions untuk validasi koordinat
  const isValidCoordinate = (value: any): value is number => {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  };

  const isValidLokasiString = (value: any): value is string => {
    return typeof value === 'string' && value.trim().length > 0 && value.includes(',');
  };

  const hasValidCoordinates = (item: Keluarga): boolean => {
    return (
      (isValidCoordinate(item.latitude) && isValidCoordinate(item.longitude)) ||
      isValidLokasiString(item.lokasi)
    );
  };

  const formatCoordinates = (lat?: number | null, lng?: number | null, lokasi?: string | null) => {
    if (isValidCoordinate(lat) && isValidCoordinate(lng)) {
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }

    if (isValidLokasiString(lokasi)) {
      return lokasi;
    }

    return 'Belum diatur';
  };

  const openGoogleMaps = (lat?: number | null, lng?: number | null, lokasi?: string | null) => {
    if (isValidCoordinate(lat) && isValidCoordinate(lng)) {
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
      return;
    }

    if (isValidLokasiString(lokasi)) {
      const coords = lokasi.split(',');
      if (coords.length === 2) {
        const parsedLat = parseFloat(coords[0].trim());
        const parsedLng = parseFloat(coords[1].trim());
        if (isValidCoordinate(parsedLat) && isValidCoordinate(parsedLng)) {
          window.open(`https://www.google.com/maps?q=${parsedLat},${parsedLng}`, '_blank');
        }
      }
    }
  };

  // Early return jika data tidak tersedia
  if (!keluarga) {
    return (
      <AuthenticatedLayout
        user={auth.user}
        breadcrumbs={breadcrumbs}
        header={
          <div className="flex items-center space-x-3">
            <div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-green-500 rounded-full animate-pulse"></div>
            <h2 className="font-light text-2xl text-gray-900">Laporan {category}</h2>
          </div>
        }
      >
        <Head title={`Laporan ${category}`} />

        <div className="space-y-8">
          <div className="bg-white rounded-2xl border border-gray-100/50 p-8 shadow-sm">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium mb-2">Memuat data laporan koordinat...</p>
              <p className="text-gray-400 text-sm">Mohon tunggu sebentar</p>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  useEffect(() => {
    setStatusFilter(filters.status || 'all');
  }, [filters]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const status = e.target.value;
    setStatusFilter(status);
    router.get(route('reports.show', 'koordinat'), {
      status
    }, {
      preserveState: true,
      replace: true
    });
  };

  const formatStatusEkonomi = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'sangat_miskin': 'Sangat Miskin',
      'miskin': 'Miskin',
      'rentan_miskin': 'Rentan Miskin'
    };
    return statusMap[status] || status.replace('_', ' ');
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

  const totalData = safeStatistics.complete + safeStatistics.incomplete;
  const completePercentage = totalData > 0 ? ((safeStatistics.complete / totalData) * 100).toFixed(1) : '0';
  const incompletePercentage = totalData > 0 ? ((safeStatistics.incomplete / totalData) * 100).toFixed(1) : '0';

  return (
    <AuthenticatedLayout
      user={auth.user}
      breadcrumbs={breadcrumbs}
      header={
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-emerald-400 to-green-500 rounded-full animate-pulse"></div>
          <h2 className="font-light text-2xl text-gray-900">Laporan {category}</h2>
        </div>
      }
    >
      <Head title={`Laporan ${category}`} />

      <div className="space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100/50 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Keluarga</p>
                <p className="text-3xl font-light text-gray-900">{totalData.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-gray-100 to-slate-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 715.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100/50 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Sudah Ada Koordinat</p>
                <p className="text-3xl font-light text-green-700">{safeStatistics.complete.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">{completePercentage}%</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100/50 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Belum Ada Koordinat</p>
                <p className="text-3xl font-light text-gray-700">{safeStatistics.incomplete.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">{incompletePercentage}%</p>
              </div>
              <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl border border-gray-100/50 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-2 h-6 bg-gradient-to-b from-emerald-400 to-green-500 rounded-full"></div>
            <h3 className="text-lg font-medium text-gray-900">Progress Kelengkapan Koordinat</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Sudah Ada Koordinat</span>
              <span className="font-medium text-green-600">{completePercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${completePercentage}%` }}
              ></div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Belum Ada Koordinat</span>
              <span className="font-medium text-gray-600">{incompletePercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-gray-400 to-gray-500 h-3 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${incompletePercentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="bg-white rounded-2xl border border-gray-100/50 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="p-8 border-b border-gray-100/50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Detail Data Keluarga</h3>
                <p className="text-sm text-gray-600">
                  Menampilkan {safeMeta.from || 0} - {safeMeta.to || 0} dari {safeMeta.total || 0} keluarga
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Filter */}
                <select
                  value={statusFilter}
                  onChange={handleStatusChange}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200"
                >
                  <option value="all">Semua Status</option>
                  <option value="complete">Sudah Ada Koordinat</option>
                  <option value="incomplete">Belum Ada Koordinat</option>
                </select>

                {/* Export Button dengan Modal */}
                <button
                  onClick={exportModal.openModal}
                  className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-green-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-green-600 focus:outline-none focus:ring-4 focus:ring-emerald-200 transition-all duration-200 transform hover:-translate-y-0.5 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Data
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. KK</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kepala Keluarga</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Ekonomi</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Koordinat</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {safeKeluarga.data && safeKeluarga.data.length > 0 ? (
                  safeKeluarga.data.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50/50 transition-colors duration-200 animate-fadeIn"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-mono text-gray-900">{item.no_kk}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{item.nama_kepala_keluarga}</div>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        {hasValidCoordinates(item) ? (
                          <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-200">
                            Lengkap
                          </span>
                        ) : (
                          <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-gray-50 text-gray-700 border border-gray-200">
                            Belum Lengkap
                          </span>
                        )}
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
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center animate-fadeIn">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 713 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                        </div>
                        <p className="text-gray-500 text-lg font-medium mb-2">Tidak ada data keluarga</p>
                        <p className="text-gray-400 text-sm">Coba ubah filter untuk melihat data lainnya</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {safeKeluarga.data && safeKeluarga.data.length > 0 && safeKeluarga.links && safeKeluarga.links.length > 3 && (
            <div className="px-8 py-6 border-t border-gray-100/50 bg-gray-50/30">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Menampilkan <span className="font-medium">{safeMeta.from || 0}</span> sampai{' '}
                  <span className="font-medium">{safeMeta.to || 0}</span> dari{' '}
                  <span className="font-medium">{safeMeta.total || 0}</span> hasil
                </div>

                <Pagination
                  links={safeKeluarga.links}
                  className="animate-fadeIn"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModal.isOpen}
        onClose={exportModal.closeModal}
        category="koordinat"
        filters={{ status: statusFilter }}
        title="Export Laporan Koordinat"
      />

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
