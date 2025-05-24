// resources/js/Pages/Reports/Wilayah.tsx
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
  provinsi: string;
  kota: string;
  kecamatan: string;
  kelurahan: string;
  status_ekonomi: string;
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

interface WilayahProps extends PageProps {
  keluarga?: PaginatedKeluarga;
  statistics?: Array<{ provinsi: string; total: number }>;
  provinsiList?: string[];
  kotaList?: string[];
  filters?: {
    provinsi?: string;
    kota?: string;
  };
  category?: string;
}

export default function Wilayah({
  auth,
  keluarga,
  statistics = [],
  provinsiList = [],
  kotaList = [],
  filters = {},
  category = 'Wilayah'
}: WilayahProps) {
  const [selectedProvinsi, setSelectedProvinsi] = useState(filters.provinsi || 'all');
  const [selectedKota, setSelectedKota] = useState(filters.kota || 'all');
  const exportModal = useExportModal();

  const breadcrumbs = [
    { label: 'Dashboard', href: route('dashboard') },
    { label: 'Laporan', href: route('reports.index') },
    { label: category, active: true },
  ];

  // Safe data access dengan null checks yang lebih ketat
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

  // Pastikan meta object selalu ada
  const safeMeta = safeKeluarga.meta || {
    current_page: 1,
    from: 0,
    last_page: 1,
    per_page: 15,
    to: 0,
    total: 0
  };

  // Early return jika data tidak tersedia
  if (!keluarga) {
    return (
      <AuthenticatedLayout
        user={auth.user}
        breadcrumbs={breadcrumbs}
        header={
          <div className="flex items-center space-x-3">
            <div className="w-2 h-8 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-full animate-pulse"></div>
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
              <p className="text-gray-500 text-lg font-medium mb-2">Memuat data laporan wilayah...</p>
              <p className="text-gray-400 text-sm">Mohon tunggu sebentar</p>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  useEffect(() => {
    setSelectedProvinsi(filters.provinsi || 'all');
    setSelectedKota(filters.kota || 'all');
  }, [filters]);

  const handleProvinsiChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinsi = e.target.value;
    setSelectedProvinsi(provinsi);
    setSelectedKota('all');
    router.get(route('reports.show', 'wilayah'), {
      provinsi,
      kota: 'all'
    }, {
      preserveState: true,
      replace: true
    });
  };

  const handleKotaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const kota = e.target.value;
    setSelectedKota(kota);
    router.get(route('reports.show', 'wilayah'), {
      provinsi: selectedProvinsi,
      kota
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

  return (
    <AuthenticatedLayout
      user={auth.user}
      breadcrumbs={breadcrumbs}
      header={
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-full animate-pulse"></div>
          <h2 className="font-light text-2xl text-gray-900">Laporan {category}</h2>
        </div>
      }
    >
      <Head title={`Laporan ${category}`} />

      <div className="space-y-8">
        {/* Filter Section */}
        <div className="bg-white rounded-2xl border border-gray-100/50 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-2 h-6 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-full"></div>
            <h3 className="text-lg font-medium text-gray-900">Filter Wilayah</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="provinsi" className="block text-sm font-medium text-gray-700 mb-2">
                Provinsi
              </label>
              <select
                id="provinsi"
                value={selectedProvinsi}
                onChange={handleProvinsiChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 bg-white"
              >
                <option value="all">Semua Provinsi</option>
                {provinsiList.map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="kota" className="block text-sm font-medium text-gray-700 mb-2">
                Kota/Kabupaten
              </label>
              <select
                id="kota"
                value={selectedKota}
                onChange={handleKotaChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-colors duration-200 bg-white disabled:bg-gray-50 disabled:text-gray-500"
                disabled={selectedProvinsi === 'all'}
              >
                <option value="all">Semua Kota/Kabupaten</option>
                {kotaList.map((kota) => (
                  <option key={kota} value={kota}>{kota}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="bg-white rounded-2xl border border-gray-100/50 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-6 bg-gradient-to-b from-emerald-400 to-green-500 rounded-full"></div>
              <h3 className="text-lg font-medium text-gray-900">Statistik Per Provinsi</h3>
            </div>
            <span className="text-sm text-gray-500">Top 10 Provinsi</span>
          </div>

          {statistics.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {statistics.slice(0, 10).map((stat, index) => (
                <div
                  key={stat.provinsi}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg border border-gray-100 hover:shadow-md transition-all duration-200 animate-fadeIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center text-white text-sm font-medium">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-700 truncate">{stat.provinsi}</span>
                  </div>
                  <span className="text-lg font-light text-gray-900">{stat.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500">Tidak ada data statistik.</p>
            </div>
          )}
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. KK</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kepala Keluarga</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provinsi</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kota/Kabupaten</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kecamatan</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelurahan</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status Ekonomi</th>
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
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{item.provinsi}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{item.kota}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{item.kecamatan}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700">{item.kelurahan}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status_ekonomi)}`}>
                          {formatStatusEkonomi(item.status_ekonomi)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Link
                          href={route('keluarga.show', item.id)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-all duration-200 transform hover:scale-105"
                        >
                          Detail
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center animate-fadeIn">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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
        category="wilayah"
        filters={{
          provinsi: selectedProvinsi,
          kota: selectedKota
        }}
        title="Export Laporan Wilayah"
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
