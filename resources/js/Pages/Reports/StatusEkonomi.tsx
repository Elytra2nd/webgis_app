import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Pagination from '@/Components/Pagination';
import ExportModal from '@/Components/ExportModal';
import { useExportModal } from '@/Hooks/useExportModal';
import { PageProps } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, TrendingDown, TrendingUp, AlertTriangle, Filter, Download, Users } from 'lucide-react';


interface Keluarga {
  id: number;
  no_kk: string;
  nama_keluarga: string;
  alamat: string;
  status_ekonomi: string;
  jumlah_anggota?: number;
  pendapatan?: number;
  kelurahan?: string;
  kecamatan?: string;
  kota?: string;
  provinsi?: string;
  created_at: string;
  updated_at: string;
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

interface StatusEkonomiProps extends PageProps {
  keluarga?: PaginatedKeluarga;
  statistics?: {
    sangat_miskin: number;
    miskin: number;
    rentan_miskin: number;
  };
  filters?: {
    status?: string;
    tahun?: string;
  };
  category?: string;
}

export default function StatusEkonomi({
  auth,
  keluarga,
  statistics,
  filters = {},
  category = 'Status Ekonomi PKH'
}: StatusEkonomiProps) {
  const [statusFilter, setStatusFilter] = useState(filters.status || 'all');
  const exportModal = useExportModal();

  // PERBAIKAN: Update breadcrumbs untuk menggunakan route admin yang benar
  const breadcrumbs = [
    { label: 'Dashboard', href: route('dashboard') },
    { label: 'Laporan PKH', href: route('admin.reports.index') },
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
    sangat_miskin: 0,
    miskin: 0,
    rentan_miskin: 0
  };

  // PERBAIKAN: Enhanced loading state
  if (!keluarga || !statistics) {
    return (
      <AuthenticatedLayout
        user={auth.user}
        breadcrumbs={breadcrumbs}
        header={
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-3 h-8 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full shadow-lg"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <div className="flex items-center space-x-3">
              <DollarSign className="w-6 h-6 text-amber-600" />
              <h2 className="font-light text-2xl text-slate-800 tracking-wide">Laporan {category}</h2>
            </div>
          </motion.div>
        }
      >
        <Head title={`Laporan ${category}`} />

        <div className="space-y-8">
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-8 shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center">
              <motion.div 
                className="w-16 h-16 bg-gradient-to-r from-amber-100 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <DollarSign className="w-8 h-8 text-amber-600" />
              </motion.div>
              <p className="text-slate-600 text-lg font-medium mb-2">Memuat data laporan status ekonomi PKH...</p>
              <p className="text-slate-400 text-sm">Mohon tunggu sebentar</p>
            </div>
          </motion.div>
        </div>
      </AuthenticatedLayout>
    );
  }

  useEffect(() => {
    setStatusFilter(filters.status || 'all');
  }, [filters]);

  const handleFilterChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    
    // PERBAIKAN: Update route untuk admin reports
    router.get(route('admin.reports.index'), {
      status: newStatus,
      category: 'status-ekonomi'
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
        return 'bg-slate-50 text-slate-700 border border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sangat_miskin':
        return <TrendingDown className="w-3 h-3 mr-1" />;
      case 'miskin':
        return <AlertTriangle className="w-3 h-3 mr-1" />;
      case 'rentan_miskin':
        return <TrendingUp className="w-3 h-3 mr-1" />;
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const totalKeluarga = safeStatistics.sangat_miskin + safeStatistics.miskin + safeStatistics.rentan_miskin;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <AuthenticatedLayout
      user={auth.user}
      breadcrumbs={breadcrumbs}
      header={
        <motion.div 
          className="flex items-center space-x-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-3 h-8 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full shadow-lg"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <div className="flex items-center space-x-3">
            <DollarSign className="w-6 h-6 text-amber-600" />
            <h2 className="font-light text-2xl text-slate-800 tracking-wide">Laporan {category}</h2>
          </div>
        </motion.div>
      }
    >
      <Head title={`Laporan ${category}`} />

      <motion.div 
        className="space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Statistics Cards */}
        <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" variants={itemVariants}>
          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Total Keluarga PKH</p>
                <p className="text-3xl font-light text-slate-900">{totalKeluarga.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-slate-600" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Sangat Miskin</p>
                <p className="text-3xl font-light text-red-700">{safeStatistics.sangat_miskin.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {totalKeluarga > 0 ? ((safeStatistics.sangat_miskin / totalKeluarga) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Miskin</p>
                <p className="text-3xl font-light text-amber-700">{safeStatistics.miskin.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {totalKeluarga > 0 ? ((safeStatistics.miskin / totalKeluarga) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
            whileHover={{ y: -5, scale: 1.02 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-cyan-600">Rentan Miskin</p>
                <p className="text-3xl font-light text-cyan-700">{safeStatistics.rentan_miskin.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">
                  {totalKeluarga > 0 ? ((safeStatistics.rentan_miskin / totalKeluarga) * 100).toFixed(1) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 p-8 shadow-lg hover:shadow-xl transition-all duration-300"
          variants={itemVariants}
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-2 h-6 bg-gradient-to-b from-amber-400 to-orange-500 rounded-full"></div>
            <h3 className="text-lg font-medium text-slate-900">Distribusi Status Ekonomi PKH</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 flex items-center">
                <TrendingDown className="w-4 h-4 mr-2 text-red-500" />
                Sangat Miskin
              </span>
              <span className="font-medium text-red-600">
                {totalKeluarga > 0 ? ((safeStatistics.sangat_miskin / totalKeluarga) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-red-500 to-red-600 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${totalKeluarga > 0 ? (safeStatistics.sangat_miskin / totalKeluarga) * 100 : 0}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
                Miskin
              </span>
              <span className="font-medium text-amber-600">
                {totalKeluarga > 0 ? ((safeStatistics.miskin / totalKeluarga) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-amber-500 to-amber-600 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${totalKeluarga > 0 ? (safeStatistics.miskin / totalKeluarga) * 100 : 0}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 flex items-center">
                <TrendingUp className="w-4 h-4 mr-2 text-cyan-500" />
                Rentan Miskin
              </span>
              <span className="font-medium text-cyan-600">
                {totalKeluarga > 0 ? ((safeStatistics.rentan_miskin / totalKeluarga) * 100).toFixed(1) : 0}%
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <motion.div
                className="bg-gradient-to-r from-cyan-500 to-cyan-600 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${totalKeluarga > 0 ? (safeStatistics.rentan_miskin / totalKeluarga) * 100 : 0}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Data Table Section */}
        <motion.div 
          className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-100/50 overflow-hidden shadow-lg"
          variants={itemVariants}
        >
          {/* Header */}
          <div className="p-8 border-b border-slate-100/50 bg-gradient-to-r from-slate-50 to-amber-50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h3 className="text-xl font-medium text-slate-900 mb-2">Detail Data Keluarga PKH</h3>
                <p className="text-sm text-slate-600">
                  Menampilkan {safeMeta.from || 0} - {safeMeta.to || 0} dari {safeMeta.total || 0} keluarga
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="pl-10 pr-4 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors duration-200 bg-white/80 backdrop-blur-sm"
                  >
                    <option value="all">Semua Status</option>
                    <option value="sangat_miskin">Sangat Miskin</option>
                    <option value="miskin">Miskin</option>
                    <option value="rentan_miskin">Rentan Miskin</option>
                  </select>
                </div>

                {/* Export Button */}
                <motion.button
                  onClick={exportModal.openModal}
                  className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium rounded-lg hover:from-amber-600 hover:to-orange-600 focus:outline-none focus:ring-4 focus:ring-amber-200 transition-all duration-200 shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Download className="w-5 h-5 mr-2" />
                  Export Data
                </motion.button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">No. KK</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Nama Keluarga</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Alamat</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status Ekonomi</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Jumlah Anggota</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Pendapatan</th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <AnimatePresence>
                  {safeKeluarga.data && safeKeluarga.data.length > 0 ? (
                    safeKeluarga.data.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        className="hover:bg-slate-50/50 transition-colors duration-200"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ backgroundColor: "rgba(248, 250, 252, 0.8)" }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-slate-900">{item.no_kk}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900">{item.nama_keluarga}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-xs">
                            <div className="text-sm text-slate-900 truncate">{item.alamat}</div>
                            {item.kelurahan && (
                              <div className="text-xs text-slate-500 truncate">
                                {item.kelurahan}, {item.kecamatan}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status_ekonomi)}`}>
                            {getStatusIcon(item.status_ekonomi)}
                            {formatStatusEkonomi(item.status_ekonomi)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-900">{item.jumlah_anggota || '-'}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-900">
                            {item.pendapatan ? formatCurrency(item.pendapatan) : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end space-x-2">
                            <Link
                              href={route('admin.keluarga.show', item.id)}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-all duration-200"
                            >
                              Detail
                            </Link>
                            <Link
                              href={route('admin.keluarga.edit', item.id)}
                              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-cyan-700 bg-cyan-50 border border-cyan-200 rounded-lg hover:bg-cyan-100 transition-all duration-200"
                            >
                              Edit
                            </Link>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center">
                          <motion.div 
                            className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <DollarSign className="w-8 h-8 text-slate-400" />
                          </motion.div>
                          <p className="text-slate-500 text-lg font-medium mb-2">Tidak ada data keluarga</p>
                          <p className="text-slate-400 text-sm">Coba ubah filter untuk melihat data lainnya</p>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {safeKeluarga.data && safeKeluarga.data.length > 0 && safeKeluarga.links && safeKeluarga.links.length > 3 && (
            <motion.div 
              className="px-8 py-6 border-t border-slate-100/50 bg-slate-50/30"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-slate-600">
                  Menampilkan <span className="font-medium">{safeMeta.from || 0}</span> sampai{' '}
                  <span className="font-medium">{safeMeta.to || 0}</span> dari{' '}
                  <span className="font-medium">{safeMeta.total || 0}</span> hasil
                </div>

                <Pagination links={safeKeluarga.links} />
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Export Modal */}
      <ExportModal
              isOpen={exportModal.isOpen}
              onClose={exportModal.closeModal}
              category="status-ekonomi"
              filters={{
                  search: '',
                  status: statusFilter,
                  status_bantuan: '',
                  tahun: filters.tahun || new Date().getFullYear().toString(),
                  wilayah: '',
                  bulan: undefined
              }}
              title="Export Laporan Status Ekonomi PKH"
              statistics={{
                total_penerima: totalKeluarga,
                sangat_miskin: safeStatistics.sangat_miskin,
                miskin: safeStatistics.miskin,
                rentan_miskin: safeStatistics.rentan_miskin
              }}      />
    </AuthenticatedLayout>
  );
}
