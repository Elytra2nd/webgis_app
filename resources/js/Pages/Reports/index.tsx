// resources/js/Pages/Reports/Index.tsx
import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';

interface ReportData {
  title: string;
  description: string;
  data: Array<{
    category: string;
    value: number;
    status?: string;
  }>;
}

interface WilayahData {
  [key: string]: {
    provinsi: string;
    total: number;
    kota: Array<{
      nama: string;
      total: number;
    }>;
  };
}

interface IndexProps extends PageProps {
  reportData: {
    status_ekonomi: ReportData;
    wilayah: {
      title: string;
      description: string;
      data: WilayahData;
    };
    koordinat: ReportData;
  };
  totalKeluarga: number;
}

export default function Index({ auth, reportData, totalKeluarga }: IndexProps) {
  const breadcrumbs = [
    { label: 'Dashboard', href: route('dashboard') },
    { label: 'Laporan', active: true }
  ];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'sangat_miskin':
        return 'bg-red-500';
      case 'miskin':
        return 'bg-amber-500';
      case 'rentan_miskin':
        return 'bg-cyan-500';
      case 'complete':
        return 'bg-green-500';
      case 'incomplete':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  // Konversi data wilayah untuk tampilan
  const wilayahDataForDisplay = Object.values(reportData.wilayah.data)
    .sort((a, b) => b.total - a.total)
    .slice(0, 5)
    .map(item => ({
      category: item.provinsi,
      value: item.total,
      status: 'wilayah'
    }));

  const reportCategories = [
    {
      key: 'status-ekonomi',
      title: 'Status Ekonomi',
      description: 'Laporan distribusi keluarga berdasarkan status ekonomi',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      color: 'from-amber-400 to-orange-500',
      data: reportData.status_ekonomi.data,
      totalData: reportData.status_ekonomi.data.reduce((sum, item) => sum + item.value, 0)
    },
    {
      key: 'wilayah',
      title: 'Wilayah',
      description: 'Laporan distribusi keluarga berdasarkan wilayah',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: 'from-cyan-400 to-teal-500',
      data: wilayahDataForDisplay,
      totalData: Object.values(reportData.wilayah.data).reduce((sum, item) => sum + item.total, 0)
    },
    {
      key: 'koordinat',
      title: 'Koordinat',
      description: 'Laporan kelengkapan data koordinat keluarga',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      ),
      color: 'from-emerald-400 to-green-500',
      data: reportData.koordinat.data,
      totalData: reportData.koordinat.data.reduce((sum, item) => sum + item.value, 0)
    }
  ];

  return (
    <AuthenticatedLayout
      user={auth.user}
      breadcrumbs={breadcrumbs}
      header={
        <div className="flex items-center space-x-3">
          <div className="w-2 h-8 bg-gradient-to-b from-cyan-400 to-teal-500 rounded-full animate-pulse"></div>
          <h2 className="font-light text-2xl text-gray-900">Laporan Data Keluarga</h2>
        </div>
      }
    >
      <Head title="Laporan" />

      <div className="space-y-8">
        {/* Summary Card */}
        <div className="bg-white rounded-2xl border border-gray-100/50 p-8 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-light text-gray-900 mb-2">Total Data Keluarga</h3>
            <p className="text-4xl font-semibold text-cyan-600 mb-4">{totalKeluarga.toLocaleString()}</p>
            <p className="text-gray-600">Keluarga terdaftar dalam sistem</p>
          </div>
        </div>

        {/* Report Categories */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {reportCategories.map((category, index) => (
            <div
              key={category.key}
              className="bg-white rounded-2xl border border-gray-100/50 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fadeIn"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Header */}
              <div className={`bg-gradient-to-r ${category.color} p-6 text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-medium mb-2">{category.title}</h3>
                    <p className="text-white/90 text-sm">{category.description}</p>
                  </div>
                  <div className="text-white/80">
                    {category.icon}
                  </div>
                </div>
                {/* Total indicator */}
                <div className="mt-4 pt-4 border-t border-white/20">
                  <p className="text-white/80 text-sm">Total Data</p>
                  <p className="text-2xl font-light text-white">{category.totalData.toLocaleString()}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="space-y-4 mb-6">
                  {category.data.map((item, itemIndex) => {
                    const percentage = category.totalData > 0 ? ((item.value / category.totalData) * 100).toFixed(1) : '0';
                    return (
                      <div key={itemIndex} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`}></div>
                            <span className="text-sm font-medium text-gray-700 truncate">{item.category}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-light text-gray-900">{item.value.toLocaleString()}</span>
                            <span className="text-xs text-gray-500 ml-2">({percentage}%)</span>
                          </div>
                        </div>
                        {/* Progress bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${getStatusColor(item.status)} transition-all duration-500`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Link
                  href={route('reports.show', category.key)}
                  className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-gray-50 hover:bg-gray-100 text-gray-700 font-medium rounded-lg transition-all duration-200 group"
                >
                  Lihat Detail
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-gray-100/50 p-8 shadow-sm">
          <h3 className="text-xl font-medium text-gray-900 mb-6 flex items-center">
            <div className="w-2 h-6 bg-gradient-to-b from-violet-400 to-purple-500 rounded-full mr-3"></div>
            Aksi Cepat
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href={route('keluarga.index')}
              className="flex items-center p-4 bg-gradient-to-r from-cyan-50 to-teal-50 border border-cyan-200 rounded-xl hover:from-cyan-100 hover:to-teal-100 transition-all duration-200 group transform hover:-translate-y-1"
            >
              <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Data Keluarga</h4>
                <p className="text-sm text-gray-600">Kelola data keluarga</p>
              </div>
            </Link>

            <Link
              href={route('map')}
              className="flex items-center p-4 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl hover:from-emerald-100 hover:to-green-100 transition-all duration-200 group transform hover:-translate-y-1"
            >
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Peta Penduduk</h4>
                <p className="text-sm text-gray-600">Lihat sebaran di peta</p>
              </div>
            </Link>

            <button className="flex items-center p-4 bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-200 rounded-xl hover:from-violet-100 hover:to-purple-100 transition-all duration-200 group transform hover:-translate-y-1">
              <div className="w-10 h-10 bg-violet-500 rounded-lg flex items-center justify-center mr-4 group-hover:scale-110 transition-transform duration-200">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Export Data</h4>
                <p className="text-sm text-gray-600">Unduh laporan lengkap</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Custom CSS untuk animasi */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </AuthenticatedLayout>
  );
}
