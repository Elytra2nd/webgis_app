// resources/js/Pages/Reports/StatusEkonomi.tsx
import React, { useState } from 'react';
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
  status_ekonomi: string;
  kelurahan?: string;
  kecamatan?: string;
  kota?: string;
  provinsi?: string;
}

interface StatusEkonomiProps extends PageProps {
  keluarga?: {
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
  };
  statistics?: {
    sangat_miskin: number;
    miskin: number;
    rentan_miskin: number;
  };
  filters?: {
    status?: string;
  };
  category?: string;
}

export default function StatusEkonomi({
  auth,
  keluarga,
  statistics,
  filters = {},
  category = 'Status Ekonomi'
}: StatusEkonomiProps) {
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
  const exportModal = useExportModal();

  // Null checks untuk mencegah error
  if (!keluarga || !statistics) {
    return (
      <AuthenticatedLayout
        user={auth.user}
        header={
          <div className="flex items-center space-x-3">
            <div className="w-2 h-8 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full animate-pulse"></div>
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
              <p className="text-gray-500 text-lg font-medium mb-2">Terjadi kesalahan saat memuat data</p>
              <p className="text-gray-400 text-sm">Silakan refresh halaman atau coba lagi nanti</p>
              <Link
                href={route('reports.index')}
                className="inline-flex items-center mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors duration-200"
              >
                Kembali ke Laporan
              </Link>
            </div>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: route('dashboard') },
    { label: 'Laporan', href: route('reports.index') },
    { label: category, active: true }
  ];

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

  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    router.get(route('reports.show', 'status-ekonomi'), {
      status: newStatus
    }, {
      preserveState: true,
      replace: true
    });
  };

  const totalKeluarga = statistics.sangat_miskin + statistics.miskin + statistics.rentan_miskin;

  return (
    <AuthenticatedLayout
      user={auth.user}
      breadcrumbs={breadcrumbs}
      header={
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full animate-pulse"></div>
          <h2 className="font-light text-2xl text-gray-900">Laporan {category}</h2>
        </div>
      }
    >
      <Head title={`Laporan ${category}`} />

      <div className="space-y-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100/50 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Keluarga</p>
                <p className="text-3xl font-light text-gray-900">{totalKeluarga.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-gray-100 to-slate-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 715.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100/50 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Sangat Miskin</p>
                <p className="text-3xl font-light text-red-700">{statistics.sangat_miskin.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalKeluarga > 0 ? ((statistics.sangat_miskin / totalKeluarga) * 100).toFixed(1) : 0}%
                </p>
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
                <p className="text-3xl font-light text-amber-700">{statistics.miskin.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalKeluarga > 0 ? ((statistics.miskin / totalKeluarga) * 100).toFixed(1) : 0}%
                </p>
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
                <p className="text-3xl font-light text-cyan-700">{statistics.rentan_miskin.toLocaleString()}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {totalKeluarga > 0 ? ((statistics.rentan_miskin / totalKeluarga) * 100).toFixed(1) : 0}%
                </p>
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
                <h3 className="text-xl font-medium text-gray-900 mb-2">Detail Data Keluarga</h3>
                <p className="text-sm text-gray-600">
                  Menampilkan {keluarga.meta?.from || 0} - {keluarga.meta?.to || 0} dari {keluarga.meta?.total || 0} keluarga
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
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
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Link
                        href={route('keluarga.show', item.id)}
                        className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-all duration-200 transform hover:scale-105"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <div className="flex flex-col items-center animate-fadeIn">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 715.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 919.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                        <p className="text-gray-500 text-lg font-medium mb-2">Tidak ada data yang sesuai</p>
                        <p className="text-gray-400 text-sm">Coba ubah filter untuk melihat data lainnya</p>
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

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModal.isOpen}
        onClose={exportModal.closeModal}
        category="status-ekonomi"
        filters={{ status: statusFilter }}
        title="Export Laporan Status Ekonomi"
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
